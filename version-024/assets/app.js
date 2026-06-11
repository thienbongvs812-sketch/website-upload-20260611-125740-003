(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("hidden") === false;
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.getAttribute("data-filter-panel") || "body";
            var root = document.querySelector(scope) || document;
            var queryInput = panel.querySelector("[data-filter-query]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var empty = root.querySelector("[data-empty-result]");

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function apply() {
                var query = normalize(queryInput && queryInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        ok = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        ok = false;
                    }
                    card.classList.toggle("hidden", !ok);
                    if (ok) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [queryInput, regionSelect, yearSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function setupSmoothLinks() {
        Array.prototype.slice.call(document.querySelectorAll("a[href^='#']")).forEach(function (link) {
            link.addEventListener("click", function (event) {
                var id = link.getAttribute("href");
                if (!id || id === "#") {
                    return;
                }
                var target = document.querySelector(id);
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !url) {
            return;
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function bind() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            hideButton();
            if (!video.getAttribute("src") && !(window.Hls && window.Hls.isSupported())) {
                video.src = url;
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        bind();

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("play", hideButton);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSmoothLinks();
    });
})();
