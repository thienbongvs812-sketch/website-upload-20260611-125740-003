(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupCatalogFilter() {
        var grid = document.querySelector('[data-catalog-grid]');
        if (!grid) {
            return;
        }
        var cards = selectAll('.movie-card', grid);
        var search = document.querySelector('.catalog-search');
        var year = document.querySelector('.year-filter');
        var type = document.querySelector('.type-filter');
        var emptyState = document.querySelector('[data-empty-state]');

        function updateOptions() {
            if (!year || !type || year.children.length > 1 || type.children.length > 1) {
                return;
            }
            var years = [];
            var types = [];
            cards.forEach(function (card) {
                var cardYear = card.getAttribute('data-year');
                var cardType = card.getAttribute('data-type');
                if (cardYear && years.indexOf(cardYear) === -1) {
                    years.push(cardYear);
                }
                if (cardType && types.indexOf(cardType) === -1) {
                    types.push(cardType);
                }
            });
            years.sort().reverse().slice(0, 80).forEach(function (item) {
                var option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                year.appendChild(option);
            });
            types.sort().slice(0, 80).forEach(function (item) {
                var option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                type.appendChild(option);
            });
        }

        function applyFilter() {
            var query = normalize(search && search.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var shouldShow = matchesQuery && matchesYear && matchesType;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        updateOptions();
        [search, year, type].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
    }

    function setupGlobalSearch() {
        var wrap = document.querySelector('.site-search');
        var input = document.querySelector('.site-search-input');
        var results = document.querySelector('.site-search-results');
        if (!wrap || !input || !results || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var root = wrap.getAttribute('data-root') || document.body.getAttribute('data-root') || '';

        function render(items) {
            results.innerHTML = '';
            if (!items.length) {
                results.classList.remove('is-visible');
                return;
            }
            items.forEach(function (item) {
                var link = document.createElement('a');
                link.className = 'search-result-item';
                link.href = root + item.url;
                link.innerHTML = '<img src="' + root + item.cover + '" alt="">' +
                    '<div><strong>' + escapeHtml(item.title) + '</strong>' +
                    '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></div>';
                results.appendChild(link);
            });
            results.classList.add('is-visible');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        }

        input.addEventListener('input', function () {
            var query = normalize(input.value);
            if (query.length < 2) {
                render([]);
                return;
            }
            var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).indexOf(query) !== -1;
            }).slice(0, 10);
            render(matches);
        });

        document.addEventListener('click', function (event) {
            if (!wrap.contains(event.target)) {
                results.classList.remove('is-visible');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupCatalogFilter();
        setupGlobalSearch();
    });
}());
