(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            var $spinner = $('#spinner');

            if ($spinner.length > 0) {
                $spinner.removeClass('show').css('pointer-events', 'none');

                setTimeout(function () {
                    $spinner.remove();
                }, 350);
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }


    // Navbar on scrolling
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.navbar').addClass('navbar-scrolled');
        } else {
            $('.navbar').removeClass('navbar-scrolled');
        }
    });


    // Smooth scrolling on the navbar links
    $(".navbar-nav a").on('click', function (event) {
        if (this.hash !== "") {
            var target = $(this.hash);
            if (!target.length) {
                return;
            }
            event.preventDefault();
            
            $('html, body').animate({
                scrollTop: target.offset().top - 45
            }, 1500, 'easeInOutExpo');
            
            if ($(this).parents('.navbar-nav').length) {
                $('.navbar-nav .active').removeClass('active');
                $(this).closest('a').addClass('active');
            }
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    

    // Typed Initiate
    if ($('.typed-text-output').length == 1) {
        var typed_strings = $('.typed-text').text();
        var typed = new Typed('.typed-text-output', {
            strings: typed_strings.split(', '),
            typeSpeed: 100,
            backSpeed: 20,
            smartBackspace: false,
            loop: true
        });
    }


    // Modal Video
    var $videoSrc;
    $('.btn-play').click(function () {
        $videoSrc = $(this).data("src");
    });
    $('#videoModal').on('shown.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    })
    $('#videoModal').on('hide.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc);
    })


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Travel map
    var visitedCountries = {
        AE: 'United Arab Emirates',
        AT: 'Austria',
        BA: 'Bosnia and Herzegovina',
        BE: 'Belgium',
        BO: 'Bolivia',
        BR: 'Brazil',
        CH: 'Switzerland',
        CZ: 'Czech Republic',
        DE: 'Germany',
        EE: 'Estonia',
        ES: 'Spain',
        FI: 'Finland',
        FR: 'France',
        GA: 'Gabon',
        GB: 'United Kingdom',
        GR: 'Greece',
        HK: 'Hong Kong',
        HR: 'Croatia',
        HU: 'Hungary',
        ID: 'Indonesia',
        IR: 'Iran',
        IT: 'Italy',
        JO: 'Jordan',
        LU: 'Luxembourg',
        LT: 'Lithuania',
        LV: 'Latvia',
        MA: 'Morocco',
        MC: 'Monaco',
        MO: 'Macau',
        MY: 'Malaysia',
        NL: 'Netherlands',
        PE: 'Peru',
        PL: 'Poland',
        PT: 'Portugal',
        SE: 'Sweden',
        SG: 'Singapore',
        SK: 'Slovakia',
        SZ: 'Eswatini',
        TN: 'Tunisia',
        TR: 'Turkey',
        US: 'United States',
        VA: 'Vatican City',
        ZA: 'South Africa'
    };

    var flickrAlbumUrls = {
        AE: 'https://www.flickr.com/photos/tazimehdi/albums/72157676461703893',
        AT: 'https://www.flickr.com/photos/tazimehdi/albums/72157694166422724',
        BA: 'https://www.flickr.com/photos/tazimehdi/albums/72157719613533606',
        BE: 'https://www.flickr.com/photos/tazimehdi/albums/72157689185401220',
        BO: 'https://www.flickr.com/photos/tazimehdi/albums/72157696277293064',
        BR: 'https://www.flickr.com/photos/tazimehdi/albums/72157695172493531',
        CH: 'https://www.flickr.com/photos/tazimehdi/albums/72157665074781487',
        CZ: 'https://www.flickr.com/photos/tazimehdi/albums/72157693136690071',
        DE: 'https://www.flickr.com/photos/tazimehdi/albums/72157693136763981',
        EE: 'https://www.flickr.com/photos/tazimehdi/albums/72157671202581482',
        ES: 'https://www.flickr.com/photos/tazimehdi/albums/72157694167053264',
        FI: 'https://www.flickr.com/photos/tazimehdi/albums/72157671981294896',
        FR: 'https://www.flickr.com/photos/tazimehdi/albums/72157671313477241',
        GA: 'https://www.flickr.com/photos/tazimehdi/albums/72177720333474193',
        GB: 'https://www.flickr.com/photos/tazimehdi/albums/72157691822884912',
        GR: 'https://www.flickr.com/photos/tazimehdi/albums/72157691822601392',
        HK: 'https://www.flickr.com/photos/tazimehdi/albums/72157676381154394',
        HR: 'https://www.flickr.com/photos/tazimehdi/albums/72157719620788692',
        HU: 'https://www.flickr.com/photos/tazimehdi/albums/72157667113209768',
        ID: 'https://www.flickr.com/photos/tazimehdi/albums/72157676474604673',
        IR: 'https://www.flickr.com/photos/tazimehdi/albums/72157676506710083',
        IT: 'https://www.flickr.com/photos/tazimehdi/albums/72157667113191418',
        JO: 'https://www.flickr.com/photos/tazimehdi/albums/72177720308846808',
        LT: 'https://www.flickr.com/photos/tazimehdi/albums/72157669078456663',
        LU: 'https://www.flickr.com/photos/tazimehdi/albums/72157665074605997',
        LV: 'https://www.flickr.com/photos/tazimehdi/albums/72157672096253085',
        MA: 'https://www.flickr.com/photos/tazimehdi/albums/72157676445341523',
        MC: 'https://www.flickr.com/photos/tazimehdi/albums/72157665074517297',
        MO: 'https://www.flickr.com/photos/tazimehdi/albums/72157676386501834',
        MY: 'https://www.flickr.com/photos/tazimehdi/albums/72157677903425202',
        NL: 'https://www.flickr.com/photos/tazimehdi/albums/72157694916874855',
        PE: 'https://www.flickr.com/photos/tazimehdi/albums/72157696903806115',
        PL: 'https://www.flickr.com/photos/tazimehdi/albums/72157691823232802',
        PT: 'https://www.flickr.com/photos/tazimehdi/albums/72157694916863795',
        SE: 'https://www.flickr.com/photos/tazimehdi/albums/72157693137738711',
        SG: 'https://www.flickr.com/photos/tazimehdi/albums/72157678482137570',
        SK: 'https://www.flickr.com/photos/tazimehdi/albums/72157691823642242',
        SZ: 'https://www.flickr.com/photos/tazimehdi/albums/72157676508667943',
        TN: 'https://www.flickr.com/photos/tazimehdi/albums/72157676356154694',
        TR: 'https://www.flickr.com/photos/tazimehdi/albums/72157671200886502',
        US: 'https://www.flickr.com/photos/tazimehdi/albums/72157679907312066',
        VA: 'https://www.flickr.com/photos/tazimehdi/albums/72157689186103600',
        ZA: 'https://www.flickr.com/photos/tazimehdi/albums/72157679907052366'
    };

    if ($('#travelMap').length && typeof jsVectorMap !== 'undefined') {
        var visitedCodes = Object.keys(visitedCountries);
        var $albumModal = $('#travelAlbumModal');
        var $albumTitle = $('#travelAlbumTitle');
        var $albumBody = $('#travelAlbumBody');
        var $albumLink = $('#travelAlbumLink');
        var travelAlbumModal = $albumModal.length && typeof bootstrap !== 'undefined'
            ? new bootstrap.Modal($albumModal[0])
            : null;
        var travelAlbumData = null;
        var travelAlbumDataRequest = null;
        var albumEmbedCache = {};

        var closeTravelAlbumModal = function() {
            if (!$albumModal.length) {
                return;
            }

            if (travelAlbumModal) {
                travelAlbumModal.hide();
                return;
            }

            $albumModal.removeClass('show').attr('aria-hidden', 'true').css('display', 'none');
            $('body').removeClass('modal-open').css({
                overflow: '',
                paddingRight: ''
            });
            $('.modal-backdrop.travel-album-backdrop').remove();
        };

        var openTravelAlbumModal = function() {
            if (!$albumModal.length) {
                return;
            }

            if (travelAlbumModal) {
                travelAlbumModal.show();
                return;
            }

            $albumModal.addClass('show').attr({
                'aria-hidden': 'false',
                'aria-modal': 'true',
                role: 'dialog'
            }).css('display', 'block');
            $('body').addClass('modal-open').css('overflow', 'hidden');

            if (!$('.modal-backdrop.travel-album-backdrop').length) {
                $('<div>', {
                    class: 'modal-backdrop fade show travel-album-backdrop'
                }).appendTo(document.body);
            }
        };

        $albumModal.on('click', '[data-bs-dismiss="modal"]', function() {
            closeTravelAlbumModal();
        });

        $(document).on('keydown', function(event) {
            if (event.key === 'Escape' && $albumModal.hasClass('show')) {
                closeTravelAlbumModal();
            }
        });

        var loadTravelAlbumData = function() {
            if (travelAlbumData) {
                return $.Deferred().resolve(travelAlbumData).promise();
            }

            if (!travelAlbumDataRequest) {
                travelAlbumDataRequest = $.getJSON('data/travel-albums.json?v=20260616').done(function(data) {
                    travelAlbumData = data;
                });
            }

            return travelAlbumDataRequest;
        };

        var safeHttpsUrl = function(url, allowedHosts) {
            try {
                var parsedUrl = new URL(url, window.location.href);

                if (parsedUrl.protocol !== 'https:') {
                    return null;
                }

                if (allowedHosts && allowedHosts.indexOf(parsedUrl.hostname) === -1) {
                    return null;
                }

                return parsedUrl.href;
            } catch (error) {
                return null;
            }
        };

        var renderPhotoGrid = function(album, albumUrl) {
            var photos = album.photos || [];
            var safeAlbumUrl = safeHttpsUrl(albumUrl, ['www.flickr.com']);

            if (!photos.length || !safeAlbumUrl) {
                return false;
            }

            var $toolbar = $('<div>', { class: 'travel-photo-toolbar' });
            $('<span>').text(photos.length + ' selected photos').appendTo($toolbar);
            $('<a>', {
                href: safeAlbumUrl,
                target: '_blank',
                rel: 'noopener noreferrer'
            }).text('Full album on Flickr').appendTo($toolbar);

            var renderedPhotos = 0;
            var $grid = $('<div>', { class: 'travel-photo-grid' });

            photos.forEach(function(photo, index) {
                var safePhotoSrc = safeHttpsUrl(photo.src, ['live.staticflickr.com']);

                if (!safePhotoSrc) {
                    return;
                }

                var $figure = $('<figure>', { class: 'travel-photo-item' });
                $('<img>', {
                    src: safePhotoSrc,
                    alt: (photo.alt || album.country || 'Travel') + ' photo ' + (index + 1),
                    loading: 'lazy'
                }).appendTo($figure);
                $figure.appendTo($grid);
                renderedPhotos += 1;
            });

            if (!renderedPhotos) {
                return false;
            }

            $albumBody.empty().append($toolbar, $grid);

            return true;
        };

        var loadFlickrEmbedScript = function() {
            var script = document.createElement('script');

            script.async = true;
            script.src = 'https://embedr.flickr.com/assets/client-code.js';
            script.charset = 'utf-8';
            document.body.appendChild(script);
        };

        var renderFlickrEmbed = function(albumUrl, embedData) {
            var safeAlbumUrl = safeHttpsUrl(
                embedData && embedData.web_page ? embedData.web_page : albumUrl,
                ['www.flickr.com']
            );
            var safeThumbnailUrl = embedData && embedData.thumbnail_url
                ? safeHttpsUrl(embedData.thumbnail_url, ['live.staticflickr.com'])
                : null;
            var title = embedData && embedData.title ? embedData.title : 'Open Flickr album';

            if (!safeAlbumUrl) {
                return false;
            }

            var $shell = $('<div>', { class: 'flickr-embed-shell' });
            var $embedLink = $('<a>', {
                'data-flickr-embed': 'true',
                href: safeAlbumUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                title: title
            });

            if (safeThumbnailUrl) {
                $('<img>', {
                    src: safeThumbnailUrl,
                    alt: title,
                    width: Math.min(Number(embedData.thumbnail_width) || 800, 1200),
                    height: Math.min(Number(embedData.thumbnail_height) || 600, 900),
                    loading: 'lazy'
                }).appendTo($embedLink);
            } else {
                $embedLink.text('Open Flickr album');
            }

            $embedLink.appendTo($shell);

            $albumBody.empty().append($shell);
            loadFlickrEmbedScript();

            return true;
        };

        var loadFlickrEmbed = function(code, albumUrl) {
            if (albumEmbedCache[code]) {
                if (!renderFlickrEmbed(albumUrl, albumEmbedCache[code])) {
                    showAlbumError(albumUrl);
                }

                return;
            }

            $.ajax({
                url: 'https://www.flickr.com/services/oembed/',
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                data: {
                    format: 'json',
                    url: albumUrl,
                    maxwidth: 1200,
                    maxheight: 800
                }
            }).done(function(embedData) {
                albumEmbedCache[code] = embedData;

                if (!renderFlickrEmbed(albumUrl, embedData)) {
                    showAlbumError(albumUrl);
                }
            }).fail(function() {
                if (!renderFlickrEmbed(albumUrl)) {
                    showAlbumError(albumUrl);
                }
            });
        };

        var showAlbumError = function(albumUrl) {
            var safeAlbumUrl = safeHttpsUrl(albumUrl, ['www.flickr.com']);
            var $error = $('<div>', { class: 'travel-album-error' });

            $('<h6>', { class: 'mb-1' }).text('Album unavailable here').appendTo($error);
            $('<p>', { class: 'mb-0' }).text('Flickr could not load the selected photos. You can still open the album directly.').appendTo($error);

            if (safeAlbumUrl) {
                $('<a>', {
                    class: 'btn btn-primary mt-2 px-4',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    href: safeAlbumUrl
                }).text('Open on Flickr').appendTo($error);
            }

            $albumBody.empty().append($error);
        };

        var showFlickrAlbum = function(code) {
            var albumUrl = flickrAlbumUrls[code];
            var countryName = visitedCountries[code];

            if (!albumUrl || !$albumModal.length) {
                return;
            }

            $albumTitle.text(countryName);
            $albumLink.attr('href', albumUrl);

            var $loading = $('<div>', { class: 'travel-album-loading' });
            $('<div>', {
                class: 'spinner-border text-primary',
                role: 'status'
            }).appendTo($loading);
            $('<strong>').text('Loading ' + countryName + ' photos').appendTo($loading);
            $('<span>').text('Loading selected photos without leaving the site.').appendTo($loading);
            $albumBody.empty().append($loading);

            openTravelAlbumModal();

            loadTravelAlbumData().done(function(data) {
                if (data && data[code] && renderPhotoGrid(data[code], albumUrl)) {
                    return;
                }

                loadFlickrEmbed(code, albumUrl);
            }).fail(function() {
                loadFlickrEmbed(code, albumUrl);
            });
        };

        if ($('#travelCountryList').length) {
            visitedCodes
                .sort(function(a, b) {
                    return visitedCountries[a].localeCompare(visitedCountries[b]);
                })
                .forEach(function(code) {
                    $('<button>', {
                        type: 'button',
                        'data-code': code
                    }).text(visitedCountries[code]).appendTo('#travelCountryList');
                });
        }

        new jsVectorMap({
            selector: '#travelMap',
            map: 'world',
            zoomButtons: true,
            zoomOnScroll: false,
            selectedRegions: visitedCodes,
            regionStyle: {
                initial: {
                    fill: '#DDE5EE',
                    stroke: '#FFFFFF',
                    strokeWidth: 0.45,
                    fillOpacity: 1
                },
                hover: {
                    fill: '#FFC448',
                    fillOpacity: 1,
                    cursor: 'pointer'
                },
                selected: {
                    fill: '#0B6BCB',
                    fillOpacity: 1
                },
                selectedHover: {
                    fill: '#084F99',
                    fillOpacity: 1
                }
            },
            onRegionClick: function(event, code) {
                if (visitedCountries[code]) {
                    showFlickrAlbum(code);
                }
            },
            onRegionTooltipShow: function(event, tooltip, code) {
                if (visitedCountries[code]) {
                    tooltip.text(visitedCountries[code] + ' - view photos');
                }
            }
        });

        var travelMapElement = document.getElementById('travelMap');

        if (travelMapElement) {
            travelMapElement.addEventListener('click', function(event) {
                var region = event.target.closest && event.target.closest('[data-code]');
                var code = region && region.getAttribute('data-code');

                if (visitedCountries[code]) {
                    showFlickrAlbum(code);
                }
            });
        }

        $('#travelCountryList').on('click', '[data-code]', function() {
            var code = $(this).attr('data-code');

            if (visitedCountries[code]) {
                showFlickrAlbum(code);
            }
        });
    }


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
    });

    
})(jQuery);
