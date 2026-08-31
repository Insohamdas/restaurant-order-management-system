/**
 * Harvest Kitchen - Kitchen Display System (KDS) Controller
 * Multi-Channel POS Integration (Dine-In, Zomato, Swiggy, Magicpin, Direct, Takeaway)
 * Vector Icons & Official Brand Logos, Order Details Modal, Drag & Drop & Audio Alerts
 */

const API_BASE = 'http://localhost:8080/api';

// State
let kitchenOrders = [];
let previousOrderIds = new Set();
let masterSoundEnabled = true;
let voiceAnnouncementEnabled = true;
let selectedVoiceURI = '';
let voiceRate = 0.90;
let isOfflineMode = false;
let currentChannelFilter = 'ALL';
let completedItemMap = {}; // Tracks checked off item rows: { "orderId_itemIndex": boolean }
let alertedOverdueOrders = new Set();
let draggedOrderId = null;
let activeModalOrderId = null;

// Realistic Demo Orders with diverse channels and customer special requests
const DEMO_ORDERS = [
  {
    orderId: 108,
    customerName: "Aarav Sharma",
    phone: "9876543210",
    address: "Flat 402, Lotus Heights, Bandra West, Mumbai",
    orderSource: "ZOMATO",
    tableNumber: null,
    specialInstructions: "Make Butter Chicken medium spicy. Cut Garlic Naan into halves. Send extra mint chutney & tissues.",
    status: "PLACED",
    elapsedMinutes: 3,
    estimatedPrepTimeMinutes: 18,
    urgencyLevel: "NORMAL",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    items: [
      { foodName: "Butter Chicken with Garlic Naan", quantity: 2 },
      { foodName: "Paneer Tikka Platter", quantity: 1 },
      { foodName: "Mango Lassi", quantity: 2 }
    ]
  },
  {
    orderId: 107,
    customerName: "Ananya Iyer",
    phone: "9811223344",
    address: "Villa 12, Palm Meadows, Whitefield, Bengaluru",
    orderSource: "SWIGGY",
    tableNumber: null,
    specialInstructions: "Send extra raita and spicy salan. Biryani must be piping hot.",
    status: "PLACED",
    elapsedMinutes: 6,
    estimatedPrepTimeMinutes: 20,
    urgencyLevel: "NORMAL",
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
    items: [
      { foodName: "Biryani Special Handi", quantity: 1 },
      { foodName: "Gulab Jamun (4 pcs)", quantity: 1 }
    ]
  },
  {
    orderId: 106,
    customerName: "Table 4 (Dine-In)",
    phone: "9823456789",
    address: "Dine-In • Table 4 (AC Section)",
    orderSource: "DINE_IN",
    tableNumber: "Table 4",
    specialInstructions: "No onion on pizza. Thin crust extra crispy. Serve Cold Brew with less ice for guest.",
    status: "PREPARING",
    elapsedMinutes: 14,
    estimatedPrepTimeMinutes: 18,
    urgencyLevel: "URGENT",
    createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
    items: [
      { foodName: "Farmhouse Gourmet Pizza (Large)", quantity: 1 },
      { foodName: "Crispy Peri Peri Fries", quantity: 2 },
      { foodName: "Cold Brew Coffee", quantity: 2 }
    ]
  },
  {
    orderId: 105,
    customerName: "Rahul Verma",
    phone: "9988776655",
    address: "B-204, Green Glen Layout, Bellandur",
    orderSource: "MAGICPIN",
    tableNumber: null,
    specialInstructions: "Less oil in Paneer roll. Extra ginger and cardamom in Masala Chai.",
    status: "PREPARING",
    elapsedMinutes: 9,
    estimatedPrepTimeMinutes: 15,
    urgencyLevel: "NORMAL",
    createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
    items: [
      { foodName: "Paneer Makhani Roll", quantity: 2 },
      { foodName: "Masala Chai", quantity: 2 }
    ]
  },
  {
    orderId: 104,
    customerName: "Vikram Malhotra",
    phone: "9911223344",
    address: "Tower 5, Apt 1102, Cyber City, Gurugram",
    orderSource: "DIRECT",
    tableNumber: null,
    specialInstructions: "Load extra jalapenos & cheese dip on the Nachos. Well-done patties for burgers.",
    status: "READY",
    elapsedMinutes: 21,
    estimatedPrepTimeMinutes: 20,
    urgencyLevel: "NORMAL",
    createdAt: new Date(Date.now() - 21 * 60000).toISOString(),
    items: [
      { foodName: "Classic Truffle Smash Burger", quantity: 2 },
      { foodName: "Loaded Cheese Nachos", quantity: 1 }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initSoundPreferences();
  initVoices();
  startLiveClock();
  loadKitchenOrders();

  // Poll orders every 6 seconds
  setInterval(loadKitchenOrders, 6000);

  // Check for overdue tickets every 25 seconds
  setInterval(checkOverdueTickets, 25000);
});

/**
 * Voice Engine Initialization
 */
function initVoices() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      populateVoiceDropdown();
    };
    populateVoiceDropdown();
  }
}

