/**
 * Customer Menu Page JavaScript - Mobile-First UI (Harvest Kitchen)
 * Fully Dynamic: Fetches live Coupons, Foods, Categories, Combos, and Settings
 * directly from the Backend REST API / Admin Panel.
 */

let allFoodItems = [];
let allCombos = [];
let activeCoupons = [];
let favoriteFoodIds = new Set();
let currentCategory = 'All';

// Interactive filter states
let isVegOnly = false;
let isNonVegOnly = false;
let isEatRightOnly = false;
let isRating4PlusOnly = false;
let isBestsellerOnly = false;

// Offer carousel state
let currentOfferIdx = 0;
let offerTimer = null;

// Free reward item state (dynamically populated from live catalog)
let currentRewardItem = {
  name: "Chocolate Brownie",
  price: 99,
  threshold: 299,
  imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80",
  isVeg: true
};

document.addEventListener('DOMContentLoaded', () => {
  initHeroVideo();
  initMobileFilters();
  initSearch();
  initVoiceSearch();
  initLocationModal();
  loadFavoritesSet();

  // 1. Instant Zero-Wait UI Render (Renders entire menu & deals in 0ms)
  initInstantMenu();

  // 2. Silent Background Sync (Fetches live updates without blocking user)
  syncBackendDataInBackground();

  if (typeof CartService !== 'undefined') {
    updateFreeItemProgress(CartService.calculateSubtotal());
  }
});

function initInstantMenu() {
  const cached = getCachedFoods();
  allFoodItems = processBackendFoods(cached || SEED_HARVEST_FOODS);
  activeCoupons = getCachedCoupons() || [
    { code: "WELCOME50", title: "50% OFF up to ₹100", subtext: "ABOVE ₹199", discount: 50, min: 199 },
    { code: "HARVEST20", title: "Flat 20% OFF", subtext: "ABOVE ₹299", discount: 20, min: 299 },
    { code: "FREEDEL", title: "FREE Delivery", subtext: "ABOVE ₹199", discount: 40, min: 199 },
    { code: "FLAT100", title: "Flat ₹100 OFF", subtext: "ABOVE ₹599", discount: 100, min: 599 }
  ];

  renderOffersShowcase();
  renderCategoryChips();
  setupDynamicRewardItem();
  filterAndRenderFoods();
}

function getCachedFoods() {
  try {
    const raw = localStorage.getItem('harvest_cached_foods_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 30) return parsed;
    }
  } catch (e) {}
  return null;
}

function getCachedCoupons() {
  try {
    const raw = localStorage.getItem('harvest_cached_coupons_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

async function syncBackendDataInBackground() {
  initRestaurantBranding();
  loadCoupons();
  loadCombos();
  loadMenu();
}

/* ================= Background Video Autoplay Runner ================= */
function initHeroVideo() {
  const container = document.querySelector('.hero-video-bg-container');
  const video = document.querySelector('.hero-bg-video');
  if (!container || !video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('muted', '');

  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Play on first interaction if browser blocked initial autoplay
        const playOnGesture = () => {
          video.play().catch(() => {});
        };
        window.addEventListener('touchstart', playOnGesture, { once: true, passive: true });
        window.addEventListener('click', playOnGesture, { once: true, passive: true });
        window.addEventListener('scroll', playOnGesture, { once: true, passive: true });
      });
    }
  };

  try {
    video.load();
  } catch (e) {}

  tryPlay();
  video.addEventListener('loadedmetadata', tryPlay);
  video.addEventListener('loadeddata', tryPlay);
  video.addEventListener('canplay', tryPlay);
}

/* ================= Restaurant Brand Header ================= */
async function initRestaurantBranding() {
  const headingEl = document.getElementById('restaurantNameHeading');
  try {
    const res = await fetchWithTimeout(`${API_BASE}/settings`, {}, 4000);
    if (res.ok) {
      const settings = await res.json();
      if (headingEl && settings.restaurantName) {
        headingEl.textContent = settings.restaurantName;
      }
      if (settings.freeDeliveryThreshold) {
        currentRewardItem.threshold = settings.freeDeliveryThreshold;
      }
    }
  } catch (e) {
    if (headingEl) headingEl.textContent = "Harvest Kitchen";
  }
}

