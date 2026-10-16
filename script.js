(function () {
  'use strict';

  /* ---------- Countdown to Nov 5, 2026 12:30:50 America/Chicago ----------
     America/Chicago is on CST (UTC-6) in November (DST ends Nov 1, 2026). */
  var TARGET_UTC = Date.UTC(2026, 10, 5, 18, 30, 50);

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var cdD = document.getElementById('cd-days');
  if (cdD) {
    var cdH = document.getElementById('cd-hours'),
        cdM = document.getElementById('cd-mins'),
        cdS = document.getElementById('cd-secs');
    tick();
    setInterval(tick, 1000);
  }

  function tick() {
    var now = Date.now();
    var diff = Math.max(0, TARGET_UTC - now);
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff / 3600000) % 24;
    var m = Math.floor(diff / 60000) % 60;
    var s = Math.floor(diff / 1000) % 60;
    document.getElementById('cd-days').textContent = pad(d);
    if (cdH) cdH.textContent = pad(h);
    if (cdM) cdM.textContent = pad(m);
    if (cdS) cdS.textContent = pad(s);
  }

  /* ---------- Vault signup (MailerLite) ---------- */
  var form = document.getElementById('vault-form');
  var email = document.getElementById('vault-email');
  var submit = document.getElementById('vault-submit');
  var error = document.getElementById('vault-error');
  var wrap = document.getElementById('vault-form-wrap');
  var success = document.getElementById('vault-success');

  function showError(msg) { if (error) error.textContent = msg; }

  if (form && email && submit) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');
    var val = email.value.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showError('Please enter a valid email address.');
      email.focus();
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Subscribing\u2026';

    var cb = 'ml_cb_' + Date.now();
    window[cb] = function (res) {
      cleanup();
      if (res && res.success) {
        wrap.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        var msg = 'Something went wrong. Please try again.';
        if (res && res.errors && res.errors.length) {
          msg = res.errors.map(function (er) { return er.message || er; }).join(' ');
        }
        showError(msg);
        submit.disabled = false;
        submit.textContent = 'Subscribe';
      }
    };

    var script = document.createElement('script');
    function cleanup() {
      delete window[cb];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    script.onerror = function () {
      cleanup();
      showError('Could not reach the signup service. Please try again.');
      submit.disabled = false;
      submit.textContent = 'Subscribe';
    };
    var url = 'https://assets.mailerlite.com/jsonp/2638149/pages/198727292559558432/subscribe'
      + '?callback=' + encodeURIComponent(cb)
      + '&fields%5Bemail%5D=' + encodeURIComponent(val)
      + '&ml-submit=1'
      + '&_=' + Date.now();
    script.src = url;
    document.body.appendChild(script);
    // Safety timeout in case the JSONP callback never fires
    setTimeout(function () {
      if (window[cb]) { cleanup(); showError('The request timed out. Please try again.'); submit.disabled = false; submit.textContent = 'Subscribe'; }
    }, 15000);
  });
  } /* end if (form && email && submit) */
})();

/* Mobile nav toggle */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

/* Carousels: auto-slide with dot indicators + touch swipe (no arrows, like the original) */
(function () {
  var roots = document.querySelectorAll('.carousel');
  if (!roots.length) return;

  roots.forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var slides = root.querySelectorAll('.carousel-slide');
    var dotsWrap = root.querySelector('.carousel-dots');
    var n = slides.length, idx = 0, timer = null;
    if (!n || !track || !dotsWrap) return;

    for (var i = 0; i < n; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      (function (k) { b.addEventListener('click', function () { go(k); restart(); }); })(i);
      dotsWrap.appendChild(b);
    }
    var dots = dotsWrap.querySelectorAll('button');

    function go(k) {
      idx = (k + n) % n;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      for (var j = 0; j < n; j++) dots[j].classList.toggle('active', j === idx);
    }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 5000);
    }
    root.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    root.addEventListener('mouseleave', restart);

    /* touch swipe */
    var startX = null;
    root.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      if (timer) clearInterval(timer);
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      startX = null;
      restart();
    }, { passive: true });

    go(0);
    restart();
  });
})();