function populateVoiceDropdown() {
  const selVoice = document.getElementById('selVoice');
  if (!selVoice || !('speechSynthesis' in window)) return;

  const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  if (voices.length === 0) return;

  selVoice.innerHTML = '<option value="">Auto-Detect High-Clarity Voice</option>';

  voices.forEach(voice => {
    const opt = document.createElement('option');
    opt.value = voice.voiceURI;
    const isQuality = voice.name.includes('Natural') || voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Premium');
    opt.textContent = `${voice.name} (${voice.lang}) ${isQuality ? '★' : ''}`;
    selVoice.appendChild(opt);
  });

  if (selectedVoiceURI) {
    selVoice.value = selectedVoiceURI;
  }
}

function getBestVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (selectedVoiceURI) {
    const matched = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (matched) return matched;
  }

  // Preferred list of clear voices
  const preferred = ['Samantha', 'Karen', 'Daniel', 'Serena', 'Google US English', 'Google UK English', 'Moira', 'Rishi', 'Veena'];
  for (const name of preferred) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }

  return voices.find(v => v.lang.startsWith('en')) || voices[0];
}

/**
 * Live Digital Clock
 */
function startLiveClock() {
  const clockEl = document.getElementById('kdsClock');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
    }
  };
  update();
  setInterval(update, 1000);
}

/**
 * Load Kitchen Orders from REST API (or fallback to demo data)
 */
