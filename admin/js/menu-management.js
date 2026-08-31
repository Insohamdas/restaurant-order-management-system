/**
 * Admin Menu Management Controller - Upgraded with Stock Control & Low Stock Flags
 */

let allFoodItems = [];
let editingFoodId = null;

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  AuthService.requireAuth();

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }

  initModalListeners();
  initFormListeners();
  loadMenuManagement();
});

async function loadMenuManagement() {
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
        Loading menu catalog...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(`${API_BASE}/foods`);
    if (!res.ok) throw new Error('Failed to load foods');
    allFoodItems = await res.json();
    renderMenuTable(allFoodItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--danger); padding: 30px;">
          Failed to load food items from server.
        </td>
      </tr>
    `;
  }
}

function renderMenuTable(foods) {
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;

  if (!foods || foods.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No food items found. Click "+ Add New Food Item" to create one.
        </td>
      </tr>
    `;
    return;
  }

  const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

  tbody.innerHTML = foods.map(item => {
    const isLowStock = item.isLowStock;
    return `
      <tr>
        <td>
          <img class="table-img" src="${item.imageUrl || placeholderImg}" alt="${escapeHtml(item.name)}" onerror="this.src='${placeholderImg}'">
        </td>
        <td>
          <div style="font-weight: 700; color: #181615;">${escapeHtml(item.name)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(item.description || '-')}
          </div>
        </td>
        <td><span class="badge" style="background-color: var(--primary-light); color: var(--primary); font-weight: 700;">${escapeHtml(item.category)}</span></td>
        <td style="font-weight: 800; color: #181615;">₹${Number(item.price).toFixed(0)}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 1rem; color: ${isLowStock ? '#dc2626' : '#181615'};">${item.stockQuantity != null ? item.stockQuantity : 50} units</strong>
            ${isLowStock ? '<span style="background: #fee2e2; color: #dc2626; font-size: 0.72rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">LOW</span>' : ''}
          </div>
        </td>
        <td>
          <span class="badge ${item.available ? 'badge-available' : 'badge-unavailable'}">
            ${item.available ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td style="white-space: nowrap;">
          <button class="btn btn-secondary btn-sm btn-edit-food" data-id="${item.id}" style="display: inline-flex; align-items: center; gap: 4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn btn-danger btn-sm btn-delete-food" data-id="${item.id}" data-name="${escapeHtml(item.name)}" style="display: inline-flex; align-items: center; gap: 4px; margin-left: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach Action Listeners
  tbody.querySelectorAll('.btn-edit-food').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openEditModal(id);
    });
  });

  tbody.querySelectorAll('.btn-delete-food').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const name = btn.getAttribute('data-name');
      confirmDeleteFood(id, name);
    });
  });
}

function initModalListeners() {
  const addBtn = document.getElementById('btnOpenAddModal');
  const modalOverlay = document.getElementById('foodModal');
  const closeBtns = document.querySelectorAll('.modal-close, .btn-modal-cancel');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openAddModal();
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  });
}

function openAddModal() {
  editingFoodId = null;
  document.getElementById('modalTitle').textContent = 'Add New Food Item';
  document.getElementById('foodForm').reset();
  document.getElementById('foodAvailable').checked = true;
  document.getElementById('foodStock').value = 50;
  document.getElementById('foodThreshold').value = 5;
  document.getElementById('foodTrackInventory').checked = true;
  document.getElementById('modalErrorAlert').style.display = 'none';
  document.getElementById('foodModal').classList.add('active');
}

function openEditModal(foodId) {
  const food = allFoodItems.find(f => f.id === foodId);
  if (!food) return;

  editingFoodId = foodId;
  document.getElementById('modalTitle').textContent = 'Edit Food Item';
  document.getElementById('foodName').value = food.name || '';
  document.getElementById('foodCategory').value = food.category || 'Pizza';
  document.getElementById('foodPrice').value = food.price || '';
  document.getElementById('foodStock').value = food.stockQuantity != null ? food.stockQuantity : 50;
  document.getElementById('foodThreshold').value = food.lowStockThreshold != null ? food.lowStockThreshold : 5;
  document.getElementById('foodImageUrl').value = food.imageUrl || '';
  document.getElementById('foodDescription').value = food.description || '';
  document.getElementById('foodAvailable').checked = food.available !== false;
  document.getElementById('foodTrackInventory').checked = food.trackInventory !== false;
  document.getElementById('modalErrorAlert').style.display = 'none';
  document.getElementById('foodModal').classList.add('active');
}

function initFormListeners() {
  const form = document.getElementById('foodForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('foodName').value.trim();
    const category = document.getElementById('foodCategory').value.trim();
    const price = parseFloat(document.getElementById('foodPrice').value);
    const stockQuantity = parseInt(document.getElementById('foodStock').value) || 0;
    const lowStockThreshold = parseInt(document.getElementById('foodThreshold').value) || 5;
    const imageUrl = document.getElementById('foodImageUrl').value.trim();
    const description = document.getElementById('foodDescription').value.trim();
    const available = document.getElementById('foodAvailable').checked;
    const trackInventory = document.getElementById('foodTrackInventory').checked;
    const errorAlert = document.getElementById('modalErrorAlert');

    if (!name || isNaN(price) || price <= 0 || !category) {
      errorAlert.textContent = 'Please provide valid Name, Category, and Price (> 0)';
      errorAlert.style.display = 'block';
      return;
    }

    const payload = {
      name,
      category,
      price,
      stockQuantity,
      lowStockThreshold,
      trackInventory,
      imageUrl,
      description,
      available
    };

    const submitBtn = document.getElementById('btnSaveFood');
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      let res;
      if (editingFoodId) {
        res = await fetch(`${API_BASE}/foods/${editingFoodId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/foods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save food item');
      }

      document.getElementById('foodModal').classList.remove('active');
      await loadMenuManagement();
    } catch (error) {
      console.error('Error saving food item:', error);
      errorAlert.textContent = error.message || 'Failed to save food item.';
      errorAlert.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Food Item';
    }
  });
}

async function confirmDeleteFood(foodId, foodName) {
  if (confirm(`Are you sure you want to delete "${foodName}"? This action cannot be undone.`)) {
    try {
      const res = await fetch(`${API_BASE}/foods/${foodId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete food item');
      await loadMenuManagement();
    } catch (error) {
      console.error('Error deleting food item:', error);
      alert(error.message || 'Failed to delete food item');
    }
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
