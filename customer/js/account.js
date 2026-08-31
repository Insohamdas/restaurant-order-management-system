/**
 * Harvest Kitchen - Account & Google Auth Script
 */

let currentUser = null;

// Preset Google Accounts for quick 1-click testing & demo
const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    name: 'Soham Das',
    email: 'soham.das@gmail.com',
    pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    phone: '9832006994'
  },
  {
    name: 'Priyanshu Sen',
    email: 'priyanshu.sen@gmail.com',
    pictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    phone: '9830112233'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  currentUser = getCurrentUser();
  if (currentUser) {
    showUserSection();
  } else {
    showGuestSection();
  }
  setupAddressForm();
  setupReviewForm();
  renderGoogleAccountsList();
});

function showGuestSection() {
  document.getElementById('guestSection').style.display = 'block';
  document.getElementById('userSection').style.display = 'none';
}

function showUserSection() {
  document.getElementById('guestSection').style.display = 'none';
  document.getElementById('userSection').style.display = 'grid';

  document.getElementById('userNameDisplay').textContent = currentUser.name;
  document.getElementById('userPhoneDisplay').textContent = currentUser.email || ('+91 ' + currentUser.phone);
  
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) {
    avatarEl.textContent = currentUser.name.charAt(0).toUpperCase();
  }

  loadOrders();
  loadLoyalty();
  loadAddresses();
  loadFavorites();
}

/**
 * Google Authentication Flow
 */
function startGoogleSignIn() {
  renderGoogleAccountsList();
  const modal = document.getElementById('googleChooserModal');
  if (modal) modal.style.display = 'flex';
}

function closeGoogleChooser() {
  const modal = document.getElementById('googleChooserModal');
  if (modal) modal.style.display = 'none';
}

function renderGoogleAccountsList() {
  const listContainer = document.getElementById('googleAccountsList');
  if (!listContainer) return;

  listContainer.innerHTML = DEFAULT_GOOGLE_ACCOUNTS.map((acc, index) => `
    <div class="google-account-row" onclick="authenticateGoogleUser('${escapeJs(acc.email)}', '${escapeJs(acc.name)}', '${escapeJs(acc.pictureUrl || '')}', '${escapeJs(acc.phone || '')}')">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: #4285F4; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; overflow: hidden;">
        ${acc.pictureUrl ? `<img src="${acc.pictureUrl}" alt="${escapeHtml(acc.name)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.remove()">` : acc.name.charAt(0)}
      </div>
      <div style="flex: 1; min-width: 0;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #181615; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(acc.name)}</h4>
        <p style="font-size: 0.8rem; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(acc.email)}</p>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  `).join('');
}

function toggleCustomGoogleEntry() {
  const customDiv = document.getElementById('customGoogleEntry');
  const toggleText = document.getElementById('toggleCustomGoogleText');
  if (!customDiv) return;

  if (customDiv.style.display === 'none' || !customDiv.style.display) {
    customDiv.style.display = 'block';
    if (toggleText) toggleText.textContent = 'Hide custom account';
    document.getElementById('customGoogleName').focus();
  } else {
    customDiv.style.display = 'none';
    if (toggleText) toggleText.textContent = 'Use another Google account';
  }
}

function submitCustomGoogleAccount() {
  const name = document.getElementById('customGoogleName').value.trim();
  const email = document.getElementById('customGoogleEmail').value.trim();

  if (!name) {
    showToast('Please enter your full name', 'error');
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid Google email', 'error');
    return;
  }

  authenticateGoogleUser(email, name, '', '');
}

async function authenticateGoogleUser(email, name, pictureUrl, phone) {
  closeGoogleChooser();
  showToast('Signing in with Google...', 'success');

  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, pictureUrl, phone })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google authentication failed');

    // Fresh login reset cart
    localStorage.removeItem('restaurant_cart');
    updateCartBadge();

    setCurrentUser({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      token: data.token
    });

    currentUser = getCurrentUser();
    showUserSection();
    showToast(`Welcome, ${data.name}! Signed in via Google`);
  } catch (err) {
    console.error('Google Auth Error:', err);
    showToast('Sign in failed: ' + err.message, 'error');
  }
}

function escapeJs(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function switchAccountTab(tabName) {
  document.querySelectorAll('.tab-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.account-tabs a').forEach(el => el.classList.remove('active'));

  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) activeTab.style.display = 'block';

  // highlight tab button
  const links = document.querySelectorAll('.account-tabs a');
  links.forEach(link => {
    if (link.textContent.toLowerCase().includes(tabName)) {
      link.classList.add('active');
    }
  });

  if (tabName === 'orders') loadOrders();
  if (tabName === 'rewards') loadLoyalty();
  if (tabName === 'favorites') loadFavorites();
  if (tabName === 'addresses') loadAddresses();
}