async function loadKitchenOrders() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE}/orders/kitchen`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Status: ' + res.status);
    const data = await res.json();

    isOfflineMode = false;
    detectNewOrdersAndAlert(data);
    kitchenOrders = data;
    renderKitchenBoard(kitchenOrders);

    if (activeModalOrderId) {
      const activeOrder = kitchenOrders.find(o => o.orderId === activeModalOrderId);
      if (activeOrder) renderOrderDetailContent(activeOrder);
    }

  } catch (err) {
    // Fallback quietly to demo orders
    if (!isOfflineMode && kitchenOrders.length === 0) {
      isOfflineMode = true;
      kitchenOrders = JSON.parse(JSON.stringify(DEMO_ORDERS));
      renderKitchenBoard(kitchenOrders);
    } else if (isOfflineMode) {
      renderKitchenBoard(kitchenOrders);
    }
  }
}

/**
 * Detect new orders and trigger acoustic & channel-aware voice alert
 */
function detectNewOrdersAndAlert(orders) {
  const currentIds = new Set(orders.map(o => o.orderId));
  const newIncoming = orders.filter(o => !previousOrderIds.has(o.orderId) && (o.status === 'PLACED' || o.status === 'CONFIRMED'));

  if (previousOrderIds.size > 0 && newIncoming.length > 0) {
    const firstNew = newIncoming[0];
    triggerSectionAlert('NEW_ORDER', firstNew.orderId, firstNew.orderSource, firstNew.tableNumber);
  }

  previousOrderIds = currentIds;
}

/**
 * Check for overdue orders to protect customer satisfaction
 */
function checkOverdueTickets() {
  kitchenOrders.forEach(order => {
    const elapsed = order.elapsedMinutes !== undefined ? order.elapsedMinutes : calculateElapsed(order.createdAt);
    const target = order.estimatedPrepTimeMinutes || 18;

    if (elapsed > target && !alertedOverdueOrders.has(order.orderId) && order.status !== 'READY') {
      alertedOverdueOrders.add(order.orderId);
      triggerSectionAlert('OVERDUE_ALERT', order.orderId, order.orderSource, order.tableNumber);
    }
  });
}

/**
 * Channel Filtering
 */
function filterByChannel(channel) {
  currentChannelFilter = channel;

  const tabs = document.querySelectorAll('.channel-tab');
  tabs.forEach(tab => {
    if (tab.dataset.channel === channel) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  renderKitchenBoard(kitchenOrders);
}

function updateChannelCounts(orders) {
  const counts = {
    ALL: orders.length,
    DINE_IN: 0,
    ZOMATO: 0,
    SWIGGY: 0,
    MAGICPIN: 0,
    DIRECT: 0,
    TAKEAWAY: 0
  };

  orders.forEach(o => {
    const src = normalizeSource(o.orderSource);
    if (counts[src] !== undefined) {
      counts[src]++;
    }
  });

  const setBadge = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setBadge('countAll', counts.ALL);
  setBadge('countDineIn', counts.DINE_IN);
  setBadge('countZomato', counts.ZOMATO);
  setBadge('countSwiggy', counts.SWIGGY);
  setBadge('countMagicpin', counts.MAGICPIN);
  setBadge('countDirect', counts.DIRECT);
  setBadge('countTakeaway', counts.TAKEAWAY);
}

function normalizeSource(source) {
  if (!source) return 'DIRECT';
  const s = String(source).toUpperCase().trim();
  if (s.includes('ZOMATO')) return 'ZOMATO';
  if (s.includes('SWIGGY')) return 'SWIGGY';
  if (s.includes('MAGICPIN')) return 'MAGICPIN';
  if (s.includes('DINE') || s.includes('TABLE')) return 'DINE_IN';
  if (s.includes('TAKE') || s.includes('PICKUP')) return 'TAKEAWAY';
  return 'DIRECT';
}

/**
 * Channel Badge Generator with Official Logos
 */
function getChannelBadgeHtml(order) {
  const src = normalizeSource(order.orderSource);
  const table = order.tableNumber;

  switch (src) {
    case 'ZOMATO':
      return `
        <span class="kds-channel-badge badge-zomato">
          <span class="brand-logo-icon zomato-icon">Z</span>
          <span>Zomato</span>
        </span>
      `;
    case 'SWIGGY':
      return `
        <span class="kds-channel-badge badge-swiggy">
          <span class="brand-logo-icon swiggy-icon">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2C8.69 2 6 4.69 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.31-2.69-6-6-6zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 5.5 12 5.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </span>
          <span>Swiggy</span>
        </span>
      `;
    case 'MAGICPIN':
      return `
        <span class="kds-channel-badge badge-magicpin">
          <span class="brand-logo-icon magicpin-icon">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2a6 6 0 0 0-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 0 0-6-6zm0 8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"/></svg>
          </span>
          <span>Magicpin</span>
        </span>
      `;
    case 'DINE_IN':
      return `
        <span class="kds-channel-badge badge-dinein">
          <img src="../customer/images/logo.png" class="badge-logo-img" alt="Harvest Kitchen">
          <span>Dine-In ${table ? '• ' + escapeHtml(table) : ''}</span>
        </span>
      `;
    case 'TAKEAWAY':
      return `
        <span class="kds-channel-badge badge-takeaway">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>Takeaway</span>
        </span>
      `;
    case 'DIRECT':
    default:
      return `
        <span class="kds-channel-badge badge-direct">
          <img src="../customer/images/logo.png" class="badge-logo-img" alt="Harvest Kitchen">
          <span>Direct Website</span>
        </span>
      `;
  }
}

function getChannelSpeechName(orderSource, tableNumber) {
  const src = normalizeSource(orderSource);
  switch (src) {
    case 'ZOMATO': return 'Zomato';
    case 'SWIGGY': return 'Swiggy';
    case 'MAGICPIN': return 'Magicpin';
    case 'DINE_IN': return tableNumber ? `Dine in ${tableNumber}` : 'Dine in';
    case 'TAKEAWAY': return 'Takeaway';
    case 'DIRECT':
    default:
      return 'Direct';
  }
}

/**
 * Unified Alert Trigger (Chime + Channel-Specific Speech + Toast)
 */
function triggerSectionAlert(type, orderId = 108, orderSource = 'DIRECT', tableNumber = null) {
  playSectionSound(type);

  const formattedDigits = formatDigitsForClearSpeech(orderId);
  const channelName = getChannelSpeechName(orderSource, tableNumber);

  switch (type) {
    case 'NEW_ORDER':
      showToast(`New ${channelName} Order #${orderId} received`, 'toast-blue');
      setTimeout(() => speakVoiceAnnouncement(`New ${channelName} order. Number ${formattedDigits}.`), 300);
      break;

    case 'START_COOKING':
      showToast(`${channelName} Order #${orderId} moved to Cooking`, 'toast-amber');
      setTimeout(() => speakVoiceAnnouncement(`${channelName} order ${formattedDigits}. Cooking started.`), 200);
      break;

    case 'ORDER_READY':
      showToast(`${channelName} Order #${orderId} is Ready for Pickup`, 'toast-green');
      setTimeout(() => speakVoiceAnnouncement(`${channelName} order ${formattedDigits}, is ready for pickup.`), 400);
      break;

    case 'DISPATCHED':
      showToast(`Order #${orderId} Dispatched`, 'toast-red');
      setTimeout(() => speakVoiceAnnouncement(`${channelName} order ${formattedDigits}, dispatched.`), 250);
      break;

    case 'OVERDUE_ALERT':
      showToast(`Priority: ${channelName} Order #${orderId} is Overdue`, 'toast-red');
      setTimeout(() => speakVoiceAnnouncement(`Attention kitchen. ${channelName} order ${formattedDigits}, is overdue.`), 300);
      break;
  }
}

