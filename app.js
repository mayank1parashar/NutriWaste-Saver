// Application data
const appData = {
  foodCategories: ["Fruits", "Vegetables", "Dairy", "Meat", "Grains", "Pantry"],
  sampleFoodItems: [
    {"name": "Bananas", "category": "Fruits", "quantity": "6 pieces", "expiryDays": 2, "freshness": "yellow"},
    {"name": "Spnach", "category": "Vegetables", "quantity": "1 bag", "expiryDays": 1, "freshness": "red"},
    {"name": "Chicken Breast", "category": "Meat", "quantity": "500g", "expiryDays": 4, "freshness": "green"},
    {"name": "Milk", "category": "Dairy", "quantity": "1L", "expiryDays": 3, "freshness": "yellow"},
    {"name": "Apples", "category": "Fruits", "quantity": "8 pieces", "expiryDays": 7, "freshness": "green"},
    {"name": "Carrots", "category": "Vegetables", "quantity": "1kg", "expiryDays": 5, "freshness": "green"},
    {"name": "Yogurt", "category": "Dairy", "quantity": "500g", "expiryDays": 4, "freshness": "green"},
    {"name": "Rice", "category": "Grains", "quantity": "2kg", "expiryDays": 365, "freshness": "green"}
  ],
  sampleRecipes: [
    {"name": "Banana Smoothie Bowl", "prepTime": "10 min", "difficulty": "Easy", "ingredients": ["Bananas", "Yogurt", "Granola"], "isLeftoverHero": true, "icon": "🍌"},
    {"name": "Spinach Chicken Stir Fry", "prepTime": "20 min", "difficulty": "Medium", "ingredients": ["Spinach", "Chicken Breast", "Garlic"], "isLeftoverHero": true, "icon": "🥬"},
    {"name": "Creamy Pasta", "prepTime": "25 min", "difficulty": "Easy", "ingredients": ["Pasta", "Milk", "Cheese"], "isLeftoverHero": false, "icon": "🍝"},
    {"name": "Apple Cinnamon Oatmeal", "prepTime": "15 min", "difficulty": "Easy", "ingredients": ["Apples", "Oats", "Cinnamon"], "isLeftoverHero": true, "icon": "🍎"},
    {"name": "Carrot Soup", "prepTime": "30 min", "difficulty": "Medium", "ingredients": ["Carrots", "Onion", "Vegetable Stock"], "isLeftoverHero": false, "icon": "🥕"}
  ],
  notifications: [
    {"type": "expiry", "message": "Spinach expires tomorrow - use in Spinach Chicken Stir Fry!", "urgency": "high"},
    {"type": "tip", "message": "Great job! You've saved 2.3kg of food waste this week", "urgency": "low"},
    {"type": "reminder", "message": "Don't forget to prep your Banana Smoothie Bowl for breakfast", "urgency": "medium"}
  ]
};

// State management
let currentFoodItems = [...appData.sampleFoodItems];
let currentPage = 'dashboard';
let mealPlan = {};
let draggedRecipe = null;

// Food item icons mapping
const foodIcons = {
  'Fruits': '🍎',
  'Vegetables': '🥬',
  'Dairy': '🥛',
  'Meat': '🥩',
  'Grains': '🌾',
  'Pantry': '🥫',
  'Bananas': '🍌',
  'Spinach': '🥬',
  'Chicken Breast': '🍗',
  'Milk': '🥛',
  'Apples': '🍎',
  'Carrots': '🥕',
  'Yogurt': '🧈',
  'Rice': '🍚'
};

// DOM elements - will be initialized after DOM loads
let navButtons, pages, notificationBell, notificationsPanel, closeNotifications;
let addItemModal, addItemBtn, closeModal, cancelAdd, addItemForm;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM elements
  navButtons = document.querySelectorAll('.nav-btn');
  pages = document.querySelectorAll('.page');
  notificationBell = document.querySelector('.notification-bell');
  notificationsPanel = document.getElementById('notifications-panel');
  closeNotifications = document.getElementById('close-notifications');
  addItemModal = document.getElementById('add-item-modal');
  addItemBtn = document.getElementById('add-item-btn');
  closeModal = document.getElementById('close-modal');
  cancelAdd = document.getElementById('cancel-add');
  addItemForm = document.getElementById('add-item-form');

  // Initialize all features
  initializeNavigation();
  initializeNotifications();
  initializeModals();
  initializeDashboard();
  initializeInventory();
  initializeMealPlan();
  initializeRecipes();
  initializeQuickActions();
  
  // Set today's date as minimum for expiry date input
  const today = new Date().toISOString().split('T')[0];
  const expiryInput = document.getElementById('item-expiry');
  if (expiryInput) {
    expiryInput.setAttribute('min', today);
  }
});

