(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-control.prev');
    var next = document.querySelector('.hero-control.next');
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    if (slides.length) {
        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                showSlide(i);
            });
        });
        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                showSlide(current + 1);
            });
        }
        window.setInterval(function() {
            showSlide(current + 1);
        }, 5600);
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-filter-input')).forEach(function(input) {
        var grid = input.closest('section') ? input.closest('section').querySelector('.filter-grid') : null;
        if (!grid) {
            grid = document.querySelector('.filter-grid');
        }
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        input.addEventListener('input', function() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
                card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    });

    var searchInput = document.getElementById('globalSearchInput');
    var searchResults = document.getElementById('searchResults');
    var searchTitle = document.getElementById('searchResultTitle');

    function card(item) {
        var tags = (item.tags || []).slice(0, 3).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="card-badge">' + escapeHtml(item.year) + '</span>' +
                '<span class="play-mark">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
                '<a href="' + item.url + '" class="movie-title-link"><h3>' + escapeHtml(item.title) + '</h3></a>' +
                '<p>' + escapeHtml(item.summary) + '</p>' +
                '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function renderSearch() {
        if (!searchInput || !searchResults || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || searchInput.value || '';
        searchInput.value = query;
        var keyword = query.trim().toLowerCase();
        var list = window.SEARCH_INDEX;
        var results = keyword ? list.filter(function(item) {
            return [item.title, item.year, item.region, item.genre, item.type, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase().indexOf(keyword) !== -1;
        }) : list.slice(0, 36);
        if (searchTitle) {
            searchTitle.textContent = keyword ? '匹配结果' : '热门推荐';
        }
        searchResults.innerHTML = results.slice(0, 120).map(card).join('') || '<p class="empty-state">没有找到相关影片</p>';
    }

    if (searchInput && searchResults) {
        renderSearch();
        searchInput.addEventListener('input', renderSearch);
    }
}());
