/**
 * Admin Order Details & Status Updater Controller
 */

let currentOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  AuthService.requireAuth();

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  currentOrderId = urlParams.get('orderId');

  if (!currentOrderId) {
    window.location.href = 'order-management.html';
    return;
  }

  initStatusUpdateForm();
  loadOrderDetails(currentOrderId);
});

async function loadOrderDetails(orderId) {
  const loadingEl = document.getElementById('orderDetailsLoading');
  const contentEl = document.getElementById('orderDetailsContent');

  try {
    const order = await AdminAPI.getOrder(orderId);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

    renderDetails(order);
  } catch (error) {
    console.error('Error loading order details:', error);
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="alert alert-danger" style="display: inline-block;">
          Failed to load Order #${orderId}. <a href="order-management.html" style="text-decoration: underline;">Return to Order Management</a>
        </div>
      `;
    }
  }
}

function renderDetails(order) {
  document.getElementById('orderIdDisplay').textContent = `#${order.id}`;
  
  const statusBadge = document.getElementById('orderCurrentStatusBadge');
  statusBadge.textContent = order.status.replace(/_/g, ' ');
  statusBadge.className = `badge-status status-${order.status}`;

  document.getElementById('customerName').textContent = order.customerName || '-';
  document.getElementById('customerPhone').textContent = order.phone || '-';
  document.getElementById('customerAddress').textContent = order.address || '-';
  
  const dateFormatted = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }) : '-';
  document.getElementById('orderDate').textContent = dateFormatted;

  // Set current status in select dropdown
  const statusSelect = document.getElementById('statusSelect');
  if (statusSelect) {
    statusSelect.value = order.status;
  }

  // Render items table
  const tbody = document.getElementById('orderItemsTableBody');
  if (tbody && order.items) {
    const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
    tbody.innerHTML = order.items.map(item => `
      <tr>
        <td>
          <img class="table-img" src="${item.imageUrl || placeholderImg}" alt="${escapeHtml(item.foodName || 'Item')}" onerror="this.src='${placeholderImg}'">
        </td>
        <td style="font-weight: 600;">${escapeHtml(item.foodName || 'Food Item')}</td>
        <td style="font-weight: 600;">₹${Number(item.price).toFixed(0)}</td>
        <td style="font-weight: 600;">${item.quantity}</td>
        <td style="font-weight: 700;">₹${Number(item.price * item.quantity).toFixed(0)}</td>
      </tr>
    `).join('');
  }

  const subtotal = order.subtotal != null ? order.subtotal : (order.totalAmount - (order.deliveryFee || 40));
  const deliveryFee = order.deliveryFee != null ? order.deliveryFee : 40;

  document.getElementById('orderSubtotal').textContent = `₹${Number(subtotal).toFixed(0)}`;
  document.getElementById('orderDeliveryFee').textContent = `₹${Number(deliveryFee).toFixed(0)}`;
  document.getElementById('orderTotalAmount').textContent = `₹${Number(order.totalAmount).toFixed(0)}`;
}

function initStatusUpdateForm() {
  const form = document.getElementById('updateStatusForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusSelect = document.getElementById('statusSelect');
    const newStatus = statusSelect.value;
    const btn = document.getElementById('btnUpdateStatus');
    const alertEl = document.getElementById('statusUpdateAlert');

    if (alertEl) alertEl.style.display = 'none';

    try {
      btn.disabled = true;
      btn.textContent = 'Updating...';

      const updated = await AdminAPI.updateOrderStatus(currentOrderId, newStatus);
      renderDetails(updated);

      if (alertEl) {
        alertEl.className = 'alert alert-success';
        alertEl.textContent = `Order status successfully updated to ${newStatus.replace(/_/g, ' ')}!`;
        alertEl.style.display = 'block';
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (alertEl) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = error.message || 'Failed to update order status';
        alertEl.style.display = 'block';
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Status';
    }
  });
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