// Navigation functionality
function initializeNavigation() {
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPage = button.getAttribute('data-page');
      showPage(targetPage);
    });
  });
}

function showPage(pageId) {
  // Update navigation
  navButtons.forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Update pages
  pages.forEach(page => page.classList.remove('active'));
  const activePage = document.getElementById(pageId);
  if (activePage) {
    activePage.classList.add('active');
  }
  
  currentPage = pageId;
}

// Notifications functionality
function initializeNotifications() {
  if (notificationBell) {
    notificationBell.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleNotifications();
    });
  }
  
  if (closeNotifications) {
    closeNotifications.addEventListener('click', hideNotifications);
  }
  
  renderNotifications();
  updateNotificationCount();
}

function toggleNotifications() {
  if (notificationsPanel) {
    notificationsPanel.classList.toggle('hidden');
  }
}

function hideNotifications() {
  if (notificationsPanel) {
    notificationsPanel.classList.add('hidden');
  }
}

function renderNotifications() {
  const notificationsList = document.getElementById('notifications-list');
  if (notificationsList) {
    notificationsList.innerHTML = appData.notifications.map(notification => `
      <div class="notification-item ${notification.urgency}">
        <p>${notification.message}</p>
      </div>
    `).join('');
  }
}

// Modal functionality
function initializeModals() {
  if (addItemBtn) {
    addItemBtn.addEventListener('click', showAddItemModal);
  }
  
  if (closeModal) {
    closeModal.addEventListener('click', hideAddItemModal);
  }
  
  if (cancelAdd) {
    cancelAdd.addEventListener('click', hideAddItemModal);
  }
  
  if (addItemForm) {
    addItemForm.addEventListener('submit', handleAddItem);
  }
  
  // Close modal when clicking outside
  if (addItemModal) {
    addItemModal.addEventListener('click', (e) => {
      if (e.target === addItemModal) {
        hideAddItemModal();
      }
    });
  }
}

function showAddItemModal() {
  if (addItemModal) {
    addItemModal.classList.remove('hidden');
  }
}

function hideAddItemModal() {
  if (addItemModal) {
    addItemModal.classList.add('hidden');
  }
  if (addItemForm) {
    addItemForm.reset();
  }
}

function handleAddItem(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById('item-name');
  const categoryInput = document.getElementById('item-category');
  const quantityInput = document.getElementById('item-quantity');
  const expiryInput = document.getElementById('item-expiry');
  
  // Validate all inputs exist and have values
  if (!nameInput || !categoryInput || !quantityInput || !expiryInput) {
    alert('Form inputs not found. Please try again.');
    return;
  }
  
  const name = nameInput.value.trim();
  const category = categoryInput.value;
  const quantity = quantityInput.value.trim();
  const expiryDate = expiryInput.value;
  
  // Validate required fields
  if (!name || !category || !quantity || !expiryDate) {
    alert('Please fill in all fields');
    return;
  }
  
  // Calculate days until expiry
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Determine freshness based on days until expiry
  let freshness = 'green';
  if (diffDays <= 1) freshness = 'red';
  else if (diffDays <= 3) freshness = 'yellow';
  
  const newItem = {
    name,
    category,
    quantity,
    expiryDays: diffDays,
    freshness
  };
  
  currentFoodItems.push(newItem);
  renderInventory();
  hideAddItemModal();
  
  // Show success message
  alert(`${name} added to inventory successfully!`);
  
  // If we're on dashboard, update the stats
  if (currentPage === 'dashboard') {
    updateInventoryStats();
  }
}

// Dashboard functionality
function initializeDashboard() {
  updateInventoryStats();
}

