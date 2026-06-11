(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = qs(".mobile-toggle");
        var panel = qs(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10));
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = qsa(".filter-panel");
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var list = qs("[data-filter-list]", root) || root;
            var cards = qsa(".movie-card", list);
            var search = qs(".local-search", panel);
            var clear = qs(".clear-filter", panel);
            var typeButtons = qsa("[data-filter-type]", panel);
            var categoryButtons = qsa("[data-filter-category]", panel);
            var count = qs("[data-visible-count]", panel);
            var state = {
                query: "",
                type: "all",
                category: "all"
            };

            function activate(buttons, activeButton) {
                buttons.forEach(function (button) {
                    button.classList.toggle("active", button === activeButton);
                });
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var type = normalize(card.getAttribute("data-type"));
                    var category = normalize(card.getAttribute("data-category"));
                    var matchQuery = !state.query || haystack.indexOf(state.query) !== -1;
                    var matchType = state.type === "all" || type.indexOf(normalize(state.type)) !== -1;
                    var matchCategory = state.category === "all" || category === normalize(state.category);
                    var show = matchQuery && matchType && matchCategory;
                    card.classList.toggle("hidden-by-filter", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible.toString();
                }
            }

            if (search) {
                var params = new URLSearchParams(window.location.search);
                var initial = params.get("q") || "";
                if (initial) {
                    search.value = initial;
                    state.query = normalize(initial);
                }
                search.addEventListener("input", function () {
                    state.query = normalize(search.value);
                    apply();
                });
            }

            if (clear) {
                clear.addEventListener("click", function () {
                    state.query = "";
                    state.type = "all";
                    state.category = "all";
                    if (search) {
                        search.value = "";
                    }
                    typeButtons.forEach(function (button) {
                        button.classList.toggle("active", button.getAttribute("data-filter-type") === "all");
                    });
                    categoryButtons.forEach(function (button) {
                        button.classList.toggle("active", button.getAttribute("data-filter-category") === "all");
                    });
                    apply();
                });
            }

            typeButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    state.type = button.getAttribute("data-filter-type") || "all";
                    activate(typeButtons, button);
                    apply();
                });
            });

            categoryButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    state.category = button.getAttribute("data-filter-category") || "all";
                    activate(categoryButtons, button);
                    apply();
                });
            });

            apply();
        });
    }

    function attachHls(video, streamUrl) {
        return new Promise(function (resolve) {
            if (video.getAttribute("data-ready") === "true") {
                resolve();
                return;
            }
            video.setAttribute("data-ready", "true");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                resolve();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.src = streamUrl;
                        resolve();
                    }
                });
                window.__movieHlsPlayers = window.__movieHlsPlayers || [];
                window.__movieHlsPlayers.push(hls);
                return;
            }
            video.src = streamUrl;
            resolve();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var player = qs(".movie-player");
        if (!player || !streamUrl) {
            return;
        }
        var video = qs("video", player);
        var cover = qs(".player-cover", player);
        var toggle = qs(".player-toggle", player);
        var mute = qs(".player-mute", player);
        var fullscreen = qs(".player-fullscreen", player);
        if (!video) {
            return;
        }

        function playVideo() {
            attachHls(video, streamUrl).then(function () {
                player.classList.add("is-playing");
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            });
        }

        function togglePlay() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }
        if (toggle) {
            toggle.addEventListener("click", togglePlay);
        }
        if (mute) {
            mute.addEventListener("click", function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? "取消静音" : "静音";
            });
        }
        if (fullscreen) {
            fullscreen.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
            if (toggle) {
                toggle.textContent = "暂停";
            }
        });
        video.addEventListener("pause", function () {
            if (toggle) {
                toggle.textContent = "播放";
            }
        });
        video.addEventListener("click", togglePlay);
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
