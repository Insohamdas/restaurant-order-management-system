/**
 * Harvest Kitchen - Common Frontend Utilities
 * Modern, Lightweight ES6 Vanilla JS
 */

const API_BASE = 'http://localhost:8080/api';

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
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = count;
  }
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
    toast.style.bottom = '24px';
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

// Update Navbar Auth & Active Special Offer
async function initCommonHeader() {
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
