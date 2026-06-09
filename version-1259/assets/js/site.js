(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initializeMenu() {
    var toggle = select('[data-menu-toggle]');
    var nav = select('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initializeHero() {
    var slider = select('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var activate = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });
    activate(0);
    setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function initializeLocalFilter() {
    var input = select('[data-filter-input]');
    var cards = selectAll('[data-filter-card]');
    if (!input || !cards.length) {
      return;
    }
    var filter = function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        card.style.display = haystack.indexOf(query) === -1 ? 'none' : '';
      });
    };
    input.addEventListener('input', filter);
    filter();
  }

  function searchCard(item) {
    return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
      '<div class="movie-cover">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<span class="movie-badge">' + escapeHtml(item.genre) + '</span>' +
      '</div>' +
      '<div class="movie-info">' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '</div>' +
    '</a>';
  }

  function initializeSearchPage() {
    var results = select('[data-search-results]');
    var input = select('[data-search-page-input]');
    if (!results || !input || !window.MovieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    var render = function () {
      var query = input.value.trim().toLowerCase();
      var items = window.MovieSearchIndex.filter(function (item) {
        if (!query) {
          return true;
        }
        return item.text.indexOf(query) !== -1;
      }).slice(0, 96);
      if (!items.length) {
        results.innerHTML = '<div class="search-results-empty">暂无匹配影片，请尝试更换片名、地区、类型或标签。</div>';
        return;
      }
      results.innerHTML = items.map(searchCard).join('');
    };
    input.addEventListener('input', render);
    render();
  }

  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    var started = false;
    var start = function () {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      button.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            button.classList.remove('is-hidden');
          });
        });
        return;
      }
      video.src = streamUrl;
      video.play().catch(function () {
        button.classList.remove('is-hidden');
      });
    };
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initializeMenu();
    initializeHero();
    initializeLocalFilter();
    initializeSearchPage();
  });
})();
