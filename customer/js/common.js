/**
 * Harvest Kitchen - Common Frontend Utilities
 * Modern, Lightweight ES6 Vanilla JS
 */

// Auto-detect environment: use local Spring Boot in dev / file / LAN, or remote production
const isLocalEnv = !window.location.hostname || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname === '0.0.0.0' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') || 
  window.location.hostname.endsWith('.local');

const API_BASE = isLocalEnv
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

/**
 * Global Order Store & Cross-Tab Real-Time Sync Bus
 * Keeps Customer, Admin Panel, and Kitchen Section in 100% sync
 */
const OrderStore = {
  STORAGE_KEY: 'hk_restaurant_orders_v1',
  SYNC_EVENT_KEY: 'hk_order_sync_trigger',

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const orders = data ? JSON.parse(data) : [];
      return Array.isArray(orders) ? orders : [];
    } catch (e) {
      console.warn('Error reading from OrderStore', e);
      return [];
    }
  },

  saveAll(orders) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to localStorage', e);
    }
  },

  getOrderById(id) {
    if (id === undefined || id === null) return null;
    const orders = this.getAll();
    const targetStr = String(id).replace('#', '').trim();
    const targetNum = Number(targetStr);
    return orders.find(o => 
      Number(o.id) === targetNum || 
      Number(o.orderId) === targetNum || 
      String(o.id) === targetStr || 
      String(o.orderId) === targetStr
    ) || null;
  },

  saveOrder(order) {
    if (!order) return null;
    const orders = this.getAll();
    const rawId = order.id || order.orderId || (Math.floor(1000 + Math.random() * 9000));
    const orderId = Number(rawId) || rawId;

    order.id = orderId;
    order.orderId = orderId;
    if (!order.createdAt) order.createdAt = new Date().toISOString();
    if (!order.status) order.status = 'PLACED';
    if (!order.orderSource) order.orderSource = 'DIRECT';

    const existingIndex = orders.findIndex(o => Number(o.id) === Number(orderId) || Number(o.orderId) === Number(orderId));
    if (existingIndex > -1) {
      orders[existingIndex] = { ...orders[existingIndex], ...order };
    } else {
      orders.unshift(order);
    }

    this.saveAll(orders);
    this.broadcastSync('ORDER_SAVED', order);
    return order;
  },

  updateStatus(orderId, newStatus, cancellationReason = null) {
    const orders = this.getAll();
    const targetStr = String(orderId).replace('#', '').trim();
    const targetNum = Number(targetStr);

    const order = orders.find(o => 
      Number(o.id) === targetNum || 
      Number(o.orderId) === targetNum || 
      String(o.id) === targetStr || 
      String(o.orderId) === targetStr
    );

    if (order) {
      order.status = newStatus;
      if (cancellationReason) {
        order.cancellationReason = cancellationReason;
      }
      this.saveAll(orders);
      this.broadcastSync('STATUS_CHANGED', order);
      return order;
    }
    return null;
  },

  broadcastSync(action, order) {
    try {
      const payload = JSON.stringify({
        action,
        orderId: order ? (order.id || order.orderId) : null,
        status: order ? order.status : null,
        timestamp: Date.now()
      });
      localStorage.setItem(this.SYNC_EVENT_KEY, payload);
      window.dispatchEvent(new CustomEvent('hk-order-sync', { detail: { action, order } }));
    } catch (e) {}
  },

  onSync(callback) {
    window.addEventListener('storage', (e) => {
      if (e.key === this.SYNC_EVENT_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          callback(data);
        } catch (err) {}
      }
    });
    window.addEventListener('hk-order-sync', (e) => {
      if (e.detail) {
        callback(e.detail);
      }
    });
  }
};

// Format currency
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// User Session Management
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('hk_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem('hk_user', JSON.stringify(user));
  updateNavbarAuth();
}

function logoutUser() {
  localStorage.removeItem('hk_user');
  window.location.reload();
}

// Cart Management - Unified storage across cart.js, checkout.js, and common.js
const COMMON_CART_KEY = 'restaurant_customer_cart';
const LEGACY_CART_KEY = 'restaurant_cart';

