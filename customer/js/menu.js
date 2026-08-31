/**
 * Customer Menu Page JavaScript - Upgraded with Combos, Ratings, Favorites, and Stock
 */

let allFoodItems = [];
let allCombos = [];
let favoriteFoodIds = new Set();
let currentCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  initCategoryFilters();
  initSearch();
  loadFavoritesSet();
  loadCombos();
  loadMenu();
});

async function loadFavoritesSet() {
  const user = getCurrentUser();
  if (!user) return;
  try {
    const res = await fetch(`${API_BASE}/favorites/${user.phone}`);
    if (res.ok) {
      const items = await res.json();
      favoriteFoodIds = new Set(items.map(i => i.id));
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadCombos() {
  try {
    const res = await fetch(`${API_BASE}/combos/active`);
    if (res.ok) {
      allCombos = await res.json();
    }
  } catch (e) {
    console.error('Error loading combos:', e);
  }
}

function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      filterAndRenderFoods();
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById('foodSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndRenderFoods();
    });
  }
}

async function loadMenu(retryCount = 0) {
  const container = document.getElementById('foodGrid');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
      <div class="spinner-border text-danger" role="status" style="width: 2.5rem; height: 2.5rem; margin-bottom: 15px;"></div>
      <p style="font-weight: 600; font-size: 1rem;">Loading fresh delicious menu...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/foods`);
    if (!res.ok) throw new Error('Could not fetch foods');
    allFoodItems = await res.json();
    filterAndRenderFoods();
  } catch (error) {
    console.error('Error loading menu:', error);
    if (retryCount < 2) {
      setTimeout(() => loadMenu(retryCount + 1), 1500);
      return;
    }
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <div class="alert alert-danger" style="display: inline-block; max-width: 500px; padding: 20px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <p style="font-weight: 700; margin-bottom: 8px;">Failed to load menu items</p>
          <p style="font-size: 0.875rem; color: #721c24; margin-bottom: 14px;">Please ensure the backend server is running on port 8080.</p>
          <button onclick="loadMenu()" class="btn btn-primary btn-sm" style="padding: 6px 18px; font-weight: 700; border-radius: 6px;">
            Retry Now
          </button>
        </div>
      </div>
    `;
  }
}

function filterAndRenderFoods() {
  const container = document.getElementById('foodGrid');
  if (!container) return;

  const searchInput = document.getElementById('foodSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // If "Combos" category is selected
  if (currentCategory && currentCategory.toLowerCase() === 'combos') {
    renderCombosSection(container, query);
    return;
  }

  // Filter out any items that are unavailable or out of stock
  let filtered = allFoodItems.filter(f => {
    if (f.available === false) return false;
    if (f.trackInventory === true && (f.stockQuantity === null || f.stockQuantity <= 0)) {
      return false;
    }
    return true;
  });

  if (currentCategory && currentCategory !== 'All') {
    filtered = filtered.filter(f => f.category && f.category.toLowerCase() === currentCategory.toLowerCase());
  }

  if (query) {
    filtered = filtered.filter(f => 
      (f.name && f.name.toLowerCase().includes(query)) ||
      (f.description && f.description.toLowerCase().includes(query)) ||
      (f.category && f.category.toLowerCase().includes(query))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 8px;">No dishes found matching your selection.</p>
        <p style="font-size: 0.9rem;">Try selecting a different category or search term.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(food => createFoodCard(food)).join('');

  if (typeof CartService !== 'undefined' && CartService.syncAllCardSteppers) {
    CartService.syncAllCardSteppers();
  }
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p style="font-size: 1.1rem;">No combo meal deals found matching your search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = combos.map(combo => {
    const itemsList = (combo.items || []).map(i => `
      <li>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#df1f26" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${i.quantity}x ${escapeHtml(i.foodName)}</span>
      </li>
    `).join('');

    return `
      <div class="combo-card">
        <div style="position: relative;">
          <img src="${combo.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}" class="combo-img" alt="${escapeHtml(combo.name)}">
          <span class="combo-badge">Save ₹${Math.round(combo.savings)}</span>
        </div>
        <div class="combo-body">
          <h3>${escapeHtml(combo.name)}</h3>
          <p>${escapeHtml(combo.description || 'Special curated combo deal')}</p>
          
          <div class="combo-includes">
            <h4>Includes</h4>
            <ul>${itemsList}</ul>
          </div>

          <div class="combo-pricing">
            <div class="price-box">
              <span class="current-price">${formatCurrency(combo.comboPrice)}</span>
              <span class="old-price">${formatCurrency(combo.originalPrice)}</span>
            </div>
            <button onclick="addComboToCart(${combo.id})" class="btn btn-primary btn-sm">
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
    showToast('Empty combo items', 'error');
    return;
  }

  // Add individual food items in combo with bundled discount or add composite items
  for (const item of combo.items) {
    addToCart({
      id: item.foodId,
      name: item.foodName,
      price: item.foodPrice,
      imageUrl: item.foodImageUrl || ''
    }, item.quantity);
  }
  showToast(`Added ${combo.name} package to cart!`);
}

function createFoodCard(food) {
  const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
  const imgUrl = food.imageUrl || placeholderImg;
  const isFav = favoriteFoodIds.has(food.id);

  let lowStockHtml = '';
  if (food.isLowStock) {
    lowStockHtml = `
      <span class="low-stock-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Only ${food.stockQuantity} left!
      </span>
    `;
  }

  return `
    <div class="food-card" style="position: relative;">
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(${food.id}, event)" title="Save to favorites" aria-label="Favorite">
        <svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      </button>
      <div class="food-card-img-wrapper">
        <img class="food-card-img" src="${imgUrl}" alt="${escapeHtml(food.name)}" onerror="this.src='${placeholderImg}'">
        <span class="badge food-category-badge">${escapeHtml(food.category || 'General')}</span>
      </div>
      <div class="food-card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h3 class="food-card-title">${escapeHtml(food.name)}</h3>
          <div class="rating-pill">
            <svg width="12" height="12" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${food.avgRating || 4.8}
          </div>
        </div>
        <p class="food-card-desc">${escapeHtml(food.description || 'Delightfully prepared with premium ingredients.')}</p>
        
        ${lowStockHtml ? `<div style="margin-bottom: 8px;">${lowStockHtml}</div>` : ''}

        <div class="food-card-footer">
          <div class="food-price">${formatCurrency(food.price)}</div>
          <div class="card-action-wrap" data-card-food-id="${food.id}">
            <button 
              class="btn btn-primary btn-sm btn-add-cart" 
              onclick="handleCardInitialAdd(${food.id}, event)"
            >
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function toggleFav(foodId, event) {
  event.stopPropagation();
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to save your favorite dishes', 'error');
    setTimeout(() => { window.location.href = 'account.html'; }, 800);
    return;
  }

  const btn = event.currentTarget;
  try {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: user.phone, foodId: foodId })
    });

    const data = await res.json();
    if (data.isFavorite) {
      favoriteFoodIds.add(foodId);
      btn.classList.add('active');
      showToast('Added to your favorite dishes!');
    } else {
      favoriteFoodIds.delete(foodId);
      btn.classList.remove('active');
      showToast('Removed from favorites');
    }
  } catch (e) {
    showToast('Could not update favorites', 'error');
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
