(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initializePlayer(panel) {
    var video = panel.querySelector('video[data-video-src]');
    var button = panel.querySelector('[data-play-button]');
    var message = panel.querySelector('[data-player-message]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-video-src');
    var hlsInstance = null;
    var hasStarted = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      if (!source) {
        setMessage('当前影片暂未配置播放地址。');
        return;
      }

      button.classList.add('is-hidden');

      if (!hasStarted) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放线路暂时不可用，请刷新页面后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
          });
        } else {
          video.src = source;
          video.play().catch(function () {
            setMessage('当前浏览器不支持 HLS 播放，请更换浏览器或使用支持 HLS 的环境。');
          });
        }

        hasStarted = true;
      } else {
        video.play().catch(function () {
          setMessage('请再次点击视频播放。');
        });
      }
    }

    button.addEventListener('click', playVideo);
    panel.addEventListener('dblclick', playVideo);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player-panel]').forEach(initializePlayer);
  });
})();
