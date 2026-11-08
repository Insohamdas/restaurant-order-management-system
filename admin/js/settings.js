/**
 * Harvest Kitchen - Admin Store Settings Controller
 */

// Auto-detect environment: use Render backend in production, localhost in dev
const isSettingsLocal = !window.location.hostname || 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname === '0.0.0.0' || 
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.startsWith('10.') || 
  window.location.hostname.endsWith('.local');

const API_BASE = isSettingsLocal
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupSettingsForm();
});

async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Could not load settings');
    const cfg = await res.json();

    document.getElementById('cfgRestName').value = cfg.restaurantName || 'Harvest Kitchen';
    document.getElementById('cfgDeliveryFee').value = cfg.deliveryFee != null ? cfg.deliveryFee : 40;
    document.getElementById('cfgFreeThreshold').value = cfg.freeDeliveryThreshold != null ? cfg.freeDeliveryThreshold : 499;
    document.getElementById('cfgMinOrder').value = cfg.minimumOrderAmount != null ? cfg.minimumOrderAmount : 99;
    document.getElementById('cfgTaxRate').value = cfg.taxRatePercent != null ? cfg.taxRatePercent : 5.0;
    document.getElementById('cfgPrepTime').value = cfg.estimatedPrepTimeMinutes != null ? cfg.estimatedPrepTimeMinutes : 25;
    document.getElementById('cfgAcceptingOrders').checked = cfg.acceptingOrders !== false;
  } catch (err) {
    alert('Error loading settings: ' + err.message);
  }
}

function setupSettingsForm() {
  const form = document.getElementById('settingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      restaurantName: document.getElementById('cfgRestName').value.trim(),
      deliveryFee: parseFloat(document.getElementById('cfgDeliveryFee').value),
      freeDeliveryThreshold: parseFloat(document.getElementById('cfgFreeThreshold').value),
      minimumOrderAmount: parseFloat(document.getElementById('cfgMinOrder').value),
      taxRatePercent: parseFloat(document.getElementById('cfgTaxRate').value),
      estimatedPrepTimeMinutes: parseInt(document.getElementById('cfgPrepTime').value),
      acceptingOrders: document.getElementById('cfgAcceptingOrders').checked
    };

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update settings');
      alert('Business settings updated successfully!');
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    }
  });
}