function updateInventoryStats() {
  const freshCount = currentFoodItems.filter(item => item.freshness === 'green').length;
  const useSoonCount = currentFoodItems.filter(item => item.freshness === 'yellow').length;
  const expiringCount = currentFoodItems.filter(item => item.freshness === 'red').length;
  
  // Update the dashboard stats
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length >= 3) {
    statNumbers[0].textContent = freshCount;
    statNumbers[1].textContent = useSoonCount;
    statNumbers[2].textContent = expiringCount;
  }
  
  // Update progress bar
  const total = currentFoodItems.length;
  if (total > 0) {
    const freshPercent = (freshCount / total) * 100;
    const useSoonPercent = (useSoonCount / total) * 100;
    const expiringPercent = (expiringCount / total) * 100;
    
    const barSegments = document.querySelectorAll('.bar-segment');
    if (barSegments.length >= 3) {
      barSegments[0].style.width = `${freshPercent}%`;
      barSegments[1].style.width = `${useSoonPercent}%`;
      barSegments[2].style.width = `${expiringPercent}%`;
    }
  }
}

// Inventory functionality
function initializeInventory() {
  const categoryFilter = document.getElementById('category-filter');
  const freshnessFilter = document.getElementById('freshness-filter');
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderInventory);
  }
  
  if (freshnessFilter) {
    freshnessFilter.addEventListener('change', renderInventory);
  }
  
  renderInventory();
}

function renderInventory() {
  const categoryFilter = document.getElementById('category-filter');
  const freshnessFilter = document.getElementById('freshness-filter');
  
  const categoryValue = categoryFilter ? categoryFilter.value : '';
  const freshnessValue = freshnessFilter ? freshnessFilter.value : '';
  
  let filteredItems = currentFoodItems;
  
  if (categoryValue) {
    filteredItems = filteredItems.filter(item => item.category === categoryValue);
  }
  
  if (freshnessValue) {
    filteredItems = filteredItems.filter(item => item.freshness === freshnessValue);
  }
  
  const inventoryGrid = document.getElementById('inventory-grid');
  
  if (inventoryGrid) {
    inventoryGrid.innerHTML = filteredItems.map(item => `
      <div class="food-item">
        <div class="food-item-header">
          <div class="food-icon">${foodIcons[item.name] || foodIcons[item.category]}</div>
          <span class="freshness-indicator ${item.freshness}">
            ${item.freshness === 'green' ? 'Fresh' : item.freshness === 'yellow' ? 'Use Soon' : 'Expiring'}
          </span>
        </div>
        <h3 class="food-name">${item.name}</h3>
        <p class="food-quantity">${item.quantity}</p>
        <div class="expiry-info">
          <span class="expiry-days">
            ${item.expiryDays <= 0 ? 'Expired' : item.expiryDays === 1 ? 'Expires tomorrow' : `Expires in ${item.expiryDays} days`}
          </span>
        </div>
      </div>
    `).join('');
  }
  
  updateInventoryStats();
}

// Meal Plan functionality
function initializeMealPlan() {
  renderCalendar();
  renderRecipeLibrary();
}

function renderCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  if (!calendarGrid) return;
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  
  calendarGrid.innerHTML = days.map(day => `
    <div class="day-column">
      <div class="day-header">${day}</div>
      ${meals.map(meal => `
        <div class="meal-slot" data-day="${day}" data-meal="${meal}" ondrop="dropRecipe(event)" ondragover="allowDrop(event)">
          ${mealPlan[day] && mealPlan[day][meal] ? mealPlan[day][meal] : `${meal}`}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderRecipeLibrary() {
  const recipeList = document.getElementById('recipe-list');
  const searchInput = document.getElementById('recipe-search');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterRecipes);
  }
  
  if (recipeList) {
    recipeList.innerHTML = appData.sampleRecipes.map(recipe => `
      <div class="recipe-item" draggable="true" data-recipe="${recipe.name}" ondragstart="dragRecipe(event)">
        <strong>${recipe.name}</strong>
        <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
          ${recipe.prepTime} • ${recipe.difficulty}
          ${recipe.isLeftoverHero ? ' • 🦸‍♂️ Leftover Hero' : ''}
        </div>
      </div>
    `).join('');
  }
}

