(function () {
    window.initMoviePlayer = function (config) {
        var video = document.querySelector(config.videoSelector);
        var button = document.querySelector(config.buttonSelector);
        var overlay = document.querySelector(config.overlaySelector);
        var hlsInstance = null;

        if (!video || !config.source) {
            return;
        }

        function revealPlayer() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function attachSource() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.src !== config.source) {
                    video.src = config.source;
                }
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(config.source);
                    hlsInstance.attachMedia(video);
                }
                return;
            }

            if (video.src !== config.source) {
                video.src = config.source;
            }
        }

        function playMovie() {
            revealPlayer();
            attachSource();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                playMovie();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", playMovie);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playMovie();
            }
        });
    };
})();