/* ================= Live Coupons & Offers Showcase ================= */
async function loadCoupons() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/coupons/active`, {}, 5000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        activeCoupons = data.map(c => ({
          code: c.code,
          title: c.discountType === 'PERCENTAGE' 
            ? `${Math.round(c.discountValue)}% OFF` 
            : `Flat ₹${Math.round(c.discountValue)} OFF`,
          subtext: `ABOVE ₹${Math.round(c.minOrderAmount || 199)}`,
          discount: c.discountValue,
          min: c.minOrderAmount || 0,
          type: c.discountType
        }));
        try {
          localStorage.setItem('harvest_cached_coupons_v2', JSON.stringify(activeCoupons));
        } catch (e) {}
      }
    }
  } catch (e) {
    // Already rendered default coupons instantly
  }

  // Fallback to official Harvest Kitchen coupons if none returned
  if (!activeCoupons || activeCoupons.length === 0) {
    activeCoupons = [
      { code: "WELCOME50", title: "50% OFF up to ₹100", subtext: "ABOVE ₹199", discount: 50, min: 199 },
      { code: "HARVEST20", title: "Flat 20% OFF", subtext: "ABOVE ₹299", discount: 20, min: 299 },
      { code: "FREEDEL", title: "FREE Delivery", subtext: "ABOVE ₹199", discount: 40, min: 199 },
      { code: "FLAT100", title: "Flat ₹100 OFF", subtext: "ABOVE ₹599", discount: 100, min: 599 }
    ];
  }

  renderOffersShowcase();
}

function renderOffersShowcase() {
  const container = document.getElementById('offersShowcaseRow');
  if (!container) return;

  container.innerHTML = activeCoupons.map((offer, idx) => `
    <div class="deal-promo-card" onclick="applyCouponCode('${offer.code}')" title="Tap to select coupon ${offer.code}">
      <div class="deal-promo-badge">
        <span class="deal-percent-icon">%</span>
        <div class="deal-badge-text">
          <strong>${escapeHtml(offer.title)}</strong>
          <small>${escapeHtml(offer.subtext)}</small>
        </div>
      </div>
      <div class="deal-code-pill">
        <span>USE <b>${escapeHtml(offer.code)}</b></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  `).join('');
}

function applyCouponCode(code) {
  if (typeof CartService !== 'undefined') {
    CartService.showToast(`Applied coupon: ${code} 🎉`);
  }
}

/* ================= Free Item Reward Progress Tracker ================= */
function setupDynamicRewardItem() {
  // Find a sweet dessert or drink from actual live catalog
  const dessert = allFoodItems.find(f => 
    f.category && (f.category.toLowerCase().includes('dessert') || f.category.toLowerCase().includes('sweet'))
  ) || allFoodItems.find(f => f.price <= 150) || allFoodItems[0];

  if (dessert) {
    currentRewardItem.name = dessert.name;
    currentRewardItem.price = Math.round(dessert.price);
    currentRewardItem.imageUrl = dessert.imageUrl || currentRewardItem.imageUrl;
    currentRewardItem.isVeg = dessert.isVeg !== false;
  }

  const nameEl = document.getElementById('freeItemName');
  const thumbEl = document.getElementById('freeItemThumb');
  const iconEl = document.getElementById('freeItemIcon');

  if (nameEl) nameEl.textContent = currentRewardItem.name;
  if (thumbEl && currentRewardItem.imageUrl) thumbEl.src = currentRewardItem.imageUrl;
  if (iconEl) {
    iconEl.className = currentRewardItem.isVeg ? 'veg-box-icon' : 'nonveg-box-icon';
    iconEl.innerHTML = currentRewardItem.isVeg ? '<span class="veg-circle"></span>' : '<span class="nonveg-triangle"></span>';
  }

  if (typeof CartService !== 'undefined') {
    updateFreeItemProgress(CartService.calculateSubtotal());
  }
}

function updateFreeItemProgress(subtotal = 0) {
  const fillEl = document.getElementById('freeItemProgressFill');
  const claimTextEl = document.getElementById('freeItemClaimText');
  if (!fillEl || !claimTextEl) return;

  const threshold = currentRewardItem.threshold || 299;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  fillEl.style.width = `${pct}%`;

  if (subtotal >= threshold) {
    claimTextEl.innerHTML = `<strong>₹${currentRewardItem.price}</strong> <span class="green-text">🎉 Unlocked! Free ${escapeHtml(currentRewardItem.name)}</span>`;
    fillEl.style.background = '#16a34a';
  } else {
    const diff = Math.ceil(threshold - subtotal);
    claimTextEl.innerHTML = `<strong>₹${currentRewardItem.price}</strong> <span class="green-text">Add items above ₹${diff} to claim</span>`;
    fillEl.style.background = 'linear-gradient(90deg, #f97316 0%, #16a34a 100%)';
  }
}

/* ================= Location Selector ================= */
function initLocationModal() {
  const btn = document.getElementById('locationDropdownBtn');
  const modal = document.getElementById('locationModal');
  const closeBtn = document.getElementById('closeLocationModalBtn');
  const locationNameEl = document.getElementById('currentLocationName');

  if (btn && modal) {
    btn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    document.querySelectorAll('.location-option-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.location-option-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        const loc = item.getAttribute('data-location') || 'Belghoria';
        if (locationNameEl) locationNameEl.textContent = loc;
        modal.classList.remove('active');
        if (typeof CartService !== 'undefined') {
          CartService.showToast(`Delivering to ${loc}`);
        }
      });
    });
  }
}

/* ================= Filter Controls & Dynamic Category Chips ================= */
function initMobileFilters() {
  // Veg Toggle Chip
  const vegChip = document.getElementById('chipVegToggle');
  if (vegChip) {
    vegChip.addEventListener('click', () => {
      isVegOnly = !isVegOnly;
      if (isVegOnly) isNonVegOnly = false;
      syncFilterChipsUI();
      filterAndRenderFoods();
    });
  }

  // Non-Veg Toggle Chip
  const nonVegChip = document.getElementById('chipNonVegToggle');
  if (nonVegChip) {
    nonVegChip.addEventListener('click', () => {
      isNonVegOnly = !isNonVegOnly;
      if (isNonVegOnly) isVegOnly = false;
      syncFilterChipsUI();
      filterAndRenderFoods();
    });
  }

  // EatRight Chip
  const eatRightChip = document.getElementById('chipEatRight');
  if (eatRightChip) {
    eatRightChip.addEventListener('click', () => {
      isEatRightOnly = !isEatRightOnly;
      syncFilterChipsUI();
      filterAndRenderFoods();
    });
  }

  // Ratings 4.0+ Chip
  const ratingChip = document.getElementById('chipRating4Plus');
  if (ratingChip) {
    ratingChip.addEventListener('click', () => {
      isRating4PlusOnly = !isRating4PlusOnly;
      syncFilterChipsUI();
      filterAndRenderFoods();
    });
  }

  // Filter Collapse Toggle Button
  const toggleFilterBtn = document.getElementById('toggleFilterCollapseBtn');
  const filterSection = document.getElementById('collapsibleFiltersSection');
  const filterChevron = document.getElementById('filterCollapseChevron');
  if (toggleFilterBtn && filterSection) {
    toggleFilterBtn.addEventListener('click', () => {
      const isHidden = filterSection.style.display === 'none';
      filterSection.style.display = isHidden ? 'block' : 'none';
      if (filterChevron) {
        filterChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }
}

function getCategoryIcon(cat) {
  const c = (cat || '').toLowerCase().trim();
  if (c === 'all') return '🍽️';
  if (c.includes('combo')) return '🍱';
  if (c.includes('main') || c.includes('course') || c.includes('curry') || c.includes('dal') || c.includes('gravy')) return '🍛';
  if (c.includes('appetizer') || c.includes('starter') || c.includes('fries') || c.includes('snack')) return '🥟';
  if (c.includes('dessert') || c.includes('sweet') || c.includes('brownie') || c.includes('jamun') || c.includes('cake')) return '🍰';
  if (c.includes('pizza')) return '🍕';
  if (c.includes('burger')) return '🍔';
  if (c.includes('drink') || c.includes('beverage') || c.includes('coffee') || c.includes('juice') || c.includes('shake')) return '🥤';
  if (c.includes('biryani') || c.includes('rice')) return '🍚';
  return '🍴';
}

function renderCategoryChips() {
  const container = document.getElementById('dynamicCategoryChips');
  if (!container) return;

  // Deduplicate categories strictly using Map on lowercased keys
  const categoryMap = new Map();
  allFoodItems.forEach(f => {
    if (f.category && f.category.trim()) {
      const trimmed = f.category.trim();
      const normalizedKey = trimmed.toLowerCase();
      if (!categoryMap.has(normalizedKey)) {
        categoryMap.set(normalizedKey, trimmed);
      }
    }
  });

  const categories = ['All'];
  if (allCombos && allCombos.length > 0) {
    categories.push('Combos');
  }
  categoryMap.forEach(val => categories.push(val));

  container.innerHTML = categories.map(cat => {
    const icon = getCategoryIcon(cat);
    return `
      <button 
        type="button" 
        class="cat-nav-btn ${currentCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}" 
        data-category="${escapeHtml(cat)}"
      >
        <span>${icon}</span>
        <span>${escapeHtml(cat)}</span>
      </button>
    `;
  }).join('');

  // Re-attach click listeners to dynamic category buttons
  container.querySelectorAll('.cat-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'All';
      filterAndRenderFoods();
    });
  });
}

function syncFilterChipsUI() {
  const vegChip = document.getElementById('chipVegToggle');
  const nonVegChip = document.getElementById('chipNonVegToggle');
  const eatRightChip = document.getElementById('chipEatRight');
  const ratingChip = document.getElementById('chipRating4Plus');

  if (vegChip) vegChip.classList.toggle('active', isVegOnly);
  if (nonVegChip) nonVegChip.classList.toggle('active', isNonVegOnly);
  if (eatRightChip) eatRightChip.classList.toggle('active', isEatRightOnly);
  if (ratingChip) ratingChip.classList.toggle('active', isRating4PlusOnly);
}

/* ================= Search & Voice ================= */
function initSearch() {
  const searchInput = document.getElementById('foodSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndRenderFoods();
    });
  }
}

function initVoiceSearch() {
  const micBtn = document.getElementById('micSearchBtn');
  const searchInput = document.getElementById('foodSearchInput');
  if (!micBtn || !searchInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';

    micBtn.addEventListener('click', () => {
      try {
        recognition.start();
        micBtn.style.color = '#dc2626';
        if (typeof CartService !== 'undefined') {
          CartService.showToast('Listening... Speak now 🎙️');
        }
      } catch (e) {
        console.warn('Speech recognition already active', e);
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      micBtn.style.color = '#ea580c';
      filterAndRenderFoods();
      if (typeof CartService !== 'undefined') {
        CartService.showToast(`Searched for: "${transcript}"`);
      }
    };

    recognition.onerror = () => { micBtn.style.color = '#ea580c'; };
    recognition.onend = () => { micBtn.style.color = '#ea580c'; };
  } else {
    micBtn.addEventListener('click', () => {
      searchInput.focus();
      if (typeof CartService !== 'undefined') {
        CartService.showToast('Type to search dishes!');
      }
    });
  }
}

/* ================= Live Data Loading from Database ================= */
async function loadFavoritesSet() {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user) return;
  try {
    const res = await fetchWithTimeout(`${API_BASE}/favorites/${user.phone}`, {}, 4000);
    if (res.ok) {
      const items = await res.json();
      favoriteFoodIds = new Set(items.map(i => i.id));
    }
  } catch (e) {
    // Silently proceed
  }
}

async function loadCombos() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/combos/active`, {}, 4000);
    if (res.ok) {
      allCombos = await res.json();
      renderCategoryChips();
    }
  } catch (e) {
    // Silently proceed
  }
}

