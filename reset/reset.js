(function () {
  var SUPABASE_URL = 'https://jprygwocmfryqpbxiiny.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_xxh4UXsvXsliCSmYNWe0Jw_OPLhQa2p';

  function show(id) {
    ['state-loading', 'state-error', 'state-form', 'state-success'].forEach(function (s) {
      document.getElementById(s).style.display = (s === id) ? '' : 'none';
    });
  }

  var params = {};
  window.location.hash.slice(1).split('&').forEach(function (part) {
    var eq = part.indexOf('=');
    if (eq > 0) {
      params[decodeURIComponent(part.slice(0, eq))] = decodeURIComponent(part.slice(eq + 1));
    }
  });

  var accessToken = params['access_token'];
  var refreshToken = params['refresh_token'];
  var type = params['type'];

  if (!accessToken || !refreshToken || type !== 'recovery') {
    show('state-error');
    return;
  }

  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (isIOS) {
    var appUrl = 'rctimeline://reset-password' + window.location.hash;
    // Programmatic navigation works in Safari. WKWebView (Mail on iPad) blocks it
    // silently, so we fall back to an explicit tap-to-open link after 600ms.
    window.location.href = appUrl;
    setTimeout(function () {
      document.getElementById('open-app-link').href = appUrl;
      document.getElementById('use-web-form-link').addEventListener('click', function (e) {
        e.preventDefault();
        initForm(accessToken, refreshToken);
      });
      show('state-open-app');
    }, 600);
  } else {
    initForm(accessToken, refreshToken);
  }

  function initForm(accessToken, refreshToken) {
    var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false }
    });

    client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(function (result) {
      if (result.error) {
        show('state-error');
        return;
      }

      show('state-form');

      document.getElementById('reset-form').addEventListener('submit', function (e) {
        e.preventDefault();

        var pw = document.getElementById('new-password').value;
        var confirm = document.getElementById('confirm-password').value;
        var errorEl = document.getElementById('form-error');

        function showError(msg) {
          errorEl.textContent = msg;
          errorEl.classList.add('visible');
        }

        errorEl.classList.remove('visible');

        if (pw !== confirm) { showError('Passwords do not match.'); return; }
        if (pw.length < 12) { showError('Password must be at least 12 characters.'); return; }
        if (!/[A-Z]/.test(pw)) { showError('Password must include at least one uppercase letter.'); return; }
        if (!/[a-z]/.test(pw)) { showError('Password must include at least one lowercase letter.'); return; }
        if (!/[0-9]/.test(pw)) { showError('Password must include at least one digit.'); return; }
        if (!/[^A-Za-z0-9]/.test(pw)) { showError('Password must include at least one symbol.'); return; }

        var btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.textContent = 'Updating…';

        client.auth.updateUser({ password: pw }).then(function (result) {
          if (result.error) {
            showError('Something went wrong. The link may have expired — return to the app and request a new reset email.');
            btn.disabled = false;
            btn.textContent = 'Set password';
          } else {
            show('state-success');
          }
        });
      });
    });
  }
})();
