(function () {
  window.bindMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var ready = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();