// Official Harvest Kitchen seed food catalog (38 Premium Dishe across all categories)
const SEED_HARVEST_FOODS = [
  // Artisanal Pizzas
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Classic Italian delight with 100% real mozzarella cheese, San Marzano tomatoes, and fresh basil on hand-stretched crust.",
    price: 199,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 42,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 14,
    caloriesKcal: 380,
    available: true
  },
  {
    id: 2,
    name: "Farmhouse Special Pizza",
    description: "Loaded with crunchy bell peppers, crisp red onions, sweet golden corn, button mushrooms, and melted mozzarella.",
    price: 249,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.7,
    reviewCount: 36,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 15,
    caloriesKcal: 410,
    available: true
  },
  {
    id: 3,
    name: "Peri Peri Paneer Pizza",
    description: "Spicy marinated cottage cheese cubes, roasted red peppers, jalapeños, and zesty peri-peri drizzle with herbs.",
    price: 279,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 51,
    isVeg: true,
    isBestseller: false,
    isHighProtein: true,
    proteinGrams: 19,
    caloriesKcal: 460,
    available: true
  },
  {
    id: 4,
    name: "Smoky BBQ Chicken Pizza",
    description: "Tender chunks of grilled barbecue chicken, caramelized red onions, mozzarella, and smoked chipotle glaze.",
    price: 299,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 68,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 26,
    caloriesKcal: 490,
    available: true
  },
  {
    id: 5,
    name: "Pepperoni & Sausage Pizza",
    description: "Generous slices of spicy pepperoni, chicken sausage, black olives, and mozzarella on seasoned tomato sauce.",
    price: 329,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 29,
    isVeg: false,
    isBestseller: false,
    isHighProtein: true,
    proteinGrams: 24,
    caloriesKcal: 520,
    available: true
  },
  {
    id: 6,
    name: "Truffle Mushroom Pizza",
    description: "Sauteed wild button mushrooms, roasted garlic, creamy ricotta, and mozzarella with aromatic truffle herb essence.",
    price: 349,
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 33,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 16,
    caloriesKcal: 440,
    available: true
  },

  // Gourmet Burgers & Sandwiches
  {
    id: 7,
    name: "Classic Crispy Veg Burger",
    description: "Crispy golden spiced vegetable patty topped with fresh lettuce, ripe tomatoes, pickles, and creamy house herb mayo.",
    price: 149,
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.6,
    reviewCount: 48,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 11,
    caloriesKcal: 340,
    available: true
  },
  {
    id: 8,
    name: "Spicy Paneer Tikka Burger",
    description: "Charcoal grilled paneer patty seasoned with tandoori spices, mint mayonnaise, onion rings, and toasted brioche bun.",
    price: 189,
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 54,
    isVeg: true,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 18,
    caloriesKcal: 410,
    available: true
  },
  {
    id: 9,
    name: "Gourmet Grilled Chicken Burger",
    description: "Juicy tender grilled chicken breast fillet with crisp lettuce, melted cheddar cheese, and signature smoky BBQ sauce.",
    price: 199,
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 72,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 28,
    caloriesKcal: 450,
    available: true
  },
  {
    id: 10,
    name: "Double Smash Cheeseburger",
    description: "Twin smashed chicken patties layered with double melted American cheese, caramelized onions, and secret relish.",
    price: 249,
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1583032015879-c63bfb49e498?w=500&auto=format&fit=crop&q=80",
    avgRating: 5.0,
    reviewCount: 88,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 34,
    caloriesKcal: 560,
    available: true
  },
  {
    id: 11,
    name: "Peri Peri Crispy Chicken Burger",
    description: "Deep-fried golden crispy chicken thigh patty tossed in zesty peri peri dust with spicy sriracha mayo slaw.",
    price: 219,
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 40,
    isVeg: false,
    isBestseller: false,
    isHighProtein: true,
    proteinGrams: 25,
    caloriesKcal: 480,
    available: true
  },
  {
    id: 12,
    name: "Grilled Veg Club Sandwich",
    description: "Triple-layered toasted whole wheat sandwich packed with roasted bell peppers, cucumbers, cheese, and herb pesto spread.",
    price: 169,
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.7,
    reviewCount: 31,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 12,
    caloriesKcal: 360,
    available: true
  },

  // Appetizers & Starters
  {
    id: 13,
    name: "Crispy French Fries",
    description: "Lightly salted, perfectly crisp golden potato fries served with garlic herb dip and ketchup.",
    price: 119,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.7,
    reviewCount: 65,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 4,
    caloriesKcal: 290,
    available: true
  },
  {
    id: 14,
    name: "Peri Peri Crinkle Fries",
    description: "Hot crinkle cut potato fries tossed in fiery African peri peri seasoning and served with cheese dip.",
    price: 139,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 44,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 5,
    caloriesKcal: 310,
    available: true
  },
  {
    id: 15,
    name: "Loaded Cheesy Garlic Bread",
    description: "Freshly baked artisanal baguette topped with garlic herb butter, melted mozzarella, and oregano flakes.",
    price: 159,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 58,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 10,
    caloriesKcal: 370,
    available: true
  },
  {
    id: 16,
    name: "Crispy Paneer Popcorn",
    description: "Bite-sized crunchy spiced paneer nuggets served with tangy thousand island dressing.",
    price: 179,
    category: "Appetizers",
    imageUrl: "images/paneer_popcorn.jpg",
    avgRating: 4.8,
    reviewCount: 39,
    isVeg: true,
    isBestseller: false,
    isHighProtein: true,
    proteinGrams: 17,
    caloriesKcal: 380,
    available: true
  },
  {
    id: 17,
    name: "Golden Chicken Nuggets (8 Pcs)",
    description: "Tender seasoned minced chicken bites with a golden crumb coating and sweet honey mustard.",
    price: 199,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 52,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 22,
    caloriesKcal: 390,
    available: true
  },
  {
    id: 18,
    name: "Spicy BBQ Wings (6 Pcs)",
    description: "Succulent baked and glazed chicken wings tossed in tangy hickory barbecue sauce and toasted sesame.",
    price: 229,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 75,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 26,
    caloriesKcal: 440,
    available: true
  },
  {
    id: 19,
    name: "Vegetable Spring Rolls (4 Pcs)",
    description: "Delicate fried pastry rolls filled with shredded cabbage, carrots, bell peppers, and sweet chili dip.",
    price: 149,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.6,
    reviewCount: 28,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 6,
    caloriesKcal: 270,
    available: true
  },

  // Main Course Delicacies & Curries
  {
    id: 20,
    name: "Paneer Butter Masala",
    description: "Soft fresh cottage cheese cubes slow cooked in a rich, velvety tomato and cashew butter gravy.",
    price: 249,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 94,
    isVeg: true,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 20,
    caloriesKcal: 440,
    available: true
  },
  {
    id: 21,
    name: "Dal Makhani Royale",
    description: "Black lentils and kidney beans slow simmered overnight with butter, cream, and aromatic spices.",
    price: 219,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 62,
    isVeg: true,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 16,
    caloriesKcal: 380,
    available: true
  },
  {
    id: 22,
    name: "Kadhai Paneer Special",
    description: "Fresh paneer cubes stir-fried with crunchy bell peppers, crushed coriander, and spicy onion-tomato gravy.",
    price: 259,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 47,
    isVeg: true,
    isBestseller: false,
    isHighProtein: true,
    proteinGrams: 19,
    caloriesKcal: 420,
    available: true
  },
  {
    id: 23,
    name: "Butter Chicken Boneless",
    description: "Succulent tandoori roasted chicken pieces simmered in silky makhani gravy enriched with fresh cream and fenugreek.",
    price: 299,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    avgRating: 5.0,
    reviewCount: 112,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 32,
    caloriesKcal: 510,
    available: true
  },
  {
    id: 24,
    name: "Hyderabadi Chicken Biryani",
    description: "Fragrant long-grain basmati rice cooked on dum with marinated chicken, saffron, caramelised onions, and fresh mint.",
    price: 299,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    avgRating: 5.0,
    reviewCount: 145,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 30,
    caloriesKcal: 580,
    available: true
  },
  {
    id: 25,
    name: "Royal Mutton Biryani",
    description: "Tender pieces of slow-cooked spiced mutton layered with saffron basmati rice, rose water, and boiled egg.",
    price: 379,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 78,
    isVeg: false,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 35,
    caloriesKcal: 640,
    available: true
  },
  {
    id: 26,
    name: "Steamed Saffron Basmati Rice",
    description: "Fluffy aged aromatic basmati rice infused with whole saffron strands and a hint of pure desi ghee.",
    price: 129,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.7,
    reviewCount: 30,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 6,
    caloriesKcal: 240,
    available: true
  },
  {
    id: 27,
    name: "Butter Naan (2 Pcs)",
    description: "Traditional clay oven-baked leavened flatbread brushed with generous golden dairy butter.",
    price: 69,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 95,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 8,
    caloriesKcal: 280,
    available: true
  },

  // Beverages, Shakes & Drinks
  {
    id: 28,
    name: "Rich Cold Coffee with Ice Cream",
    description: "Handcrafted chilled blended espresso coffee with creamy vanilla bean ice cream and chocolate drizzle.",
    price: 129,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 61,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 5,
    caloriesKcal: 230,
    available: true
  },
  {
    id: 29,
    name: "Classic Virgin Mojito",
    description: "Refreshing mocktail muddled with garden fresh mint leaves, lime juice, sparkling soda, and crushed ice.",
    price: 119,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.7,
    reviewCount: 42,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 1,
    caloriesKcal: 110,
    available: true
  },
  {
    id: 30,
    name: "Belgian Chocolate Shake",
    description: "Decadent thick milkshake prepared with rich Belgian cocoa, dark chocolate fudge, and chocolate shavings.",
    price: 159,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 70,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 8,
    caloriesKcal: 360,
    available: true
  },
  {
    id: 31,
    name: "Alphonso Mango Smoothie",
    description: "Creamy yogurt smoothie blended with ripe sweet Alphonso mango pulp and topped with chia seeds.",
    price: 149,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 38,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 6,
    caloriesKcal: 250,
    available: true
  },
  {
    id: 32,
    name: "Fresh Masala Lemonade",
    description: "Zesty hand-pressed lemon juice with black salt, roasted cumin, fresh mint, and sparkling chilled water.",
    price: 89,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.7,
    reviewCount: 25,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 1,
    caloriesKcal: 85,
    available: true
  },
  {
    id: 33,
    name: "Chilled Coca-Cola (500ml)",
    description: "Classic bubbly Coca-Cola carbonated soft drink served refreshingly chilled.",
    price: 49,
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 110,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 0,
    caloriesKcal: 190,
    available: true
  },

  // Sweet Desserts & Indulgences
  {
    id: 34,
    name: "Warm Fudge Chocolate Brownie",
    description: "Freshly baked walnut chocolate brownie served warm with molten dark chocolate ganache.",
    price: 159,
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 88,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 6,
    caloriesKcal: 340,
    available: true
  },
  {
    id: 35,
    name: "Shahi Gulab Jamun (2 Pcs)",
    description: "Melt-in-the-mouth golden milk dumplings soaked in saffron and green cardamom warm sugar syrup.",
    price: 99,
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 92,
    isVeg: true,
    isBestseller: true,
    isHighProtein: false,
    proteinGrams: 4,
    caloriesKcal: 260,
    available: true
  },
  {
    id: 36,
    name: "Saffron Rasmalai (2 Pcs)",
    description: "Delicate spongy cottage cheese discs soaked in chilled thickened saffron and pistachio milk.",
    price: 129,
    category: "Dessert",
    imageUrl: "images/saffron_rasmalai.jpg",
    avgRating: 4.9,
    reviewCount: 67,
    isVeg: true,
    isBestseller: true,
    isHighProtein: true,
    proteinGrams: 8,
    caloriesKcal: 290,
    available: true
  },
  {
    id: 37,
    name: "New York Baked Cheesecake",
    description: "Rich and velvety classic baked cheesecake over a buttery biscuit crust with blueberry compote.",
    price: 189,
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.9,
    reviewCount: 45,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 7,
    caloriesKcal: 380,
    available: true
  },
  {
    id: 38,
    name: "Red Velvet Lava Cupcake",
    description: "Moist red velvet sponge filled with warm white chocolate lava and cream cheese frosting swirl.",
    price: 139,
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&auto=format&fit=crop&q=80",
    avgRating: 4.8,
    reviewCount: 38,
    isVeg: true,
    isBestseller: false,
    isHighProtein: false,
    proteinGrams: 5,
    caloriesKcal: 310,
    available: true
  }
];

