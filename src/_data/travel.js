import { readFile } from 'node:fs/promises';

export default async function () {
    return JSON.parse(await readFile(new URL('../../data/travel-albums.json', import.meta.url), 'utf8'));
}