function getCart() {
  try {
    let data = localStorage.getItem(COMMON_CART_KEY);
    if (!data) {
      data = localStorage.getItem(LEGACY_CART_KEY);
      if (data) {
        localStorage.setItem(COMMON_CART_KEY, data);
      }
    }
    const cart = data ? JSON.parse(data) : [];
    if (!Array.isArray(cart)) return [];
    // Ensure every item has both id and foodId normalized as Numbers
    return cart.map(item => {
      const fid = Number(item.foodId || item.id);
      return {
        ...item,
        id: fid,
        foodId: fid,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0)
      };
    });
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    const serialized = JSON.stringify(cart);
    localStorage.setItem(COMMON_CART_KEY, serialized);
    localStorage.setItem(LEGACY_CART_KEY, serialized);
    updateCartBadge();
    localStorage.setItem('hk_last_cart_activity', Date.now().toString());
  } catch (e) {
    console.error('Error saving cart', e);
  }
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  // Update all cart badges across desktop and mobile
  document.querySelectorAll('#cartCount, .cart-badge, #mobileCartBadge').forEach(el => {
    el.textContent = count;
  });

  updateFloatingCartBar(count, total);
}

// Mobile Floating Cart Bar (Positioned cleanly above Mobile Bottom Nav)
function updateFloatingCartBar(count, total) {
  const bar = document.getElementById('floatingCartBar');
  if (bar) {
    if (count > 0) {
      bar.style.display = 'flex';
      const itemsLabel = count === 1 ? '1 ITEM' : `${count} ITEMS`;
      const itemsEl = document.getElementById('floatingCartItems');
      const totalEl = document.getElementById('floatingCartTotal');
      if (itemsEl) itemsEl.textContent = itemsLabel;
      if (totalEl) totalEl.textContent = `₹${Math.round(total)}`;
    } else {
      bar.style.display = 'none';
    }
    // Remove duplicate legacy floating cart if any
    const legacy = document.getElementById('mobileFloatingCart');
    if (legacy) legacy.remove();
    return;
  }
}

// Native Mobile Bottom Navigation Bar
function initMobileBottomNav() {
  if (document.querySelector('.mobile-bottom-nav')) return;

  const currentPath = window.location.pathname;
  const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/customer/') || currentPath.endsWith('/');
  const isMenu = currentPath.endsWith('menu.html');
  const isCart = currentPath.endsWith('cart.html') || currentPath.endsWith('checkout.html');
  const isTrack = currentPath.endsWith('track-order.html') || currentPath.endsWith('order-success.html');
  const isAccount = currentPath.endsWith('account.html');

  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.innerHTML = `
    <a href="index.html" class="m-nav-item ${isHome ? 'active' : ''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </a>
    <a href="menu.html" class="m-nav-item ${isMenu ? 'active' : ''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
      <span>Menu</span>
    </a>
    <a href="cart.html" class="m-nav-item ${isCart ? 'active' : ''}">
      <div class="m-nav-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span class="m-cart-badge" id="mobileCartBadge">0</span>
      </div>
      <span>Cart</span>
    </a>
    <a href="track-order.html" class="m-nav-item ${isTrack ? 'active' : ''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>Track</span>
    </a>
    <a href="account.html" class="m-nav-item ${isAccount ? 'active' : ''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Account</span>
    </a>
  `;

  document.body.appendChild(nav);
}

// Add Item to Cart
function addToCart(foodItem, quantity = 1) {
  if (!foodItem) return;
  const foodId = Number(foodItem.foodId || foodItem.id);
  if (!foodId) return;

  let cart = getCart();
  const existing = cart.find(i => (Number(i.foodId) === foodId || Number(i.id) === foodId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: foodId,
      foodId: foodId,
      name: foodItem.name || 'Delicious Dish',
      price: Number(foodItem.price || 0),
      imageUrl: foodItem.imageUrl || '',
      category: foodItem.category || '',
      quantity: quantity
    });
  }
  saveCart(cart);
  if (typeof CartService !== 'undefined' && CartService.syncAllCardSteppers) {
    CartService.syncAllCardSteppers();
  }
  showToast(`Added ${foodItem.name || 'Dish'} to cart!`);
}

// Toast Notifications
function showToast(message, type = 'success') {
  let toast = document.getElementById('hk-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hk-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#181615';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '999px';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.zIndex = '99999';
    toast.style.transition = 'all 0.3s ease';
    toast.style.display = 'none';
    document.body.appendChild(toast);
  }

  if (type === 'error') {
    toast.style.background = '#df1f26';
  } else {
    toast.style.background = '#181615';
  }

  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 2500);
}

