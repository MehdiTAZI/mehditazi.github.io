export default class {
    data() {
        return {
            pagination: { data: 'languages', size: 1, alias: 'locale' },
            permalink: data => `js/locales/${data.locale.code}/perspectives.js`,
            eleventyExcludeFromCollections: true
        };
    }

    render({ locale, travel, travelUi }) {
        const regionNames = new Intl.DisplayNames([locale.code], { type: 'region' });
        const countries = Object.fromEntries(Object.entries(travel)
            .filter(([code, item]) => /^[A-Z]{2}$/.test(code) && item.country)
            .map(([code, item]) => [code, locale.code === 'en' ? item.country : regionNames.of(code)]));
        return `/* Generated from src/_data/travelUi.json and travel country codes. */\nwindow.TRAVEL_I18N = ${JSON.stringify({ locale: locale.code, ...travelUi[locale.code], countries })};\n`;
    }
}