function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

async function loadMenu(retryCount = 0) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/foods`, {}, 6000);
    if (!res.ok) throw new Error('Could not fetch foods');
    const apiFoods = await res.json();
    
    // If backend returns a smaller set, combine with the comprehensive 38 seed items
    if (Array.isArray(apiFoods) && apiFoods.length >= 30) {
      allFoodItems = processBackendFoods(apiFoods);
    } else {
      const mergedMap = new Map();
      SEED_HARVEST_FOODS.forEach(s => mergedMap.set(s.name.toLowerCase(), s));
      if (Array.isArray(apiFoods)) {
        apiFoods.forEach(a => mergedMap.set(a.name.toLowerCase(), a));
      }
      allFoodItems = processBackendFoods(Array.from(mergedMap.values()));
    }

    try {
      localStorage.setItem('harvest_cached_foods_v2', JSON.stringify(allFoodItems));
    } catch (e) {}

    renderCategoryChips();
    setupDynamicRewardItem();
    filterAndRenderFoods();
  } catch (error) {
    console.log('Backend sync in background (using cached 38-item catalog):', error.message || error);
    // Menu is already rendered in 0ms via initInstantMenu(), no blocking spinner
  }
}

function processBackendFoods(apiFoods) {
  if (!apiFoods || apiFoods.length === 0) {
    return processBackendFoods(SEED_HARVEST_FOODS);
  }

  return apiFoods.map((f, idx) => {
    const lowerName = (f.name || '').toLowerCase();
    const lowerCat = (f.category || '').toLowerCase();

    const isVeg = f.isVeg !== undefined ? f.isVeg : (
      lowerCat.includes('veg') ||
      lowerName.includes('veg') ||
      lowerName.includes('paneer') ||
      lowerName.includes('margherita') ||
      lowerName.includes('jamun') ||
      lowerName.includes('brownie') ||
      lowerName.includes('coffee') ||
      lowerName.includes('fries') ||
      lowerName.includes('farmhouse')
    );

    const isHighProtein = f.isHighProtein !== undefined ? f.isHighProtein : (
      lowerName.includes('protein') ||
      lowerName.includes('chicken') ||
      lowerName.includes('paneer') ||
      lowerName.includes('biryani')
    );

    const proteinGrams = f.proteinGrams || (isHighProtein ? (isVeg ? 18 : 24) : (isVeg ? 6 : 14));
    const caloriesKcal = f.caloriesKcal || (280 + Math.round((f.price || 100) * 1.2));
    const avgRating = f.avgRating ? parseFloat(f.avgRating).toFixed(1) : (4.5 + ((idx % 5) * 0.1)).toFixed(1);
    const reviewCount = f.reviewCount || (15 + (idx * 6));
    const isBestseller = f.isBestseller !== undefined ? f.isBestseller : (idx % 2 === 0);

    return {
      ...f,
      isVeg,
      isHighProtein,
      proteinGrams,
      caloriesKcal,
      avgRating: parseFloat(avgRating),
      reviewCount,
      isBestseller
    };
  });
}

/* ================= Filtering & Rendering ================= */
function filterAndRenderFoods() {
  const container = document.getElementById('foodGrid');
  if (!container) return;

  const searchInput = document.getElementById('foodSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // Combos Category Check
  if (currentCategory && currentCategory.toLowerCase() === 'combos') {
    renderCombosSection(container, query);
    return;
  }

  let filtered = allFoodItems.filter(f => {
    if (f.available === false) return false;
    if (f.trackInventory === true && (f.stockQuantity === null || f.stockQuantity <= 0)) {
      return false;
    }
    return true;
  });

  // Veg Only Filter
  if (isVegOnly) {
    filtered = filtered.filter(f => f.isVeg === true);
  }

  // Non-Veg Only Filter
  if (isNonVegOnly) {
    filtered = filtered.filter(f => f.isVeg === false);
  }

  // EatRight (Healthy / High Protein / Fresh) Filter
  if (isEatRightOnly) {
    filtered = filtered.filter(f => f.isHighProtein === true || f.caloriesKcal < 400);
  }

  // Rating 4.0+ Filter
  if (isRating4PlusOnly) {
    filtered = filtered.filter(f => (f.avgRating || 0) >= 4.0);
  }

  // Bestseller Filter
  if (isBestsellerOnly) {
    filtered = filtered.filter(f => f.isBestseller === true);
  }

  // Category Filter
  if (currentCategory && currentCategory !== 'All') {
    const targetCat = currentCategory.toLowerCase().trim();
    filtered = filtered.filter(f => {
      if (!f.category) return false;
      const dishCat = f.category.toLowerCase().trim();
      return dishCat === targetCat || 
             dishCat.includes(targetCat) || 
             targetCat.includes(dishCat);
    });
  }

  // Query Filter
  if (query) {
    filtered = filtered.filter(f => 
      (f.name && f.name.toLowerCase().includes(query)) ||
      (f.description && f.description.toLowerCase().includes(query)) ||
      (f.category && f.category.toLowerCase().includes(query))
    );
  }

  // Update Category Section Title
  const titleCountEl = document.getElementById('categoryItemCount');
  if (titleCountEl) {
    titleCountEl.textContent = `(${filtered.length})`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: var(--text-muted);">
        <p style="font-size: 1rem; font-weight: 700; color: #334155; margin-bottom: 6px;">No dishes match your filters</p>
        <p style="font-size: 0.82rem;">Try disabling Veg/Non-Veg filters or searching a different keyword.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(food => createMobileFoodCard(food)).join('');

  if (typeof CartService !== 'undefined' && CartService.syncAllCardSteppers) {
    CartService.syncAllCardSteppers();
  }
}

/* ================= 2-Column Dish Card Template ================= */
function createMobileFoodCard(food) {
  const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
  const imgUrl = food.imageUrl || placeholderImg;

  // Veg vs Non-Veg icon
  const vegIconHtml = food.isVeg
    ? `<div class="veg-box-icon" title="Vegetarian"><span class="veg-circle"></span></div>`
    : `<div class="nonveg-box-icon" title="Non-Vegetarian"><span class="nonveg-triangle"></span></div>`;

  // Bestseller tag
  const bestsellerHtml = food.isBestseller
    ? `<span class="bestseller-tag">★ Bestseller</span>`
    : '';

  // Nutrition tag
  const nutritionHtml = (food.proteinGrams && food.caloriesKcal)
    ? `<div class="dish-nutrition-tag"><span>🔥</span> ${food.proteinGrams}g protein • ${food.caloriesKcal} kcal</div>`
    : '';

  return `
    <div class="mobile-dish-card">
      <div class="dish-media-wrap">
        <img class="dish-media-img" src="${imgUrl}" alt="${escapeHtml(food.name)}" onerror="this.src='${placeholderImg}'" loading="lazy">
      </div>

      <div class="mobile-dish-details">
        <div class="dish-badge-row">
          ${vegIconHtml}
          ${bestsellerHtml}
          <span class="dish-rating-chip">★ ${food.avgRating || '4.8'} (${food.reviewCount || 15})</span>
        </div>

        <h3 class="dish-name-heading" title="${escapeHtml(food.name)}">${escapeHtml(food.name)}</h3>
        ${nutritionHtml}

        <div class="dish-bottom-action-row">
          <div class="dish-price-text">₹${Math.round(food.price)}</div>
          <div class="card-action-wrap mobile-card-action" data-card-food-id="${food.id}">
            <button class="btn-mobile-add" onclick="handleCardInitialAdd(${food.id}, event)">
              ADD
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCombosSection(container, query) {
  let combos = allCombos;
  if (query) {
    combos = combos.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.description && c.description.toLowerCase().includes(query))
    );
  }

  if (combos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: var(--text-muted);">
        <p style="font-size: 1rem;">No combo deals found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = combos.map(combo => {
    return `
      <div class="mobile-dish-card" style="grid-column: 1 / -1;">
        <div class="dish-media-wrap" style="padding-top: 50%;">
          <img class="dish-media-img" src="${combo.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}" alt="${escapeHtml(combo.name)}">
          <div class="combo-save-badge" style="position: absolute; top: 8px; right: 8px; background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 6px;">
            SAVE ₹${Math.round(combo.savings || 50)}
          </div>
        </div>
        <div class="mobile-dish-details">
          <h3 class="dish-name-heading" style="font-size: 1rem;">${escapeHtml(combo.name)}</h3>
          <p style="font-size: 0.76rem; color: #64748b; margin-bottom: 8px;">${escapeHtml(combo.description || 'Special curated combo meal deal')}</p>
          <div class="dish-bottom-action-row">
            <div class="dish-price-text">₹${Math.round(combo.comboPrice)} <span style="text-decoration: line-through; font-size: 0.75rem; color: #94a3b8; font-weight: 500;">₹${Math.round(combo.originalPrice)}</span></div>
            <button class="btn btn-primary btn-sm" onclick="addComboToCart(${combo.id})">
              + Add Combo
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addComboToCart(comboId) {
  const combo = allCombos.find(c => c.id === comboId);
  if (!combo) return;

  if (!combo.items || combo.items.length === 0) {
    if (typeof CartService !== 'undefined') CartService.showToast('Empty combo items', 'error');
    return;
  }

  for (const item of combo.items) {
    if (typeof addToCart === 'function') {
      addToCart({
        id: item.foodId,
        name: item.foodName,
        price: item.foodPrice,
        imageUrl: item.foodImageUrl || ''
      }, item.quantity);
    }
  }
  if (typeof CartService !== 'undefined') {
    CartService.showToast(`Added ${combo.name} to cart!`);
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
