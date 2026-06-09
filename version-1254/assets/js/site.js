(function () {
  var navButton = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navButton && mobileNav) {
    navButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showHero(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));

  filters.forEach(function (input) {
    var selector = input.getAttribute("data-card-filter");
    var scope = selector ? document.querySelector(selector) : document;

    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-item"));

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" ").toLowerCase();

        card.classList.toggle("is-filter-hidden", query && text.indexOf(query) === -1);
      });
    });
  });
})();