// 1. Orders
async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  if (!container || !currentUser) return;

  try {
    const res = await fetch(`${API_BASE}/orders/phone/${currentUser.phone}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="account-card" style="text-align: center; padding: 40px 20px;">
          <h3 style="color: #181615; margin-bottom: 8px;">No Orders Yet</h3>
          <p style="color: #64748b; margin-bottom: 16px;">Craving something delicious? Explore our fresh menu today!</p>
          <a href="menu.html" class="btn btn-primary">Browse Full Menu</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const itemsHtml = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--border-light); font-size: 0.88rem;">
          <div>
            <span style="font-weight: 700; color: #181615;">${item.quantity}x</span> ${item.foodName}
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-weight: 600; color: #475569;">${formatCurrency(item.subtotal)}</span>
            ${order.status === 'DELIVERED' ? `
              <button onclick="openReviewModal(${item.foodId}, '${escapeHtml(item.foodName)}', ${order.id})" 
                      style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
                Rate Dish
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');

      const statusBadge = getStatusBadge(order.status);

      return `
        <div class="account-card" style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <h3 style="font-size: 1.1rem; font-weight: 800; color: #181615;">Order #${order.id}</h3>
                ${statusBadge}
              </div>
              <p style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">Placed on ${dateStr}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.25rem; font-weight: 800; color: #df1f26;">${formatCurrency(order.totalAmount)}</div>
              ${order.discountAmount > 0 ? `<div style="font-size: 0.78rem; color: #16a34a; font-weight: 600;">Saved ₹${Math.round(order.discountAmount)} (${order.couponCode || 'Discount'})</div>` : ''}
            </div>
          </div>

          <div style="background: #fafaf9; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
            ${itemsHtml}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <span style="font-size: 0.85rem; color: #64748b; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              Delivery to: ${escapeHtml(order.address)}
            </span>
            <div style="display: flex; gap: 10px;">
              <a href="track-order.html?id=${order.id}" class="btn btn-secondary" style="font-size: 0.85rem; padding: 6px 14px;">
                Track Status
              </a>
              <button onclick="reorderPastOrder(${order.id})" class="btn btn-primary" style="font-size: 0.85rem; padding: 6px 14px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                Reorder
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color: #dc2626;">Error loading orders: ${e.message}</p>`;
  }
}

function getStatusBadge(status) {
  const styles = {
    PLACED: 'background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;',
    CONFIRMED: 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;',
    PREPARING: 'background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa;',
    READY: 'background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff;',
    OUT_FOR_DELIVERY: 'background: #fef9c3; color: #a16207; border: 1px solid #fef08a;',
    DELIVERED: 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;',
    CANCELLED: 'background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;'
  };
  const label = status ? status.replace(/_/g, ' ') : 'PLACED';
  return `<span style="padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; ${styles[status] || styles.PLACED}">${label}</span>`;
}

// 2. Loyalty
async function loadLoyalty() {
  if (!currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/loyalty/${currentUser.phone}`);
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById('loyaltyPtsValue').textContent = data.pointsBalance || 0;

    const txContainer = document.getElementById('loyaltyTransactionsContainer');
    if (!data.transactions || data.transactions.length === 0) {
      txContainer.innerHTML = '<p style="color: #64748b;">No points activity recorded yet. Place orders to earn points!</p>';
      return;
    }

    txContainer.innerHTML = data.transactions.map(tx => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const isEarn = tx.transactionType === 'EARNED' || tx.transactionType === 'REVERSED';
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
          <div>
            <div style="font-weight: 700; color: #181615; font-size: 0.9rem;">${escapeHtml(tx.description || tx.transactionType)}</div>
            <div style="font-size: 0.78rem; color: #64748b;">${dateStr}</div>
          </div>
          <div style="font-weight: 800; font-size: 1rem; color: ${isEarn ? '#16a34a' : '#dc2626'};">
            ${isEarn ? '+' : '-'}${tx.points} pts
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

// 3. Favorites
async function loadFavorites() {
  const container = document.getElementById('favoritesContainer');
  if (!container || !currentUser) return;

  try {
    const res = await fetch(`${API_BASE}/favorites/${currentUser.phone}`);
    if (!res.ok) throw new Error('Failed to load favorites');
    const items = await res.json();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="account-card" style="text-align: center; padding: 30px; grid-column: 1 / -1;">
          <h3 style="color: #181615; margin-bottom: 6px;">No Saved Favorites</h3>
          <p style="color: #64748b; margin-bottom: 14px;">Click the heart icon on any dish in our menu to save it here for fast ordering!</p>
          <a href="menu.html" class="btn btn-primary">Browse Menu</a>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="food-card" style="position: relative;">
        <img src="${item.imageUrl}" alt="${escapeHtml(item.name)}" class="food-img">
        <div class="food-info">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3 class="food-title">${escapeHtml(item.name)}</h3>
            <div class="rating-pill">
              <svg width="12" height="12" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${item.avgRating || 4.8}
            </div>
          </div>
          <p class="food-desc">${escapeHtml(item.description)}</p>
          <div class="food-footer">
            <span class="food-price">${formatCurrency(item.price)}</span>
            <button onclick="addToCart({id: ${item.id}, name: '${escapeHtml(item.name)}', price: ${item.price}, imageUrl: '${item.imageUrl}'})" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.85rem;">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p style="color: #dc2626;">Error: ${e.message}</p>`;
  }
}

