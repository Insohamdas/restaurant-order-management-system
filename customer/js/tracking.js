/**
 * Customer Order Tracking JavaScript - Upgraded with Prep Time, Ready status & Cancellation
 */

const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
let currentTrackingOrder = null;
let autoRefreshTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderIdFromUrl = urlParams.get('orderId') || urlParams.get('id');

  const trackingInput = document.getElementById('trackingOrderIdInput');
  const trackBtn = document.getElementById('btnTrackOrder');

  if (orderIdFromUrl) {
    if (trackingInput) trackingInput.value = orderIdFromUrl;
    fetchAndDisplayOrder(orderIdFromUrl);
  }

  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      const id = trackingInput ? trackingInput.value.trim().replace('#', '') : '';
      if (!id) {
        showTrackingError('Please enter an Order ID');
        return;
      }
      fetchAndDisplayOrder(id);
    });
  }

  if (trackingInput) {
    trackingInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        trackBtn.click();
      }
    });
  }

  setupCancelForm();
});

async function fetchAndDisplayOrder(orderId) {
  const errorAlert = document.getElementById('trackingErrorAlert');
  const detailsSection = document.getElementById('trackingDetailsSection');
  const emptyPrompt = document.getElementById('trackingEmptyPrompt');

  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) {
      throw new Error(`Order #${orderId} could not be found.`);
    }

    const order = await res.json();
    currentTrackingOrder = order;

    if (emptyPrompt) emptyPrompt.style.display = 'none';
    if (detailsSection) detailsSection.style.display = 'block';

    renderOrderInfo(order);
    renderOrderTimeline(order.status);
    renderOrderItems(order);

    // Setup auto-refresh if order is still in progress
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    if (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
      autoRefreshTimer = setInterval(() => {
        refreshOrderStatusSilently(order.id);
      }, 7000);
    }

  } catch (error) {
    console.error('Error fetching order tracking info:', error);
    if (detailsSection) detailsSection.style.display = 'none';
    showTrackingError(error.message || `Could not find Order #${orderId}. Please check the ID and try again.`);
  }
}

async function refreshOrderStatusSilently(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (res.ok) {
      const order = await res.json();
      currentTrackingOrder = order;
      renderOrderInfo(order);
      renderOrderTimeline(order.status);
    }
  } catch (e) {
    // Ignore silent poll errors
  }
}

function renderOrderInfo(order) {
  const idEl = document.getElementById('trackOrderIdDisplay');
  const statusBadgeEl = document.getElementById('trackStatusBadge');
  const cancelBtn = document.getElementById('btnCancelOrder');
  const customerNameEl = document.getElementById('trackCustomerName');
  const phoneEl = document.getElementById('trackPhone');
  const addressEl = document.getElementById('trackAddress');
  const dateEl = document.getElementById('trackDate');
  const prepTimeVal = document.getElementById('trackPrepTimeVal');
  const prepTimeBanner = document.getElementById('prepTimeBanner');

  if (idEl) idEl.textContent = `#${order.id}`;

  if (statusBadgeEl) {
    statusBadgeEl.textContent = formatStatusText(order.status);
    statusBadgeEl.className = `badge-status status-${order.status}`;
  }

  // Customer Cancellation eligibility: PLACED or CONFIRMED only
  if (cancelBtn) {
    if (order.canCancel || order.status === 'PLACED' || order.status === 'CONFIRMED') {
      cancelBtn.style.display = 'inline-block';
    } else {
      cancelBtn.style.display = 'none';
    }
  }

  // Estimated Prep time
  if (prepTimeVal) {
    if (order.status === 'DELIVERED') {
      prepTimeBanner.style.background = '#065f46';
      prepTimeBanner.style.borderLeftColor = '#10b981';
      document.getElementById('prepTimeTitle').textContent = 'Delivered Fresh & Hot';
      prepTimeVal.textContent = 'Enjoy your meal!';
    } else if (order.status === 'CANCELLED') {
      prepTimeBanner.style.background = '#7f1d1d';
      prepTimeBanner.style.borderLeftColor = '#ef4444';
      document.getElementById('prepTimeTitle').textContent = 'Order Cancelled';
      prepTimeVal.textContent = order.cancellationReason ? `Reason: ${order.cancellationReason}` : 'Cancelled';
    } else {
      prepTimeVal.textContent = `~${order.estimatedPrepTimeMinutes || 25} mins`;
    }
  }

  if (customerNameEl) customerNameEl.textContent = order.customerName || '-';
  if (phoneEl) phoneEl.textContent = order.phone || '-';
  if (addressEl) addressEl.textContent = order.address || '-';

  if (dateEl && order.createdAt) {
    const dt = new Date(order.createdAt);
    dateEl.textContent = dt.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }
}

