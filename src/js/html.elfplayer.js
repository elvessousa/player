// -----------------------------------------------------------------------------
// 
//  VIDEO PLAYER - HTML5
//  This file renders a HTML5 video player on a <player> tag
// 
// -----------------------------------------------------------------------------
// 
//  Index:
//  - Collects player instances
//  - Initializer
//  - Create player chrome
//  - Create player controls
//  - Player interactions
//  - Play / pause video
//  - Video scrubbing
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
//  - Initialize players if '<player>' tags present
// 
// -----------------------------------------------------------------------------
(function (window, document) {
  // ----------------------------------------------------
  // Collects player instances
  // ----------------------------------------------------
  window.players = document.getElementsByTagName('player');
  
  var videoPlayer = {
    // ----------------------------------------------------
    // Initializer
    // ----------------------------------------------------
    init: function () {
      for (p = 0; p < players.length; ++p) {
        this.makeChrome(players[p]);
        this.makeControls(players[p]);
        this.handleActions(players[p]);
      }
    },
    // ----------------------------------------------------
    // Create player chrome
    // ----------------------------------------------------
    makeChrome: function (element) {
      var src, video, files, source;
      files = element.getAttribute('src');
      video = document.createElement('video');
      source = document.createElement('source');
      source.setAttribute('src', files);
      video.appendChild(source);
      element.appendChild(video);
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
    handleActions: function (chrome) {
      // Elements
      var video = chrome.querySelector('video');
      var play = chrome.querySelector('.play-pause');
      var full = chrome.querySelector('.full');
      var clock = chrome.querySelector('.duration');
      var seekr = chrome.querySelector('.time-bar');
      var volume = chrome.querySelector('.volume-bar');
      var poster = chrome.querySelector('.poster');
      var fg = chrome.getAttribute('fg') ? chrome.getAttribute('fg') : '#fff';
      var bg = chrome.getAttribute('bg') ? chrome.getAttribute('bg') : 'rgba(150,150,150,0.3)';

      // Metadata
      video.addEventListener('loadedmetadata', function () {
        chrome.setAttribute('class', 'player');
        videoPlayer.stylize(chrome, fg, bg);
        videoPlayer.colorize(volume, fg, bg);        
        clock.innerHTML = videoPlayer.formatTime(this.duration);
      }, false);

      // Playing
      video.addEventListener('play', function () {
        chrome.setAttribute('class', 'player playing');
        videoPlayer.progress(this);
      }, false);

      // Paused
      video.addEventListener('pause', function () {
        chrome.setAttribute('class', 'player paused');
        videoPlayer.stopProgress();
      }, false);

      // Ended
      video.addEventListener('ended', function () {
        chrome.setAttribute('class', 'player ended');
        this.currentTime = 0;
        this.pause();
      }, false);

      // Play
      video.addEventListener('click', function () {
        videoPlayer.playPause(video);
      }, false);

      // Play
      play.addEventListener('click', function () {
        videoPlayer.playPause(video);
      }, false);

      // Poster
      if (poster) {
        poster.addEventListener('click', function () {
          videoPlayer.playPause(video);
        }, false);
      }

      // Full screen
      full.addEventListener('click', function(e) {
        videoPlayer.handleFullscreen(chrome);
      });

      // Video scrubbing
      this.seekToTime(seekr, video, fg, bg);

      // Volume
      video.volume = 1;
      volume.onchange = function () {
        video.volume = this.value / 100;
        videoPlayer.colorize(this, fg, bg);
      };
    },
    // ----------------------------------------------------
    // Play / pause video
    // ----------------------------------------------------    
    playPause: function (video) {
      if (video.paused || video.ended) {
        if (video.ended) video.currentTime = 0;
        video.play();
      } else {
        video.pause();
      }
    },
    // ----------------------------------------------------
    // Video scrubbing
    // ----------------------------------------------------    
    seekToTime: function(el, video, fg, bg) {
      el.addEventListener('change', function (e) {
        var value = e.target.value;
        var newTime = video.duration * (value / 100);
        if (newTime < 0 || newTime > video.duration) return;
        video.currentTime = newTime;
        videoPlayer.colorize(e.target, fg, bg);
      }, false);
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
        videoPlayer.updateTime(video);
        videoPlayer.updateProgressBar(video);
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
    updateTime: function (video) {
      var clock, chrome;
      chrome = video.parentElement;
      clock = chrome.querySelector('.current');
      clock.innerText = this.formatTime(video.currentTime);
    },
    // ----------------------------------------------------
    // Update progress bar value
    // ----------------------------------------------------
    updateProgressBar: function (video) {
      var progress, chrome;
      chrome = video.parentElement;
      var fg = chrome.getAttribute('fg') ? chrome.getAttribute('fg') : '#fff';
      var bg = chrome.getAttribute('bg') ? chrome.getAttribute('bg') : 'rgba(150,150,150,0.3)';
      progress = chrome.querySelector('.time-bar');
      progress.value = (video.currentTime / video.duration) * 100;
      this.colorize(progress, fg, bg);
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
    }
  };
  // ----------------------------------------------------
  // Initialize players if '<player>' tags present
  // ----------------------------------------------------
  if (window.players.length) {
    videoPlayer.init();
  }
}(this, document));