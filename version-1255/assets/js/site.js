(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    var input = filterScope.querySelector('[data-filter-input]');
    var yearSelect = filterScope.querySelector('[data-year-filter]');
    var typeSelect = filterScope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || '',
          card.dataset.category || '',
          card.dataset.type || '',
          card.dataset.tags || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && card.dataset.year !== year) {
          matched = false;
        }

        if (type && card.dataset.type !== type) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.MOVIE_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('[data-search-input]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchEmpty = document.querySelector('[data-search-empty]');

    if (searchInput) {
      searchInput.value = query;
    }

    function cardTemplate(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="play-dot">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function renderSearch(value) {
      var keyword = value.trim().toLowerCase();
      var results = window.MOVIE_DATA.filter(function (movie) {
        if (!keyword) {
          return true;
        }

        return [movie.title, movie.category, movie.type, movie.year, movie.region, movie.genre, movie.oneLine, movie.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 240);

      if (searchTitle) {
        searchTitle.textContent = keyword ? '搜索结果：' + value : '热门搜索';
      }

      searchResults.innerHTML = results.map(cardTemplate).join('');

      if (searchEmpty) {
        searchEmpty.hidden = results.length !== 0;
      }
    }

    renderSearch(query);
  }
})();
