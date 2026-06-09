(function () {
  var params = new URLSearchParams(window.location.search);
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var title = document.getElementById("search-title");
  var copy = document.getElementById("search-copy");
  var query = params.get("q") || "";

  if (input) {
    input.value = query;
  }

  function createCard(movie) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '<a class="poster" href="' + movie.url + '"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-badge">' + escapeHtml(movie.year) + '</span></a>',
      '<div class="card-body"><div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-list"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function runSearch(value) {
    var normalized = value.trim().toLowerCase();

    if (!normalized || !results || !window.SEARCH_INDEX) {
      return;
    }

    var matches = window.SEARCH_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category]
        .join(" ")
        .toLowerCase()
        .indexOf(normalized) !== -1;
    });

    if (title) {
      title.textContent = "搜索结果";
    }

    if (copy) {
      copy.textContent = matches.length ? "已为你匹配到相关影视内容。" : "没有找到完全匹配的内容，可以换一个关键词。";
    }

    results.innerHTML = matches.slice(0, 120).map(createCard).join("");
  }

  runSearch(query);
})();
