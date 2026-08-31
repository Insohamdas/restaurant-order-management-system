/**
 * Customer API Service
 * Handles HTTP communication with the Spring Boot REST API
 */

const API_BASE_URL = 'http://localhost:8080/api';

const CustomerAPI = {
  /**
   * Fetch all foods, optionally filtered by category
   */
  async getFoods(category = '') {
    let url = `${API_BASE_URL}/foods`;
    if (category && category !== 'All') {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch food items');
    }
    return response.json();
  },

  /**
   * Fetch single food item by ID
   */
  async getFood(id) {
    const response = await fetch(`${API_BASE_URL}/foods/${id}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch food item');
    }
    return response.json();
  },

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || (data.fieldErrors ? Object.values(data.fieldErrors).join(', ') : 'Failed to place order'));
    }
    return data;
  },

  /**
   * Fetch order details by ID for tracking
   */
  async getOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Order not found');
    }
    return response.json();
  }
};
