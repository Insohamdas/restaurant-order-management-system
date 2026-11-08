/**
 * Admin API Service
 * Handles HTTP communication between Admin Portal and Spring Boot REST API
 */

// Auto-detect environment: use local Spring Boot in dev / file / LAN, or remote production
const isAdminApiLocal = !window.location.hostname || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname === '0.0.0.0' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') || 
  window.location.hostname.endsWith('.local');

const API_BASE_URL = isAdminApiLocal
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

/**
 * Global Order Store & Cross-Tab Real-Time Sync Bus
 * Keeps Admin, Kitchen, and Customer in 100% sync
 */
const OrderStore = (typeof window.OrderStore !== 'undefined') ? window.OrderStore : {
  STORAGE_KEY: 'hk_restaurant_orders_v1',
  SYNC_EVENT_KEY: 'hk_order_sync_trigger',

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const orders = data ? JSON.parse(data) : [];
      return Array.isArray(orders) ? orders : [];
    } catch (e) {
      console.warn('Error reading from OrderStore', e);
      return [];
    }
  },

  saveAll(orders) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to localStorage', e);
    }
  },

  getOrderById(id) {
    if (id === undefined || id === null) return null;
    const orders = this.getAll();
    const targetStr = String(id).replace('#', '').trim();
    const targetNum = Number(targetStr);
    return orders.find(o => 
      Number(o.id) === targetNum || 
      Number(o.orderId) === targetNum || 
      String(o.id) === targetStr || 
      String(o.orderId) === targetStr
    ) || null;
  },

  saveOrder(order) {
    if (!order) return null;
    const orders = this.getAll();
    const rawId = order.id || order.orderId || (Math.floor(1000 + Math.random() * 9000));
    const orderId = Number(rawId) || rawId;

    order.id = orderId;
    order.orderId = orderId;
    if (!order.createdAt) order.createdAt = new Date().toISOString();
    if (!order.status) order.status = 'PLACED';
    if (!order.orderSource) order.orderSource = 'DIRECT';

    const existingIndex = orders.findIndex(o => Number(o.id) === Number(orderId) || Number(o.orderId) === Number(orderId));
    if (existingIndex > -1) {
      orders[existingIndex] = { ...orders[existingIndex], ...order };
    } else {
      orders.unshift(order);
    }

    this.saveAll(orders);
    this.broadcastSync('ORDER_SAVED', order);
    return order;
  },

  updateStatus(orderId, newStatus, cancellationReason = null) {
    const orders = this.getAll();
    const targetStr = String(orderId).replace('#', '').trim();
    const targetNum = Number(targetStr);

    const order = orders.find(o => 
      Number(o.id) === targetNum || 
      Number(o.orderId) === targetNum || 
      String(o.id) === targetStr || 
      String(o.orderId) === targetStr
    );

    if (order) {
      order.status = newStatus;
      if (cancellationReason) {
        order.cancellationReason = cancellationReason;
      }
      this.saveAll(orders);
      this.broadcastSync('STATUS_CHANGED', order);
      return order;
    }
    return null;
  },

  broadcastSync(action, order) {
    try {
      const payload = JSON.stringify({
        action,
        orderId: order ? (order.id || order.orderId) : null,
        status: order ? order.status : null,
        timestamp: Date.now()
      });
      localStorage.setItem(this.SYNC_EVENT_KEY, payload);
      window.dispatchEvent(new CustomEvent('hk-order-sync', { detail: { action, order } }));
    } catch (e) {}
  },

  onSync(callback) {
    window.addEventListener('storage', (e) => {
      if (e.key === this.SYNC_EVENT_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          callback(data);
        } catch (err) {}
      }
    });
    window.addEventListener('hk-order-sync', (e) => {
      if (e.detail) {
        callback(e.detail);
      }
    });
  }
};

const AdminAPI = {
  /**
   * Fetch dashboard statistics
   */
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  },

  /**
   * Fetch all foods (including unavailable ones for admin management)
   */
  async getFoods(category = '') {
    let url = `${API_BASE_URL}/foods`;
    if (category && category !== 'All') {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch food items');
    }
    return response.json();
  },

  /**
   * Fetch single food item
   */
  async getFood(id) {
    const response = await fetch(`${API_BASE_URL}/foods/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch food item');
    }
    return response.json();
  },

  /**
   * Create new food item
   */
  async createFood(foodData) {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foodData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || (data.fieldErrors ? Object.values(data.fieldErrors).join(', ') : 'Failed to create food item'));
    }
    return data;
  },

  /**
   * Update existing food item
   */
  async updateFood(id, foodData) {
    const response = await fetch(`${API_BASE_URL}/foods/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foodData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || (data.fieldErrors ? Object.values(data.fieldErrors).join(', ') : 'Failed to update food item'));
    }
    return data;
  },

  /**
   * Delete food item
   */
  async deleteFood(id) {
    const response = await fetch(`${API_BASE_URL}/foods/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete food item');
    }
    return true;
  },

  /**
   * Fetch all customer orders (merges API and unified OrderStore)
   */
  async getOrders() {
    let apiOrders = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(`${API_BASE_URL}/orders`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        apiOrders = await response.json();
      }
    } catch (e) {
      console.warn('API orders fetch failed, reading from local OrderStore', e);
    }

    // Merge with OrderStore so offline orders are never omitted
    const localOrders = OrderStore.getAll();
    const map = new Map();

    apiOrders.forEach(o => map.set(Number(o.id || o.orderId), o));
    localOrders.forEach(o => {
      const id = Number(o.id || o.orderId);
      if (!map.has(id)) {
        map.set(id, o);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return merged;
  },

  /**
   * Fetch single order by ID
   */
  async getOrder(id) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('API getOrder failed, checking local OrderStore', e);
    }

    const localOrder = OrderStore.getOrderById(id);
    if (localOrder) return localOrder;
    throw new Error('Order not found');
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id, status) {
    let updatedData = null;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        updatedData = await response.json();
      }
    } catch (e) {
      console.warn('API updateOrderStatus failed, updating local OrderStore', e);
    }

    const local = OrderStore.updateStatus(id, status);
    return updatedData || local || { id, status };
  }
};
