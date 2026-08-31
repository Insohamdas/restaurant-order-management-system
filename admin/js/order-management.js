/**
 * Admin Order Management Controller
 * Supports multi-dimensional filtering by Status, Date Range, Specific Date, and Search
 */

let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  AuthService.requireAuth();

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }

  initFilterListeners();
  loadOrders();
});

function initFilterListeners() {
  const statusSelect = document.getElementById('orderStatusFilter');
  const datePresetSelect = document.getElementById('orderDatePreset');
  const customDateInput = document.getElementById('orderCustomDate');
  const searchInput = document.getElementById('orderSearchInput');
  const resetBtn = document.getElementById('btnResetFilters');
  const refreshBtn = document.getElementById('btnRefreshOrders');
  const customDateContainer = document.getElementById('customDateRangeContainer');

  if (statusSelect) {
    statusSelect.addEventListener('change', () => filterAndRenderOrders());
  }

  if (datePresetSelect) {
    datePresetSelect.addEventListener('change', () => {
      if (datePresetSelect.value === 'CUSTOM') {
        if (customDateContainer) customDateContainer.style.display = 'flex';
      } else {
        if (customDateContainer) customDateContainer.style.display = 'none';
      }
      filterAndRenderOrders();
    });
  }

  if (customDateInput) {
    customDateInput.addEventListener('change', () => filterAndRenderOrders());
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => filterAndRenderOrders());
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (statusSelect) statusSelect.value = 'ALL';
      if (datePresetSelect) datePresetSelect.value = 'ALL';
      if (customDateContainer) customDateContainer.style.display = 'none';
      if (customDateInput) customDateInput.value = '';
      if (searchInput) searchInput.value = '';
      filterAndRenderOrders();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadOrders());
  }
}

async function loadOrders() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 35px;">
        Loading live orders stream...
      </td>
    </tr>
  `;

  try {
    allOrders = await AdminAPI.getOrders();
    filterAndRenderOrders();
  } catch (error) {
    console.error('Error fetching orders:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--danger); padding: 35px;">
          Failed to load orders from backend server. Please verify Spring Boot API is running.
        </td>
      </tr>
    `;
  }
}

function filterAndRenderOrders() {
  const tbody = document.getElementById('ordersTableBody');
  const countBadge = document.getElementById('orderCountBadge');
  if (!tbody) return;

  const statusFilter = document.getElementById('orderStatusFilter')?.value || 'ALL';
  const datePreset = document.getElementById('orderDatePreset')?.value || 'ALL';
  const customDateVal = document.getElementById('orderCustomDate')?.value || '';
  const searchQuery = document.getElementById('orderSearchInput')?.value.toLowerCase().trim() || '';

  const now = new Date();
  const todayStr = getLocalDateString(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let filtered = allOrders.filter(order => {
    // 1. Status Filter
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }

    // 2. Date Filter
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const orderDateStr = getLocalDateString(orderDate);

      if (datePreset === 'TODAY') {
        if (orderDateStr !== todayStr) return false;
      } else if (datePreset === 'YESTERDAY') {
        if (orderDateStr !== yesterdayStr) return false;
      } else if (datePreset === 'LAST_7_DAYS') {
        if (orderDate < sevenDaysAgo) return false;
      } else if (datePreset === 'THIS_MONTH') {
        if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (datePreset === 'CUSTOM') {
        if (customDateVal && orderDateStr !== customDateVal) {
          return false;
        }
      }
    }

    // 3. Search Filter
    if (searchQuery) {
      const idMatch = String(order.id).includes(searchQuery.replace('#', ''));
      const nameMatch = order.customerName && order.customerName.toLowerCase().includes(searchQuery);
      const phoneMatch = order.phone && order.phone.toLowerCase().includes(searchQuery);
      const addressMatch = order.address && order.address.toLowerCase().includes(searchQuery);
      if (!idMatch && !nameMatch && !phoneMatch && !addressMatch) {
        return false;
      }
    }

    return true;
  });

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${allOrders.length} orders`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
          No orders found matching the selected status or date criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';

    return `
      <tr>
        <td style="font-weight: 800; color: var(--brand-dark);">#${order.id}</td>
        <td style="font-weight: 600;">${escapeHtml(order.customerName)}</td>
        <td style="color: var(--text-muted);">${escapeHtml(order.phone)}</td>
        <td style="font-weight: 800; color: var(--brand-dark);">₹${Number(order.totalAmount).toFixed(0)}</td>
        <td><span class="badge-status status-${order.status}">${order.status.replace(/_/g, ' ')}</span></td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${formattedDate}</td>
        <td>
          <a href="order-details.html?orderId=${order.id}" class="btn btn-secondary btn-sm" style="font-weight: 700;">
            View Details →
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
