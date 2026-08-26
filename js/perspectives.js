(function () {
    'use strict';

    var mapElement = document.getElementById('travelMap');
    if (!mapElement) return;

    var listElement = document.getElementById('travelCountryList');
    var searchElement = document.getElementById('travelSearch');
    var filtersElement = document.getElementById('travelFilters');
    var statusElement = document.getElementById('travelMapStatus');
    var resultsElement = document.getElementById('travelResultsCount');
    var emptyElement = document.getElementById('travelEmptyState');
    var modalElement = document.getElementById('travelAlbumModal');
    var modal = modalElement && window.bootstrap ? new bootstrap.Modal(modalElement) : null;
    var data = {};
    var countries = [];
    var activeContinent = 'all';
    var activeCode = null;
    var returnFocus = null;
  var map = null;

    /* The JSON remains the source of names, album links and photo counts.
       These compact geographic fields are normalized onto each record so the
       map and cards share one model, including countries without map polygons. */
    var continents = {};
    var markers = {};
    var markerCountries = [];

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character];
        });
    }

    function flag(code) {
        return '<img class="travel-flag" src="img/flags/' + esc(code.toLowerCase()) + '.svg" alt="" aria-hidden="true">';
    }

    function albumCount(record) {
        return Array.isArray(record.photos) ? record.photos.length : 0;
    }

    function visibleCountries() {
        var query = (searchElement.value || '').trim().toLocaleLowerCase();
        var selectedFilter = filtersElement.querySelector('button[aria-pressed="true"]');
        var continent = selectedFilter ? selectedFilter.dataset.continent : 'all';
        return countries.filter(function (country) {
            return (continent === 'all' || country.continent === continent || (continent === 'Americas' && (country.continent === 'North America' || country.continent === 'South America'))) && (!query || country.country.toLocaleLowerCase().indexOf(query) !== -1);
        });
    }

    function selectCode(code, focusCard) {
        var country = data[code];
        if (!country) return;
        activeCode = code;
        document.querySelectorAll('[data-code]').forEach(function (node) { node.classList.toggle('is-active', node.getAttribute('data-code') === code); });
        mapElement.querySelectorAll('[data-code]').forEach(function (region) {
            region.classList.toggle('travel-map-active', region.getAttribute('data-code') === code);
        });
        statusElement.textContent = country.country + ' selected. ' + albumCount(country) + ' photos.';
        if (focusCard) {
            var card = listElement.querySelector('[data-code="' + code + '"]');
            if (card) card.focus();
        }
    }

    function renderCards() {
        var visible = visibleCountries();
        listElement.innerHTML = visible.map(function (country) {
            var count = albumCount(country);
            return '<button type="button" class="travel-country-card" data-code="' + esc(country.code) + '" aria-label="Open ' + esc(country.country) + ' photo album">' +
                '<div class="travel-country-card-top">' + flag(country.code) + '<span class="travel-country-code">' + esc(country.code) + '</span></div>' +
                '<h3>' + esc(country.country) + '</h3><p>' + esc(country.continent) + '</p>' +
                '<span class="travel-photo-count">' + (count ? count + ' photo' + (count === 1 ? '' : 's') : 'Flickr album') + '</span></button>';
        }).join('');
        resultsElement.textContent = visible.length + ' of ' + countries.length + ' countries';
        emptyElement.hidden = visible.length !== 0;
    }

    function renderModal(code) {
        var country = data[code];
        var meta = document.getElementById('travelAlbumMeta');
        var title = document.getElementById('travelAlbumTitle');
        var body = document.getElementById('travelAlbumBody');
        var link = document.getElementById('travelAlbumLink');
        if (!country) return;
        activeCode = code;
        title.textContent = country.country;
        meta.innerHTML = flag(code) + '<span>' + esc(country.continent) + '</span>';
        link.href = country.albumUrl;
        var count = albumCount(country);
        body.innerHTML = count ? '<div class="travel-photo-toolbar"><span>' + count + ' selected photos</span><a href="' + esc(country.albumUrl) + '" target="_blank" rel="noopener noreferrer">Full album on Flickr</a></div><div class="travel-photo-grid">' + country.photos.map(function (photo, index) {
            return '<figure class="travel-photo-item"><img loading="lazy" src="' + esc(photo.src) + '" alt="' + esc(photo.alt || country.country) + ' photo ' + (index + 1) + '"></figure>';
        }).join('') + '</div>' : '<div class="travel-album-error"><h6>No selected photos yet</h6><p class="mb-0">The album is available on Flickr.</p></div>';
        var position = countries.findIndex(function (item) { return item.code === code; });
        document.getElementById('travelAlbumPrevious').disabled = position <= 0;
        document.getElementById('travelAlbumNext').disabled = position >= countries.length - 1;
        selectCode(code, false);
        window.history.replaceState(null, '', '?country=' + encodeURIComponent(code));
        if (modal) modal.show(); else { modalElement.classList.add('show'); modalElement.style.display = 'block'; modalElement.setAttribute('aria-hidden', 'false'); }
    }

    function openAlbum(code, source) {
        returnFocus = source || document.activeElement;
        renderModal(code);
    }

    function load() {
        var json = window.TRAVEL_ALBUMS;
        if (!json) {
            listElement.innerHTML = '<p class="travel-map-unavailable">Albums could not be loaded right now. Please refresh to try again.</p>';
            return;
        }
        try {
            data = json;
            var meta = json._meta || {};
            continents = meta.continents || {};
            markers = meta.markers || {};
            countries = Object.keys(data).filter(function (code) { return data[code] && data[code].country; }).map(function (code) { return Object.assign({}, data[code], { code: code, continent: data[code].continent || continents[code] || 'Other', coordinates: data[code].coordinates || markers[code] || null, flag: data[code].flag || code, photoCount: albumCount(data[code]) }); }).sort(function (a, b) { return a.country.localeCompare(b.country); });
            markerCountries = countries.filter(function (country) { return Array.isArray(country.coordinates); });
            document.getElementById('travelCountryTotal').textContent = countries.length;
            document.getElementById('travelContinentTotal').textContent = new Set(countries.map(function (item) { return item.continent; })).size;
            renderCards();
            if (typeof window.jsVectorMap !== 'undefined') {
                try {
                    map = new jsVectorMap({ selector: '#travelMap', map: 'world', zoomButtons: false, zoomOnScroll: false, selectedRegions: countries.map(function (item) { return item.code; }), markers: markerCountries.map(function (country) { return { name: country.country, coords: country.coordinates, code: country.code }; }), markerStyle: { initial: { r: 8, fill: '#e06b42', stroke: '#fff', strokeWidth: 2 }, hover: { r: 10 }, selected: { r: 9, fill: '#173b57' } }, regionStyle: { initial: { fill: '#e8eef3', stroke: '#fff', strokeWidth: .5 }, hover: { fill: '#f4b942', cursor: 'pointer' }, selected: { fill: '#287aa9' }, selectedHover: { fill: '#173b57' } }, onRegionClick: function (event, code) { if (data[code]) openAlbum(code, event.target); }, onMarkerClick: function (event, index) { var country = markerCountries[Number(index)]; if (country) openAlbum(country.code, event.target); }, onRegionTooltipShow: function (event, tooltip, code) { if (data[code]) tooltip.text(data[code].country + ' · ' + albumCount(data[code]) + ' photos'); }, onMarkerTooltipShow: function (event, tooltip, index) { var country = markerCountries[Number(index)]; if (country) tooltip.text(country.country + ' · album marker'); } });
                    mapElement.querySelectorAll('[data-code]').forEach(function (region) {
                        if (!data[region.getAttribute('data-code')]) region.style.pointerEvents = 'none';
                    });
                } catch (error) { mapElement.innerHTML = '<p class="travel-map-unavailable">The interactive map is unavailable. The full country collection remains available below.</p>'; }
            }
            var requestedCode = new URLSearchParams(window.location.search).get('country');
            if (requestedCode && data[requestedCode.toUpperCase()]) openAlbum(requestedCode.toUpperCase(), null);
        } catch (error) { listElement.innerHTML = '<p class="travel-map-unavailable">Albums could not be loaded right now. Please refresh to try again.</p>'; }
    }

    searchElement.addEventListener('input', renderCards);
    filtersElement.addEventListener('click', function (event) { var button = event.target.closest('button[data-continent]'); if (!button) return; activeContinent = button.dataset.continent; filtersElement.querySelectorAll('button').forEach(function (item) { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); }); renderCards(); });
    listElement.addEventListener('click', function (event) { var card = event.target.closest('[data-code]'); if (card) openAlbum(card.dataset.code, card); });
    listElement.addEventListener('keydown', function (event) { var card = event.target.closest('[data-code]'); if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openAlbum(card.dataset.code, card); } });
    document.getElementById('travelZoomIn').addEventListener('click', function () {
        if (map && typeof map._setScale === 'function') map._setScale(map.scale * map.params.zoomStep, map._width / 2, map._height / 2, false, map.params.zoomAnimate);
    });
    document.getElementById('travelZoomOut').addEventListener('click', function () {
        if (map && typeof map._setScale === 'function') map._setScale(map.scale / map.params.zoomStep, map._width / 2, map._height / 2, false, map.params.zoomAnimate);
    });
    document.getElementById('travelMapReset').addEventListener('click', function () {
      if (map && typeof map._applyTransform === 'function') {
        // Restore the fitted initial viewport without using map.reset(), which
        // also removes the country markers displayed on the map.
        map.scale = map._baseScale;
        map.transX = map._baseTransX;
        map.transY = map._baseTransY;
        map._applyTransform();
      }
    });
    document.getElementById('travelAlbumPrevious').addEventListener('click', function () { var i = countries.findIndex(function (item) { return item.code === activeCode; }); if (i > 0) renderModal(countries[i - 1].code); });
    document.getElementById('travelAlbumNext').addEventListener('click', function () { var i = countries.findIndex(function (item) { return item.code === activeCode; }); if (i < countries.length - 1) renderModal(countries[i + 1].code); });
    if (modalElement) modalElement.addEventListener('hidden.bs.modal', function () { if (returnFocus && returnFocus.focus) returnFocus.focus(); });
    load();
}());
