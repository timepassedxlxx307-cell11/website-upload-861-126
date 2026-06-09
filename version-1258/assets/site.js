(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var navMenu = document.getElementById("nav-menu");

    if (menuButton && navMenu) {
      menuButton.addEventListener("click", function () {
        navMenu.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-dot]"));
      var prev = slider.querySelector("[data-prev]");
      var next = slider.querySelector("[data-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === index);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === index);
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
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var value = parseInt(dot.getAttribute("data-dot"), 10);
          show(value);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyCards(cards, keyword, category, year) {
      var q = normalize(keyword);
      var cat = normalize(category);
      var y = normalize(year);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (cat && cardCategory !== cat) {
          matched = false;
        }
        if (y && cardYear !== y) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });
    }

    var filterForm = document.querySelector("[data-filter-form]");
    if (filterForm) {
      var filterInput = filterForm.querySelector("[data-filter-input]");
      var filterScope = document.querySelector("[data-filter-scope]");
      var filterCards = filterScope ? Array.prototype.slice.call(filterScope.querySelectorAll("[data-card]")) : [];

      function runFilter() {
        applyCards(filterCards, filterInput ? filterInput.value : "", "", "");
      }

      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runFilter();
      });

      if (filterInput) {
        filterInput.addEventListener("input", runFilter);
      }
    }

    var searchForm = document.querySelector("[data-search-form]");
    if (searchForm) {
      var searchInput = searchForm.querySelector("[data-search-input]");
      var categorySelect = searchForm.querySelector("[data-category-select]");
      var yearSelect = searchForm.querySelector("[data-year-select]");
      var searchScope = document.querySelector("[data-search-scope]");
      var searchCards = searchScope ? Array.prototype.slice.call(searchScope.querySelectorAll("[data-card]")) : [];
      var params = new URLSearchParams(window.location.search);

      if (searchInput && params.get("q")) {
        searchInput.value = params.get("q");
      }

      function runSearch() {
        applyCards(
          searchCards,
          searchInput ? searchInput.value : "",
          categorySelect ? categorySelect.value : "",
          yearSelect ? yearSelect.value : ""
        );
      }

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
      });

      [searchInput, categorySelect, yearSelect].forEach(function (item) {
        if (item) {
          item.addEventListener("input", runSearch);
          item.addEventListener("change", runSearch);
        }
      });

      runSearch();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var hls = null;
      var initialized = false;

      function prepare() {
        if (!video || !stream || initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        player.classList.add("is-playing");
        if (video) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.currentTime) {
            player.classList.remove("is-playing");
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  });
})();
