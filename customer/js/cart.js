/**
 * Customer Shopping Cart Service
 * Manages cart state in localStorage, interactive card stepper sync, and navbar badges
 */

const CART_STORAGE_KEY = 'restaurant_customer_cart';
let BUSINESS_SETTINGS = {
  deliveryFee: 40.0,
  freeDeliveryThreshold: 499.0,
  minimumOrderAmount: 99.0
};

// Fetch dynamic settings from API
async function loadBusinessSettings() {
  try {
    const baseUrl = (typeof API_BASE !== 'undefined') ? API_BASE : (
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8080/api'
        : 'https://restaurant-order-management-system-cxv5.onrender.com/api'
    );
    const res = await fetch(`${baseUrl}/settings`);
    if (res.ok) {
      BUSINESS_SETTINGS = await res.json();
    }
  } catch (e) {
    // Keep defaults
  }
}

const CartService = {
  getCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading cart from localStorage', e);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      this.updateCartBadge();
      this.syncAllCardSteppers();
      localStorage.setItem('hk_last_cart_activity', Date.now().toString());
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  },

  getItemQuantity(foodId) {
    const cart = this.getCart();
    const item = cart.find(i => (i.foodId === foodId || i.id === foodId));
    return item ? item.quantity : 0;
  },

  addToCart(food, quantity = 1) {
    if (!food) return;
    const foodId = food.foodId || food.id;
    if (!foodId) return;

    if (food.available === false) {
      this.showToast(`Sorry, ${food.name} is currently unavailable.`, 'error');
      return;
    }

    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => (item.foodId === foodId || item.id === foodId));

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: foodId,
        foodId: foodId,
        name: food.name,
        price: food.price,
        imageUrl: food.imageUrl || '',
        category: food.category || '',
        quantity: quantity
      });
    }

    this.saveCart(cart);
  },

  updateQuantity(foodId, newQuantity) {
    let cart = this.getCart();
    if (newQuantity <= 0) {
      cart = cart.filter(item => (item.foodId !== foodId && item.id !== foodId));
    } else {
      const item = cart.find(item => (item.foodId === foodId || item.id === foodId));
      if (item) {
        item.quantity = newQuantity;
      }
    }
    this.saveCart(cart);
  },

  removeFromCart(foodId) {
    let cart = this.getCart();
    cart = cart.filter(item => (item.foodId !== foodId && item.id !== foodId));
    this.saveCart(cart);
  },

  clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    this.updateCartBadge();
    this.syncAllCardSteppers();
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  },

  calculateSubtotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getDeliveryFee() {
    const cart = this.getCart();
    if (cart.length === 0) return 0;
    const subtotal = this.calculateSubtotal();
    if (subtotal >= (BUSINESS_SETTINGS.freeDeliveryThreshold || 499.0)) {
      return 0;
    }
    return BUSINESS_SETTINGS.deliveryFee || 40.0;
  },

  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const fee = this.getDeliveryFee();
    return subtotal + fee;
  },

  updateCartBadge() {
    const count = this.getCartCount();
    const badges = document.querySelectorAll('.cart-badge, #cartCount');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  },

  // Sync interactive quantity steppers across all cards currently on screen
  syncAllCardSteppers() {
    const cart = this.getCart();
    const map = {};
    cart.forEach(item => {
      const id = item.foodId || item.id;
      map[id] = item.quantity;
    });

    document.querySelectorAll('[data-card-food-id]').forEach(wrap => {
      const foodId = parseInt(wrap.getAttribute('data-card-food-id'), 10);
      const qty = map[foodId] || 0;

      if (qty > 0) {
        wrap.innerHTML = `
          <div class="card-qty-stepper">
            <button class="stepper-btn stepper-minus" onclick="handleCardQtyChange(${foodId}, -1, event)" title="Decrease" aria-label="Decrease quantity">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="stepper-val">${qty}</span>
            <button class="stepper-btn stepper-plus" onclick="handleCardQtyChange(${foodId}, 1, event)" title="Increase" aria-label="Increase quantity">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        `;
      } else {
        wrap.innerHTML = `
          <button class="btn btn-primary btn-sm btn-add-cart" onclick="handleCardInitialAdd(${foodId}, event)">
            + Add to Cart
          </button>
        `;
      }
    });
  },

  showToast(message, type = 'success') {
    let toast = document.getElementById('hk-toast') || document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hk-toast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'flex';

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2200);
  }
};

// Global Card Stepper Handlers for Home and Menu pages
function handleCardInitialAdd(foodId, event) {
  if (event) event.stopPropagation();
  let food = (typeof allFoodItems !== 'undefined' && Array.isArray(allFoodItems)) ? allFoodItems.find(f => f.id === foodId) : null;
  if (!food) {
    food = { id: foodId, name: 'Dish', price: 0 };
  }
  CartService.addToCart(food, 1);
}

function handleCardQtyChange(foodId, delta, event) {
  if (event) event.stopPropagation();
  const currentQty = CartService.getItemQuantity(foodId);
  const newQty = currentQty + delta;
  CartService.updateQuantity(foodId, newQty);
}

// Global aliases to ensure backwards compatibility with common.js
function getCart() { return CartService.getCart(); }
function saveCart(cart) { CartService.saveCart(cart); }
function addToCart(foodItem, quantity = 1) { CartService.addToCart(foodItem, quantity); }
function updateCartBadge() { CartService.updateCartBadge(); }

document.addEventListener('DOMContentLoaded', () => {
  loadBusinessSettings();
  CartService.updateCartBadge();
});
