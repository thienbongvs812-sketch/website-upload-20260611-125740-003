(function () {
    function bootPlayer(root) {
        var video = root.querySelector("video");
        var cover = root.querySelector(".play-cover");

        if (!video) {
            return;
        }

        var src = video.getAttribute("data-hls");
        var loaded = false;
        var hls = null;

        function start() {
            if (!src) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }

                loaded = true;
            }

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-stage")).forEach(bootPlayer);
})();