function formatDigitsForClearSpeech(orderId) {
  if (!orderId) return '';
  return String(orderId).split('').join(', ');
}

function speakVoiceAnnouncement(text) {
  if (!voiceAnnouncementEnabled || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const chosenVoice = getBestVoice();

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.rate = voiceRate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Graceful fallback
  }
}

function testVoiceClarity() {
  triggerSectionAlert('NEW_ORDER', 108, 'ZOMATO');
}

/**
 * Manual Refresh
 */
function manualRefresh() {
  const refreshBtn = document.getElementById('btnRefreshKds');
  if (refreshBtn) {
    refreshBtn.classList.add('spinning');
    setTimeout(() => refreshBtn.classList.remove('spinning'), 700);
  }
  loadKitchenOrders();
}

/**
 * Render Board with Filtered Columns
 */
function renderKitchenBoard(orders) {
  updateChannelCounts(orders);

  // Filter orders by active channel tab
  let filtered = orders;
  if (currentChannelFilter !== 'ALL') {
    filtered = orders.filter(o => normalizeSource(o.orderSource) === currentChannelFilter);
  }

  const listPlaced = document.getElementById('listPlaced');
  const listPreparing = document.getElementById('listPreparing');
  const listReady = document.getElementById('listReady');

  const countPlaced = document.getElementById('countPlaced');
  const countPreparing = document.getElementById('countPreparing');
  const countReady = document.getElementById('countReady');
  const activeTotal = document.getElementById('kdsActiveTotal');
  const speedTarget = document.getElementById('kdsSpeedTarget');

  const placedOrders = filtered.filter(o => o.status === 'PLACED' || o.status === 'CONFIRMED');
  const prepOrders = filtered.filter(o => o.status === 'PREPARING');
  const readyOrders = filtered.filter(o => o.status === 'READY');

  if (activeTotal) activeTotal.textContent = filtered.length;
  if (countPlaced) countPlaced.textContent = placedOrders.length;
  if (countPreparing) countPreparing.textContent = prepOrders.length;
  if (countReady) countReady.textContent = readyOrders.length;

  if (speedTarget) {
    const activeCooking = prepOrders.length + placedOrders.length;
    const estMinutes = 15 + (activeCooking * 2);
    speedTarget.textContent = `Prep: ~${estMinutes}m Target`;
  }

  // Render Placed / Incoming
  if (listPlaced) {
    if (placedOrders.length === 0) {
      listPlaced.innerHTML = `
        <div class="kds-empty-state">
          <div class="empty-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          </div>
          <h4>No Incoming Orders</h4>
          <p>New tickets from Zomato, Swiggy, Dine-In &amp; Direct will appear here</p>
        </div>`;
    } else {
      listPlaced.innerHTML = placedOrders.map(o => createTicketCard(o, 'PLACED')).join('');
    }
  }

  // Render Preparing
  if (listPreparing) {
    if (prepOrders.length === 0) {
      listPreparing.innerHTML = `
        <div class="kds-empty-state">
          <div class="empty-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </div>
          <h4>Kitchen Is Clear</h4>
          <p>Drag tickets here or click "Start Cooking" to begin</p>
        </div>`;
    } else {
      listPreparing.innerHTML = prepOrders.map(o => createTicketCard(o, 'PREPARING')).join('');
    }
  }

  // Render Ready
  if (listReady) {
    if (readyOrders.length === 0) {
      listReady.innerHTML = `
        <div class="kds-empty-state">
          <div class="empty-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4>No Orders Waiting</h4>
          <p>Dishes ready for delivery rider or table service</p>
        </div>`;
    } else {
      listReady.innerHTML = readyOrders.map(o => createTicketCard(o, 'READY')).join('');
    }
  }
}

/**
 * Generate Ticket Card HTML with Click to Open Details & Drag Support
 */
