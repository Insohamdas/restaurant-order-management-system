/**
 * Customer Cart Page Controller - Upgraded with Smart Upselling & Free Delivery Goal
 */

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  const clearBtn = document.getElementById('btnClearCart');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        CartService.clearCart();
        renderCartPage();
      }
    });
  }
});

async function renderCartPage() {
  const container = document.getElementById('cartItemsList');
  const emptyState = document.getElementById('cartEmptyState');
  const cartContent = document.getElementById('cartContentSection');
  const subtotalEl = document.getElementById('cartSubtotal');
  const deliveryFeeEl = document.getElementById('cartDeliveryFee');
  const grandTotalEl = document.getElementById('cartGrandTotal');

  const cart = CartService.getCart();

  if (!cart || cart.length === 0) {
    if (cartContent) cartContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (cartContent) cartContent.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

  if (container) {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.imageUrl || placeholderImg}" alt="${escapeHtml(item.name)}" onerror="this.src='${placeholderImg}'">
        <div>
          <div class="cart-item-title">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">₹${Number(item.price).toFixed(0)} each</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn btn-qty-minus" data-food-id="${item.foodId}">-</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn btn-qty-plus" data-food-id="${item.foodId}">+</button>
        </div>
        <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(0)}</div>
        <div>
          <button class="btn btn-danger btn-sm btn-remove-item" data-food-id="${item.foodId}" title="Remove item" style="padding: 5px 8px; display: inline-flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Attach listeners
    container.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = parseInt(btn.getAttribute('data-food-id'));
        const item = cart.find(i => i.foodId === foodId);
        if (item) {
          CartService.updateQuantity(foodId, item.quantity - 1);
          renderCartPage();
        }
      });
    });

    container.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = parseInt(btn.getAttribute('data-food-id'));
        const item = cart.find(i => i.foodId === foodId);
        if (item) {
          CartService.updateQuantity(foodId, item.quantity + 1);
          renderCartPage();
        }
      });
    });

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = parseInt(btn.getAttribute('data-food-id'));
        CartService.removeFromCart(foodId);
        renderCartPage();
      });
    });
  }

  const subtotal = CartService.calculateSubtotal();
  const deliveryFee = CartService.getDeliveryFee();
  const grandTotal = CartService.calculateTotal();

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
  if (deliveryFeeEl) {
    if (deliveryFee === 0 && subtotal > 0) {
      deliveryFeeEl.innerHTML = '<span style="color: #16a34a; font-weight: 700;">FREE (Unlocked)</span>';
    } else {
      deliveryFeeEl.textContent = `₹${deliveryFee.toFixed(0)}`;
    }
  }
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(0)}`;

  // Update Free Delivery Goal Bar
  updateFreeDeliveryBar(subtotal);

  // Load Smart Upsells
  loadCartUpsells(cart);
}

function updateFreeDeliveryBar(subtotal) {
  const bar = document.getElementById('freeDeliveryBar');
  const msg = document.getElementById('freeDelMsg');
  const percentEl = document.getElementById('freeDelPercent');
  const progress = document.getElementById('freeDelProgress');
  if (!bar || !msg || !progress) return;

  const threshold = (typeof BUSINESS_SETTINGS !== 'undefined' && BUSINESS_SETTINGS.freeDeliveryThreshold) ? BUSINESS_SETTINGS.freeDeliveryThreshold : 499.0;
  bar.style.display = 'block';

  if (subtotal >= threshold) {
    msg.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span style="color: #16a34a; font-weight: 700;">Congratulations! You have unlocked FREE Delivery!</span>
    `;
    percentEl.textContent = '100%';
    percentEl.style.color = '#16a34a';
    progress.style.width = '100%';
    progress.style.background = '#16a34a';
  } else {
    const remaining = threshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
    msg.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#df1f26" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/></svg>
      Add <strong>₹${remaining.toFixed(0)}</strong> more to get <strong>FREE Delivery</strong>!
    `;
    percentEl.textContent = `${pct}%`;
    percentEl.style.color = '#df1f26';
    progress.style.width = `${pct}%`;
    progress.style.background = 'linear-gradient(90deg, #df1f26, #16a34a)';
  }
}

async function loadCartUpsells(cart) {
  const section = document.getElementById('upsellSection');
  const grid = document.getElementById('upsellGrid');
  if (!section || !grid) return;

  try {
    const baseUrl = (typeof API_BASE !== 'undefined') ? API_BASE : (
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8080/api'
        : 'https://restaurant-order-management-system-cxv5.onrender.com/api'
    );
    const foodIds = cart.map(i => (i.foodId || i.id)).filter(Boolean).join(',');
    const res = await fetch(`${baseUrl}/recommendations/upsell?foodIds=${foodIds}`);
    if (!res.ok) return;

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    if (data.title) document.getElementById('upsellTitle').textContent = data.title;
    if (data.subtitle) document.getElementById('upsellSubtitle').textContent = data.subtitle;

    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

    grid.innerHTML = data.items.map(item => {
      const imgUrl = item.imageUrl || defaultImg;
      const qty = CartService.getItemQuantity(item.id);

      const actionHtml = qty > 0 ? `
        <div class="card-qty-stepper">
          <button class="stepper-btn stepper-minus" onclick="handleUpsellQty(${item.id}, -1)" title="Decrease" aria-label="Decrease quantity">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <span class="stepper-val">${qty}</span>
          <button class="stepper-btn stepper-plus" onclick="handleUpsellQty(${item.id}, 1)" title="Increase" aria-label="Increase quantity">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      ` : `
        <button onclick="handleUpsellInitialAdd(${item.id}, '${escapeHtml(item.name)}', ${item.price}, '${escapeHtml(imgUrl)}')" class="btn-upsell-add">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: -1px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add
        </button>
      `;

      return `
        <div class="upsell-card">
          <div class="upsell-card-media">
            <img src="${imgUrl}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null; this.src='${defaultImg}';">
          </div>
          <div class="upsell-card-info">
            <h4 class="upsell-card-title">${escapeHtml(item.name)}</h4>
            <div class="upsell-card-meta">
              <span class="upsell-price">₹${Number(item.price).toFixed(0)}</span>
            </div>
            <div class="upsell-card-action">
              ${actionHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Error fetching upsells:', e);
  }
}

function handleUpsellInitialAdd(id, name, price, imageUrl) {
  CartService.addToCart({ id, foodId: id, name, price, imageUrl }, 1);
  renderCartPage();
}

function handleUpsellQty(foodId, delta) {
  const currentQty = CartService.getItemQuantity(foodId);
  const newQty = currentQty + delta;
  CartService.updateQuantity(foodId, newQty);
  renderCartPage();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
