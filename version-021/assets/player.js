function initVideoPlayer(videoId, buttonId, coverId, mediaUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  if (!video || !button || !cover || !mediaUrl) {
    return;
  }

  var prepared = false;
  var start = function () {
    if (!prepared) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
      prepared = true;
    }
    cover.classList.add("hidden");
    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {});
    }
  };

  button.addEventListener("click", start);
  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });
}
