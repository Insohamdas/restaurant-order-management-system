/**
 * Harvest Kitchen - Admin Coupons Controller
 */

const API_BASE = 'http://localhost:8080/api';
let couponsList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCoupons();
  setupCouponForm();
});

async function loadCoupons() {
  const cardsGrid = document.getElementById('couponCardsGrid');
  const tbody = document.getElementById('couponsTableBody');

  try {
    const res = await fetch(`${API_BASE}/coupons`);
    if (!res.ok) throw new Error('Could not load coupons from server');
    couponsList = await res.json();

    updateCouponMetrics(couponsList);
    renderCouponCards(couponsList, cardsGrid);
    renderCouponTable(couponsList, tbody);
  } catch (err) {
    console.error('Failed to load coupons:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="color: #dc2626; text-align: center; padding: 20px;">Error: ${err.message}</td></tr>`;
    showToast('Failed to load coupons: ' + err.message, true);
  }
}

function updateCouponMetrics(coupons) {
  const totalEl = document.getElementById('statTotalCoupons');
  const activeEl = document.getElementById('statActiveCoupons');
  const maxEl = document.getElementById('statMaxDiscount');
  const redeemedEl = document.getElementById('statTotalRedeemed');

  if (totalEl) totalEl.textContent = coupons.length;

  const activeCount = coupons.filter(c => c.active).length;
  if (activeEl) activeEl.textContent = activeCount;

  let maxDisc = '50% OFF';
  let maxVal = 0;
  coupons.forEach(c => {
    if (c.discountType === 'PERCENTAGE' && c.discountValue > maxVal) {
      maxVal = c.discountValue;
      maxDisc = `${c.discountValue}% OFF`;
    }
  });
  if (maxEl) maxEl.textContent = maxDisc;

  let totalRedeemed = 0;
  coupons.forEach(c => {
    totalRedeemed += (c.usedCount || 0);
  });
  if (redeemedEl) redeemedEl.textContent = totalRedeemed;
}

function renderCouponCards(coupons, container) {
  if (!container) return;

  if (coupons.length === 0) {
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: #64748b; background: #fff; border-radius: 12px; border: 1px dashed var(--border);">No coupons created yet. Click "+ Create New Coupon" to start.</div>';
    return;
  }

  container.innerHTML = coupons.map(c => {
    const isPercentage = c.discountType === 'PERCENTAGE';
    const discountLabel = isPercentage ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`;
    const minOrderLabel = c.minimumOrderAmount ? `₹${Math.round(c.minimumOrderAmount)}` : 'No minimum';
    const maxCapLabel = c.maximumDiscount ? `₹${Math.round(c.maximumDiscount)}` : 'No cap';
    const expiryLabel = c.expiryDate || 'No expiry';
    const used = c.usedCount || 0;
    const limit = c.usageLimit || 1000;
    const pct = Math.min(100, Math.round((used / limit) * 100));

    return `
      <div class="coupon-card ${c.active ? '' : 'inactive-card'}">
        <div>
          <div class="coupon-card-header">
            <span class="coupon-code-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
              ${escapeHtml(c.code)}
            </span>
            ${c.active 
              ? '<span class="badge badge-available" style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #16a34a;"></span> ACTIVE</span>' 
              : '<span class="badge badge-unavailable" style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #dc2626;"></span> INACTIVE</span>'
            }
          </div>

          <div class="coupon-discount-tag">${discountLabel}</div>
          <p style="font-size: 0.84rem; color: #64748b; margin-bottom: 8px;">
            ${c.firstOrderOnly ? 'Exclusive for first-time orders.' : 'Valid for all customer orders.'}
          </p>

          <ul class="coupon-rule-list">
            <li>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Min Order: <strong>${minOrderLabel}</strong></span>
            </li>
            <li>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <span>Max Savings Cap: <strong>${maxCapLabel}</strong></span>
            </li>
            <li>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Valid till: <strong>${expiryLabel}</strong></span>
            </li>
          </ul>

          <div style="font-size: 0.78rem; color: #64748b; display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>Redeemed: <strong>${used} times</strong></span>
            <span>Limit: ${limit}</span>
          </div>
          <div class="coupon-progress-bar">
            <div class="coupon-progress-fill" style="width: ${pct}%;"></div>
          </div>
        </div>

        <div class="coupon-card-footer">
          <button type="button" onclick="editCoupon(${c.id})" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.82rem;">
            Edit
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" onclick="toggleCouponActive(${c.id})" class="btn ${c.active ? 'btn-secondary' : 'btn-primary'} btn-sm" style="padding: 5px 12px; font-size: 0.82rem;">
              ${c.active ? 'Deactivate' : 'Activate'}
            </button>
            <button type="button" onclick="deleteCoupon(${c.id})" class="btn btn-danger btn-sm" style="padding: 5px 10px; font-size: 0.82rem;">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCouponTable(coupons, tbody) {
  if (!tbody) return;

  if (coupons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">No coupons registered.</td></tr>';
    return;
  }

  tbody.innerHTML = coupons.map(c => {
    const isPercentage = c.discountType === 'PERCENTAGE';
    const ruleLabel = isPercentage ? `${c.discountValue}% OFF` : `₹${Math.round(c.discountValue)} FLAT`;
    const minOrder = c.minimumOrderAmount ? `₹${Math.round(c.minimumOrderAmount)}` : '₹0';
    const maxCap = c.maximumDiscount ? `₹${Math.round(c.maximumDiscount)}` : 'Unlimited';
    const used = c.usedCount || 0;
    const limit = c.usageLimit || '∞';

    return `
      <tr>
        <td>
          <span class="coupon-code-badge" style="font-size: 0.88rem; padding: 3px 8px;">
            ${escapeHtml(c.code)}
          </span>
        </td>
        <td>
          <strong style="color: #181615; font-size: 0.95rem;">${ruleLabel}</strong>
        </td>
        <td>
          <span style="font-weight: 600; color: #475569;">${minOrder}</span>
        </td>
        <td>
          <span style="font-weight: 600; color: #475569;">${maxCap}</span>
        </td>
        <td>
          <span class="badge" style="background: #f1f5f9; color: #334155; font-weight: 700;">${used} / ${limit}</span>
        </td>
        <td>
          ${c.firstOrderOnly 
            ? '<span class="badge" style="background: #eff6ff; color: #2563eb; font-weight: 700;">1st Order Only</span>' 
            : '<span class="badge" style="background: #f8fafc; color: #64748b; font-weight: 600;">All Users</span>'
          }
        </td>
        <td>
          ${c.active 
            ? '<span class="badge badge-available" style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #16a34a;"></span> ACTIVE</span>' 
            : '<span class="badge badge-unavailable" style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #dc2626;"></span> INACTIVE</span>'
          }
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button type="button" onclick="editCoupon(${c.id})" class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.8rem;">
              Edit
            </button>
            <button type="button" onclick="toggleCouponActive(${c.id})" class="btn ${c.active ? 'btn-secondary' : 'btn-primary'} btn-sm" style="padding: 4px 10px; font-size: 0.8rem;">
              ${c.active ? 'Disable' : 'Enable'}
            </button>
            <button type="button" onclick="deleteCoupon(${c.id})" class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 0.8rem;">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openCouponModal() {
  const form = document.getElementById('couponForm');
  if (form) form.reset();

  document.getElementById('couponId').value = '';
  document.getElementById('couponModalTitle').textContent = 'Create Promo Coupon';
  document.getElementById('couponActive').checked = true;
  document.getElementById('couponMinOrder').value = '199';

  const modal = document.getElementById('couponModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeCouponModal() {
  const modal = document.getElementById('couponModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function editCoupon(id) {
  const coupon = couponsList.find(c => c.id == id);
  if (!coupon) {
    showToast('Could not find coupon #' + id, true);
    return;
  }

  document.getElementById('couponId').value = coupon.id;
  document.getElementById('couponCode').value = coupon.code || '';
  document.getElementById('couponDiscountType').value = coupon.discountType || 'PERCENTAGE';
  document.getElementById('couponDiscountValue').value = coupon.discountValue || '';
  document.getElementById('couponMinOrder').value = coupon.minimumOrderAmount || 0;
  document.getElementById('couponMaxDiscount').value = coupon.maximumDiscount || '';
  document.getElementById('couponUsageLimit').value = coupon.usageLimit || '';
  document.getElementById('couponExpiry').value = coupon.expiryDate || '';
  document.getElementById('couponFirstOrder').checked = Boolean(coupon.firstOrderOnly);
  document.getElementById('couponActive').checked = Boolean(coupon.active);

  document.getElementById('couponModalTitle').textContent = `Edit Promo Coupon (${coupon.code})`;
  const modal = document.getElementById('couponModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function setupCouponForm() {
  const form = document.getElementById('couponForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('couponId').value;
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const discountType = document.getElementById('couponDiscountType').value;
    const discountValue = parseFloat(document.getElementById('couponDiscountValue').value);
    const minimumOrderAmount = parseFloat(document.getElementById('couponMinOrder').value) || 0;
    const maximumDiscount = parseFloat(document.getElementById('couponMaxDiscount').value) || null;
    const usageLimit = parseInt(document.getElementById('couponUsageLimit').value) || null;
    const expiryDate = document.getElementById('couponExpiry').value || null;
    const firstOrderOnly = document.getElementById('couponFirstOrder').checked;
    const active = document.getElementById('couponActive').checked;

    if (!code) {
      showToast('Please enter a coupon code', true);
      return;
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      showToast('Please enter a valid discount value', true);
      return;
    }

    const payload = {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      expiryDate,
      firstOrderOnly,
      active
    };

    try {
      let url = `${API_BASE}/coupons`;
      let method = 'POST';

      if (id && String(id).trim() !== '') {
        url = `${API_BASE}/coupons/${id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save promo coupon');
      }

      closeCouponModal();
      showToast(id ? 'Promo coupon updated successfully' : 'New promo coupon created & published');
      loadCoupons();
    } catch (err) {
      showToast('Error: ' + err.message, true);
    }
  });
}

async function toggleCouponActive(couponId) {
  try {
    const res = await fetch(`${API_BASE}/coupons/${couponId}/toggle`, { method: 'PUT' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to toggle coupon status');
    }
    const updated = await res.json();
    showToast(`Promo coupon ${updated.code} is now ${updated.active ? 'ACTIVE' : 'DEACTIVATED'}`);
    loadCoupons();
  } catch (err) {
    showToast('Error: ' + err.message, true);
  }
}

async function deleteCoupon(couponId) {
  if (!confirm('Are you sure you want to delete this promo coupon?')) return;
  try {
    const res = await fetch(`${API_BASE}/coupons/${couponId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete coupon');
    showToast('Promo coupon deleted successfully');
    loadCoupons();
  } catch (err) {
    showToast('Error: ' + err.message, true);
  }
}

function showToast(msg, isError = false) {
  let toast = document.getElementById('couponToast');
  let msgEl = document.getElementById('couponToastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'couponToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = '#181615';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '999999';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.9rem';
    document.body.appendChild(toast);
    msgEl = toast;
  }

  msgEl.textContent = msg;
  toast.style.background = isError ? '#dc2626' : '#181615';
  toast.style.display = 'flex';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Window exports
window.openCouponModal = openCouponModal;
window.closeCouponModal = closeCouponModal;
window.editCoupon = editCoupon;
window.toggleCouponActive = toggleCouponActive;
window.deleteCoupon = deleteCoupon;
window.showToast = showToast;
