/**
 * Admin Menu Management Controller - Upgraded with Stock Control & Low Stock Flags
 */

let allFoodItems = [];
let editingFoodId = null;

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080/api'
  : 'https://restaurant-order-management-system-cxv5.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  AuthService.requireAuth();

  const logoutBtn = document.getElementById('btnLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }

  initModalListeners();
  initFormListeners();
  loadMenuManagement();
});

async function loadMenuManagement() {
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
        Loading menu catalog...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(`${API_BASE}/foods`);
    if (!res.ok) throw new Error('Failed to load foods');
    const apiFoods = await res.json();
    if (Array.isArray(apiFoods) && apiFoods.length >= 30) {
      allFoodItems = apiFoods;
    } else {
      const mergedMap = new Map();
      ADMIN_SEED_FOODS.forEach(s => mergedMap.set(s.name.toLowerCase(), s));
      if (Array.isArray(apiFoods)) {
        apiFoods.forEach(a => mergedMap.set(a.name.toLowerCase(), a));
      }
      allFoodItems = Array.from(mergedMap.values());
    }
    renderMenuTable(allFoodItems);
  } catch (error) {
    console.warn('Backend API offline, displaying 38-item catalog:', error);
    allFoodItems = ADMIN_SEED_FOODS;
    renderMenuTable(allFoodItems);
  }
}

