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

  if (typeof OrderStore !== 'undefined') {
    OrderStore.onSync(() => {
      loadDashboard();
    });
  }

  setInterval(loadDashboard, 8000);
});

const isDashLocal = !window.location.hostname || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname === '0.0.0.0' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') || 
  window.location.hostname.endsWith('.local');

const API_BASE = isDashLocal
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

async function loadDashboard() {
  try {
    const revEl = document.getElementById('statTodayRevenue');
    const aovEl = document.getElementById('statAov');
    const pendingEl = document.getElementById('statPendingOrders');
    const foodsEl = document.getElementById('statTotalFoods');

    // 1. Fetch orders from AdminAPI (merges backend + OrderStore)
    let orders = [];
    if (typeof AdminAPI !== 'undefined' && AdminAPI.getOrders) {
      orders = await AdminAPI.getOrders();
    } else if (typeof OrderStore !== 'undefined') {
      orders = OrderStore.getAll();
    }

    renderRecentOrders(orders.slice(0, 6));

    // 2. Fetch or compute analytics
    let summaryLoaded = false;
    try {
      const res = await fetch(`${API_BASE}/analytics/summary`);
      if (res.ok) {
        const summary = await res.json();
        if (revEl) revEl.textContent = `₹${Math.round(summary.todayRevenue || 0).toLocaleString('en-IN')}`;
        if (aovEl) aovEl.textContent = `₹${Math.round(summary.averageOrderValue || 0).toLocaleString('en-IN')}`;
        if (pendingEl) pendingEl.textContent = summary.pendingOrders || 0;
        summaryLoaded = true;
      }
    } catch (e) {}

    if (!summaryLoaded && orders.length > 0) {
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => {
        const d = o.createdAt ? new Date(o.createdAt).toDateString() : '';
        return d === today && o.status !== 'CANCELLED';
      });
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const aov = todayOrders.length > 0 ? (todayRevenue / todayOrders.length) : 0;
      const pendingCount = orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.status)).length;

      if (revEl) revEl.textContent = `₹${Math.round(todayRevenue).toLocaleString('en-IN')}`;
      if (aovEl) aovEl.textContent = `₹${Math.round(aov).toLocaleString('en-IN')}`;
      if (pendingEl) pendingEl.textContent = pendingCount;
    }

    try {
      const foodsRes = await fetch(`${API_BASE}/foods`);
      if (foodsRes.ok) {
        const foods = await foodsRes.json();
        if (foodsEl) foodsEl.textContent = foods.length;
      }
    } catch (e) {
      if (foodsEl && (!foodsEl.textContent || foodsEl.textContent === '0')) {
        foodsEl.textContent = '38';
      }
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
