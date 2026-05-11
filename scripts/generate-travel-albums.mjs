import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const mainJs = await fs.readFile(path.join(root, 'js/main.js'), 'utf8');

function objectBlock(name) {
    const start = mainJs.indexOf(`var ${name} = {`);
    if (start < 0) {
        throw new Error(`Missing ${name}`);
    }

    const from = mainJs.indexOf('{', start);
    let depth = 0;

    for (let i = from; i < mainJs.length; i++) {
        if (mainJs[i] === '{') depth++;
        if (mainJs[i] === '}') depth--;
        if (depth === 0) {
            return mainJs.slice(from, i + 1);
        }
    }

    throw new Error(`Unterminated ${name}`);
}

function parseObject(block) {
    const entries = {};
    const re = /([A-Z]{2}):\s*'([^']+)'/g;
    let match;

    while ((match = re.exec(block))) {
        entries[match[1]] = match[2];
    }

    return entries;
}

function extractPhotos(html) {
    const photos = new Map();
    const patterns = [
        /"displayUrl":"(\\\/\\\/live\.staticflickr\.com\\\/[^\"]+?_c\.jpg)"/g,
        /"displayUrl":"(\\\/\\\/live\.staticflickr\.com\\\/[^\"]+?_b\.jpg)"/g,
        /"displayUrl":"(\\\/\\\/live\.staticflickr\.com\\\/[^\"]+?_z\.jpg)"/g
    ];

    for (const pattern of patterns) {
        let match;

        while ((match = pattern.exec(html))) {
            const src = `https:${match[1].replace(/\\\//g, '/')}`;
            const idMatch = src.match(/\/([0-9]+)_[^/]+_[cbz]\.jpg$/);
            const id = idMatch ? idMatch[1] : src;

            if (!photos.has(id)) {
                photos.set(id, src);
            }
        }

        if (photos.size >= 12) {
            break;
        }
    }

    return Array.from(photos.values()).slice(0, 24);
}

const countries = parseObject(objectBlock('visitedCountries'));
const albumUrls = parseObject(objectBlock('flickrAlbumUrls'));
const output = {};

for (const [code, albumUrl] of Object.entries(albumUrls)) {
    const response = await fetch(albumUrl);

    if (!response.ok) {
        throw new Error(`Could not fetch ${code}: ${response.status}`);
    }

    const html = await response.text();
    const photos = extractPhotos(html).map((src) => ({
        src,
        alt: countries[code] || code
    }));

    output[code] = {
        country: countries[code] || code,
        albumUrl,
        photos
    };

    console.log(`${code}: ${photos.length} photos`);
}

await fs.mkdir(path.join(root, 'data'), { recursive: true });
await fs.writeFile(
    path.join(root, 'data/travel-albums.json'),
    `${JSON.stringify(output, null, 2)}\n`
);
