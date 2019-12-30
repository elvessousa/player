// -----------------------------------------------------------------------------
// 
//  VIDEO PLAYER - YOUTUBE API
//  This file renders a HTML5 video player using YouTube API on a <yplayer> tag
// 
// -----------------------------------------------------------------------------
// 
//  Index:
//  - Checks for <yplayer> tags
//  - Initializer
//  - Callback YTAPI player iFrame
//  - Create player controls
//  - Player interactions
//  - Check for fullscreen state
//  - Set attribute for fullscreen state
//  - Expands player to fullscreen
//  - Update progress bar
//  - Stop progress interval
//  - Update current time value
//  - Update progress bar value
//  - Convert seconds to HH:MM:SS
//  - Stylize player elements
//  - Colorize volume and time ranges
//  - Manage player states - YTAPi
//  - Initialize players if '<yplayer>' tags present
// 
// -----------------------------------------------------------------------------
(function (window, document) {
  // ----------------------------------------------------
  // Checks for <yplayer> tags
  // ----------------------------------------------------
  window.yplayers = document.querySelectorAll('yplayer');
  
  var videoYPlayer = {
    // ----------------------------------------------------
    // Initializer
    // ----------------------------------------------------
    init: function () {
      var screens = [];
      for (p = 0; p < yplayers.length; ++p) {
        var src, player, el, yplayer;
        player = yplayers[p];
        source = player.getAttribute('src');
        screen = document.createElement('div');
        screen.setAttribute('id', source);
        player.appendChild(screen);
        var newplayer = this.makePlayers(source);
        this.makeControls(player);
        screens.push(player);
      }
    },
    // ----------------------------------------------------
    // Callback YTAPI player iFrame
    // ----------------------------------------------------
    makePlayers: function (id) {
      return new YT.Player(id, {
        height: '100%',
        width: '100%',
        videoId: id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          enablejsapi: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          wmode: 'opaque'
        },
        events: {
          'onReady': this.handleActions,
          'onStateChange': this.states,
        }
      });
    },
    // ----------------------------------------------------
    // Create player controls
    // ----------------------------------------------------    
    makeControls: function (element) {
      var html, controls, poster;

      // HTML
      html = '<button class="play-pause"></button>';
      html += '<input type="range" class="time-bar" min="0" max="100" value="0">';
      html += '<input type="range" class="volume-bar" min="0" max="100" value="100">';
      html += '<time><span class="current">00:00</span>';
      html += '<span class="duration">00:00</span></time>';
      html += '<button class="full"></button>';

      // Controls
      controls = document.createElement('controls');
      controls.innerHTML = html;
      element.appendChild(controls);

      // Overlay
      var overlay = document.createElement('div');
      overlay.setAttribute('class', 'overlay');
      element.appendChild(overlay);

      // Poster
      poster = element.getAttribute('poster');
      title = element.getAttribute('title');
      if (poster) {
        image = document.createElement('div');
        image.setAttribute('class', 'poster');
        image.setAttribute('title', title);
        image.style.backgroundImage = "url('" + poster + "')";
        element.appendChild(image);
      }
    },
    // ----------------------------------------------------
    // Player interactions
    // ----------------------------------------------------    
    handleActions: function (e) {
      // Elements
      var screen = e.target;
      var chrome = screen.a.parentElement;
      var update;
      screen.stopVideo();

      // Controls
      var play = chrome.querySelector('.play-pause');
      var full = chrome.querySelector('.full');
      var duration = chrome.querySelector('.duration');
      var seekr = chrome.querySelector('.time-bar');
      var overlay = chrome.querySelector('.overlay');
      var volume = chrome.querySelector('.volume-bar');
      var poster = chrome.querySelector('.poster');
      var fg = chrome.getAttribute('fg') ? chrome.getAttribute('fg') : '#fff';
      var bg = chrome.getAttribute('bg') ? chrome.getAttribute('bg') : 'rgba(150,150,150,0.3)';
      videoYPlayer.stylize(chrome, fg);

      // Update controls on load
      duration.innerText = videoYPlayer.formatTime(screen.getDuration());
      videoYPlayer.updateTime(e);
      videoYPlayer.updateProgressBar(e, fg, bg);

      // Clear any old interval.
      clearInterval(update);

      // Start interval to update elapsed time display
      update = setInterval(function () {
        videoYPlayer.updateTime(e);
        videoYPlayer.updateProgressBar(e, fg, bg);
      }, 1000);

      // Play / Pause
      play.addEventListener('click', function () {
        videoYPlayer.playPause(screen);
      }, false);

      overlay.addEventListener('click', function () {
        videoYPlayer.playPause(screen);
      }, false);

      // Play / Pause
      if (poster) {
        poster.addEventListener('click', function () {
          videoYPlayer.playPause(screen);
        }, false);
      }

      // Volume
      videoYPlayer.colorize(volume, fg, bg);
      volume.onchange = function () {
        screen.setVolume(this.value);
        videoYPlayer.colorize(this, fg, bg);
      };

      // Time bar
      seekr.onchange = function (e) {
        var newTime = screen.getDuration() * (e.target.value / 100);
        screen.seekTo(newTime);
        videoYPlayer.colorize(e.target, fg, bg);
      };

      // Fullscreen
      full.onclick = function () {
        videoYPlayer.handleFullscreen(chrome);
      };
    },
    // ----------------------------------------------------
    // Play / pause video
    // ----------------------------------------------------    
    playPause: function (screen) {
      var state = screen.getPlayerState();
      if (state == 1) {
        screen.pauseVideo();
      } else {
        screen.playVideo();
      }
    },
    // ----------------------------------------------------
    // Check for fullscreen state
    // ----------------------------------------------------    
    isFullScreen: function() {
      return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    },
    // ----------------------------------------------------
    // Set attribute for fullscreen state
    // ----------------------------------------------------    
    setFullscreenData: function(state, chrome) {
      chrome.setAttribute('data-fullscreen', !!state);
    },
    // ----------------------------------------------------
    // Expands player to fullscreen
    // ----------------------------------------------------    
    handleFullscreen: function(chrome) {
      if (this.isFullScreen()) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        this.setFullscreenData(false, chrome);
      } else {
        if (chrome.requestFullscreen) chrome.requestFullscreen();
        else if (chrome.mozRequestFullScreen) chrome.mozRequestFullScreen();
        else if (chrome.webkitRequestFullScreen) chrome.webkitRequestFullScreen();
        else if (chrome.msRequestFullscreen) chrome.msRequestFullscreen();
        this.setFullscreenData(true, chrome);
      }
      chrome.classList.toggle('fullscreen');
    },
    // ----------------------------------------------------
    // Update progress bar
    // ----------------------------------------------------
    progress: function (video) {
      (function progressTrack() {
        videoYPlayer.updateTime(video);
        videoYPlayer.updateProgressBar(video);
        progressInterval = setTimeout(progressTrack, 1000);
      })();
    },
    // ----------------------------------------------------
    // Stop progress interval
    // ----------------------------------------------------    
    stopProgress: function () {
      clearTimeout(progressInterval);
    },
    // ----------------------------------------------------
    // Update current time value
    // ----------------------------------------------------
    updateTime: function (e) {
      var clock, video, chrome;
      video = e.target;
      chrome = video.a.parentElement;
      clock = chrome.querySelector('.current');
      clock.innerText = this.formatTime(video.getCurrentTime());
    },
    // ----------------------------------------------------
    // Update progress bar value
    // ----------------------------------------------------
    updateProgressBar: function (e, fg, bg) {
      var progress, video, chrome;
      video = e.target;
      chrome = video.a.parentElement;
      progress = chrome.querySelector('.time-bar');
      state = video.getPlayerState();
      if (state == -1 || state == 5 || state == 3) {
        progress.value = 0;
      } else {
        progress.value = (video.getCurrentTime() / video.getDuration()) * 100;
        videoYPlayer.colorize(progress, fg, bg);
      }
    },
    // ----------------------------------------------------
    // Convert seconds to HH:MM:SS
    // ----------------------------------------------------
    formatTime: function (time) {
      var hh, mm, ss;
      time = Math.round(time);
      // Hour
      hh = Math.floor(time / 3600);
      hh = hh < 10 ? '0' + hh : hh;
      // Minutes
      mm = Math.floor(time % 3600 / 60);
      mm = mm < 10 ? '0' + mm : mm;
      // Seconds
      ss = Math.round(time % 3600 % 60);
      ss = ss < 10 ? '0' + ss : ss;
      // HH:mm:ss
      if (time >= 3600) {
        return hh + ':' + mm + ":" + ss;
      } else {
        return mm + ":" + ss;
      }
    },
    // ----------------------------------------------------
    // Stylize player elements
    // ----------------------------------------------------
    stylize: function (el, fg) {
      var eid = el.id;
      var web = '#' + eid + ' input[type="range"]::-webkit-slider-thumb { background: ' + fg + ' }';
      var moz = '#' + eid + ' input[type="range"]::-moz-range-thumb { background: ' + fg + ' }';
      var css = document.createTextNode(web + moz);
      var style = document.createElement('style');
      style.appendChild(css);
      var player = document.getElementById(eid);
      player.parentNode.insertBefore(style, player);
    },
    // ----------------------------------------------------
    // Colorize volume and time ranges
    // ----------------------------------------------------
    colorize: function (el, fg, bg, screen) {
      var max = el.getAttribute('max');
      var min = el.getAttribute('min');
      var val = (el.value - min) / max - min;
      el.style.backgroundImage = '-webkit-gradient(linear, left top, right top, ' + 'color-stop(' + val + ', ' + fg + '), ' + 'color-stop(' + val + ', ' + bg + ')' + ')';
    },
    // ----------------------------------------------------
    // Manage player states - YTAPi
    // ----------------------------------------------------
    states: function (e) {
      var player = e.target.a.parentElement;
      switch (e.data) {
        case 0:
          player.setAttribute('class', 'player ended');
          break;
        case -1:
          player.setAttribute('class', 'player unstarted');
          break;
        case 1:
          player.setAttribute('class', 'player playing');
          break;
        case 2:
          player.setAttribute('class', 'player paused');
          break;
        case 3:
          player.setAttribute('class', 'player buffering');
          break;
        default:
          player.setAttribute('class', 'player');
          break;
      }
    }
  };
  // ----------------------------------------------------
  // Initialize players if '<yplayer>' tags present
  // ----------------------------------------------------
  if (window.yplayers.length) {
    window.ytag = document.createElement('script');
    window.ytag.src = "https://www.youtube.com/iframe_api";
    window.first = document.getElementsByTagName('script')[0];
    window.first.parentNode.insertBefore(window.ytag, first);
    window.onYouTubeIframeAPIReady = function() {
      videoYPlayer.init();
    };
  }
}(this, document));