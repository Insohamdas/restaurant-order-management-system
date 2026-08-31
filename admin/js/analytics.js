/**
 * Harvest Kitchen - Admin Analytics JavaScript Controller
 */

const API_BASE = 'http://localhost:8080/api';
let currentPeriod = 'LAST_30_DAYS';

document.addEventListener('DOMContentLoaded', () => {
  fetchAllAnalytics();
});

function switchPeriod(period, btn) {
  currentPeriod = period;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  fetchAllAnalytics();
}

function refreshAllAnalytics() {
  fetchAllAnalytics();
}

async function fetchAllAnalytics() {
  await Promise.all([
    loadSummaryKPIs(),
    loadCategoryPerformance(),
    loadPeakHours(),
    loadTopDishes(),
    loadCancellationMetrics(),
    loadCouponPerformance(),
    loadRetentionMetrics()
  ]);
}

async function loadSummaryKPIs() {
  try {
    let url = `${API_BASE}/analytics/summary`;
    if (currentPeriod !== 'LAST_30_DAYS') {
      url = `${API_BASE}/analytics/revenue?period=${currentPeriod}`;
    }

    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();

    const todayRev = data.todayRevenue !== undefined ? data.todayRevenue : 0;
    const totalRev = data.totalRevenue !== undefined ? data.totalRevenue : (data.monthRevenue || 0);
    const aov = data.averageOrderValue !== undefined ? data.averageOrderValue : 0;
    const completedOrders = data.completedOrders !== undefined ? data.completedOrders : (data.totalOrders || 0);

    const todayRevEl = document.getElementById('kpiTodayRev');
    const monthRevEl = document.getElementById('kpiMonthRev');
    const todayOrdersEl = document.getElementById('kpiTodayOrders');
    const totalOrdersEl = document.getElementById('kpiTotalOrders');
    const aovEl = document.getElementById('kpiAov');

    if (todayRevEl) todayRevEl.textContent = `₹${Math.round(todayRev).toLocaleString('en-IN')}`;
    if (monthRevEl) monthRevEl.textContent = `₹${Math.round(totalRev).toLocaleString('en-IN')}`;
    if (todayOrdersEl) todayOrdersEl.textContent = `${data.todayOrders || 0} order(s) placed today`;
    if (totalOrdersEl) totalOrdersEl.textContent = `${completedOrders} completed order(s)`;
    if (aovEl) aovEl.textContent = `₹${Math.round(aov).toLocaleString('en-IN')}`;
  } catch (e) {
    console.error('Failed to load summary KPIs:', e);
  }
}

async function loadRetentionMetrics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/retention`);
    if (!res.ok) return;
    const data = await res.json();

    const repeatRate = data.repeatOrderRate !== undefined ? data.repeatOrderRate : (data.repeatCustomerRate || 0);
    const repeatDiners = data.repeatCustomers || 0;
    const totalDiners = data.totalUniqueCustomers || 0;

    const repeatEl = document.getElementById('kpiRepeatRate');
    const custCountsEl = document.getElementById('kpiCustomerCounts');

    if (repeatEl) repeatEl.textContent = `${repeatRate.toFixed(1)}%`;
    if (custCountsEl) {
      custCountsEl.textContent = `${repeatDiners} repeat of ${totalDiners} diners`;
    }
  } catch (e) {
    console.error('Failed to load retention:', e);
  }
}

async function loadCategoryPerformance() {
  const container = document.getElementById('categoryChartList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/analytics/categories?period=${currentPeriod}`);
    if (!res.ok) throw new Error('Could not fetch categories');
    let list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No category sales recorded for this period.</p>';
      return;
    }

    const totalRevenue = list.reduce((sum, c) => sum + (c.totalRevenue || c.revenue || 0), 0) || 1;

    container.innerHTML = list.map(cat => {
      const catName = cat.category || cat.categoryName || cat.name || 'General';
      const revenue = cat.totalRevenue !== undefined ? cat.totalRevenue : (cat.revenue || 0);
      const qty = cat.totalQuantitySold !== undefined ? cat.totalQuantitySold : (cat.quantitySold || cat.quantity || 0);
      const pct = cat.percentageOfTotal !== undefined ? cat.percentageOfTotal : Math.min(100, Math.round((revenue / totalRevenue) * 100));

      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label">
            ${escapeHtml(catName)}
            <span style="font-size: 0.74rem; color: #94a3b8; font-weight: 500; display: block;">${qty} items sold</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="chart-bar-val">
            <div>₹${Math.round(revenue).toLocaleString('en-IN')}</div>
            <span style="font-size: 0.74rem; color: #16a34a; font-weight: 800;">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color: #dc2626; padding: 10px;">Error: ${e.message}</p>`;
  }
}