const ADMIN_SEED_FOODS = [
  { id: 1, name: "Margherita Pizza", description: "Classic Italian delight with 100% real mozzarella cheese, San Marzano tomatoes, and fresh basil.", price: 199, category: "Pizza", stockQuantity: 45, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80" },
  { id: 2, name: "Farmhouse Special Pizza", description: "Loaded with crunchy bell peppers, crisp red onions, sweet golden corn, button mushrooms, and mozzarella.", price: 249, category: "Pizza", stockQuantity: 30, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80" },
  { id: 3, name: "Peri Peri Paneer Pizza", description: "Spicy marinated cottage cheese cubes, roasted red peppers, jalapeños, and peri-peri drizzle with herbs.", price: 279, category: "Pizza", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80" },
  { id: 4, name: "Smoky BBQ Chicken Pizza", description: "Tender chunks of grilled barbecue chicken, caramelized red onions, mozzarella, and smoked chipotle glaze.", price: 299, category: "Pizza", stockQuantity: 30, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80" },
  { id: 5, name: "Pepperoni & Sausage Pizza", description: "Generous slices of spicy pepperoni, chicken sausage, black olives, and mozzarella on seasoned tomato sauce.", price: 329, category: "Pizza", stockQuantity: 25, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80" },
  { id: 6, name: "Truffle Mushroom Pizza", description: "Sauteed wild button mushrooms, roasted garlic, creamy ricotta, and mozzarella with truffle herb essence.", price: 349, category: "Pizza", stockQuantity: 20, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80" },
  { id: 7, name: "Classic Crispy Veg Burger", description: "Crispy golden spiced vegetable patty topped with fresh lettuce, ripe tomatoes, pickles, and herb mayo.", price: 149, category: "Burger", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80" },
  { id: 8, name: "Spicy Paneer Tikka Burger", description: "Charcoal grilled paneer patty seasoned with tandoori spices, mint mayonnaise, onion rings, and brioche bun.", price: 189, category: "Burger", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80" },
  { id: 9, name: "Gourmet Grilled Chicken Burger", description: "Juicy tender grilled chicken breast fillet with crisp lettuce, melted cheddar cheese, and BBQ sauce.", price: 199, category: "Burger", stockQuantity: 25, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80" },
  { id: 10, name: "Double Smash Cheeseburger", description: "Twin smashed chicken patties layered with double melted American cheese, caramelized onions, and relish.", price: 249, category: "Burger", stockQuantity: 20, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1583032015879-c63bfb49e498?w=500&auto=format&fit=crop&q=80" },
  { id: 11, name: "Peri Peri Crispy Chicken Burger", description: "Deep-fried golden crispy chicken thigh patty tossed in zesty peri peri dust with sriracha mayo slaw.", price: 219, category: "Burger", stockQuantity: 30, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80" },
  { id: 12, name: "Grilled Veg Club Sandwich", description: "Triple-layered toasted whole wheat sandwich packed with roasted bell peppers, cucumbers, and pesto spread.", price: 169, category: "Burger", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80" },
  { id: 13, name: "Crispy French Fries", description: "Lightly salted, perfectly crisp golden potato fries served with garlic herb dip and ketchup.", price: 119, category: "Appetizers", stockQuantity: 60, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80" },
  { id: 14, name: "Peri Peri Crinkle Fries", description: "Hot crinkle cut potato fries tossed in fiery African peri peri seasoning and served with cheese dip.", price: 139, category: "Appetizers", stockQuantity: 50, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80" },
  { id: 15, name: "Loaded Cheesy Garlic Bread", description: "Freshly baked artisanal baguette topped with garlic herb butter, melted mozzarella, and oregano flakes.", price: 159, category: "Appetizers", stockQuantity: 45, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=500&auto=format&fit=crop&q=80" },
  { id: 16, name: "Crispy Paneer Popcorn", description: "Bite-sized crunchy spiced paneer nuggets served with tangy thousand island dressing.", price: 179, category: "Appetizers", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "images/paneer_popcorn.jpg" },
  { id: 17, name: "Golden Chicken Nuggets (8 Pcs)", description: "Tender seasoned minced chicken bites with a golden crumb coating and sweet honey mustard.", price: 199, category: "Appetizers", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80" },
  { id: 18, name: "Spicy BBQ Wings (6 Pcs)", description: "Succulent baked and glazed chicken wings tossed in tangy hickory barbecue sauce and toasted sesame.", price: 229, category: "Appetizers", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80" },
  { id: 19, name: "Vegetable Spring Rolls (4 Pcs)", description: "Delicate fried pastry rolls filled with shredded cabbage, carrots, bell peppers, and sweet chili dip.", price: 149, category: "Appetizers", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80" },
  { id: 20, name: "Paneer Butter Masala", description: "Soft fresh cottage cheese cubes slow cooked in a rich, velvety tomato and cashew butter gravy.", price: 249, category: "Main Course", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80" },
  { id: 21, name: "Dal Makhani Royale", description: "Black lentils and kidney beans slow simmered overnight with butter, cream, and aromatic spices.", price: 219, category: "Main Course", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80" },
  { id: 22, name: "Kadhai Paneer Special", description: "Fresh paneer cubes stir-fried with crunchy bell peppers, crushed coriander, and spicy onion-tomato gravy.", price: 259, category: "Main Course", stockQuantity: 30, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80" },
  { id: 23, name: "Butter Chicken Boneless", description: "Succulent tandoori roasted chicken pieces simmered in silky makhani gravy enriched with fresh cream.", price: 299, category: "Main Course", stockQuantity: 45, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80" },
  { id: 24, name: "Hyderabadi Chicken Biryani", description: "Fragrant long-grain basmati rice cooked on dum with marinated chicken, saffron, and fresh mint.", price: 299, category: "Main Course", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80" },
  { id: 25, name: "Royal Mutton Biryani", description: "Tender pieces of slow-cooked spiced mutton layered with saffron basmati rice, rose water, and boiled egg.", price: 379, category: "Main Course", stockQuantity: 25, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80" },
  { id: 26, name: "Steamed Saffron Basmati Rice", description: "Fluffy aged aromatic basmati rice infused with whole saffron strands and a hint of pure desi ghee.", price: 129, category: "Main Course", stockQuantity: 50, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80" },
  { id: 27, name: "Butter Naan (2 Pcs)", description: "Traditional clay oven-baked leavened flatbread brushed with generous golden dairy butter.", price: 69, category: "Main Course", stockQuantity: 60, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80" },
  { id: 28, name: "Rich Cold Coffee with Ice Cream", description: "Handcrafted chilled blended espresso coffee with creamy vanilla bean ice cream and chocolate drizzle.", price: 129, category: "Drinks", stockQuantity: 50, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80" },
  { id: 29, name: "Classic Virgin Mojito", description: "Refreshing mocktail muddled with garden fresh mint leaves, lime juice, sparkling soda, and crushed ice.", price: 119, category: "Drinks", stockQuantity: 50, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80" },
  { id: 30, name: "Belgian Chocolate Shake", description: "Decadent thick milkshake prepared with rich Belgian cocoa, dark chocolate fudge, and chocolate shavings.", price: 159, category: "Drinks", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80" },
  { id: 31, name: "Alphonso Mango Smoothie", description: "Creamy yogurt smoothie blended with ripe sweet Alphonso mango pulp and topped with chia seeds.", price: 149, category: "Drinks", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=80" },
  { id: 32, name: "Fresh Masala Lemonade", description: "Zesty hand-pressed lemon juice with black salt, roasted cumin, fresh mint, and sparkling chilled water.", price: 89, category: "Drinks", stockQuantity: 60, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=500&auto=format&fit=crop&q=80" },
  { id: 33, name: "Chilled Coca-Cola (500ml)", description: "Classic bubbly Coca-Cola carbonated soft drink served refreshingly chilled.", price: 49, category: "Drinks", stockQuantity: 80, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80" },
  { id: 34, name: "Warm Fudge Chocolate Brownie", description: "Freshly baked walnut chocolate brownie served warm with molten dark chocolate ganache.", price: 159, category: "Dessert", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80" },
  { id: 35, name: "Shahi Gulab Jamun (2 Pcs)", description: "Melt-in-the-mouth golden milk dumplings soaked in saffron and green cardamom warm sugar syrup.", price: 99, category: "Dessert", stockQuantity: 40, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80" },
  { id: 36, name: "Saffron Rasmalai (2 Pcs)", description: "Delicate spongy cottage cheese discs soaked in chilled thickened saffron and pistachio milk.", price: 129, category: "Dessert", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "images/saffron_rasmalai.jpg" },
  { id: 37, name: "New York Baked Cheesecake", description: "Rich and velvety classic baked cheesecake over a buttery biscuit crust with blueberry compote.", price: 189, category: "Dessert", stockQuantity: 30, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80" },
  { id: 38, name: "Red Velvet Lava Cupcake", description: "Moist red velvet sponge filled with warm white chocolate lava and cream cheese frosting swirl.", price: 139, category: "Dessert", stockQuantity: 35, available: true, isLowStock: false, imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&auto=format&fit=crop&q=80" }
];

function renderMenuTable(foods) {
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;

  if (!foods || foods.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No food items found. Click "+ Add New Food Item" to create one.
        </td>
      </tr>
    `;
    return;
  }

  const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

  tbody.innerHTML = foods.map(item => {
    const isLowStock = item.isLowStock;
    return `
      <tr>
        <td>
          <img class="table-img" src="${item.imageUrl || placeholderImg}" alt="${escapeHtml(item.name)}" onerror="this.src='${placeholderImg}'">
        </td>
        <td>
          <div style="font-weight: 700; color: #181615;">${escapeHtml(item.name)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(item.description || '-')}
          </div>
        </td>
        <td><span class="badge" style="background-color: var(--primary-light); color: var(--primary); font-weight: 700;">${escapeHtml(item.category)}</span></td>
        <td style="font-weight: 800; color: #181615;">₹${Number(item.price).toFixed(0)}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 1rem; color: ${isLowStock ? '#dc2626' : '#181615'};">${item.stockQuantity != null ? item.stockQuantity : 50} units</strong>
            ${isLowStock ? '<span style="background: #fee2e2; color: #dc2626; font-size: 0.72rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">LOW</span>' : ''}
          </div>
        </td>
        <td>
          <span class="badge ${item.available ? 'badge-available' : 'badge-unavailable'}">
            ${item.available ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td style="white-space: nowrap;">
          <button class="btn btn-secondary btn-sm btn-edit-food" data-id="${item.id}" style="display: inline-flex; align-items: center; gap: 4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn btn-danger btn-sm btn-delete-food" data-id="${item.id}" data-name="${escapeHtml(item.name)}" style="display: inline-flex; align-items: center; gap: 4px; margin-left: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach Action Listeners
  tbody.querySelectorAll('.btn-edit-food').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openEditModal(id);
    });
  });

  tbody.querySelectorAll('.btn-delete-food').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const name = btn.getAttribute('data-name');
      confirmDeleteFood(id, name);
    });
  });
}

function initModalListeners() {
  const addBtn = document.getElementById('btnOpenAddModal');
  const modalOverlay = document.getElementById('foodModal');
  const closeBtns = document.querySelectorAll('.modal-close, .btn-modal-cancel');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openAddModal();
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  });
}

function openAddModal() {
  editingFoodId = null;
  document.getElementById('modalTitle').textContent = 'Add New Food Item';
  document.getElementById('foodForm').reset();
  document.getElementById('foodAvailable').checked = true;
  document.getElementById('foodStock').value = 50;
  document.getElementById('foodThreshold').value = 5;
  document.getElementById('foodTrackInventory').checked = true;
  document.getElementById('modalErrorAlert').style.display = 'none';
  document.getElementById('foodModal').classList.add('active');
}

function openEditModal(foodId) {
  const food = allFoodItems.find(f => f.id === foodId);
  if (!food) return;

  editingFoodId = foodId;
  document.getElementById('modalTitle').textContent = 'Edit Food Item';
  document.getElementById('foodName').value = food.name || '';
  document.getElementById('foodCategory').value = food.category || 'Pizza';
  document.getElementById('foodPrice').value = food.price || '';
  document.getElementById('foodStock').value = food.stockQuantity != null ? food.stockQuantity : 50;
  document.getElementById('foodThreshold').value = food.lowStockThreshold != null ? food.lowStockThreshold : 5;
  document.getElementById('foodImageUrl').value = food.imageUrl || '';
  document.getElementById('foodDescription').value = food.description || '';
  document.getElementById('foodAvailable').checked = food.available !== false;
  document.getElementById('foodTrackInventory').checked = food.trackInventory !== false;
  document.getElementById('modalErrorAlert').style.display = 'none';
  document.getElementById('foodModal').classList.add('active');
}

function initFormListeners() {
  const form = document.getElementById('foodForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('foodName').value.trim();
    const category = document.getElementById('foodCategory').value.trim();
    const price = parseFloat(document.getElementById('foodPrice').value);
    const stockQuantity = parseInt(document.getElementById('foodStock').value) || 0;
    const lowStockThreshold = parseInt(document.getElementById('foodThreshold').value) || 5;
    const imageUrl = document.getElementById('foodImageUrl').value.trim();
    const description = document.getElementById('foodDescription').value.trim();
    const available = document.getElementById('foodAvailable').checked;
    const trackInventory = document.getElementById('foodTrackInventory').checked;
    const errorAlert = document.getElementById('modalErrorAlert');

    if (!name || isNaN(price) || price <= 0 || !category) {
      errorAlert.textContent = 'Please provide valid Name, Category, and Price (> 0)';
      errorAlert.style.display = 'block';
      return;
    }

    const payload = {
      name,
      category,
      price,
      stockQuantity,
      lowStockThreshold,
      trackInventory,
      imageUrl,
      description,
      available
    };

    const submitBtn = document.getElementById('btnSaveFood');
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      let res;
      if (editingFoodId) {
        res = await fetch(`${API_BASE}/foods/${editingFoodId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/foods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save food item');
      }

      document.getElementById('foodModal').classList.remove('active');
      await loadMenuManagement();
    } catch (error) {
      console.error('Error saving food item:', error);
      errorAlert.textContent = error.message || 'Failed to save food item.';
      errorAlert.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Food Item';
    }
  });
}

async function confirmDeleteFood(foodId, foodName) {
  if (confirm(`Are you sure you want to delete "${foodName}"? This action cannot be undone.`)) {
    try {
      const res = await fetch(`${API_BASE}/foods/${foodId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete food item');
      await loadMenuManagement();
    } catch (error) {
      console.error('Error deleting food item:', error);
      alert(error.message || 'Failed to delete food item');
    }
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
