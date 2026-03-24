﻿/// ===== CART MANAGER =====
var API_URL = 'https://shopify-store-o6wo.onrender.com/api';

var cartManager = {
  cart: { items: [] },
  _loaded: false,

  init: function () {
    var self = this;
    self.loadCart().then(function () {
      self._loaded = true;
      self.updateCartUI();
      self.bindEvents();
    });
  },

  loadCart: function () {
    var self = this;
    return fetch(API_URL + '/cart')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        self.cart = (data && Array.isArray(data.items)) ? data : { items: [] };
      })
      .catch(function () { self.cart = { items: [] }; });
  },

  // Add to cart � works immediately, no need to wait for loadCart
  addToCart: function (productId, qty) {
    var self = this;
    qty = qty || 1;
    var pid = String(productId);

    // Show loading state on button
    var btn = document.querySelector('[data-pid="' + pid + '"]');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      btn.disabled = true;
    }

    fetch(API_URL + '/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: pid, qty: qty })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        self.cart = (data && Array.isArray(data.items)) ? data : { items: [] };
        self.updateCartUI();
        self.showNotification('\u2713 Added to cart!');
        if (btn) {
          btn.innerHTML = '<i class="fas fa-check"></i> Added!';
          setTimeout(function () {
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
            btn.disabled = false;
          }, 1500);
        }
      })
      .catch(function (e) {
        console.error('addToCart error:', e);
        if (btn) {
          btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
          btn.disabled = false;
        }
        self.showNotification('Could not add to cart. Is the backend running?');
      });
  },

  updateQuantity: function (productId, delta) {
    var self = this;
    var pid = String(productId);
    var items = self.cart.items;
    var idx = -1;
    for (var i = 0; i < items.length; i++) {
      if (String(items[i].productId) === pid) { idx = i; break; }
    }
    if (idx === -1) return;

    items[idx].qty += delta;
    if (items[idx].qty <= 0) items.splice(idx, 1);

    self.updateCartUI();   // instant re-render
    self.saveCart();       // persist in background
  },

  removeFromCart: function (productId) {
    var self = this;
    var pid = String(productId);
    self.cart.items = self.cart.items.filter(function (i) {
      return String(i.productId) !== pid;
    });
    self.updateCartUI();
    self.saveCart();
  },

  saveCart: function () {
    var self = this;
    var items = self.cart.items.map(function (i) {
      return {
        productId: String(i.productId),
        qty: Number(i.qty),
        title: i.title || '',
        price: Number(i.price) || 0,
        image: i.image || ''
      };
    });
    fetch(API_URL + '/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    }).catch(function (e) { console.warn('saveCart failed:', e); });
  },

  updateCartUI: function () {
    var self = this;
    // Update all cart badges on page
    var badges = document.querySelectorAll('#cart-count');
    var total = 0;
    for (var i = 0; i < self.cart.items.length; i++) total += self.cart.items[i].qty;
    for (var b = 0; b < badges.length; b++) {
      badges[b].textContent = total;
      badges[b].style.display = total > 0 ? 'inline-flex' : 'none';
    }

    // Render cart items (only on cart page)
    var container = document.getElementById('cart-items');
    if (container) self.renderCartItems(container);

    self.updateTotals();
  },

  renderCartItems: function (container) {
    var self = this;
    if (!self.cart.items || self.cart.items.length === 0) {
      container.innerHTML =
        '<div class="empty-cart">' +
          '<i class="fas fa-shopping-cart"></i>' +
          '<h3>Your cart is empty</h3>' +
          '<p>Add some products to get started</p>' +
          '<a href="shop.html" class="btn btn-primary">' +
            '<i class="fas fa-shopping-bag"></i> Browse Products' +
          '</a>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < self.cart.items.length; i++) {
      var item = self.cart.items[i];
      var img = item.image || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80';
      var pid = String(item.productId);
      var lineTotal = (Number(item.price) * item.qty).toFixed(2);

      html +=
        '<div class="cart-item" data-pid="' + pid + '">' +
          '<img src="' + img + '" alt="' + item.title + '" />' +
          '<div class="cart-item-info">' +
            '<h3>' + item.title + '</h3>' +
            '<span class="item-price">&#8377;' + Number(item.price).toFixed(2) + ' each</span>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<div class="qty-control">' +
              '<button class="qty-btn" data-pid="' + pid + '" data-delta="-1">&#8722;</button>' +
              '<span class="qty-val">' + item.qty + '</span>' +
              '<button class="qty-btn" data-pid="' + pid + '" data-delta="1">+</button>' +
            '</div>' +
            '<span class="item-total">&#8377;' + lineTotal + '</span>' +
            '<button class="remove-btn" data-pid="' + pid + '">' +
              '<i class="fas fa-trash-alt"></i> Remove' +
            '</button>' +
          '</div>' +
        '</div>';
    }
    container.innerHTML = html;
  },

  // Event delegation on #cart-items � handles qty and remove
  bindEvents: function () {
    var self = this;
    var container = document.getElementById('cart-items');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        var pid   = qtyBtn.getAttribute('data-pid');
        var delta = parseInt(qtyBtn.getAttribute('data-delta'), 10);
        self.updateQuantity(pid, delta);
        return;
      }
      var removeBtn = e.target.closest('.remove-btn');
      if (removeBtn) {
        self.removeFromCart(removeBtn.getAttribute('data-pid'));
      }
    });
  },

  updateTotals: function () {
    var self = this;
    var subtotalEl  = document.getElementById('subtotal-value');
    var shippingEl  = document.getElementById('shipping-value');
    var taxEl       = document.getElementById('tax-value');
    var totalEl     = document.getElementById('total-value');
    var checkoutBtn = document.getElementById('checkout-btn');

    var subtotal = 0;
    for (var i = 0; i < self.cart.items.length; i++) {
      subtotal += Number(self.cart.items[i].price) * self.cart.items[i].qty;
    }
    var shipping = self.cart.items.length > 0 ? 99 : 0;
    var tax      = Math.round(subtotal * 0.18 * 100) / 100;
    var total    = Math.round((subtotal + shipping + tax) * 100) / 100;

    if (subtotalEl) subtotalEl.textContent = '\u20B9' + subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = shipping > 0 ? '\u20B9' + shipping.toFixed(2) : 'Free';
    if (taxEl)      taxEl.textContent      = '\u20B9' + tax.toFixed(2);
    if (totalEl)    totalEl.textContent    = '\u20B9' + total.toFixed(2);

    if (checkoutBtn) {
      checkoutBtn.disabled      = self.cart.items.length === 0;
      checkoutBtn.style.opacity = self.cart.items.length === 0 ? '0.5' : '1';
    }
  },

  showNotification: function (msg) {
    var existing = document.getElementById('cart-notif');
    if (existing) existing.remove();
    var n = document.createElement('div');
    n.id = 'cart-notif';
    n.style.cssText = 'position:fixed;top:20px;right:20px;background:#16a34a;color:#fff;padding:14px 22px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.18);z-index:99999;font-family:Poppins,sans-serif;font-size:.9rem;font-weight:600;display:flex;align-items:center;gap:8px;animation:fadeInUp .25s ease';
    n.innerHTML = '<i class="fas fa-check-circle"></i> ' + msg;
    document.body.appendChild(n);
    setTimeout(function () { if (n.parentNode) n.remove(); }, 2500);
  }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  cartManager.init();
});
