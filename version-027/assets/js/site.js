(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(
        slider.querySelectorAll(".hero-slide"),
      );
      var thumbs = Array.prototype.slice.call(
        slider.querySelectorAll(".hero-thumb"),
      );
      var active = 0;
      var timer = null;

      function show(index) {
        active = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle("is-active", thumbIndex === active);
        });
      }

      function startTimer() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show((active + 1) % slides.length);
        }, 4800);
      }

      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener("click", function () {
          show(index);
          startTimer();
        });
      });

      if (slides.length) {
        show(0);
        startTimer();
      }
    }

    var filterPanels = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-panel]"),
    );

    filterPanels.forEach(function (panel) {
      var scope = document.querySelector(
        panel.getAttribute("data-filter-panel"),
      );
      var cards = scope
        ? Array.prototype.slice.call(scope.querySelectorAll(".js-filter-card"))
        : [];
      var keyword = panel.querySelector("[data-filter-keyword]");
      var year = panel.querySelector("[data-filter-year]");
      var genre = panel.querySelector("[data-filter-genre]");
      var empty = document.querySelector(
        panel.getAttribute("data-empty-target"),
      );

      function applyFilter() {
        var text = keyword ? keyword.value.trim().toLowerCase() : "";
        var chosenYear = year ? year.value : "";
        var chosenGenre = genre ? genre.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var region = card.getAttribute("data-region") || "";
          var textMatch =
            !text ||
            title.indexOf(text) >= 0 ||
            cardGenre.toLowerCase().indexOf(text) >= 0 ||
            region.toLowerCase().indexOf(text) >= 0;
          var yearMatch = !chosenYear || cardYear === chosenYear;
          var genreMatch = !chosenGenre || cardGenre.indexOf(chosenGenre) >= 0;
          var matched = textMatch && yearMatch && genreMatch;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keyword, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });

    var searchForm = document.querySelector("[data-search-form]");
    var searchResults = document.querySelector("[data-search-results]");

    if (searchForm && searchResults && Array.isArray(window.searchMovies)) {
      var searchInput = searchForm.querySelector("[data-search-keyword]");
      var searchType = searchForm.querySelector("[data-search-type]");
      var searchYear = searchForm.querySelector("[data-search-year]");

      function render(items) {
        if (!items.length) {
          searchResults.innerHTML =
            '<div class="no-result is-visible">没有找到匹配的影片</div>';
          return;
        }

        searchResults.innerHTML = items
          .slice(0, 72)
          .map(function (item) {
            return (
              '<article class="search-result-card"><h2><a href="' +
              item.url +
              '">' +
              escapeHtml(item.title) +
              "</a></h2><p>" +
              escapeHtml(item.year + " · " + item.region + " · " + item.type) +
              "</p><p>" +
              escapeHtml(item.genre) +
              '</p><a class="btn btn-amber" href="' +
              item.url +
              '">进入详情</a></article>'
            );
          })
          .join("");
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          }[char];
        });
      }

      function runSearch() {
        var keyword = searchInput.value.trim().toLowerCase();
        var type = searchType.value;
        var year = searchYear.value;
        var matched = window.searchMovies.filter(function (item) {
          var text = [item.title, item.genre, item.region, item.type, item.tags]
            .join(" ")
            .toLowerCase();
          var textMatch = !keyword || text.indexOf(keyword) >= 0;
          var typeMatch = !type || item.type.indexOf(type) >= 0;
          var yearMatch = !year || item.year === year;
          return textMatch && typeMatch && yearMatch;
        });
        render(matched);
      }

      searchForm.addEventListener("input", runSearch);
      searchForm.addEventListener("change", runSearch);
      render(window.searchMovies.slice(0, 24));
    }
  });
})();
