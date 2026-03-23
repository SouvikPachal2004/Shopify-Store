// ===== AUTH MANAGER =====
var AUTH_API = 'https://shopify-store-o6wo.onrender.com/api';

var authManager = (function () {

  // -- helpers --------------------------------------------------------------
  function getUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')); }
    catch (e) { return null; }
  }

  function getToken() { return localStorage.getItem('token') || ''; }

  function saveSession(user, token) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
  }

  function clearSession() {
    var user = getUser();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    // Note: we intentionally keep hp_profile_* and hp_address_* so users
    // don't lose their saved details if they log back in on the same device.
  }

  // -- avatar initials -------------------------------------------------------
  function initials(name) {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

  // -- build profile dropdown ------------------------------------------------
  function buildProfileDropdown(user, isInnerPage) {
    var prefix = isInnerPage ? '../' : '';
    var accountHref = prefix + 'pages/account.html';
    var ordersHref  = prefix + 'pages/dashboard.html';
    var loginHref   = prefix + 'pages/login.html';

    var wrap = document.createElement('div');
    wrap.className = 'profile-wrap';
    wrap.id = 'profile-wrap';

    wrap.innerHTML =
      '<button class="profile-btn" id="profile-btn" aria-expanded="false">' +
        '<div class="profile-avatar">' + initials(user.name) + '</div>' +
        '<span class="profile-name">' + user.name.split(' ')[0] + '</span>' +
        '<i class="fas fa-chevron-down profile-chevron"></i>' +
      '</button>' +
      '<div class="profile-dropdown" id="profile-dropdown">' +
        '<div class="profile-dropdown-header">' +
          '<div class="profile-avatar-lg">' + initials(user.name) + '</div>' +
          '<div>' +
            '<div class="profile-dropdown-name">' + user.name + '</div>' +
            '<div class="profile-dropdown-email">' + (user.email || '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="profile-dropdown-divider"></div>' +
        '<a href="' + accountHref + '" class="profile-dropdown-item"><i class="fas fa-user"></i> My Account</a>' +
        '<a href="' + ordersHref  + '" class="profile-dropdown-item"><i class="fas fa-box"></i> My Orders</a>' +
        '<div class="profile-dropdown-divider"></div>' +
        '<button class="profile-dropdown-item profile-logout" onclick="authManager.logout()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>' +
      '</div>';

    return wrap;
  }

  // -- inject CSS once -------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('auth-styles')) return;
    var s = document.createElement('style');
    s.id = 'auth-styles';
    s.textContent =
      '.profile-wrap{position:relative;display:flex;align-items:center;}' +
      '.profile-btn{display:flex;align-items:center;gap:8px;background:rgba(37,99,235,.08);border:1.5px solid rgba(37,99,235,.2);border-radius:50px;padding:6px 14px 6px 6px;cursor:pointer;transition:all .25s;font-family:Poppins,sans-serif;}' +
      '.profile-btn:hover{background:rgba(37,99,235,.14);border-color:rgba(37,99,235,.4);}' +
      '.profile-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '.profile-name{font-size:.85rem;font-weight:600;color:#0f172a;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.profile-chevron{font-size:.65rem;color:#64748b;transition:transform .25s;}' +
      '.profile-btn[aria-expanded="true"] .profile-chevron{transform:rotate(180deg);}' +
      '.profile-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 16px 40px rgba(15,23,42,.14);min-width:220px;z-index:500;opacity:0;transform:translateY(-8px) scale(.97);pointer-events:none;transition:opacity .2s,transform .2s;}' +
      '.profile-dropdown.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}' +
      '.profile-dropdown-header{display:flex;align-items:center;gap:12px;padding:16px;}' +
      '.profile-avatar-lg{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:1rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '.profile-dropdown-name{font-size:.9rem;font-weight:700;color:#0f172a;}' +
      '.profile-dropdown-email{font-size:.75rem;color:#64748b;margin-top:2px;}' +
      '.profile-dropdown-divider{height:1px;background:#f1f5f9;margin:0 12px;}' +
      '.profile-dropdown-item{display:flex;align-items:center;gap:10px;padding:11px 16px;font-size:.85rem;font-weight:500;color:#334155;text-decoration:none;transition:background .15s,color .15s;width:100%;background:none;border:none;cursor:pointer;font-family:Poppins,sans-serif;text-align:left;}' +
      '.profile-dropdown-item:hover{background:#f8faff;color:#2563eb;}' +
      '.profile-dropdown-item i{width:16px;color:#94a3b8;}' +
      '.profile-dropdown-item:hover i{color:#2563eb;}' +
      '.profile-logout{color:#ef4444 !important;}' +
      '.profile-logout:hover{background:#fff5f5 !important;color:#dc2626 !important;}' +
      '.profile-logout i{color:#ef4444 !important;}';
    document.head.appendChild(s);
  }

  // -- update header UI ------------------------------------------------------
  function updateHeaderUI() {
    var user = getUser();
    var headerIcons = document.querySelector('.header-icons');
    if (!headerIcons) return;

    injectStyles();

    // Detect if we're in pages/ subfolder
    var isInner = window.location.pathname.includes('/pages/');

    if (user) {
      // Remove login/signup buttons, add profile dropdown
      var loginBtn  = headerIcons.querySelector('.btn-login');
      var signupBtn = headerIcons.querySelector('.btn-signup');
      if (loginBtn)  loginBtn.remove();
      if (signupBtn) signupBtn.remove();

      // Don't add twice
      if (!document.getElementById('profile-wrap')) {
        var dropdown = buildProfileDropdown(user, isInner);
        headerIcons.appendChild(dropdown);

        // Toggle dropdown on click
        var btn = document.getElementById('profile-btn');
        var menu = document.getElementById('profile-dropdown');

        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = menu.classList.contains('open');
          menu.classList.toggle('open', !isOpen);
          btn.setAttribute('aria-expanded', String(!isOpen));
        });

        // Close on outside click
        document.addEventListener('click', function () {
          menu.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      }
    } else {
      // Ensure login/signup buttons are visible (already in HTML)
      // Nothing extra needed
    }
  }

  // -- logout ----------------------------------------------------------------
  function logout() {
    clearSession();
    // Show brief toast then redirect
    var n = document.createElement('div');
    n.style.cssText = 'position:fixed;top:20px;right:20px;background:#0f172a;color:#fff;padding:13px 20px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.2);z-index:9999;font-family:Poppins,sans-serif;font-size:.88rem;font-weight:600;display:flex;align-items:center;gap:8px';
    n.innerHTML = '<i class="fas fa-check-circle" style="color:#4ade80"></i> Signed out successfully';
    document.body.appendChild(n);
    setTimeout(function () {
      n.remove();
      var isInner = window.location.pathname.includes('/pages/');
      window.location.href = isInner ? '../index.html' : 'index.html';
    }, 1200);
  }

  // -- public API ------------------------------------------------------------
  return {
    init: function () { updateHeaderUI(); },
    logout: logout,
    getUser: getUser,
    getToken: getToken,
    saveSession: saveSession
  };

})();

// Run on every page load
document.addEventListener('DOMContentLoaded', function () {
  authManager.init();
});
