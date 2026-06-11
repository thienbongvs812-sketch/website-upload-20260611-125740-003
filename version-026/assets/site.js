(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('.poster-image');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  function initLocalFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var grid = section.querySelector('[data-filter-grid]');
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var categorySelect = panel.querySelector('[data-filter-category]');
      var yearInput = panel.querySelector('[data-filter-year]');
      var resetButton = panel.querySelector('[data-filter-reset]');
      var countNode = panel.querySelector('[data-filter-count]');

      if (!grid) {
        grid = document.querySelector('[data-filter-grid]');
      }

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function applyFilters() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var year = normalize(yearInput && yearInput.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.type,
            card.dataset.region,
            card.dataset.category,
            card.dataset.genre,
            card.textContent
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesCategory = !category || normalize(card.dataset.category) === category;
          var matchesYear = !year || normalize(card.dataset.year).indexOf(year) !== -1;
          var isVisible = matchesKeyword && matchesCategory && matchesYear;

          card.classList.toggle('is-filter-hidden', !isVisible);

          if (isVisible) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = '当前显示 ' + visible + ' 部影片，共 ' + cards.length + ' 部。';
        }
      }

      [keywordInput, categorySelect, yearInput].forEach(function (field) {
        if (field) {
          field.addEventListener('input', applyFilters);
          field.addEventListener('change', applyFilters);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (keywordInput) {
            keywordInput.value = '';
          }
          if (categorySelect) {
            categorySelect.value = '';
          }
          if (yearInput) {
            yearInput.value = '';
          }
          applyFilters();
        });
      }

      applyFilters();
    });
  }

  function movieCardTemplate(movie) {
    var href = 'movie/' + movie.id + '.html';
    var image = movie.cover + '.jpg';
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-region="' + escapeHtml(movie.region) + '" data-category="' + escapeHtml(movie.category) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
      '  <a href="' + href + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
      '    <figure class="poster-frame">' +
      '      <div class="poster-fallback"><span>' + escapeHtml(movie.title) + '</span></div>' +
      '      <img class="poster-image" src="' + image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '      <span class="card-badge card-badge-left">' + escapeHtml(movie.category) + '</span>' +
      '      <span class="card-badge card-badge-right">★ ' + escapeHtml(movie.rating) + '</span>' +
      '    </figure>' +
      '    <div class="card-body">' +
      '      <h3>' + escapeHtml(movie.title) + '</h3>' +
      '      <p>' + escapeHtml(movie.description) + '</p>' +
      '      <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '      <div class="tag-row">' + tags + '</div>' +
      '    </div>' +
      '  </a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = page.querySelector('[data-search-input]');
    var category = page.querySelector('[data-search-category]');
    var button = page.querySelector('[data-search-button]');
    var count = page.querySelector('[data-search-count]');
    var results = page.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function runSearch() {
      var keyword = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var movies = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.description,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags.join(' ')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesCategory = !categoryValue || normalize(movie.category) === categoryValue;
        return matchesKeyword && matchesCategory;
      }).slice(0, 120);

      if (!keyword && !categoryValue) {
        movies = window.MOVIE_SEARCH_DATA.slice(0, 48);
      }

      results.innerHTML = movies.map(movieCardTemplate).join('');
      initImageFallbacks();

      if (count) {
        count.textContent = '当前显示 ' + movies.length + ' 条结果。';
      }
    }

    if (button) {
      button.addEventListener('click', runSearch);
    }

    if (input) {
      input.addEventListener('input', runSearch);
    }

    if (category) {
      category.addEventListener('change', runSearch);
    }

    runSearch();
  }

  ready(function () {
    initMenu();
    initImageFallbacks();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
  });
})();
