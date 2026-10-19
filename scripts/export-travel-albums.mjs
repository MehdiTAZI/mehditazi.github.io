import fs from 'node:fs/promises';
import path from 'node:path';
import { travelScript } from './travel-data.mjs';

const root = process.cwd();
const sourcePath = path.join(root, 'data/travel-albums.json');
const outputPath = path.join(root, 'data/travel-albums.js');
const data = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
await fs.writeFile(outputPath, travelScript(data));
