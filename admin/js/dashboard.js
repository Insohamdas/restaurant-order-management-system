/**
 * Admin Dashboard Controller - Upgraded with Low Stock Alerts & Live Revenue
 */

document.addEventListener('DOMContentLoaded', () => {
  AuthService.requireAuth();

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }

  loadDashboard();
  checkLowStock();
});

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

async function loadDashboard() {
  try {
    // 1. Fetch Analytics & Stats
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (res.ok) {
      const summary = await res.json();
      const revEl = document.getElementById('statTodayRevenue');
      const aovEl = document.getElementById('statAov');
      const pendingEl = document.getElementById('statPendingOrders');
      if (revEl) revEl.textContent = `₹${Math.round(summary.todayRevenue || 0).toLocaleString('en-IN')}`;
      if (aovEl) aovEl.textContent = `₹${Math.round(summary.averageOrderValue || 0).toLocaleString('en-IN')}`;
      if (pendingEl) pendingEl.textContent = summary.pendingOrders || 0;
    }

    const foodsRes = await fetch(`${API_BASE}/foods`);
    if (foodsRes.ok) {
      const foods = await foodsRes.json();
      const foodsEl = document.getElementById('statTotalFoods');
      if (foodsEl) foodsEl.textContent = foods.length;
    }

    // 2. Fetch Recent Orders
    const ordersRes = await fetch(`${API_BASE}/orders`);
    if (ordersRes.ok) {
      const orders = await ordersRes.json();
      renderRecentOrders(orders.slice(0, 6));
    }

  } catch (error) {
    console.error('Error loading dashboard metrics:', error);
  }
}

async function checkLowStock() {
  try {
    const res = await fetch(`${API_BASE}/inventory/low-stock`);
    if (!res.ok) return;
    const lowStockItems = await res.json();

    const banner = document.getElementById('lowStockBanner');
    const msg = document.getElementById('lowStockMsg');
    if (!banner || !msg) return;

    if (lowStockItems.length > 0) {
      banner.style.display = 'block';
      const names = lowStockItems.map(i => `${i.name} (${i.stockQuantity} left)`).join(', ');
      msg.textContent = `Low stock alert for ${lowStockItems.length} item(s): ${names}`;
    } else {
      banner.style.display = 'none';
    }
  } catch (e) {
    console.error('Error checking low stock:', e);
  }
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recentOrdersTableBody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No customer orders placed yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';

    return `
      <tr>
        <td style="font-weight: 700;">#${order.id}</td>
        <td style="font-weight: 600;">${escapeHtml(order.customerName)}</td>
        <td>${escapeHtml(order.phone)}</td>
        <td style="font-weight: 700;">₹${Number(order.totalAmount).toFixed(0)}</td>
        <td><span class="badge-status status-${order.status}">${order.status.replace(/_/g, ' ')}</span></td>
        <td style="color: var(--text-muted); font-size: 0.85rem;">${formattedDate}</td>
        <td>
          <a href="order-details.html?orderId=${order.id}" class="btn btn-secondary btn-sm">
            View Details →
          </a>
        </td>
      </tr>
    `;
  }).join('');
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
