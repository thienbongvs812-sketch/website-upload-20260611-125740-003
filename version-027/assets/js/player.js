(function () {
  window.createMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      attachSource();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
