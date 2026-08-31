/**
 * Harvest Kitchen - Common Frontend Utilities
 * Modern, Lightweight ES6 Vanilla JS
 */

// Auto-detect environment: use Render backend in production, localhost in dev
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

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

// Cart Management
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('restaurant_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('restaurant_cart', JSON.stringify(cart));
  updateCartBadge();
  localStorage.setItem('hk_last_cart_activity', Date.now().toString());
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

// Mobile Floating Cart Bar (for fast checkout on mobile screens)
function updateFloatingCartBar(count, total) {
  const isMenuOrHome = window.location.pathname.endsWith('menu.html') || 
                       window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname.endsWith('/customer/');
  
  if (!isMenuOrHome) return;

  let bar = document.getElementById('mobileFloatingCart');
  if (count <= 0) {
    if (bar) bar.style.display = 'none';
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'mobileFloatingCart';
    bar.className = 'mobile-floating-cart';
    document.body.appendChild(bar);
  }

  bar.style.display = 'flex';
  bar.innerHTML = `
    <div class="m-cart-info">
      <span class="m-cart-qty">${count} ${count === 1 ? 'ITEM' : 'ITEMS'}</span>
      <span class="m-cart-divider">•</span>
      <span class="m-cart-total">${formatCurrency(total)}</span>
    </div>
    <a href="cart.html" class="m-cart-cta">
      <span>View Cart</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  `;
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
  let cart = getCart();
  const existing = cart.find(i => i.id === foodItem.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      imageUrl: foodItem.imageUrl,
      category: foodItem.category,
      quantity: quantity
    });
  }
  saveCart(cart);
  showToast(`Added ${foodItem.name} to cart!`);
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
  const accountLinks = document.querySelectorAll('a[href="account.html"]');
  accountLinks.forEach(link => {
    if (user && user.name) {
      const firstName = user.name.split(' ')[0];
      link.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${firstName}`;
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