function createTicketCard(order, columnType) {
  const elapsed = order.elapsedMinutes !== undefined ? order.elapsedMinutes : calculateElapsed(order.createdAt);
  const target = order.estimatedPrepTimeMinutes || 18;

  let timerClass = 'timer-normal';
  let cardClass = '';
  let priorityTagHtml = '';

  if (elapsed > target || order.urgencyLevel === 'OVERDUE') {
    timerClass = 'timer-overdue';
    cardClass = 'overdue';
    priorityTagHtml = `
      <span class="kds-priority-tag tag-priority">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Priority</span>
      </span>
    `;
  } else if (elapsed > 12 || order.urgencyLevel === 'URGENT') {
    timerClass = 'timer-urgent';
    cardClass = 'urgent';
    priorityTagHtml = `
      <span class="kds-priority-tag tag-rush">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>Rush</span>
      </span>
    `;
  }

  const channelBadgeHtml = getChannelBadgeHtml(order);

  // Special Request Note Banner on card
  let noteBadgeHtml = '';
  if (order.specialInstructions) {
    noteBadgeHtml = `
      <div class="kds-card-note" title="${escapeHtml(order.specialInstructions)}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Note: ${escapeHtml(order.specialInstructions.length > 34 ? order.specialInstructions.substring(0, 34) + '...' : order.specialInstructions)}</span>
      </div>
    `;
  }

  const itemsHtml = (order.items || []).map((item, index) => {
    const itemKey = `${order.orderId}_${index}`;
    const isDone = completedItemMap[itemKey] ? 'completed' : '';
    return `
      <div class="kds-item-row ${isDone}" onclick="event.stopPropagation(); toggleItemPlated('${itemKey}', this)">
        <span class="kds-item-qty">${item.quantity}&times;</span>
        <span class="kds-item-name">${escapeHtml(item.foodName)}</span>
        <span class="kds-item-check">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      </div>
    `;
  }).join('');

  let actionBtnHtml = '';
  if (columnType === 'PLACED') {
    actionBtnHtml = `
      <button onclick="event.stopPropagation(); handleCookingStart(${order.orderId}, '${order.orderSource || 'DIRECT'}', '${order.tableNumber || ''}')" class="kds-action-btn btn-prep">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        <span>Start Cooking</span>
      </button>
    `;
  } else if (columnType === 'PREPARING') {
    actionBtnHtml = `
      <button onclick="event.stopPropagation(); handleMarkReady(${order.orderId}, '${order.orderSource || 'DIRECT'}', '${order.tableNumber || ''}')" class="kds-action-btn btn-ready">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Mark Ready</span>
      </button>
    `;
  } else if (columnType === 'READY') {
    actionBtnHtml = `
      <button onclick="event.stopPropagation(); handleDispatch(${order.orderId}, '${order.orderSource || 'DIRECT'}', '${order.tableNumber || ''}')" class="kds-action-btn btn-dispatch">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/></svg>
        <span>Dispatch Order</span>
      </button>
    `;
  }

  const orderTimeStr = order.createdAt ? formatTime(order.createdAt) : '';

  return `
    <div class="kds-ticket ${cardClass}" 
         id="ticket-${order.orderId}" 
         draggable="true" 
         ondragstart="onTicketDragStart(event, ${order.orderId})" 
         ondragend="onTicketDragEnd(event)"
         onclick="openOrderDetailModal(${order.orderId})">
      
      <div class="kds-ticket-head">
        <div class="kds-ticket-id-wrap">
          <span class="kds-drag-handle" title="Drag ticket to another column">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
          </span>
          <div class="kds-order-id">#${order.orderId}</div>
          ${channelBadgeHtml}
          ${priorityTagHtml}
        </div>
        <div class="kds-timer ${timerClass}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${elapsed}m / ${target}m</span>
        </div>
      </div>

      <div class="kds-ticket-body">
        <div class="kds-customer-row">
          <span class="kds-customer-name">${escapeHtml(order.customerName || 'Customer')}</span>
          ${orderTimeStr ? `<span class="kds-order-time">${orderTimeStr}</span>` : ''}
        </div>
        ${noteBadgeHtml}
        <div class="kds-items-list">
          ${itemsHtml}
        </div>
      </div>

      <div class="kds-ticket-foot">
        ${actionBtnHtml}
      </div>
    </div>
  `;
}

/* =========================================================
   Order Detail Modal & Plating System
   ========================================================= */

function openOrderDetailModal(orderId) {
  activeModalOrderId = orderId;
  const order = kitchenOrders.find(o => o.orderId === orderId);
  if (!order) return;

  renderOrderDetailContent(order);

  const modal = document.getElementById('orderDetailModal');
  if (modal) modal.style.display = 'flex';
}

