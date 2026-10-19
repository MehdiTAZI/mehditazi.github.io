import { travelScript } from '../scripts/travel-data.mjs';

export default class {
    data() { return { permalink: 'data/travel-albums.js', eleventyExcludeFromCollections: true }; }
    render({ travel }) { return travelScript(travel); }
}
