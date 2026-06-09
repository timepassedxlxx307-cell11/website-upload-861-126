(function() {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function textOf(element) {
    return (element.textContent || '').toLowerCase();
  }

  ready(function() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
        toggle.textContent = expanded ? '☰' : '×';
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          var index = Number(dot.getAttribute('data-slide') || '0');
          show(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function() {
          show(current + 1);
        }, 5600);
      }
    }

    var urlParams = new URLSearchParams(window.location.search);
    var query = (urlParams.get('q') || '').trim();
    var globalSearch = document.querySelector('[data-global-search]');
    var localSearch = document.querySelector('[data-local-search]');
    var resultStatus = document.querySelector('[data-result-status]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card, .searchable-list .ranking-item'));

    function applySearch(value) {
      var keyword = (value || '').trim().toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = [
          textOf(card),
          card.getAttribute('data-title') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-search-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultStatus) {
        resultStatus.textContent = keyword ? '已筛选到 ' + visible + ' 个结果' : '高清影视 · 在线播放';
      }
    }

    if (globalSearch && query) {
      globalSearch.value = query;
    }

    if (localSearch) {
      if (query) {
        localSearch.value = query;
        applySearch(query);
      }
      localSearch.addEventListener('input', function() {
        applySearch(localSearch.value);
      });
    } else if (query) {
      applySearch(query);
    }

    var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
    if (yearButtons.length) {
      yearButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          var year = button.getAttribute('data-filter-year');
          yearButtons.forEach(function(item) {
            item.classList.toggle('active', item === button);
          });
          cards.forEach(function(card) {
            var matched = year === 'all' || card.getAttribute('data-year') === year;
            card.classList.toggle('is-filtered-out', !matched);
          });
        });
      });
    }
  });
})();
