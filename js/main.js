(function ($) {
    'use strict';

    // Page content is already rendered in the requested language. This script
    // only initializes interactions whose libraries and elements are present.
    setTimeout(function () {
        $('#spinner').removeClass('show').css('pointer-events', 'none');
        setTimeout(function () { $('#spinner').remove(); }, 350);
    }, 1);
    if (typeof WOW !== 'undefined') new WOW().init();

    var homePage = document.getElementById('home');
    function updateNavigation() {
        var scrolled = $(window).scrollTop() > 300;
        $('.navbar').toggleClass('navbar-scrolled', !homePage || scrolled);
        $('.back-to-top').toggle(scrolled);
    }
    $(window).on('scroll', updateNavigation);
    updateNavigation();

    $('.navbar-nav a').on('click', function (event) {
        if (!this.hash) return;
        var target = document.getElementById(this.hash.slice(1));
        if (!target) return;
        event.preventDefault();
        var link = this;
        $('html, body').animate({ scrollTop: $(target).offset().top - 85 }, 700, 'easeInOutExpo', function () {
            if (window.location.hash !== link.hash) {
                window.history.replaceState(null, '', link.hash);
                window.dispatchEvent(new Event('site:locationchange'));
            }
        });
        $('.navbar-nav .active').removeClass('active');
        $(this).addClass('active');
        var collapse = document.getElementById('navbarCollapse');
        if (collapse?.classList.contains('show') && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(collapse).hide();
    });

    $('.back-to-top').on('click', function (event) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 700, 'easeInOutExpo');
    });

    if ($('.typed-text-output').length && typeof Typed !== 'undefined') {
        new Typed('.typed-text-output', {
            strings: $('.typed-text').text().split(', '), typeSpeed: 100,
            backSpeed: 20, smartBackspace: false, loop: true
        });
    }
    if ($.fn.counterUp) $('[data-toggle="counter-up"]').counterUp({ delay: 10, time: 2000 });
    if ($.fn.waypoint) $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () { $(this).css('width', $(this).attr('aria-valuenow') + '%'); });
    }, { offset: '80%' });
    if ($.fn.isotope && $('.portfolio-container').length) {
        var portfolio = $('.portfolio-container').isotope({ itemSelector: '.portfolio-item', layoutMode: 'fitRows' });
        $('#portfolio-flters li').on('click', function () {
            $('#portfolio-flters li').removeClass('active');
            $(this).addClass('active');
            portfolio.isotope({ filter: $(this).data('filter') });
        });
    }
    if ($.fn.owlCarousel && $('.testimonial-carousel').length) {
        $('.testimonial-carousel').owlCarousel({ autoplay: true, smartSpeed: 1000, items: 1, dots: true, loop: true });
    }
}(jQuery));
