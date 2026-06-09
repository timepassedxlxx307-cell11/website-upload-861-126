(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      toggle.textContent = opened ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    if (!lists.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var yearSelects = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
    var genreSelects = Array.prototype.slice.call(document.querySelectorAll("[data-genre-filter]"));

    inputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
    });

    function apply() {
      var keyword = "";
      var year = "";
      var genre = "";
      inputs.forEach(function (input) {
        if (input.value.trim()) {
          keyword = input.value.trim().toLowerCase();
        }
      });
      yearSelects.forEach(function (select) {
        if (select.value) {
          year = select.value;
        }
      });
      genreSelects.forEach(function (select) {
        if (select.value) {
          genre = select.value;
        }
      });

      lists.forEach(function (list) {
        var shown = 0;
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (year && cardYear !== year) {
            ok = false;
          }
          if (genre && cardGenre.indexOf(genre) === -1) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
          empty.hidden = shown !== 0;
        }
      });
    }

    inputs.concat(yearSelects).concat(genreSelects).forEach(function (field) {
      field.addEventListener("input", apply);
      field.addEventListener("change", apply);
    });
    apply();
  }

  function setupPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector(".player-cover");
      var source = frame.getAttribute("data-video");
      var started = false;
      var player = null;

      function attach() {
        if (started || !video || !source) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          player = new window.Hls();
          player.loadSource(source);
          player.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        frame.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            play();
          }
        });
        video.addEventListener("ended", function () {
          if (player && player.destroy) {
            player.destroy();
            player = null;
            started = false;
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
