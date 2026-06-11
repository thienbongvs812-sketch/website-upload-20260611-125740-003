(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = './search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
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
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    show(0);
    start();
  }

  function initLocalFilter() {
    document.querySelectorAll('[data-local-filter]').forEach(function (input) {
      var target = input.getAttribute('data-local-filter');
      var cards = Array.prototype.slice.call(document.querySelectorAll(target || '.movie-card'));
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          card.hidden = query && haystack.indexOf(query) === -1;
        });
      });
    });
  }

  function initSearchPage() {
    var root = document.getElementById('search-results');
    if (!root || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = document.getElementById('search-query');
    var typeFilter = document.getElementById('search-type');
    var regionFilter = document.getElementById('search-region');
    var initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }

    function card(movie) {
      return [
        '<article class="movie-card" data-search="', escapeHTML([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(' ')), '">',
        '<a href="', escapeHTML(movie.url), '">',
        '<div class="card-image">',
        '<img src="', escapeHTML(movie.cover), '" alt="', escapeHTML(movie.title), '" loading="lazy">',
        '<span class="card-badge">', escapeHTML(movie.year), '</span>',
        '<span class="card-type">', escapeHTML(movie.type), '</span>',
        '</div>',
        '<div class="card-body">',
        '<h3 class="line-clamp-2">', escapeHTML(movie.title), '</h3>',
        '<div class="card-meta"><span>', escapeHTML(movie.region), '</span><span>·</span><span>', escapeHTML(movie.genre), '</span></div>',
        '<p class="line-clamp-3">', escapeHTML(movie.oneLine), '</p>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    function render() {
      var query = normalize(input ? input.value : '');
      var typeValue = typeFilter ? typeFilter.value : '';
      var regionValue = regionFilter ? regionFilter.value : '';
      var list = window.SEARCH_INDEX.filter(function (movie) {
        var haystack = normalize([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' '));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var typeMatch = !typeValue || movie.type.indexOf(typeValue) !== -1;
        var regionMatch = !regionValue || movie.region.indexOf(regionValue) !== -1;
        return queryMatch && typeMatch && regionMatch;
      }).slice(0, 120);
      if (!query && !typeValue && !regionValue) {
        list = window.SEARCH_INDEX.slice(0, 72);
      }
      if (!list.length) {
        root.innerHTML = '<div class="content-panel"><h2>没有找到相关作品</h2><p>可以尝试更换片名、年份、地区或类型继续搜索。</p></div>';
        return;
      }
      root.innerHTML = '<div class="movie-grid">' + list.map(card).join('') + '</div>';
    }

    [input, typeFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });
    render();
  }

  function initPlayer() {
    var configNode = document.getElementById('movie-player-config');
    var video = document.getElementById('movie-video');
    var overlay = document.querySelector('[data-player-overlay]');
    var playButton = document.querySelector('[data-player-play]');
    var errorBox = document.querySelector('[data-player-error]');
    if (!configNode || !video) {
      return;
    }
    var config;
    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }
    var prepared = false;
    var wantsPlay = false;
    var hls = null;

    function showError() {
      if (errorBox) {
        errorBox.textContent = '播放暂时不可用，请稍后重试';
        errorBox.classList.add('is-visible');
      }
    }

    function tryPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (!config.src) {
        showError();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(config.src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (wantsPlay) {
            tryPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.src;
        video.addEventListener('loadedmetadata', function () {
          if (wantsPlay) {
            tryPlay();
          }
        }, { once: true });
        return;
      }
      showError();
    }

    function play() {
      wantsPlay = true;
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      tryPlay();
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }
    if (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          play();
        }
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();
