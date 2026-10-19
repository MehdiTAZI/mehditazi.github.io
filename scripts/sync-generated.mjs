import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Keep branch-based GitHub Pages and direct local previews working. Only these
// generated files are synchronized; user assets and source files are untouched.
const files = ['index.html', 'ventures.html', 'perspectives.html', 'sitemap.xml',
    'fr/index.html', 'fr/ventures.html', 'fr/perspectives.html',
    'js/locales/en/perspectives.js', 'js/locales/fr/perspectives.js', 'data/travel-albums.js'];
for (const file of files) {
    await mkdir(path.dirname(file), { recursive: true });
    await copyFile(path.join('_site', file), file);
}
console.log(`Synchronized ${files.length} generated files for static hosting.`);