function renderOrderDetailContent(order) {
  const elapsed = order.elapsedMinutes !== undefined ? order.elapsedMinutes : calculateElapsed(order.createdAt);
  const target = order.estimatedPrepTimeMinutes || 18;

  // Header Elements
  const modalOrderId = document.getElementById('modalOrderId');
  const modalOrderChannelBadge = document.getElementById('modalOrderChannelBadge');
  const modalOrderPriorityBadge = document.getElementById('modalOrderPriorityBadge');
  const modalOrderTimer = document.getElementById('modalOrderTimer');

  if (modalOrderId) modalOrderId.textContent = `#${order.orderId}`;
  if (modalOrderChannelBadge) modalOrderChannelBadge.innerHTML = getChannelBadgeHtml(order);

  if (modalOrderPriorityBadge) {
    if (elapsed > target || order.urgencyLevel === 'OVERDUE') {
      modalOrderPriorityBadge.innerHTML = `
        <span class="kds-priority-tag tag-priority">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>Priority Alert</span>
        </span>
      `;
    } else if (elapsed > 12 || order.urgencyLevel === 'URGENT') {
      modalOrderPriorityBadge.innerHTML = `
        <span class="kds-priority-tag tag-rush">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Rush</span>
        </span>
      `;
    } else {
      modalOrderPriorityBadge.innerHTML = '';
    }
  }

  if (modalOrderTimer) {
    let timerClass = 'timer-normal';
    if (elapsed > target) timerClass = 'timer-overdue';
    else if (elapsed > 12) timerClass = 'timer-urgent';
    modalOrderTimer.className = `kds-timer ${timerClass}`;
    modalOrderTimer.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>${elapsed}m / ${target}m</span>`;
  }

  // Special Request Box
  const specialBox = document.getElementById('modalSpecialInstructionWrap');
  const specialText = document.getElementById('modalSpecialInstructionText');
  if (specialBox && specialText) {
    if (order.specialInstructions && order.specialInstructions.trim()) {
      specialBox.style.display = 'flex';
      specialText.textContent = `"${order.specialInstructions}"`;
    } else {
      specialBox.style.display = 'none';
    }
  }

  // Meta Grid
  const modalCustName = document.getElementById('modalCustomerName');
  const modalCustPhone = document.getElementById('modalCustomerPhone');
  const modalCustAddress = document.getElementById('modalCustomerAddress');
  const modalOrderTime = document.getElementById('modalOrderTime');

  if (modalCustName) modalCustName.textContent = order.customerName || 'Customer';
  if (modalCustPhone) modalCustPhone.textContent = order.phone || '-';
  if (modalCustAddress) modalCustAddress.textContent = order.address || (order.tableNumber ? `${order.tableNumber} (Dine-In)` : 'Counter Handover');
  if (modalOrderTime) modalOrderTime.textContent = order.createdAt ? formatTime(order.createdAt) : '-';

  // Items Checklist
  const modalItemsList = document.getElementById('modalItemsList');
  if (modalItemsList) {
    modalItemsList.innerHTML = (order.items || []).map((item, index) => {
      const itemKey = `${order.orderId}_${index}`;
      const isDone = completedItemMap[itemKey] ? 'completed' : '';
      return `
        <div class="modal-item-card ${isDone}" onclick="toggleModalItemPlated('${itemKey}', this)">
          <span class="modal-item-qty">${item.quantity}&times;</span>
          <span class="modal-item-name">${escapeHtml(item.foodName)}</span>
          <div class="modal-item-checkbox">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      `;
    }).join('');
  }

  // Footer Action Container: Make Ready / Start Cooking / Dispatch
  const modalActionContainer = document.getElementById('modalActionContainer');
  if (modalActionContainer) {
    if (order.status === 'PLACED' || order.status === 'CONFIRMED') {
      modalActionContainer.innerHTML = `
        <button class="btn-modal-action action-prep" onclick="startCookingFromModal(${order.orderId})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          <span>Start Cooking</span>
        </button>
      `;
    } else if (order.status === 'PREPARING') {
      modalActionContainer.innerHTML = `
        <button class="btn-modal-action action-ready" onclick="markReadyFromModal(${order.orderId})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Mark Ready</span>
        </button>
      `;
    } else if (order.status === 'READY') {
      modalActionContainer.innerHTML = `
        <button class="btn-modal-action action-dispatch" onclick="dispatchFromModal(${order.orderId})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/></svg>
          <span>Dispatch Order</span>
        </button>
      `;
    } else {
      modalActionContainer.innerHTML = '';
    }
  }
}

function toggleModalItemPlated(itemKey, el) {
  completedItemMap[itemKey] = !completedItemMap[itemKey];
  if (completedItemMap[itemKey]) {
    el.classList.add('completed');
  } else {
    el.classList.remove('completed');
  }
  renderKitchenBoard(kitchenOrders);
}

function startCookingFromModal(orderId) {
  const order = kitchenOrders.find(o => o.orderId === orderId);
  handleCookingStart(orderId, order ? order.orderSource : 'DIRECT', order ? order.tableNumber : null);
  closeOrderDetailModal();
}

function markReadyFromModal(orderId) {
  const order = kitchenOrders.find(o => o.orderId === orderId);
  handleMarkReady(orderId, order ? order.orderSource : 'DIRECT', order ? order.tableNumber : null);
  closeOrderDetailModal();
}

function dispatchFromModal(orderId) {
  const order = kitchenOrders.find(o => o.orderId === orderId);
  handleDispatch(orderId, order ? order.orderSource : 'DIRECT', order ? order.tableNumber : null);
  closeOrderDetailModal();
}

function closeOrderDetailModal() {
  activeModalOrderId = null;
  const modal = document.getElementById('orderDetailModal');
  if (modal) modal.style.display = 'none';
}

function closeOrderDetailModalOnBackdrop(e) {
  if (e.target.id === 'orderDetailModal') closeOrderDetailModal();
}

/* =========================================================
   Drag and Drop Handlers
   ========================================================= */

function onTicketDragStart(e, orderId) {
  draggedOrderId = orderId;
  e.dataTransfer.setData('text/plain', String(orderId));
  e.dataTransfer.effectAllowed = 'move';

  const ticketEl = document.getElementById(`ticket-${orderId}`);
  if (ticketEl) {
    setTimeout(() => ticketEl.classList.add('dragging'), 0);
  }
}

function onTicketDragEnd(e) {
  draggedOrderId = null;
  document.querySelectorAll('.kds-ticket').forEach(t => t.classList.remove('dragging'));
  document.querySelectorAll('.kds-column').forEach(c => c.classList.remove('drag-over'));
}

function onColumnDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const col = e.currentTarget;
  if (col && !col.classList.contains('drag-over')) {
    col.classList.add('drag-over');
  }
}

function onColumnDragLeave(e) {
  const col = e.currentTarget;
  if (e.relatedTarget && !col.contains(e.relatedTarget)) {
    col.classList.remove('drag-over');
  }
}

function onColumnDrop(e, targetStatus) {
  e.preventDefault();
  const col = e.currentTarget;
  if (col) col.classList.remove('drag-over');

  const rawId = e.dataTransfer.getData('text/plain') || draggedOrderId;
  if (!rawId) return;

  const orderId = parseInt(rawId, 10);
  const order = kitchenOrders.find(o => o.orderId === orderId);
  if (!order) return;

  if (order.status === targetStatus) return;

  if (targetStatus === 'PREPARING') {
    handleCookingStart(orderId, order.orderSource, order.tableNumber);
  } else if (targetStatus === 'READY') {
    handleMarkReady(orderId, order.orderSource, order.tableNumber);
  } else if (targetStatus === 'PLACED') {
    showToast(`Order #${orderId} moved back to Incoming`, 'toast-blue');
    updateOrderStatus(orderId, 'PLACED');
  }
}

