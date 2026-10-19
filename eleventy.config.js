import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const pageFiles = { home: 'index.html', ventures: 'ventures.html', perspectives: 'perspectives.html' };
const origin = `https://${readFileSync(new URL('./CNAME', import.meta.url), 'utf8').trim()}`;
const assetHash = createHash('sha256');
for (const file of ['css/style.css', 'js/main.js', 'js/perspectives.js', 'js/language-switcher.js', 'data/travel-albums.json', 'scripts/travel-data.mjs', 'src/_data/travelUi.json', 'src/travel-locale.11ty.js']) {
    assetHash.update(readFileSync(new URL(file, import.meta.url)));
}

export default function (config) {
    config.setNunjucksEnvironmentOptions({ autoescape: true, throwOnUndefined: true });
    config.addTransform('trim-line-endings', function (content) {
        return /\.(html|xml)$/.test(this.page.outputPath || '') ? content.replace(/[\t ]+$/gm, '') : content;
    });
    config.addGlobalData('site', { origin, version: assetHash.digest('hex').slice(0, 12), pageFiles });
    config.addGlobalData('languages', [{ code: 'en', prefix: '' }, { code: 'fr', prefix: 'fr/' }]);
    config.addGlobalData('eleventyComputed', {
        assetRoot: data => data.locale?.code === 'fr' ? '../' : '',
        common: data => data.shared?.[data.locale?.code || 'en']
    });
    config.addFilter('pageUrl', (pageKey, language) => {
        const file = pageKey === 'home' ? '' : pageFiles[pageKey];
        return `${origin}/${language === 'fr' ? 'fr/' : ''}${file}`;
    });
    config.addFilter('countryCount', data => Object.keys(data).filter(code => /^[A-Z]{2}$/.test(code)).length);
    for (const directory of ['css', 'img', 'js', 'lib', 'resources']) config.addPassthroughCopy(directory);
    for (const file of ['CNAME', '.nojekyll', 'google004780fff4bfd91b.html']) config.addPassthroughCopy(file);
    config.addWatchTarget('css/');
    config.addWatchTarget('js/');
    config.addWatchTarget('data/travel-albums.json');
    return { dir: { input: 'src', includes: '_includes', data: '_data', output: '_site' }, templateFormats: ['njk', '11ty.js'] };
}
