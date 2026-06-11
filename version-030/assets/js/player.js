(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var message = document.getElementById("player-message");

    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function bindStream() {
      var Hls = window.Hls;

      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频加载失败，请刷新重试");
          }
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      showMessage("浏览器暂不支持播放");
    }

    function playVideo() {
      hideOverlay();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showMessage("点击视频区域可继续播放");
        });
      }
    }

    bindStream();

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  });
})();
