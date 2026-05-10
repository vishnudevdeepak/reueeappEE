// Authentication check
function checkAuth() {
  const user = localStorage.getItem('loggedInUser');
  if (!user) {
    navigateTo('login.html');
    return;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const username = localStorage.getItem('loggedInUser');
  const email = localStorage.getItem('userEmail');
  
  // Display user info in navbar if element exists
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = `Welcome, ${username}`;
  }
  
  const emailDisplay = document.getElementById('emailDisplay');
  if (emailDisplay) {
    emailDisplay.textContent = email || 'No email';
  }
  
  // Load listings/rentals if elements exist
  loadListings();
  loadRentals();
});

const API_BASE = (window.location.protocol === 'file:' || window.location.origin === 'null')
  ? 'http://localhost:3000' : window.location.origin;

// Load and display buy listings
async function loadListings() {
  try {
    const res = await fetch(`${API_BASE}/api/listings`);
    const listings = await res.json();
    const container = document.getElementById('listingsContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (listings.length === 0) {
      container.innerHTML = '<p>No listings available.</p>';
      return;
    }
    
    listings.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <h4>${item.name || 'Unnamed Item'}</h4>
        <p>${item.description || 'No description'}</p>
        <p class="price">$${item.price || '0'}</p>
        <button onclick="viewItem(${item.id})">View Details</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading listings:', err);
  }
}

// Load and display rental items
async function loadRentals() {
  try {
    const res = await fetch(`${API_BASE}/api/rentals`);
    const rentals = await res.json();
    const container = document.getElementById('rentalsContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (rentals.length === 0) {
      container.innerHTML = '<p>No rentals available.</p>';
      return;
    }
    
    rentals.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <h4>${item.name || 'Unnamed Item'}</h4>
        <p>${item.description || 'No description'}</p>
        <p class="price">$${item.rentPrice || '0'} per day</p>
        <button onclick="viewRental(${item.id})">View Details</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading rentals:', err);
  }
}

// View item details
function viewItem(id) {
  localStorage.setItem('selectedItemId', id);
  navigateTo('filldetailpage.html');
}

// View rental details
function viewRental(id) {
  localStorage.setItem('selectedRentalId', id);
  navigateTo('rentdetailpage.html');
}

// Logout function
function logout() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('selectedItemId');
  localStorage.removeItem('selectedRentalId');
  navigateTo('login.html');
}

// Post a new item for sale
async function postItem() {
  const name = prompt('Item name:');
  if (!name) return;
  
  const description = prompt('Description:');
  const price = prompt('Price:');
  
  if (!name || !price) {
    alert('Name and price are required.');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/api/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || '',
        price: parseFloat(price),
        type: 'buy',
        seller: localStorage.getItem('loggedInUser')
      })
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Item posted successfully!');
      loadListings();
    } else {
      alert('Error posting item: ' + data.message);
    }
  } catch (err) {
    alert('Unable to post item: ' + err.message);
  }
}

// Post a rental item
async function postRental() {
  const name = prompt('Item name:');
  if (!name) return;
  
  const description = prompt('Description:');
  const rentPrice = prompt('Daily rental price:');
  
  if (!name || !rentPrice) {
    alert('Name and rental price are required.');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/api/rentals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || '',
        rentPrice: parseFloat(rentPrice),
        type: 'rent',
        owner: localStorage.getItem('loggedInUser')
      })
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Rental posted successfully!');
      loadRentals();
    } else {
      alert('Error posting rental: ' + data.message);
    }
  } catch (err) {
    alert('Unable to post rental: ' + err.message);
  }
}
