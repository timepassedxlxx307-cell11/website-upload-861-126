(function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            mobileToggle.textContent = mobilePanel.classList.contains("is-open") ? "×" : "☰";
        });
    }

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = Number(dot.getAttribute("data-hero-dot") || 0);
                showSlide(target);
                startAutoPlay();
            });
        });

        if (slides.length > 1) {
            startAutoPlay();
        }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterList = document.querySelector("[data-filter-list]");

    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-search-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        if (queryValue) {
            filterInput.value = queryValue;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardContains(card, query) {
            if (!query) {
                return true;
            }
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-category"),
                card.textContent
            ].join(" ");
            return normalize(text).indexOf(query) !== -1;
        }

        function matchesSelect(card, select) {
            var value = normalize(select.value);
            if (!value) {
                return true;
            }
            var key = select.getAttribute("data-filter-select");
            return normalize(card.getAttribute("data-" + key)) === value;
        }

        function applyFilters() {
            var query = normalize(filterInput.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var visible = cardContains(card, query) && selects.every(function (select) {
                    return matchesSelect(card, select);
                });
                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        filterInput.addEventListener("input", applyFilters);
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
        applyFilters();
    }
})();
