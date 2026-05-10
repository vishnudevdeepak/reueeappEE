// Authentication check
function checkAuth() {
  const user = localStorage.getItem('loggedInUser');
  if (!user) {
    navigateTo('login.html');
    return;
  }
}

const API_BASE = (window.location.protocol === 'file:' || window.location.origin === 'null')
  ? 'http://localhost:3000' : window.location.origin;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadBuyListings();
});

// Load buy listings
async function loadBuyListings() {
  try {
    const res = await fetch(`${API_BASE}/api/listings?type=buy`);
    const listings = await res.json();
    const container = document.getElementById('buyListingsContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (listings.length === 0) {
      container.innerHTML = '<p>No items for sale available.</p>';
      return;
    }
    
    listings.forEach(item => {
      const card = document.createElement('div');
      card.className = 'listing-card';
      card.innerHTML = `
        <div class="card-header">
          <h3>${item.name || 'Unnamed Item'}</h3>
          <span class="seller">Seller: ${item.seller || 'Unknown'}</span>
        </div>
        <div class="card-body">
          <p>${item.description || 'No description provided'}</p>
          <div class="card-price">
            <strong>Price: $${item.price || '0'}</strong>
          </div>
          <div class="card-date">
            Posted: ${new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary" onclick="viewDetails(${item.id})">View Details</button>
          <button class="btn-secondary" onclick="contactSeller('${item.seller}')">Contact Seller</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading listings:', err);
    document.getElementById('buyListingsContainer').innerHTML = 
      '<p>Error loading listings. Please try again later.</p>';
  }
}

// View item details
function viewDetails(itemId) {
  localStorage.setItem('selectedItemId', itemId);
  navigateTo('filldetailpage.html');
}

// Contact seller
function contactSeller(sellerName) {
  const currentUser = localStorage.getItem('loggedInUser');
  if (currentUser === sellerName) {
    alert('You are the seller of this item.');
    return;
  }
  alert(`You want to contact ${sellerName}. A message system can be implemented here.`);
  // In a real app, implement a messaging system
}

// Search listings by name
function searchListings(searchTerm) {
  const container = document.getElementById('buyListingsContainer');
  const cards = container.querySelectorAll('.listing-card');
  
  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    if (title.includes(search) || description.includes(search)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Sort listings by price
function sortByPrice(order = 'asc') {
  const container = document.getElementById('buyListingsContainer');
  const cards = Array.from(container.querySelectorAll('.listing-card'));
  
  cards.sort((a, b) => {
    const priceA = parseFloat(a.querySelector('.card-price').textContent.match(/\$(\d+)/)[1]);
    const priceB = parseFloat(b.querySelector('.card-price').textContent.match(/\$(\d+)/)[1]);
    
    return order === 'asc' ? priceA - priceB : priceB - priceA;
  });
  
  cards.forEach(card => container.appendChild(card));
}

// Logout function
function logout() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('userEmail');
  navigateTo('login.html');
}
