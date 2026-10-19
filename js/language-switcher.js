(function () {
    'use strict';
    var links = document.querySelectorAll('[data-site-language]');
    function update() {
        links.forEach(function (link) {
            var target = new URL(link.getAttribute('href'), window.location.href);
            target.search = window.location.search;
            target.hash = window.location.hash;
            link.href = target.href;
        });
    }
    links.forEach(function (link) {
        link.addEventListener('focus', update);
        link.addEventListener('pointerdown', update);
        link.addEventListener('click', update);
    });
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    window.addEventListener('site:locationchange', update);
    update();
}());