// 4. Addresses
async function loadAddresses() {
  const container = document.getElementById('addressesContainer');
  if (!container || !currentUser) return;

  try {
    const res = await fetch(`${API_BASE}/auth/addresses/${currentUser.id}`);
    if (!res.ok) throw new Error('Failed to load addresses');
    const addresses = await res.json();

    if (addresses.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; color: #64748b; padding: 20px; text-align: center; border: 1px dashed var(--border); border-radius: 10px;">
          No saved addresses. Click "+ Add New Address" above to save your delivery location.
        </div>
      `;
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div style="border: 1px solid ${addr.isDefault ? '#df1f26' : 'var(--border)'}; background: #fff; border-radius: 10px; padding: 18px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 800; font-size: 0.95rem; color: #181615;">${escapeHtml(addr.label)}</span>
          ${addr.isDefault ? '<span style="background: #fef2f2; color: #df1f26; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 4px;">DEFAULT</span>' : ''}
        </div>
        <p style="font-size: 0.85rem; color: #475569; line-height: 1.4; margin-bottom: 12px;">${escapeHtml(addr.addressText)}</p>
        <div style="display: flex; justify-content: flex-end;">
          <button onclick="deleteAddress(${addr.id})" style="background: transparent; border: none; color: #dc2626; font-size: 0.8rem; font-weight: 700; cursor: pointer;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p style="color: #dc2626;">Error: ${e.message}</p>`;
  }
}

function openAddAddressModal() {
  document.getElementById('addressModal').classList.add('open');
}
function closeAddAddressModal() {
  document.getElementById('addressModal').classList.remove('open');
}

function setupAddressForm() {
  const form = document.getElementById('addAddressForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const label = document.getElementById('addrLabel').value;
      const addressText = document.getElementById('addrText').value.trim();
      const isDefault = document.getElementById('addrDefault').checked;

      try {
        const res = await fetch(`${API_BASE}/auth/addresses/${currentUser.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label, addressText, isDefault })
        });

        if (!res.ok) throw new Error('Failed to save address');
        closeAddAddressModal();
        form.reset();
        loadAddresses();
        showToast('Address saved successfully!');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

async function deleteAddress(addressId) {
  if (!confirm('Are you sure you want to delete this address?')) return;
  try {
    const res = await fetch(`${API_BASE}/auth/addresses/${currentUser.id}/${addressId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete address');
    loadAddresses();
    showToast('Address deleted');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 5. Dish Review Modal
function openReviewModal(foodId, foodName, orderId) {
  document.getElementById('revFoodId').value = foodId;
  document.getElementById('revOrderId').value = orderId;
  document.getElementById('reviewDishName').textContent = foodName;
  document.getElementById('reviewModal').classList.add('open');
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('open');
}

function setupReviewForm() {
  const form = document.getElementById('submitReviewForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const foodId = Long = parseInt(document.getElementById('revFoodId').value);
      const orderId = parseInt(document.getElementById('revOrderId').value);
      const rating = parseInt(document.getElementById('revRating').value);
      const comment = document.getElementById('revComment').value.trim();

      try {
        const res = await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodId,
            orderId,
            customerName: currentUser.name,
            customerPhone: currentUser.phone,
            rating,
            comment
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit review');

        closeReviewModal();
        form.reset();
        showToast('Thank you! Your review has been submitted.');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