/**
 * Item Strike-through
 */
function toggleItemPlated(itemKey, el) {
  completedItemMap[itemKey] = !completedItemMap[itemKey];
  if (completedItemMap[itemKey]) {
    el.classList.add('completed');
  } else {
    el.classList.remove('completed');
  }
}

/**
 * Action Handlers
 */
function handleCookingStart(orderId, orderSource, tableNumber) {
  triggerSectionAlert('START_COOKING', orderId, orderSource, tableNumber);
  updateOrderStatus(orderId, 'PREPARING');
}

function handleMarkReady(orderId, orderSource, tableNumber) {
  triggerSectionAlert('ORDER_READY', orderId, orderSource, tableNumber);
  updateOrderStatus(orderId, 'READY');
}

function handleDispatch(orderId, orderSource, tableNumber) {
  triggerSectionAlert('DISPATCHED', orderId, orderSource, tableNumber);
  updateOrderStatus(orderId, 'OUT_FOR_DELIVERY');
}

/**
 * Update Order Status
 */
async function updateOrderStatus(orderId, newStatus) {
  if (isOfflineMode) {
    const order = kitchenOrders.find(o => o.orderId === orderId);
    if (order) {
      if (newStatus === 'OUT_FOR_DELIVERY' || newStatus === 'DELIVERED') {
        kitchenOrders = kitchenOrders.filter(o => o.orderId !== orderId);
      } else {
        order.status = newStatus;
      }
      renderKitchenBoard(kitchenOrders);
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Status update failed');
    }
    loadKitchenOrders();
  } catch (err) {
    console.error('KDS Order update error:', err);
    showToast('Error updating order: ' + err.message, 'toast-red');
  }
}

/* =========================================================
   Acoustic Sound Engine (Web Audio API Synthesizer)
   ========================================================= */

