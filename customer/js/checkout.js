/**
 * Customer Checkout Page JavaScript - Upgraded with Coupons, Loyalty, and Saved Addresses
 */

let appliedCoupon = null;
let appliedLoyaltyDiscount = 0;
let selectedLoyaltyPoints = 0;
let userLoyaltyAccount = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadBusinessSettings();
  initCustomerAutoFill();
  renderCheckoutSummary();
  loadActiveCoupons();
  initCouponHandlers();
  initCheckoutForm();
});

function initCustomerAutoFill() {
  const user = getCurrentUser();
  if (!user) return;

  const nameInput = document.getElementById('customerName');
  const phoneInput = document.getElementById('customerPhone');
  const emailInput = document.getElementById('customerEmail');

  if (nameInput && !nameInput.value) nameInput.value = user.name;
  if (phoneInput && !phoneInput.value) phoneInput.value = user.phone;
  if (emailInput && !emailInput.value) emailInput.value = user.email || '';

  // Load saved addresses and loyalty points
  loadUserAddresses(user.id);
  loadCustomerLoyalty(user.phone);
}

async function loadUserAddresses(userId) {
  try {
    const res = await fetch(`${API_BASE}/auth/addresses/${userId}`);
    if (!res.ok) return;
    const addresses = await res.json();
    if (addresses.length === 0) return;

    const select = document.getElementById('savedAddressesSelect');
    const group = document.getElementById('savedAddressesGroup');
    if (!select || !group) return;

    group.style.display = 'block';
    select.innerHTML = '<option value="">-- Choose from your saved addresses --</option>' + 
      addresses.map(a => `<option value="${escapeHtml(a.addressText)}" ${a.isDefault ? 'selected' : ''}>${escapeHtml(a.label)}: ${escapeHtml(a.addressText.substring(0, 40))}...</option>`).join('');

    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    if (defaultAddr) {
      document.getElementById('customerAddress').value = defaultAddr.addressText;
    }

    select.addEventListener('change', () => {
      if (select.value) {
        document.getElementById('customerAddress').value = select.value;
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadCustomerLoyalty(phone) {
  try {
    const res = await fetch(`${API_BASE}/loyalty/${phone}`);
    if (!res.ok) return;
    userLoyaltyAccount = await res.json();

    const card = document.getElementById('loyaltyRedeemCard');
    const availText = document.getElementById('loyaltyAvailText');
    const select = document.getElementById('loyaltyPointsSelect');
    if (!card || !availText || !select) return;

    if (userLoyaltyAccount.pointsBalance >= 100) {
      card.style.display = 'block';
      availText.textContent = `You have ${userLoyaltyAccount.pointsBalance} reward points`;

      let optionsHtml = '<option value="0">Don\'t redeem points</option>';
      if (userLoyaltyAccount.pointsBalance >= 100) {
        optionsHtml += '<option value="100">Redeem 100 pts (₹20 OFF)</option>';
      }
      if (userLoyaltyAccount.pointsBalance >= 250) {
        optionsHtml += '<option value="250">Redeem 250 pts (₹60 OFF)</option>';
      }
      if (userLoyaltyAccount.pointsBalance >= 500) {
        optionsHtml += '<option value="500">Redeem 500 pts (₹150 OFF)</option>';
      }
      select.innerHTML = optionsHtml;

      select.addEventListener('change', () => {
        selectedLoyaltyPoints = parseInt(select.value) || 0;
        if (selectedLoyaltyPoints === 100) appliedLoyaltyDiscount = 20.0;
        else if (selectedLoyaltyPoints === 250) appliedLoyaltyDiscount = 60.0;
        else if (selectedLoyaltyPoints === 500) appliedLoyaltyDiscount = 150.0;
        else appliedLoyaltyDiscount = 0.0;

        renderCheckoutSummary();
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadActiveCoupons() {
  const container = document.getElementById('couponChipsList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/coupons/active`);
    if (!res.ok) return;
    const coupons = await res.json();

    if (coupons.length === 0) {
      document.getElementById('activeCouponsBox').style.display = 'none';
      return;
    }

    container.innerHTML = coupons.map(c => {
      const disc = c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`;
      const minText = c.minimumOrderAmount > 0 ? ` (Min ₹${c.minimumOrderAmount})` : '';
      return `
        <span class="coupon-chip" onclick="applyPromoChip('${c.code}')" title="${c.code} - ${disc}${minText}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          <strong>${c.code}</strong> — ${disc}${minText}
        </span>
      `;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

function applyPromoChip(code) {
  document.getElementById('couponInput').value = code;
  validateAndApplyCoupon(code);
}

function initCouponHandlers() {
  const applyBtn = document.getElementById('btnApplyCoupon');
  const input = document.getElementById('couponInput');

  if (applyBtn && input) {
    applyBtn.addEventListener('click', () => {
      const code = input.value.trim().toUpperCase();
      if (!code) {
        showCouponMsg('Please enter a coupon code', false);
        return;
      }
      validateAndApplyCoupon(code);
    });
  }
}

async function validateAndApplyCoupon(code) {
  const subtotal = CartService.calculateSubtotal();
  const phone = document.getElementById('customerPhone').value.trim();

  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        subtotal: subtotal,
        customerPhone: phone
      })
    });

    const data = await res.json();
    if (data.valid) {
      appliedCoupon = data;
      showCouponMsg(data.message, true);
      renderCheckoutSummary();
    } else {
      appliedCoupon = null;
      showCouponMsg(data.message, false);
      renderCheckoutSummary();
    }
  } catch (e) {
    showCouponMsg('Failed to validate coupon', false);
  }
}

function showCouponMsg(msg, isSuccess) {
  const el = document.getElementById('couponStatusMsg');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  el.style.color = isSuccess ? '#16a34a' : '#dc2626';
}

function renderCheckoutSummary() {
  const itemsContainer = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const deliveryFeeEl = document.getElementById('checkoutDeliveryFee');
  const grandTotalEl = document.getElementById('checkoutGrandTotal');
  const taxEl = document.getElementById('checkoutTax');
  const formSection = document.getElementById('checkoutFormSection');
  const emptySection = document.getElementById('checkoutEmptySection');

  const cart = CartService.getCart();

  if (!cart || cart.length === 0) {
    if (formSection) formSection.style.display = 'none';
    if (emptySection) emptySection.style.display = 'block';
    return;
  }

  if (formSection) formSection.style.display = 'grid';
  if (emptySection) emptySection.style.display = 'none';

  const subtotal = CartService.calculateSubtotal();
  const deliveryFee = CartService.getDeliveryFee();

  // Coupon discount
  let couponDiscount = 0.0;
  if (appliedCoupon && appliedCoupon.discountAmount) {
    couponDiscount = appliedCoupon.discountAmount;
    document.getElementById('couponDiscountRow').style.display = 'flex';
    document.getElementById('appliedCouponLabel').textContent = appliedCoupon.code;
    document.getElementById('checkoutCouponDiscount').textContent = `- ₹${couponDiscount.toFixed(0)}`;
  } else {
    document.getElementById('couponDiscountRow').style.display = 'none';
  }

  // Loyalty discount
  if (appliedLoyaltyDiscount > 0) {
    document.getElementById('loyaltyDiscountRow').style.display = 'flex';
    document.getElementById('checkoutLoyaltyDiscount').textContent = `- ₹${appliedLoyaltyDiscount.toFixed(0)}`;
  } else {
    document.getElementById('loyaltyDiscountRow').style.display = 'none';
  }

  // 5% GST on discounted subtotal
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount - appliedLoyaltyDiscount);
  const taxAmount = (discountedSubtotal * 5.0) / 100.0;

  // Grand Total
  const grandTotal = discountedSubtotal + taxAmount + deliveryFee;

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); font-size: 0.9rem;">
        <div>
          <span style="font-weight: 700;">${escapeHtml(item.name)}</span>
          <span style="color: var(--text-muted); margin-left: 6px;">× ${item.quantity}</span>
        </div>
        <div style="font-weight: 700;">₹${(item.price * item.quantity).toFixed(0)}</div>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
  if (taxEl) taxEl.textContent = `₹${taxAmount.toFixed(0)}`;
  if (deliveryFeeEl) {
    if (deliveryFee === 0 && subtotal > 0) {
      deliveryFeeEl.innerHTML = '<span style="color: #16a34a; font-weight: 700;">FREE (Unlocked)</span>';
    } else {
      deliveryFeeEl.textContent = `₹${deliveryFee.toFixed(0)}`;
    }
  }
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(0)}`;
}

function initCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const emailInput = document.getElementById('customerEmail');
    const addressInput = document.getElementById('customerAddress');
    const submitBtn = document.getElementById('btnPlaceOrder');
    const errorAlert = document.getElementById('checkoutErrorAlert');

    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.textContent = '';
    }

    const customerName = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const customerEmail = emailInput ? emailInput.value.trim() : null;
    const address = addressInput.value.trim();

    if (!customerName || !phone || !address) {
      showCheckoutError('Please fill in all required customer fields.');
      return;
    }

    const cart = CartService.getCart();
    if (cart.length === 0) {
      showCheckoutError('Your cart is empty. Please add food items to checkout.');
      return;
    }

    const user = getCurrentUser();

    // Build order items payload
    const items = cart.map(item => ({
      foodId: item.foodId,
      quantity: item.quantity
    }));

    const orderPayload = {
      userId: user ? user.id : null,
      customerName,
      phone,
      customerEmail,
      address,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      loyaltyPointsToRedeem: selectedLoyaltyPoints,
      items
    };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Placing Order...';

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      // Order placed successfully!
      CartService.clearCart();

      // Redirect to Order Success page
      window.location.href = `order-success.html?orderId=${data.id}`;
    } catch (error) {
      console.error('Order creation failed:', error);
      showCheckoutError(error.message || 'Failed to place your order. Please check item availability.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order Now →';
    }
  });
}

function showCheckoutError(msg) {
  const errorAlert = document.getElementById('checkoutErrorAlert');
  if (errorAlert) {
    errorAlert.textContent = msg;
    errorAlert.style.display = 'block';
  } else {
    alert(msg);
  }
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
