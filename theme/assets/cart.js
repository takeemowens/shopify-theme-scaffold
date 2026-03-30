/* =============================================
   ALL IS WELL — CART + WISHLIST + TOAST
   Handles: cart drawer, AJAX cart ops, wishlist
   localStorage, toast notifications.
   Tokens: /assets/base.css (:root variables)
   ============================================= */
(function () {
  'use strict';

  /* =============================================
     1. TOAST NOTIFICATION SYSTEM
     ============================================= */
  var toastContainer;

  function initToast() {
    toastContainer = document.getElementById('aiw-toast-container');
  }

  function showToast(message, type) {
    if (!toastContainer) return;
    type = type || 'success';
    var toast = document.createElement('div');
    toast.className = 'aiw-toast aiw-toast--' + type;

    var icon = document.createElement('span');
    icon.className = 'aiw-toast__icon';
    icon.textContent = type === 'success' ? '\u2713' : type === 'error' ? '\u2717' : '\u2665';

    var msg = document.createElement('span');
    msg.className = 'aiw-toast__msg';
    msg.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(msg);
    toastContainer.appendChild(toast);

    requestAnimationFrame(function () { toast.classList.add('aiw-toast--show'); });
    setTimeout(function () {
      toast.classList.remove('aiw-toast--show');
      toast.addEventListener('transitionend', function () { toast.remove(); });
    }, 3000);
  }

  window.AIW = window.AIW || {};
  window.AIW.toast = showToast;

  /* =============================================
     2. CART DRAWER
     ============================================= */
  var cartDrawer, cartOverlay, cartItemsWrap, cartSubtotal, cartCheckoutBtn, cartEmptyState;

  function initCartDrawer() {
    cartDrawer     = document.getElementById('cart-drawer');
    cartOverlay    = document.getElementById('cart-drawer-overlay');
    cartItemsWrap  = document.getElementById('cart-drawer-items');
    cartSubtotal   = document.getElementById('cart-drawer-subtotal');
    cartCheckoutBtn= document.getElementById('cart-drawer-checkout');
    cartEmptyState = document.getElementById('cart-drawer-empty');

    if (!cartDrawer) return;

    var cartLink = document.querySelector('.nav-cart-wrap');
    if (cartLink) {
      cartLink.addEventListener('click', function (e) {
        e.preventDefault();
        openCartDrawer();
      });
    }

    var closeBtn = document.getElementById('cart-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCartDrawer();
    });
  }

  function openCartDrawer() {
    if (!cartDrawer) return;
    fetchAndRenderCart();
    cartDrawer.classList.add('is-open');
    if (cartOverlay) cartOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    if (cartOverlay) cartOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
  }

  window.AIW.openCart = openCartDrawer;
  window.AIW.closeCart = closeCartDrawer;

  function fetchAndRenderCart() {
    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) { renderCartDrawer(cart); });
  }

  function renderCartDrawer(cart) {
    if (!cartItemsWrap) return;

    updateCartBadge(cart.item_count);

    if (cart.item_count === 0) {
      clearElement(cartItemsWrap);
      if (cartEmptyState) cartEmptyState.style.display = '';
      if (cartCheckoutBtn) cartCheckoutBtn.style.display = 'none';
      if (cartSubtotal) cartSubtotal.parentElement.style.display = 'none';
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartCheckoutBtn) cartCheckoutBtn.style.display = '';
    if (cartSubtotal) cartSubtotal.parentElement.style.display = '';

    clearElement(cartItemsWrap);

    cart.items.forEach(function (item) {
      var row = buildCartItem(item);
      cartItemsWrap.appendChild(row);
    });

    if (cartSubtotal) cartSubtotal.textContent = formatMoney(cart.total_price);
  }

  function buildCartItem(item) {
    var row = document.createElement('div');
    row.className = 'cd-item';
    row.dataset.key = item.key;

    /* Image */
    var imgWrap = document.createElement('div');
    imgWrap.className = 'cd-item__img';
    if (item.image) {
      var img = document.createElement('img');
      img.src = item.image.replace(/(\.\w+)\?/, '_200x$1?');
      img.alt = item.title;
      img.loading = 'lazy';
      imgWrap.appendChild(img);
    }
    row.appendChild(imgWrap);

    /* Info */
    var info = document.createElement('div');
    info.className = 'cd-item__info';

    var title = document.createElement('div');
    title.className = 'cd-item__title';
    title.textContent = item.product_title;
    info.appendChild(title);

    if (item.variant_title) {
      var variant = document.createElement('div');
      variant.className = 'cd-item__variant';
      variant.textContent = item.variant_title;
      info.appendChild(variant);
    }

    /* Qty row */
    var qtyRow = document.createElement('div');
    qtyRow.className = 'cd-item__qty-row';

    var decBtn = document.createElement('button');
    decBtn.className = 'cd-qty-btn';
    decBtn.textContent = '\u2212';
    decBtn.setAttribute('aria-label', 'Decrease quantity');
    decBtn.addEventListener('click', function () {
      updateCartItem(item.key, Math.max(0, item.quantity - 1));
    });

    var qtyVal = document.createElement('span');
    qtyVal.className = 'cd-qty-val';
    qtyVal.textContent = item.quantity;

    var incBtn = document.createElement('button');
    incBtn.className = 'cd-qty-btn';
    incBtn.textContent = '+';
    incBtn.setAttribute('aria-label', 'Increase quantity');
    incBtn.addEventListener('click', function () {
      updateCartItem(item.key, item.quantity + 1);
    });

    qtyRow.appendChild(decBtn);
    qtyRow.appendChild(qtyVal);
    qtyRow.appendChild(incBtn);
    info.appendChild(qtyRow);
    row.appendChild(info);

    /* Right — price + remove */
    var right = document.createElement('div');
    right.className = 'cd-item__right';

    var price = document.createElement('div');
    price.className = 'cd-item__price';
    price.textContent = formatMoney(item.final_line_price);
    right.appendChild(price);

    var removeBtn = document.createElement('button');
    removeBtn.className = 'cd-item__remove';
    removeBtn.textContent = '\u00D7';
    removeBtn.setAttribute('aria-label', 'Remove item');
    removeBtn.addEventListener('click', function () {
      updateCartItem(item.key, 0);
    });
    right.appendChild(removeBtn);
    row.appendChild(right);

    return row;
  }

  function updateCartItem(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id: key, quantity: quantity })
    })
    .then(function (r) {
      if (!r.ok) throw new Error('Cart update failed');
      return r.json();
    })
    .then(function (cart) {
      renderCartDrawer(cart);
      if (quantity === 0) showToast('Item removed', 'success');
    })
    .catch(function () {
      showToast('Could not update cart \u2014 try again', 'error');
    });
  }

  function addToCart(variantId, quantity, productTitle) {
    quantity = quantity || 1;
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ items: [{ id: parseInt(variantId, 10), quantity: quantity }] })
    })
    .then(function (r) {
      if (!r.ok) throw new Error('Could not add to cart');
      return r.json();
    })
    .then(function () {
      showToast((productTitle || 'Item') + ' added to cart', 'success');
      openCartDrawer();
      return fetch('/cart.js', { credentials: 'same-origin' }).then(function (r) { return r.json(); });
    })
    .then(function (cart) {
      updateCartBadge(cart.item_count);
    })
    .catch(function () {
      showToast('Could not add to cart \u2014 try again', 'error');
    });
  }

  window.AIW.addToCart = addToCart;

  function updateCartBadge(count) {
    document.querySelectorAll('.cart-count').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });

    if (count > 0) {
      var cartWrap = document.querySelector('.nav-cart-wrap');
      if (cartWrap && !cartWrap.querySelector('.cart-count')) {
        var badge = document.createElement('span');
        badge.className = 'cart-count';
        badge.textContent = count;
        cartWrap.appendChild(badge);
      }
    }
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  }

  function clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /* =============================================
     3. WISHLIST (localStorage)
     ============================================= */
  var WISHLIST_KEY = 'aiw_wishlist';
  var wishlistDrawer, wishlistOverlay, wishlistItemsWrap, wishlistEmptyState;

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    updateWishlistBadge();
  }

  function isInWishlist(handle) {
    return getWishlist().some(function (item) { return item.handle === handle; });
  }

  function addToWishlist(product) {
    var list = getWishlist();
    if (list.some(function (item) { return item.handle === product.handle; })) return;
    list.push(product);
    saveWishlist(list);
    showToast(product.title + ' added to wishlist', 'wishlist');
    updateWishlistButtons();
  }

  function removeFromWishlist(handle) {
    var list = getWishlist().filter(function (item) { return item.handle !== handle; });
    saveWishlist(list);
    updateWishlistButtons();
  }

  function toggleWishlist(product) {
    if (isInWishlist(product.handle)) {
      removeFromWishlist(product.handle);
      showToast('Removed from wishlist', 'success');
    } else {
      addToWishlist(product);
    }
  }

  window.AIW.toggleWishlist = toggleWishlist;
  window.AIW.isInWishlist = isInWishlist;

  function updateWishlistBadge() {
    var count = getWishlist().length;
    var badge = document.querySelector('.wishlist-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    } else if (count > 0) {
      var wishBtn = document.querySelector('.nav-wishlist-btn');
      if (wishBtn) {
        var b = document.createElement('span');
        b.className = 'wishlist-count';
        b.textContent = count;
        wishBtn.style.position = 'relative';
        wishBtn.appendChild(b);
      }
    }
  }

  function updateWishlistButtons() {
    document.querySelectorAll('[data-wishlist-handle]').forEach(function (btn) {
      var handle = btn.dataset.wishlistHandle;
      var inList = isInWishlist(handle);
      btn.classList.toggle('wishlisted', inList);
      var label = btn.querySelector('.wishlist-label');
      if (label) label.textContent = inList ? 'Wishlisted' : 'Add to Wishlist';
    });
  }

  function initWishlistDrawer() {
    wishlistDrawer    = document.getElementById('wishlist-drawer');
    wishlistOverlay   = document.getElementById('wishlist-drawer-overlay');
    wishlistItemsWrap = document.getElementById('wishlist-drawer-items');
    wishlistEmptyState= document.getElementById('wishlist-drawer-empty');

    if (!wishlistDrawer) return;

    var wishBtn = document.querySelector('.nav-wishlist-btn');
    if (wishBtn) {
      wishBtn.addEventListener('click', function () { openWishlistDrawer(); });
    }

    var closeBtn = document.getElementById('wishlist-drawer-close');
    if (closeBtn) closeBtn.addEventListener('click', closeWishlistDrawer);
    if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlistDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wishlistDrawer.classList.contains('is-open')) closeWishlistDrawer();
    });
  }

  function openWishlistDrawer() {
    if (!wishlistDrawer) return;
    renderWishlistDrawer();
    wishlistDrawer.classList.add('is-open');
    if (wishlistOverlay) wishlistOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
  }

  function closeWishlistDrawer() {
    if (!wishlistDrawer) return;
    wishlistDrawer.classList.remove('is-open');
    if (wishlistOverlay) wishlistOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
  }

  function renderWishlistDrawer() {
    var list = getWishlist();

    if (!wishlistItemsWrap) return;

    if (list.length === 0) {
      clearElement(wishlistItemsWrap);
      if (wishlistEmptyState) wishlistEmptyState.style.display = '';
      return;
    }

    if (wishlistEmptyState) wishlistEmptyState.style.display = 'none';

    clearElement(wishlistItemsWrap);

    list.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'cd-item';

      var imgWrap = document.createElement('div');
      imgWrap.className = 'cd-item__img';
      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;
        img.loading = 'lazy';
        imgWrap.appendChild(img);
      }
      row.appendChild(imgWrap);

      var info = document.createElement('div');
      info.className = 'cd-item__info';

      var titleLink = document.createElement('a');
      titleLink.className = 'cd-item__title';
      titleLink.href = item.url;
      titleLink.textContent = item.title;
      info.appendChild(titleLink);

      if (item.price) {
        var priceEl = document.createElement('div');
        priceEl.className = 'cd-item__variant';
        priceEl.textContent = item.price;
        info.appendChild(priceEl);
      }
      row.appendChild(info);

      var right = document.createElement('div');
      right.className = 'cd-item__right';

      var removeBtn = document.createElement('button');
      removeBtn.className = 'cd-item__remove';
      removeBtn.textContent = '\u00D7';
      removeBtn.setAttribute('aria-label', 'Remove from wishlist');
      removeBtn.addEventListener('click', function () {
        removeFromWishlist(item.handle);
        renderWishlistDrawer();
        showToast('Removed from wishlist', 'success');
      });
      right.appendChild(removeBtn);
      row.appendChild(right);

      wishlistItemsWrap.appendChild(row);
    });
  }

  /* =============================================
     4. PDP WISHLIST BUTTON
     ============================================= */
  function initPDPWishlist() {
    var wishBtn = document.getElementById('wishlistBtn');
    if (!wishBtn) return;

    var handle = wishBtn.dataset.wishlistHandle;
    if (!handle) return;

    if (isInWishlist(handle)) {
      wishBtn.classList.add('wishlisted');
      var label = wishBtn.querySelector('.wishlist-label');
      if (label) label.textContent = 'Wishlisted';
    }

    wishBtn.addEventListener('click', function () {
      var product = {
        handle: wishBtn.dataset.wishlistHandle,
        title: wishBtn.dataset.wishlistTitle || '',
        image: wishBtn.dataset.wishlistImage || '',
        price: wishBtn.dataset.wishlistPrice || '',
        url: wishBtn.dataset.wishlistUrl || ''
      };
      toggleWishlist(product);
    });
  }

  /* =============================================
     5. INIT
     ============================================= */
  function init() {
    initToast();
    initCartDrawer();
    initWishlistDrawer();
    initPDPWishlist();
    updateWishlistBadge();
    updateWishlistButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
