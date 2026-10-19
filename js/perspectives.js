(function () {
    'use strict';
    var mapElement = document.getElementById('travelMap');
    if (!mapElement) return;

    var listElement = document.getElementById('travelCountryList');
    var ui = window.TRAVEL_I18N;
    if (!ui) { listElement.textContent = listElement.dataset.loadError; return; }
    var assetRoot = document.body.dataset.siteRoot || '';
    var searchElement = document.getElementById('travelSearch');
    var filtersElement = document.getElementById('travelFilters');
    var statusElement = document.getElementById('travelMapStatus');
    var resultsElement = document.getElementById('travelResultsCount');
    var emptyElement = document.getElementById('travelEmptyState');
    var modalElement = document.getElementById('travelAlbumModal');
    var modal = window.bootstrap ? new bootstrap.Modal(modalElement) : null;
    var data = {};
    var countries = [];
    var activeCode = null;
    var returnFocus = null;
    var map = null;
    var numberFormat = new Intl.NumberFormat(ui.locale);

    function text(key, parameters) {
        return ui[key].replace(/\{(\w+)\}/g, function (_, name) { return String(parameters[name]); });
    }
    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }
    function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(ui.locale); }
    function flag(code) { return '<img class="travel-flag" loading="lazy" decoding="async" src="' + assetRoot + 'img/flags/' + esc(code.toLowerCase()) + '.svg" alt="" aria-hidden="true">'; }
    function albumCount(country) { return Array.isArray(country.photos) ? country.photos.length : 0; }
    function photoLabel(count, selected) { return text(selected ? (count === 1 ? 'selectedPhotoOne' : 'selectedPhotoMany') : (count === 1 ? 'photoOne' : 'photoMany'), { count: numberFormat.format(count) }); }
    function continentLabel(country) { return ui.continents[country.continent] || country.continent; }

    function visibleCountries() {
        var query = normalize((searchElement.value || '').trim());
        var selectedFilter = filtersElement.querySelector('button[aria-pressed="true"]');
        var continent = selectedFilter ? selectedFilter.dataset.continent : 'all';
        return countries.filter(function (country) {
            return (continent === 'all' || country.continent === continent || (continent === 'Americas' && ['North America', 'South America'].includes(country.continent))) && (!query || normalize(country.country).includes(query) || country.code.toLowerCase() === query);
        });
    }
    function selectCode(code) {
        var country = data[code];
        if (!country) return;
        activeCode = code;
        listElement.querySelectorAll('[data-code]').forEach(function (card) { card.classList.toggle('is-active', card.dataset.code === code); });
        mapElement.querySelectorAll('[data-code]').forEach(function (region) { region.classList.toggle('travel-map-active', region.dataset.code === code); });
        statusElement.textContent = text('selected', { country: country.country, photos: photoLabel(albumCount(country)) });
    }
    function renderCards() {
        var visible = visibleCountries();
        listElement.innerHTML = visible.map(function (country) {
            var count = albumCount(country);
            return '<button type="button" class="travel-country-card' + (country.code === activeCode ? ' is-active' : '') + '" data-code="' + country.code + '" aria-label="' + esc(text('openAlbum', {country:country.country})) + '">' +
                '<div class="travel-country-card-top">' + flag(country.flag) + '<span class="travel-country-code">' + country.code + '</span></div>' +
                '<h3>' + esc(country.country) + '</h3><p>' + esc(continentLabel(country)) + '</p><span class="travel-photo-count">' + esc(count ? photoLabel(count) : ui.flickrAlbum) + '</span></button>';
        }).join('');
        resultsElement.textContent = text('results', {visible:numberFormat.format(visible.length), total:numberFormat.format(countries.length)});
        emptyElement.hidden = visible.length !== 0;
    }
    function renderModal(code) {
        var country = data[code];
        if (!country) return;
        document.getElementById('travelAlbumTitle').textContent = country.country;
        document.getElementById('travelAlbumMeta').innerHTML = flag(country.flag) + '<span>' + esc(continentLabel(country)) + '</span>';
        document.getElementById('travelAlbumLink').href = country.albumUrl;
        var count = albumCount(country);
        document.getElementById('travelAlbumBody').innerHTML = count ? '<div class="travel-photo-toolbar"><span>' + esc(photoLabel(count, true)) + '</span><a href="' + esc(country.albumUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(ui.fullAlbum) + '</a></div><div class="travel-photo-grid">' + country.photos.map(function (photo, index) {
            return '<figure class="travel-photo-item"><img loading="lazy" src="' + esc(photo.src) + '" alt="' + esc(text('photoAlt', {country:country.country, number:index + 1})) + '"></figure>';
        }).join('') + '</div>' : '<div class="travel-album-error"><h6>' + esc(ui.noPhotos) + '</h6><p class="mb-0">' + esc(ui.albumAvailable) + '</p></div>';
        var position = countries.findIndex(function (item) { return item.code === code; });
        document.getElementById('travelAlbumPrevious').disabled = position <= 0;
        document.getElementById('travelAlbumNext').disabled = position >= countries.length - 1;
        selectCode(code);
        var url = new URL(window.location.href);
        url.searchParams.set('country', code);
        window.history.replaceState(null, '', url);
        window.dispatchEvent(new Event('site:locationchange'));
        if (modal) modal.show();
    }
    function openAlbum(code, source) { returnFocus = source || document.activeElement; renderModal(code); }

    function load() {
        var raw = window.TRAVEL_ALBUMS;
        if (!raw) { listElement.textContent = ui.loadError; return; }
        try {
            var meta = raw._meta || {};
            countries = Object.keys(raw).filter(function (code) { return /^[A-Z]{2}$/.test(code) && raw[code].albumUrl; }).map(function (code) {
                var country = Object.assign({}, raw[code], {
                    code: code, country: ui.countries[code],
                    continent: raw[code].continent || (meta.continents || {})[code] || 'Other',
                    coordinates: raw[code].coordinates || (meta.markers || {})[code] || null,
                    flag: raw[code].flag || code
                });
                data[code] = country;
                return country;
            }).sort(function (a,b) { return a.country.localeCompare(b.country, ui.locale); });
            var markerCountries = countries.filter(function (country) { return Array.isArray(country.coordinates); });
            document.getElementById('travelCountryTotal').textContent = numberFormat.format(countries.length);
            document.getElementById('travelContinentTotal').textContent = numberFormat.format(new Set(countries.map(function (item) { return item.continent; })).size);
            renderCards();
            if (typeof window.jsVectorMap !== 'undefined') {
                try {
                    map = new jsVectorMap({
                        selector:'#travelMap', map:'world', zoomButtons:false, zoomOnScroll:false,
                        selectedRegions:countries.map(function (item) { return item.code; }),
                        markers:markerCountries.map(function (country) { return {name:country.country, coords:country.coordinates, code:country.code}; }),
                        markerStyle:{initial:{r:8,fill:'#e06b42',stroke:'#fff',strokeWidth:2},hover:{r:10},selected:{r:9,fill:'#173b57'}},
                        regionStyle:{initial:{fill:'#e8eef3',stroke:'#fff',strokeWidth:.5},hover:{fill:'#f4b942',cursor:'pointer'},selected:{fill:'#287aa9'},selectedHover:{fill:'#173b57'}},
                        onRegionClick:function (event,code) { if (data[code]) openAlbum(code,event.target); },
                        onMarkerClick:function (event,index) { var country = markerCountries[Number(index)]; if (country) openAlbum(country.code,event.target); },
                        onRegionTooltipShow:function (event,tooltip,code) { if (data[code]) tooltip.text(data[code].country + ' · ' + photoLabel(albumCount(data[code]))); },
                        onMarkerTooltipShow:function (event,tooltip,index) { var country = markerCountries[Number(index)]; if (country) tooltip.text(country.country + ' · ' + ui.marker); }
                    });
                    mapElement.querySelectorAll('[data-code]').forEach(function (region) { if (!data[region.dataset.code]) region.style.pointerEvents = 'none'; });
                } catch (error) { mapElement.innerHTML = '<p class="travel-map-unavailable">' + esc(ui.mapError) + '</p>'; }
            } else { mapElement.innerHTML = '<p class="travel-map-unavailable">' + esc(ui.mapError) + '</p>'; }
            var requestedCode = new URLSearchParams(window.location.search).get('country');
            if (requestedCode && data[requestedCode.toUpperCase()]) openAlbum(requestedCode.toUpperCase(), null);
        } catch (error) { listElement.textContent = ui.loadError; }
    }
    searchElement.addEventListener('input', renderCards);
    filtersElement.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-continent]');
        if (!button) return;
        filtersElement.querySelectorAll('button').forEach(function (item) { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); });
        renderCards();
    });
    listElement.addEventListener('click', function (event) { var card = event.target.closest('[data-code]'); if (card) openAlbum(card.dataset.code,card); });
    document.getElementById('travelZoomIn').addEventListener('click', function () { if (map) map._setScale(map.scale * map.params.zoomStep,map._width/2,map._height/2,false,map.params.zoomAnimate); });
    document.getElementById('travelZoomOut').addEventListener('click', function () { if (map) map._setScale(map.scale / map.params.zoomStep,map._width/2,map._height/2,false,map.params.zoomAnimate); });
    document.getElementById('travelMapReset').addEventListener('click', function () {
        if (!map) return;
        map.scale = map._baseScale;
        map.transX = map._baseTransX;
        map.transY = map._baseTransY;
        map._applyTransform();
    });
    document.getElementById('travelAlbumPrevious').addEventListener('click', function () { var i = countries.findIndex(function (item) { return item.code === activeCode; }); if (i > 0) renderModal(countries[i-1].code); });
    document.getElementById('travelAlbumNext').addEventListener('click', function () { var i = countries.findIndex(function (item) { return item.code === activeCode; }); if (i < countries.length-1) renderModal(countries[i+1].code); });
    modalElement.addEventListener('hidden.bs.modal', function () { if (returnFocus?.isConnected && returnFocus.focus) returnFocus.focus(); });
    load();
}());
