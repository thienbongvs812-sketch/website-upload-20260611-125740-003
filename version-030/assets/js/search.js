(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function card(movie) {
    var badge = movie.tags && movie.tags.length ? movie.tags[0] : movie.type;
    return [
      "<article class=\"movie-card\">",
      "<a class=\"card-cover\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + " 在线观看\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"card-badge\">" + escapeHtml(badge) + "</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p class=\"card-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
      "<p class=\"card-text\">" + escapeHtml(movie.oneLine) + "</p>",
      "</div>",
      "</article>"
    ].join("");
  }

  function render() {
    var query = getQuery();
    var input = document.getElementById("search-input");
    var title = document.getElementById("search-title");
    var results = document.getElementById("search-results");

    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var lowered = query.toLowerCase();
    var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return haystack.indexOf(lowered) !== -1;
    });

    if (title) {
      title.textContent = matches.length ? "搜索结果" : "没有找到相关作品";
    }

    if (!matches.length) {
      results.innerHTML = "<div class=\"empty-state\"><h2>换个关键词试试</h2><p>可以搜索片名、地区、类型、年份或标签。</p></div>";
      return;
    }

    results.innerHTML = matches.slice(0, 120).map(card).join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
