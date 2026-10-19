import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { parse, parseFragment } from 'parse5';

const origin = `https://${(await readFile('CNAME', 'utf8')).trim()}`;
const pages = ['index.html', 'ventures.html', 'perspectives.html'];
const documents = new Map();
function nodes(root) { return [root, ...(root.childNodes || []).flatMap(nodes)]; }
function attr(node, name) { return node.attrs?.find(item => item.name === name)?.value; }
function plain(root) { return (root.nodeName === '#text' ? root.value : (root.childNodes || []).map(plain).join('')).replace(/\s+/g, ' ').trim(); }
async function document(file) {
    if (!documents.has(file)) documents.set(file, parse(await readFile(file, 'utf8')));
    return documents.get(file);
}
const english = JSON.parse(await readFile('src/_data/copy/en.json', 'utf8'));
const french = JSON.parse(await readFile('src/_data/copy/fr.json', 'utf8'));
for (const pageKey of ['home', 'ventures', 'perspectives']) {
    assert.deepEqual(Object.keys(english[pageKey]).sort(), Object.keys(french[pageKey]).sort(), `Translation keys differ: ${pageKey}`);
    for (const value of Object.values(french[pageKey])) assert.equal(typeof value, 'string');
}

let checkedLinks = 0;
for (const lang of ['en', 'fr']) {
    for (const pageFile of pages) {
        const file = (lang === 'fr' ? 'fr/' : '') + pageFile;
        const html = await readFile(file, 'utf8');
        assert.equal(html, await readFile(path.join('_site', file), 'utf8'), `Generated copy is stale: ${file}`);
        assert.ok(!/\{[{%]|undefined/.test(html), `Unresolved template in ${file}`);
        const all = nodes(await document(file));
        assert.equal(attr(all.find(node => node.tagName === 'html'), 'lang'), lang);
        const ids = all.map(node => attr(node, 'id')).filter(Boolean);
        assert.equal(new Set(ids).size, ids.length, `Duplicate IDs in ${file}`);
        const localePath = lang === 'fr' ? 'fr/' : '';
        const expectedCanonical = `${origin}/${localePath}${pageFile === 'index.html' ? '' : pageFile}`;
        assert.equal(attr(all.find(node => attr(node, 'rel') === 'canonical'), 'href'), expectedCanonical);
        const alternates = all.filter(node => attr(node, 'rel') === 'alternate');
        for (const alternateLang of ['en', 'fr', 'x-default']) {
            const alternate = alternates.find(node => attr(node, 'hreflang') === alternateLang);
            assert.ok(alternate, `Missing hreflang ${alternateLang} in ${file}`);
            assert.equal(attr(alternate, 'href'), `${origin}/${alternateLang === 'fr' ? 'fr/' : ''}${pageFile === 'index.html' ? '' : pageFile}`);
        }
        const switches = all.filter(node => attr(node, 'data-site-language'));
        assert.equal(switches.length, 2);
        assert.equal(attr(switches.find(node => attr(node, 'aria-current') === 'true'), 'data-site-language'), lang);
        const scripts = all.filter(node => node.tagName === 'script').map(node => attr(node, 'src'));
        assert.equal(scripts.filter(src => src?.includes('/locales/') || src?.startsWith('js/locales/')).length, pageFile === 'perspectives.html' ? 1 : 0);
        assert.equal(scripts.some(src => src?.includes('jsvectormap')), pageFile === 'perspectives.html');
        if (pageFile === 'perspectives.html') assert.ok(scripts.some(src => src?.includes(`locales/${lang}/perspectives.js`)));
        if (pageFile === 'index.html') {
            const cvLinks = all.filter(node => attr(node, 'class')?.split(' ').includes('resume-download-link'));
            assert.equal(cvLinks.length, 2);
            const expectedCV = lang === 'fr' ? 'Mehdi-TAZI-resume-international-fr.pdf' : 'Mehdi-TAZI-resume-abstract-en.pdf';
            assert.ok(cvLinks.every(node => attr(node, 'href').endsWith(expectedCV)), `Default CV must match the ${lang} page`);
            assert.ok(cvLinks.every(node => attr(node, 'download') === `Mehdi-TAZI-resume-${lang}.pdf`));
            const cvToggles = all.filter(node => attr(node, 'class')?.split(' ').includes('resume-language-toggle'));
            assert.equal(cvToggles.length, 2);
            assert.ok(cvToggles.every(node => plain(node) === lang.toUpperCase()), `CV badge must match the ${lang} page`);
            const testimonialUrls = all.filter(node => node.tagName === 'a' && attr(node, 'href')?.startsWith('https://www.linkedin.com/in/') && !attr(node, 'href').includes('/details/')).map(node => attr(node, 'href'));
            assert.deepEqual(testimonialUrls, [
                'https://www.linkedin.com/in/thierrygrima/',
                'https://www.linkedin.com/in/christophehengrivot/',
                'https://www.linkedin.com/in/raphaelmansuy/',
                'https://www.linkedin.com/in/ruben-sastre-sedano-2b61489b/',
                'https://www.linkedin.com/in/weijie-chen-07babb179/',
                'https://www.linkedin.com/in/mlucic/'
            ]);
            const bubbles = all.filter(node => attr(node, 'class')?.split(' ').includes('testimonial-company-logo')).map(node => path.basename(attr(node, 'src')));
            assert.deepEqual(bubbles, ['decathlon.png','axa.png','cgi.jpg','umanis.png','capgemini.png','engie.png']);
        }
        for (const node of all) {
            for (const name of ['href', 'src']) {
                const value = attr(node, name);
                if (!value || /^(https?:|mailto:|tel:|data:)/.test(value)) continue;
                assert.ok(!value.startsWith('javascript:'), `Unsafe URL in ${file}`);
                const targetUrl = new URL(value, `${origin}/${file}`);
                const targetFile = decodeURIComponent(targetUrl.pathname.slice(1)) || 'index.html';
                await access(targetFile);
                if (targetUrl.hash && targetFile.endsWith('.html')) {
                    const targetNodes = nodes(await document(targetFile));
                    assert.ok(targetNodes.some(item => attr(item, 'id') === targetUrl.hash.slice(1)), `Broken anchor ${value} in ${file}`);
                }
                checkedLinks++;
            }
            for (const attribute of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
                const references = attr(node, attribute);
                if (references) for (const id of references.split(/\s+/)) assert.ok(ids.includes(id), `Broken ${attribute}=${id} in ${file}`);
            }
        }
        if (lang === 'fr') {
            const pageKey = pageFile === 'index.html' ? 'home' : pageFile.replace('.html', '');
            const renderedText = plain(await document(file));
            for (const [key, value] of Object.entries(english[pageKey])) {
                const englishText = plain(parseFragment(value));
                if (!key.startsWith('meta') && englishText.length > 35 && value !== french[pageKey][key]) {
                    assert.ok(!renderedText.includes(englishText), `Untranslated copy ${pageKey}.${key}`);
                }
            }
        }
    }
}
const source = JSON.parse(await readFile('data/travel-albums.json', 'utf8'));
const codes = Object.keys(source).filter(code => /^[A-Z]{2}$/.test(code)).sort();
for (const code of codes) await access(`img/flags/${(source[code].flag || code).toLowerCase()}.svg`);
const sharedContext = {window:{}};
vm.runInNewContext(await readFile('data/travel-albums.js', 'utf8'), sharedContext);
assert.deepEqual(Object.keys(sharedContext.window.TRAVEL_ALBUMS).filter(code => /^[A-Z]{2}$/.test(code)).sort(), codes);
assert.equal(await readFile('data/travel-albums.js', 'utf8'), await readFile('_site/data/travel-albums.js', 'utf8'));
for (const code of codes) {
    const generated = sharedContext.window.TRAVEL_ALBUMS[code];
    assert.equal(generated.albumUrl, source[code].albumUrl);
    assert.equal(JSON.stringify(generated.photos.map(photo => photo.src)), JSON.stringify((source[code].photos || []).map(photo => photo.src)), `Photo list changed: ${code}`);
    assert.ok(!('country' in generated), `Country names should come from the current locale: ${code}`);
}
for (const lang of ['en','fr']) {
    const context = {window:{}};
    vm.runInNewContext(await readFile(`js/locales/${lang}/perspectives.js`, 'utf8'), context);
    const ui = context.window.TRAVEL_I18N;
    assert.equal(ui.locale, lang);
    assert.deepEqual(Object.keys(ui.countries).sort(), codes);
    assert.ok(Object.values(ui.countries).every(value => typeof value === 'string' && value.length));
}
const sitemap = await readFile('sitemap.xml', 'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, 6);
assert.equal([...sitemap.matchAll(/hreflang=/g)].length, 18);
assert.ok(!sitemap.includes('#'));
console.log(`Validated six localized pages, ${checkedLinks} local links, metadata, language isolation and ${codes.length} travel countries.`);
