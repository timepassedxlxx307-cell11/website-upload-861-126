(function () {
  function initializePlayer(playerBox) {
    var video = playerBox.querySelector('video');
    var trigger = playerBox.querySelector('[data-play-trigger]');
    var status = playerBox.querySelector('[data-player-status]');
    var source = playerBox.dataset.src;
    var loaded = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadSource() {
      if (loaded || !video || !source) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败');
          }
        });
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadSource();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          if (trigger) {
            trigger.classList.add('is-hidden');
          }
          setStatus(playerBox.dataset.title || '正在播放');
        }).catch(function () {
          setStatus('点击播放器开始播放');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        setStatus(playerBox.dataset.title || '正在播放');
      });

      video.addEventListener('pause', function () {
        setStatus(playerBox.dataset.title || '已暂停');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
  });
})();
