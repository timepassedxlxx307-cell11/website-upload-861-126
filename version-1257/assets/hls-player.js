(function() {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function startVideo(video, trigger) {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-url');
    if (!source) {
      return;
    }

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      video.hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = source;
      video.play().catch(function() {});
    }
  }

  ready(function() {
    var video = document.querySelector('.video-player');
    var trigger = document.querySelector('.play-trigger');

    if (!video) {
      return;
    }

    if (trigger) {
      trigger.addEventListener('click', function() {
        startVideo(video, trigger);
      });
    }

    video.addEventListener('click', function() {
      if (!video.currentSrc) {
        startVideo(video, trigger);
      }
    });

    video.addEventListener('play', function() {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
  });
})();
