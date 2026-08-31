/**
 * Admin API Service
 * Handles HTTP communication between Admin Portal and Spring Boot REST API
 */

const API_BASE_URL = 'http://localhost:8080/api';

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
   * Fetch all customer orders
   */
  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  /**
   * Fetch single order by ID
   */
  async getOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    return response.json();
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order status');
    }
    return data;
  }
};