function updateNavbarAuth() {
  const user = getCurrentUser();
  const firstName = (user && user.name) ? user.name.trim().split(' ')[0] : '';
  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  // 1. Mobile top bar profile button (transforms into sleek pill when signed in)
  const topAccountBtns = document.querySelectorAll('#topAccountBtn, .mobile-top-bar a[href="account.html"]');
  topAccountBtns.forEach(btn => {
    if (user && firstName) {
      btn.classList.add('top-user-pill');
      btn.innerHTML = `
        <span class="top-user-avatar">${initial}</span>
        <span class="top-user-name">${escapeHtml(firstName)}</span>
      `;
      btn.setAttribute('title', `Logged in as ${user.name}`);
      btn.setAttribute('aria-label', `Logged in as ${user.name}`);
    } else {
      btn.classList.remove('top-user-pill');
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      `;
      btn.setAttribute('title', 'Sign In / Account');
      btn.setAttribute('aria-label', 'Sign In / Account');
    }
  });

  // 2. Standard navbar links (desktop headers)
  const navLinks = document.querySelectorAll('.nav-links a[href="account.html"]');
  navLinks.forEach(link => {
    if (user && firstName) {
      link.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${escapeHtml(firstName)}`;
    } else {
      link.innerHTML = 'Account';
    }
  });

  // 3. Mobile bottom navigation bar
  const bottomNavAccount = document.querySelector('.m-bottom-nav a[href="account.html"] span');
  if (bottomNavAccount) {
    bottomNavAccount.textContent = (user && firstName) ? firstName : 'Account';
  }

  // 4. Update the three-dot more options dropdown state
  updateDropdownAuth(user, firstName);
}

function updateDropdownAuth(user = null, firstName = '') {
  if (!user) user = getCurrentUser();
  if (!firstName && user && user.name) firstName = user.name.trim().split(' ')[0];

  const headerUser = document.getElementById('dropdownHeaderUser');
  if (headerUser) {
    headerUser.textContent = (user && user.name) ? `Hi, ${user.name}` : 'Welcome Guest';
  }

  const authContainer = document.getElementById('dropdownAuthActionContainer');
  if (authContainer) {
    if (user && user.name) {
      authContainer.innerHTML = `
        <button type="button" onclick="logoutUser()" class="dropdown-item dropdown-signout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sign Out (${escapeHtml(firstName)})</span>
        </button>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="account.html" class="dropdown-item" id="dropdownAuthBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span>Sign In / Register</span>
        </a>
      `;
    }
  }
}

function toggleNavMoreDropdown(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const dropdown = document.getElementById('navMoreDropdown');
  const btn = document.getElementById('btnMoreOptions');
  if (!dropdown) return;

  const isShowing = dropdown.classList.toggle('show');
  if (btn) btn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  if (isShowing) {
    updateDropdownAuth();
  }
}

function initNavMoreDropdownListeners() {
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('navMoreDropdown');
    const btn = document.getElementById('btnMoreOptions');
    if (dropdown && dropdown.classList.contains('show')) {
      if (!dropdown.contains(e.target) && !btn?.contains(e.target)) {
        dropdown.classList.remove('show');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('navMoreDropdown');
      const btn = document.getElementById('btnMoreOptions');
      if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

async function fetchAndDisplayActiveOffer() {
  try {
    const res = await fetch(`${API_BASE}/offers/active`);
    if (!res.ok) return;
    const offers = await res.json();
    if (offers && offers.length > 0) {
      // Optional announcement banner
    }
  } catch (e) {
    // Ignore quietly
  }
}

// Update Navbar Auth & Active Special Offer
async function initCommonHeader() {
  initMobileBottomNav();
  updateCartBadge();
  updateNavbarAuth();
  initNavMoreDropdownListeners();
  fetchAndDisplayActiveOffer();
}

// Reorder functionality
async function reorderPastOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error('Order not found');
    const order = await res.json();

    if (!order.items || order.items.length === 0) {
      showToast('No items found in this order', 'error');
      return;
    }

    let cart = getCart();
    for (const item of order.items) {
      const existing = cart.find(c => c.id === item.foodId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cart.push({
          id: item.foodId,
          name: item.foodName,
          price: item.price,
          imageUrl: item.foodImageUrl || '',
          quantity: item.quantity
        });
      }
    }

    saveCart(cart);
    showToast('Items added to cart! Redirecting to cart...');
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 800);
  } catch (e) {
    showToast('Could not reorder: ' + e.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCommonHeader();
  // Strip any legacy food status badge elements or cart popups
  const cleanupDom = () => {
    document.querySelectorAll('.food-status-badge, .badge-available, .badge-unavailable, .abandoned-cart-banner, #abandoned-cart-banner').forEach(el => el.remove());
  };
  cleanupDom();
  setTimeout(cleanupDom, 100);
  setTimeout(cleanupDom, 400);
  setTimeout(cleanupDom, 1000);
  setInterval(cleanupDom, 1500);
});