function playSectionSound(soundType) {
  if (!masterSoundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    switch (soundType) {

      // 1. Incoming Order: Cheerful 3-Note Ascending Chime (C5, E5, G5)
      case 'NEW_ORDER': {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + (i * 0.14);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.28, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.5);
        });
        break;
      }

      // 2. Start Cooking: Affirmative rising frequency blip
      case 'START_COOKING': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      // 3. Order Ready: Authentic High-Resonance Service Bell (Ding!)
      case 'ORDER_READY': {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318.51, now);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 1.2);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2637.02, now);
        gain2.gain.setValueAtTime(0.18, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.7);
        break;
      }

      // 4. Dispatched / Delivered: Smooth positive two-note harmonic
      case 'DISPATCHED': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.00, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      // 5. Overdue / Priority Warning: Dual Warning Pulse
      case 'OVERDUE_ALERT': {
        [0, 0.22].forEach(delay => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const pulseTime = now + delay;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, pulseTime);
          osc.frequency.setValueAtTime(370, pulseTime + 0.08);

          gain.gain.setValueAtTime(0.2, pulseTime);
          gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(pulseTime);
          osc.stop(pulseTime + 0.18);
        });
        break;
      }
    }
  } catch (e) {
    // AudioContext policy
  }
}

/**
 * Toast Notification Popup (No Emojis, Clean Vector Icon Style)
 */
function showToast(message, typeClass = 'toast-blue') {
  const container = document.getElementById('kdsToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `kds-toast ${typeClass}`;
  toast.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* =========================================================
   Sound Modal & Preference Controls
   ========================================================= */

function initSoundPreferences() {
  const storedMaster = localStorage.getItem('kds_master_sound');
  const storedVoice = localStorage.getItem('kds_voice_announce');
  const storedVoiceURI = localStorage.getItem('kds_voice_uri');
  const storedRate = localStorage.getItem('kds_voice_rate');

  if (storedMaster !== null) masterSoundEnabled = storedMaster === 'true';
  if (storedVoice !== null) voiceAnnouncementEnabled = storedVoice === 'true';
  if (storedVoiceURI !== null) selectedVoiceURI = storedVoiceURI;
  if (storedRate !== null) voiceRate = parseFloat(storedRate);

  const chkMaster = document.getElementById('chkSoundMaster');
  const chkVoice = document.getElementById('chkVoiceAnnounce');
  const rngSpeed = document.getElementById('rngVoiceSpeed');
  const lblSpeed = document.getElementById('lblSpeed');

  if (chkMaster) chkMaster.checked = masterSoundEnabled;
  if (chkVoice) chkVoice.checked = voiceAnnouncementEnabled;
  if (rngSpeed) rngSpeed.value = voiceRate;
  if (lblSpeed) lblSpeed.textContent = `${voiceRate.toFixed(2)}×`;

  updateSoundUI();
}

function toggleMasterSound(val) {
  masterSoundEnabled = val;
  localStorage.setItem('kds_master_sound', masterSoundEnabled);
  updateSoundUI();
  if (masterSoundEnabled) playSectionSound('NEW_ORDER');
}

function toggleVoiceAnnouncement(val) {
  voiceAnnouncementEnabled = val;
  localStorage.setItem('kds_voice_announce', voiceAnnouncementEnabled);
  if (voiceAnnouncementEnabled) {
    speakVoiceAnnouncement("Voice announcements active");
  }
}

function onVoiceSelectChange(val) {
  selectedVoiceURI = val;
  localStorage.setItem('kds_voice_uri', selectedVoiceURI);
  speakVoiceAnnouncement("Voice accent updated");
}

function onVoiceRateChange(val) {
  voiceRate = parseFloat(val);
  localStorage.setItem('kds_voice_rate', voiceRate);
  const lblSpeed = document.getElementById('lblSpeed');
  if (lblSpeed) lblSpeed.textContent = `${voiceRate.toFixed(2)}×`;
}

function updateSoundUI() {
  const iconOn = document.getElementById('soundIconOn');
  const iconOff = document.getElementById('soundIconOff');
  if (iconOn && iconOff) {
    iconOn.style.display = masterSoundEnabled ? 'block' : 'none';
    iconOff.style.display = masterSoundEnabled ? 'none' : 'block';
  }
}

function openSoundModal() {
  const modal = document.getElementById('soundModal');
  if (modal) modal.style.display = 'flex';
  populateVoiceDropdown();
}

function closeSoundModal() {
  const modal = document.getElementById('soundModal');
  if (modal) modal.style.display = 'none';
}

function closeSoundModalOnBackdrop(e) {
  if (e.target.id === 'soundModal') closeSoundModal();
}

/**
 * Fullscreen Mode Toggle
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

/**
 * Helper Utilities
 */
function calculateElapsed(createdAt) {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const diff = Date.now() - created.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
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