function filterRecipes() {
  const searchInput = document.getElementById('recipe-search');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  const recipeItems = document.querySelectorAll('.recipe-item');
  
  recipeItems.forEach(item => {
    const recipeName = item.getAttribute('data-recipe').toLowerCase();
    if (recipeName.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Drag and drop functionality
function dragRecipe(event) {
  draggedRecipe = event.target.getAttribute('data-recipe');
  event.target.classList.add('dragging');
}

function allowDrop(event) {
  event.preventDefault();
}

function dropRecipe(event) {
  event.preventDefault();
  if (draggedRecipe) {
    const day = event.target.getAttribute('data-day');
    const meal = event.target.getAttribute('data-meal');
    
    if (!mealPlan[day]) {
      mealPlan[day] = {};
    }
    
    mealPlan[day][meal] = draggedRecipe;
    event.target.textContent = draggedRecipe;
    event.target.classList.add('has-meal');
    
    draggedRecipe = null;
    
    // Remove dragging class from all recipe items
    document.querySelectorAll('.recipe-item').forEach(item => {
      item.classList.remove('dragging');
    });
  }
}

// Recipes functionality
function initializeRecipes() {
  const difficultyFilter = document.getElementById('difficulty-filter');
  const leftoverFilter = document.getElementById('leftover-filter');
  
  if (difficultyFilter) {
    difficultyFilter.addEventListener('change', renderRecipes);
  }
  
  if (leftoverFilter) {
    leftoverFilter.addEventListener('click', toggleLeftoverFilter);
  }
  
  renderRecipes();
}

let showLeftoverOnly = false;

function toggleLeftoverFilter() {
  showLeftoverOnly = !showLeftoverOnly;
  const button = document.getElementById('leftover-filter');
  
  if (button) {
    if (showLeftoverOnly) {
      button.classList.add('btn--primary');
      button.classList.remove('btn--outline');
      button.textContent = 'Show All Recipes';
    } else {
      button.classList.add('btn--outline');
      button.classList.remove('btn--primary');
      button.textContent = 'Leftover Heroes Only';
    }
  }
  
  renderRecipes();
}

function renderRecipes() {
  const difficultyFilter = document.getElementById('difficulty-filter');
  const difficultyValue = difficultyFilter ? difficultyFilter.value : '';
  
  let filteredRecipes = appData.sampleRecipes;
  
  if (difficultyValue) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficultyValue);
  }
  
  if (showLeftoverOnly) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.isLeftoverHero);
  }
  
  const recipesGrid = document.getElementById('recipes-grid');
  
  if (recipesGrid) {
    recipesGrid.innerHTML = filteredRecipes.map(recipe => `
      <div class="recipe-card ${recipe.isLeftoverHero ? 'leftover-hero' : ''}">
        <div class="recipe-icon">${recipe.icon || '👨‍🍳'}</div>
        <h3 class="recipe-name">${recipe.name}</h3>
        <div class="recipe-meta">
          <span>⏱️ ${recipe.prepTime}</span>
          <span>📊 ${recipe.difficulty}</span>
        </div>
        <div class="recipe-ingredients">
          <strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}
        </div>
      </div>
    `).join('');
  }
}

// Quick Actions functionality
function initializeQuickActions() {
  const addGroceriesBtn = document.getElementById('add-groceries');
  const planMealsBtn = document.getElementById('plan-meals');
  const findRecipesBtn = document.getElementById('find-recipes');
  
  if (addGroceriesBtn) {
    addGroceriesBtn.addEventListener('click', () => {
      showPage('inventory');
      setTimeout(() => showAddItemModal(), 100);
    });
  }
  
  if (planMealsBtn) {
    planMealsBtn.addEventListener('click', () => {
      showPage('meal-plan');
    });
  }
  
  if (findRecipesBtn) {
    findRecipesBtn.addEventListener('click', () => {
      showPage('recipes');
    });
  }
}

// Update notification count based on urgency
function updateNotificationCount() {
  const highUrgencyCount = appData.notifications.filter(n => n.urgency === 'high').length;
  const notificationCount = document.querySelector('.notification-count');
  
  if (notificationCount) {
    notificationCount.textContent = highUrgencyCount;
    
    if (highUrgencyCount === 0) {
      notificationCount.style.display = 'none';
    } else {
      notificationCount.style.display = 'flex';
    }
  }
}

// Initialize drag and drop event listeners
document.addEventListener('dragend', function(event) {
  if (event.target.classList.contains('recipe-item')) {
    event.target.classList.remove('dragging');
  }
});

// Close notifications when clicking outside
document.addEventListener('click', function(event) {
  const notificationsPanel = document.getElementById('notifications-panel');
  const notificationBell = document.querySelector('.notification-bell');
  
  if (notificationsPanel && notificationBell) {
    if (!notificationsPanel.contains(event.target) && !notificationBell.contains(event.target)) {
      hideNotifications();
    }
  }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    hideNotifications();
    hideAddItemModal();
  }
});

// Utility functions
function getFreshnessText(freshness) {
  switch(freshness) {
    case 'green': return 'Fresh';
    case 'yellow': return 'Use Soon';
    case 'red': return 'Expiring';
    default: return 'Unknown';
  }
}
