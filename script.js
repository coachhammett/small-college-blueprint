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

  function showError(msg) { error.textContent = msg; }

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
