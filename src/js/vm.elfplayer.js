// -----------------------------------------------------------------------------
// 
//  VIDEO PLAYER - VIMEO API
//  This file renders a HTML5 video player using Vimeo API on a <vplayer> tag
// 
// -----------------------------------------------------------------------------
// 
//  Index:
//  - Load API assynchronously
//  - Initializer
//  - Callback Vimeo API player iFrame
//  - Create player controls
//  - Player interactions
//  - Play / pause video
//  - Video scrubbing
//  - Check for fullscreen state
//  - Set attribute for fullscreen state
//  - Expands player to fullscreen
//  - Update current time value
//  - Convert seconds to HH:MM:SS
//  - Stylize player elements
//  - Colorize volume and time ranges
//  - Initialize players if '<vplayer>' tags present
// 
// -----------------------------------------------------------------------------
(function (window, document) {
 // ----------------------------------------------------
  // Load API assynchronously
  // ----------------------------------------------------
  // window.tag = document.createElement('script');
  // window.tag.src = "https://player.vimeo.com/api/player.js";
  // window.first = document.getElementsByTagName('script')[0];
  // window.first.parentNode.insertBefore(tag, first);
  window.vplayers = document.querySelectorAll('vplayer');
  
  var vimeoPlayer = {
    // ----------------------------------------------------
    // Initializer
    // ----------------------------------------------------
    init: function () {
      var screens = [];
      for (p = 0; p < vplayers.length; ++p) {
        var src, player, el, vplayer;
        player = vplayers[p];
        source = player.getAttribute('src');
        screen = document.createElement('div');
        screen.setAttribute('id', source);
        player.appendChild(screen);
        var newplayer = this.makePlayers(source);
        this.makeControls(player);
        this.handleActions(player, newplayer);
        screens.push(player);
      }
    },
    // ----------------------------------------------------
    // Callback Vimeo API player iFrame
    // ----------------------------------------------------
    makePlayers: function (id) {
      var options = {
        id: id,
        title: false,
        autoplay: false,
        byline: false,
        controls: false
      };
      return new Vimeo.Player(id, options);
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
    handleActions: function (chrome, player) {
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
      vimeoPlayer.stylize(chrome, fg);

      // Set duration
      player.getDuration().then(function(dur) {
        duration.innerText = vimeoPlayer.formatTime(dur);
      });

      // Update time
      vimeoPlayer.updateTime(chrome, player);
      player.on('timeupdate', function(e) {
        vimeoPlayer.updateTime(chrome, player);
        seekr.value = e.percent * 100;
        vimeoPlayer.colorize(seekr, fg, bg);
      });

      // Play / pause
      play.addEventListener('click', function () {
        vimeoPlayer.playPause(player);
      }, false);

      // Overlay
      overlay.addEventListener('click', function () {
        vimeoPlayer.playPause(player);
      }, false);
      
      // Poster
      if (poster) {
        poster.addEventListener('click', function () {
          vimeoPlayer.playPause(player);
        }, false);
      }

      // Fullscreen
      full.addEventListener('click', function () {
        vimeoPlayer.handleFullscreen(chrome);
      }, false);

      // Video scrubbing
      this.seekToTime(seekr, player, fg, bg);

      // Volume
      player.setVolume(1);
      vimeoPlayer.colorize(volume, fg, bg);
      volume.onchange = function () {
        player.setVolume(this.value / 100);
        vimeoPlayer.colorize(this, fg, bg);
      };
    },
    // ----------------------------------------------------
    // Play / pause video
    // ----------------------------------------------------    
    playPause: function (player) {
      player.getPaused().then(function (paused) {
        if (paused == true) {
          player.play();
        } else {
          player.pause();
        }
      });
    },
    // ----------------------------------------------------
    // Video scrubbing
    // ----------------------------------------------------    
    seekToTime: function(el, player, fg, bg) {
      var duration;

      player.getDuration().then(function(dur) {
        duration = dur;
      });

      el.addEventListener('change', function (e) {
        var value = e.target.value;
        var newTime = duration * (value / 100);
        if (newTime < 0 || newTime > duration) return;
        player.setCurrentTime(newTime);
        vimeoPlayer.colorize(e.target, fg, bg);
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
    // Update current time value
    // ----------------------------------------------------
    updateTime: function (chrome, player) {
      var clock;
      clock = chrome.querySelector('.current');
      player.getCurrentTime().then(function (time) {
        clock.innerText = vimeoPlayer.formatTime(time);
      });
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
  };
  // ----------------------------------------------------
  // Initialize players if '<vplayer>' tags present
  // ----------------------------------------------------
  // window.vtag = document.createElement('script');
  // window.vtag.src = "https://player.vimeo.com/api/player.js";
  // window.first = document.getElementsByTagName('script')[0];
  // window.first.parentNode.insertBefore(vtag, first);
  if (window.vplayers.length) {
    if (typeof Vimeo !== 'undefined') {
      vimeoPlayer.init();
    }
  }
}(this, document));