(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function next() {
            show((current + 1) % slides.length);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(next, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        restart();
    }

    function initLocalFilter() {
        var form = document.querySelector("[data-local-filter-form]");
        var input = document.querySelector("[data-local-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!form || !input || !cards.length) {
            return;
        }
        function apply() {
            var query = normalizeText(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalizeText([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" "));
                var matched = !query || text.indexOf(query) !== -1;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible > 0;
            }
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            apply();
        });
        input.addEventListener("input", apply);
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
        }).join("");
        return '' +
            '<article class="movie-card">' +
                '<a class="movie-card-media" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
                    '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="media-shade"></span>' +
                    '<span class="play-dot">▶</span>' +
                    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>' +
                    '<p class="movie-line">' + escapeHtml(movie.text) + '</p>' +
                    '<div class="tag-list">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.MOVIE_INDEX) {
            return;
        }
        var form = page.querySelector("[data-search-page-form]");
        var input = page.querySelector("[data-search-page-input]");
        var grid = page.querySelector("[data-search-results]");
        var empty = page.querySelector("[data-search-empty]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        function render() {
            var keyword = normalizeText(input.value);
            var results = window.MOVIE_INDEX.filter(function (movie) {
                if (!keyword) {
                    return true;
                }
                var text = normalizeText([
                    movie.title,
                    movie.year,
                    movie.genre,
                    movie.region,
                    movie.type,
                    movie.text,
                    (movie.tags || []).join(" ")
                ].join(" "));
                return text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            grid.innerHTML = results.map(cardTemplate).join("");
            empty.hidden = results.length > 0;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            url.searchParams.set("q", input.value);
            window.history.replaceState(null, "", url.toString());
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    window.setupMoviePlayer = function (streamUrl) {
        var player = document.querySelector("[data-player]");
        var video = document.getElementById("movie-player");
        var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
        if (!player || !video || !streamUrl) {
            return;
        }
        var started = false;
        var hls = null;
        function start() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            player.classList.add("is-playing");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = streamUrl;
            video.play().catch(function () {});
        }
        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        });
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
    });
})();