async function loadPeakHours() {
  const container = document.getElementById('peakHoursList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/analytics/peak-hours`);
    if (!res.ok) throw new Error('Could not fetch peak hours');
    let list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No hourly traffic recorded yet.</p>';
      return;
    }

    const maxOrders = Math.max(...list.map(h => h.orderCount || h.orders || 0), 1);
    
    // Filter active order hours or operational hours (8 AM to 10 PM)
    const displayHours = list.filter(h => (h.orderCount || 0) > 0 || (h.hour >= 9 && h.hour <= 21));

    container.innerHTML = displayHours.map(item => {
      let hourLabel = item.hourLabel;
      if (!hourLabel && item.hour !== undefined) {
        const h = item.hour;
        if (h === 0) hourLabel = '12 AM';
        else if (h < 12) hourLabel = `${h} AM`;
        else if (h === 12) hourLabel = '12 PM';
        else hourLabel = `${h - 12} PM`;
      }
      hourLabel = hourLabel || '12:00';

      const orderCount = item.orderCount !== undefined ? item.orderCount : (item.orders || 0);
      const sales = item.totalSales !== undefined ? item.totalSales : (item.sales || 0);
      const pct = orderCount > 0 ? Math.min(100, Math.round((orderCount / maxOrders) * 100)) : 5;

      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label" style="width: 80px;">
            ${escapeHtml(hourLabel)}
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill chart-bar-fill-blue" style="width: ${pct}%;"></div>
          </div>
          <div class="chart-bar-val" style="width: 110px;">
            <span style="font-weight: 800; color: ${orderCount > 0 ? '#0284c7' : '#94a3b8'};">
              ${orderCount} order${orderCount === 1 ? '' : 's'}
            </span>
            ${sales > 0 ? `<span style="font-size: 0.74rem; color: #64748b; display: block;">₹${Math.round(sales).toLocaleString('en-IN')}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    container.innerHTML = `<p style="color: #dc2626; padding: 10px;">Error: ${e.message}</p>`;
  }
}

async function loadTopDishes() {
  const tbody = document.getElementById('topSellingTableBody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/analytics/top-dishes?period=${currentPeriod}`);
    if (!res.ok) throw new Error('Could not fetch top dishes');
    let list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No dish sales recorded for this period.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((item, idx) => {
      const name = item.productName || item.dishName || item.name || 'Menu Item';
      const cat = item.category || item.categoryName || 'General';
      const qty = item.quantitySold !== undefined ? item.quantitySold : (item.quantity || item.unitsSold || item.totalQuantitySold || 0);
      const revenue = item.totalRevenue !== undefined ? item.totalRevenue : (item.revenue || item.totalRevenueGenerated || 0);
      const avgPrice = qty > 0 ? Math.round(revenue / qty) : 0;

      let rankClass = '';
      if (idx === 0) rankClass = 'rank-1';
      else if (idx === 1) rankClass = 'rank-2';
      else if (idx === 2) rankClass = 'rank-3';

      return `
        <tr>
          <td style="text-align: center;">
            <span class="rank-badge ${rankClass}">#${idx + 1}</span>
          </td>
          <td>
            <strong style="color: #181615; font-size: 0.95rem;">${escapeHtml(name)}</strong>
          </td>
          <td>
            <span class="badge" style="background: #f1f5f9; color: #475569; font-weight: 700;">${escapeHtml(cat)}</span>
          </td>
          <td>
            <span style="font-weight: 800; color: #181615;">${qty} sold</span>
          </td>
          <td>
            <strong style="color: #df1f26; font-size: 0.98rem;">₹${Math.round(revenue).toLocaleString('en-IN')}</strong>
          </td>
          <td>
            <span style="color: #64748b; font-weight: 600;">₹${avgPrice}</span>
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: #dc2626; text-align: center; padding: 20px;">Error: ${e.message}</td></tr>`;
  }
}

async function loadCancellationMetrics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/cancellations`);
    if (!res.ok) return;
    const data = await res.json();

    const rate = data.cancellationRate !== undefined ? data.cancellationRate : 0;
    const lostRev = data.totalLostRevenue !== undefined ? data.totalLostRevenue : 0;

    const rateEl = document.getElementById('cancelRateVal');
    const lostRevEl = document.getElementById('cancelLostRevVal');
    const listContainer = document.getElementById('cancelReasonsList');

    if (rateEl) rateEl.textContent = `${rate.toFixed(1)}%`;
    if (lostRevEl) lostRevEl.textContent = `₹${Math.round(lostRev).toLocaleString('en-IN')}`;

    if (listContainer) {
      const reasons = data.reasonsBreakdown || data.reasons || {};
      const entries = Object.entries(reasons);

      if (entries.length === 0) {
        listContainer.innerHTML = '<p style="color: #16a34a; font-size: 0.85rem; font-weight: 700; margin-top: 4px; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 0 order cancellations! 100% fulfillment velocity.</p>';
        return;
      }

      listContainer.innerHTML = entries.map(([reason, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border); font-size: 0.85rem;">
          <span style="color: #181615; font-weight: 600;">${escapeHtml(reason)}</span>
          <span style="font-weight: 800; color: #dc2626;">${count} order(s)</span>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Failed to load cancellations:', e);
  }
}

async function loadCouponPerformance() {
  const tbody = document.getElementById('couponStatsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/analytics/coupons`);
    if (!res.ok) return;
    let list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 16px;">No coupon redemptions recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(c => {
      const code = c.code || c.couponCode || 'PROMO';
      const uses = c.timesUsed !== undefined ? c.timesUsed : (c.totalUses || 0);
      const discount = c.totalDiscountGiven !== undefined ? c.totalDiscountGiven : 0;

      return `
        <tr>
          <td>
            <span style="background: #fef2f2; color: #df1f26; font-weight: 800; padding: 4px 10px; border-radius: 6px; border: 1.5px dashed #fca5a5; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
              ${escapeHtml(code)}
            </span>
          </td>
          <td><strong style="color: #181615;">${uses}</strong> redemptions</td>
          <td><strong style="color: #15803d; font-size: 0.95rem;">₹${Math.round(discount).toLocaleString('en-IN')}</strong></td>
          <td><span class="badge" style="background: #dcfce7; color: #15803d; font-weight: 800;">ACTIVE</span></td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" style="color: #dc2626; text-align: center;">Error: ${e.message}</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Window exports
window.switchPeriod = switchPeriod;
window.refreshAllAnalytics = refreshAllAnalytics;
window.fetchAllAnalytics = fetchAllAnalytics;
