(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initMobileNav() {
        var toggle = one('[data-mobile-toggle]');
        var nav = one('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = one('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = one('[data-hero-prev]', hero);
        var next = one('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initLocalFilters() {
        var scopes = all('[data-filter-scope]');
        scopes.forEach(function (scope) {
            var search = one('[data-local-search]', scope);
            var buttons = all('[data-filter-value]', scope);
            var cards = all('[data-search-card]', scope);
            var empty = one('[data-empty-result]', scope.parentNode) || one('[data-empty-result]', scope);
            var activeFilter = 'all';

            function normalize(value) {
                return (value || '').toString().trim().toLowerCase();
            }

            function apply() {
                var query = normalize(search ? search.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var filterMatched = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
                    var queryMatched = !query || text.indexOf(query) !== -1;
                    var matched = filterMatched && queryMatched;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (search) {
                search.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    search.value = q;
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    button.classList.add('is-active');
                    activeFilter = button.getAttribute('data-filter-value') || 'all';
                    apply();
                });
            });

            apply();
        });
    }

    function initPlayer() {
        var shell = one('[data-player]');
        if (!shell) {
            return;
        }
        var video = one('video', shell);
        var button = one('[data-play-button]', shell);
        var status = one('[data-player-status]', shell);
        var stream = video ? video.getAttribute('data-stream') : '';
        var hls = null;
        var ready = false;

        function setStatus(message, show) {
            if (!status) {
                return;
            }
            status.textContent = message || '';
            status.classList.toggle('is-visible', Boolean(show));
        }

        function attachHls(onReady) {
            if (!video || !stream) {
                setStatus('视频加载失败，请稍后再试', true);
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                onReady();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    onReady();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            setStatus('视频加载失败，请稍后再试', true);
                        }
                    }
                });
                return;
            }
            setStatus('视频加载失败，请稍后再试', true);
        }

        function play() {
            if (!video) {
                return;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            setStatus('加载中...', true);
            var start = function () {
                setStatus('', false);
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        setStatus('点击画面继续播放', true);
                    });
                }
            };
            if (ready) {
                start();
            } else {
                attachHls(start);
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                setStatus('', false);
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('error', function () {
                setStatus('视频加载失败，请稍后再试', true);
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initLocalFilters();
        initPlayer();
    });
})();
