/**
 * Harvest Kitchen - Admin Combos Controller
 */

// Auto-detect environment: use Render backend in production, localhost in dev
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';
let availableFoods = [];
let combosList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCombos();
  loadFoodsList();
  setupComboForm();
});

async function loadFoodsList() {
  try {
    const res = await fetch(`${API_BASE}/foods`);
    if (res.ok) availableFoods = await res.json();
  } catch (e) {
    console.error('Failed to load foods:', e);
  }
}

async function loadCombos() {
  const cardsGrid = document.getElementById('combosCardsGrid');
  const tbody = document.getElementById('combosTableBody');

  try {
    const res = await fetch(`${API_BASE}/combos`);
    if (!res.ok) throw new Error('Failed to load combo deals');
    combosList = await res.json();

    updateComboMetrics(combosList);
    renderComboCards(combosList, cardsGrid);
    renderComboTable(combosList, tbody);
  } catch (err) {
    console.error('Error loading combos:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color: #dc2626; text-align: center;">Error: ${err.message}</td></tr>`;
  }
}

function updateComboMetrics(combos) {
  const totalEl = document.getElementById('statTotalCombos');
  const activeEl = document.getElementById('statActiveCombos');
  const maxSavEl = document.getElementById('statMaxSavings');

  if (totalEl) totalEl.textContent = combos.length;
  const activeCount = combos.filter(c => c.active).length;
  if (activeEl) activeEl.textContent = activeCount;

  let maxSav = 0;
  combos.forEach(c => {
    if (c.savings && c.savings > maxSav) maxSav = c.savings;
  });
  if (maxSavEl) maxSavEl.textContent = maxSav > 0 ? `Save ₹${Math.round(maxSav)}` : 'Save ₹118';
}

function renderComboCards(combos, container) {
  if (!container) return;

  if (combos.length === 0) {
    container.innerHTML = '<div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: #64748b; background: #fff; border-radius: 12px;">No combo deals found. Click "+ Create New Combo" to add one.</div>';
    return;
  }

  container.innerHTML = combos.map(c => {
    const defaultImg = 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80';
    const imgUrl = c.imageUrl || defaultImg;
    const items = c.items || [];

    return `
      <div class="combo-admin-card">
        <div>
          <div class="combo-card-media">
            <img src="${imgUrl}" alt="${escapeHtml(c.name)}" onerror="this.src='${defaultImg}'">
            ${c.savings > 0 ? `<div class="combo-savings-pill">Save ₹${Math.round(c.savings)}</div>` : ''}
          </div>

          <div class="combo-card-body">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: #181615; margin: 0;">${escapeHtml(c.name)}</h3>
              <span class="badge" style="background: ${c.active ? '#dcfce7' : '#fee2e2'}; color: ${c.active ? '#15803d' : '#dc2626'}; font-weight: 800; font-size: 0.74rem;">
                ${c.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <p style="font-size: 0.83rem; color: #64748b; margin-bottom: 10px; line-height: 1.4;">
              ${escapeHtml(c.description || 'Special chef bundled meal')}
            </p>

            <div style="font-size: 0.78rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Included Items:</div>
            <div class="combo-dishes-chips">
              ${items.length > 0 ? items.map(i => `<span class="dish-chip">${i.quantity}× ${escapeHtml(i.foodName)}</span>`).join('') : '<span class="dish-chip">Custom dishes</span>'}
            </div>

            <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 12px;">
              <span style="font-size: 1.25rem; font-weight: 800; color: #df1f26;">₹${Math.round(c.comboPrice)}</span>
              ${c.originalPrice ? `<span style="text-decoration: line-through; color: #94a3b8; font-size: 0.95rem;">₹${Math.round(c.originalPrice)}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="combo-card-footer">
          <button onclick="toggleComboActive(${c.id})" class="btn btn-secondary btn-sm" style="padding: 5px 12px; font-size: 0.82rem;">
            ${c.active ? 'Deactivate' : 'Activate'}
          </button>
          <button onclick="deleteCombo(${c.id})" class="btn btn-danger btn-sm" style="padding: 5px 10px; font-size: 0.82rem;">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderComboTable(combos, tbody) {
  if (!tbody) return;

  if (combos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No combos created yet.</td></tr>';
    return;
  }

  tbody.innerHTML = combos.map(c => {
    const itemsStr = (c.items || []).map(i => `${i.quantity}× ${escapeHtml(i.foodName)}`).join(', ');
    return `
      <tr>
        <td>
          <strong style="color: #181615; font-size: 0.95rem;">${escapeHtml(c.name)}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(c.description || '')}</div>
        </td>
        <td><span style="font-size: 0.84rem; color: #475569;">${itemsStr || 'None'}</span></td>
        <td><span style="text-decoration: line-through; color: #94a3b8;">₹${c.originalPrice || 0}</span></td>
        <td><strong style="color: var(--brand-red); font-size: 1.05rem;">₹${c.comboPrice}</strong></td>
        <td><span class="badge" style="background: #dcfce7; color: #15803d; font-weight: 800;">Save ₹${Math.round(c.savings || 0)}</span></td>
        <td>
          <span class="badge" style="background: ${c.active ? '#dcfce7' : '#fee2e2'}; color: ${c.active ? '#15803d' : '#dc2626'}; font-weight: 700;">
            ${c.active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </td>
        <td>
          <button onclick="toggleComboActive(${c.id})" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.8rem;">
            ${c.active ? 'Deactivate' : 'Activate'}
          </button>
          <button onclick="deleteCombo(${c.id})" class="btn btn-danger btn-sm" style="padding: 4px 10px; font-size: 0.8rem; margin-left: 6px;">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openComboModal() {
  document.getElementById('comboForm').reset();
  const selector = document.getElementById('comboItemsSelector');
  if (selector) {
    selector.innerHTML = availableFoods.map(food => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
        <label style="font-size: 0.85rem; color: #181615; display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" class="combo-food-check" data-food-id="${food.id}" data-food-price="${food.price}" onchange="recalcComboOriginalPrice()">
          <span>${escapeHtml(food.name)} <strong style="color: #64748b;">(₹${food.price})</strong></span>
        </label>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 0.75rem; color: #94a3b8;">Qty:</span>
          <input type="number" class="combo-food-qty" data-food-id="${food.id}" value="1" min="1" max="5" onchange="recalcComboOriginalPrice()" style="width: 50px; padding: 3px 6px; border: 1px solid var(--border); border-radius: 4px;">
        </div>
      </div>
    `).join('');
  }
  const modal = document.getElementById('comboModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function recalcComboOriginalPrice() {
  let totalOrig = 0;
  document.querySelectorAll('.combo-food-check:checked').forEach(chk => {
    const price = parseFloat(chk.getAttribute('data-food-price')) || 0;
    const foodId = chk.getAttribute('data-food-id');
    const qtyInput = document.querySelector(`.combo-food-qty[data-food-id="${foodId}"]`);
    const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    totalOrig += price * qty;
  });

  const origInput = document.getElementById('comboOrigPrice');
  if (origInput && totalOrig > 0) {
    origInput.value = Math.round(totalOrig);
  }
}

function closeComboModal() {
  const modal = document.getElementById('comboModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function setupComboForm() {
  const form = document.getElementById('comboForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('comboName').value.trim();
    const description = document.getElementById('comboDesc').value.trim();
    const originalPrice = parseFloat(document.getElementById('comboOrigPrice').value);
    const comboPrice = parseFloat(document.getElementById('comboPrice').value);
    const imageUrl = document.getElementById('comboImageUrl').value.trim();

    const items = [];
    document.querySelectorAll('.combo-food-check:checked').forEach(chk => {
      const foodId = parseInt(chk.getAttribute('data-food-id'));
      const qtyInput = document.querySelector(`.combo-food-qty[data-food-id="${foodId}"]`);
      const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
      items.push({ foodId, quantity });
    });

    if (items.length === 0) {
      alert('Please select at least 1 dish to include in this combo bundle.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/combos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          originalPrice,
          comboPrice,
          imageUrl,
          active: true,
          items
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save combo');
      }

      closeComboModal();
      loadCombos();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

async function toggleComboActive(comboId) {
  try {
    const res = await fetch(`${API_BASE}/combos/${comboId}/toggle`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to toggle combo status');
    loadCombos();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteCombo(comboId) {
  if (!confirm('Are you sure you want to delete this combo deal?')) return;
  try {
    const res = await fetch(`${API_BASE}/combos/${comboId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete combo');
    loadCombos();
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