function renderOrderTimeline(currentStatus) {
  const timelineEl = document.getElementById('trackTimeline');
  if (!timelineEl) return;

  if (currentStatus === 'CANCELLED') {
    timelineEl.innerHTML = `
      <div class="tracker-step cancelled" style="margin: 0 auto; width: 100%; text-align: center;">
        <div class="step-node" style="background: #ef4444; color: #fff;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div class="step-label" style="font-size: 1rem; color: #dc2626; font-weight: 800;">Order Cancelled</div>
      </div>
    `;
    return;
  }

  const currentIndex = ORDER_STEPS.indexOf(currentStatus);

  timelineEl.innerHTML = ORDER_STEPS.map((step, idx) => {
    let stateClass = '';
    let iconContent = idx + 1;

    if (idx < currentIndex) {
      stateClass = 'completed';
      iconContent = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (idx === currentIndex) {
      stateClass = 'active';
      iconContent = '●';
    }

    return `
      <div class="tracker-step ${stateClass}">
        <div class="step-node">${iconContent}</div>
        <div class="step-label">${formatStatusText(step)}</div>
      </div>
    `;
  }).join('');
}

function renderOrderItems(order) {
  const itemsContainer = document.getElementById('trackItemsList');
  const subtotalEl = document.getElementById('trackSubtotal');
  const discountRow = document.getElementById('trackDiscountRow');
  const discountEl = document.getElementById('trackDiscount');
  const taxEl = document.getElementById('trackTax');
  const deliveryFeeEl = document.getElementById('trackDeliveryFee');
  const totalAmountEl = document.getElementById('trackTotalAmount');

  if (itemsContainer && order.items) {
    itemsContainer.innerHTML = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light); font-size: 0.95rem;">
        <div>
          <span style="font-weight: 700;">${escapeHtml(item.foodName || 'Food Item')}</span>
          <span style="color: var(--text-muted); margin-left: 6px;">× ${item.quantity}</span>
        </div>
        <div style="font-weight: 700;">₹${Number(item.price * item.quantity).toFixed(0)}</div>
      </div>
    `).join('');
  }

  const subtotal = order.subtotal || (order.totalAmount - (order.deliveryFee || 40));
  const deliveryFee = order.deliveryFee != null ? order.deliveryFee : 40;
  const totalDiscount = (order.discountAmount || 0) + (order.loyaltyDiscount || 0);

  if (subtotalEl) subtotalEl.textContent = `₹${Number(subtotal).toFixed(0)}`;
  if (discountRow) {
    if (totalDiscount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `- ₹${Number(totalDiscount).toFixed(0)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
  if (taxEl) taxEl.textContent = `₹${Number(order.taxAmount || 0).toFixed(0)}`;
  if (deliveryFeeEl) {
    if (deliveryFee === 0) {
      deliveryFeeEl.innerHTML = '<span style="color: #16a34a; font-weight: 700;">FREE</span>';
    } else {
      deliveryFeeEl.textContent = `₹${Number(deliveryFee).toFixed(0)}`;
    }
  }
  if (totalAmountEl) totalAmountEl.textContent = `₹${Number(order.totalAmount).toFixed(0)}`;
}

function openCancelModal() {
  document.getElementById('cancelModal').classList.add('open');
}

function closeCancelModal() {
  document.getElementById('cancelModal').classList.remove('open');
}

function setupCancelForm() {
  const form = document.getElementById('cancelOrderForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentTrackingOrder) return;

    const select = document.getElementById('cancelReasonSelect');
    const comments = document.getElementById('cancelReasonText');
    const fullReason = select.value + (comments.value.trim() ? `: ${comments.value.trim()}` : '');

    try {
      const res = await fetch(`${API_BASE}/orders/${currentTrackingOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: currentTrackingOrder.phone,
          reason: fullReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not cancel order');

      closeCancelModal();
      showToast('Order #' + currentTrackingOrder.id + ' has been cancelled.');
      fetchAndDisplayOrder(currentTrackingOrder.id);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function formatStatusText(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ');
}

function showTrackingError(msg) {
  const errorAlert = document.getElementById('trackingErrorAlert');
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
