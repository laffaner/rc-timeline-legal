(function () {
  function show(id) {
    ['state-loading', 'state-open-app', 'state-confirmed', 'state-error'].forEach(function (s) {
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

  // Account is already confirmed by Supabase before this redirect fires.
  // We just need to get the session tokens into the app.
  if (!accessToken || !refreshToken || type !== 'signup') {
    show('state-error');
    return;
  }

  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (isIOS) {
    var appUrl = 'rctimeline://confirm' + window.location.hash;
    window.location.href = appUrl;
    // WKWebView (Mail on iPad) blocks programmatic navigation silently,
    // so fall back to an explicit tap-to-open link after 600ms.
    setTimeout(function () {
      document.getElementById('open-app-link').href = appUrl;
      show('state-open-app');
    }, 600);
  } else {
    show('state-confirmed');
  }
})();
