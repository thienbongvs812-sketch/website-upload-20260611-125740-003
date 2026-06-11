(function () {
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                if (window.Hls) {
                    resolve();
                } else {
                    existing.addEventListener('load', resolve, { once: true });
                    existing.addEventListener('error', reject, { once: true });
                }
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setupPlayer() {
        var video = document.querySelector('.movie-player[data-hls-src]');
        var button = document.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-hls-src');
        var hlsInstance = null;
        var prepared = false;

        function attachNativeSource() {
            video.src = source;
            prepared = true;
            return Promise.resolve();
        }

        function attachHlsSource() {
            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                prepared = true;
                return Promise.resolve();
            }
            return attachNativeSource();
        }

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }
            if (!source) {
                return Promise.resolve();
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                return attachNativeSource();
            }
            return loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest').then(attachHlsSource).catch(attachNativeSource);
        }

        button.addEventListener('click', function () {
            button.classList.add('is-loading');
            prepare().then(function () {
                button.classList.add('is-hidden');
                return video.play();
            }).catch(function () {
                button.classList.remove('is-hidden');
            }).finally(function () {
                button.classList.remove('is-loading');
            });
        });

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    }

    document.addEventListener('DOMContentLoaded', setupPlayer);
}());
