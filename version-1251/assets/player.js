(function(global) {
    function init(video, button, url) {
        if (!video || !url) {
            return;
        }
        var ready = false;
        var hls = null;

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (global.Hls && global.Hls.isSupported()) {
                hls = new global.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function start() {
            attach();
            hideButton();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', start);
        video.addEventListener('play', hideButton);
        video.addEventListener('ended', function() {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function() {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    global.MoviePlayer = {
        init: init
    };
}(window));
