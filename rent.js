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
  loadRentalListings();
});

// Load rental listings
async function loadRentalListings() {
  try {
    const res = await fetch(`${API_BASE}/api/rentals`);
    const rentals = await res.json();
    const container = document.getElementById('rentalListingsContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    if (rentals.length === 0) {
      container.innerHTML = '<p>No items available for rent.</p>';
      return;
    }
    
    rentals.forEach(item => {
      const card = document.createElement('div');
      card.className = 'rental-card';
      card.innerHTML = `
        <div class="card-header">
          <h3>${item.name || 'Unnamed Item'}</h3>
          <span class="owner">Owner: ${item.owner || 'Unknown'}</span>
        </div>
        <div class="card-body">
          <p>${item.description || 'No description provided'}</p>
          <div class="card-price">
            <strong>Rental Price: $${item.rentPrice || '0'} / day</strong>
          </div>
          <div class="card-date">
            Posted: ${new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary" onclick="viewRentalDetails(${item.id})">View Details</button>
          <button class="btn-secondary" onclick="bookRental(${item.id}, '${item.name}')">Book Now</button>
          <button class="btn-tertiary" onclick="contactOwner('${item.owner}')">Contact Owner</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading rentals:', err);
    const container = document.getElementById('rentalListingsContainer');
    if (container) {
      container.innerHTML = '<p>Error loading rentals. Please try again later.</p>';
    }
  }
}

// View rental details
function viewRentalDetails(rentalId) {
  localStorage.setItem('selectedRentalId', rentalId);
  navigateTo('rentdetailpage.html');
}

// Book a rental
function bookRental(rentalId, itemName) {
  const currentUser = localStorage.getItem('loggedInUser');
  const owner = prompt(`Who is the owner of this item? (For this item: ${itemName})`);
  
  if (!owner) return;
  
  if (currentUser === owner) {
    alert('You cannot book your own rental item.');
    return;
  }
  
  const startDate = prompt('Start date (YYYY-MM-DD):');
  const endDate = prompt('End date (YYYY-MM-DD):');
  
  if (!startDate || !endDate) {
    alert('Please provide both dates.');
    return;
  }
  
  alert(`Booking request submitted for ${itemName} from ${startDate} to ${endDate}. Contact ${owner} to confirm.`);
  // In a real app, store booking data to backend
}

// Contact owner
function contactOwner(ownerName) {
  const currentUser = localStorage.getItem('loggedInUser');
  if (currentUser === ownerName) {
    alert('You are the owner of this item.');
    return;
  }
  alert(`You want to contact ${ownerName}. A message system can be implemented here.`);
  // In a real app, implement a messaging system
}

// Search rentals by name
function searchRentals(searchTerm) {
  const container = document.getElementById('rentalListingsContainer');
  if (!container) return;
  
  const cards = container.querySelectorAll('.rental-card');
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

// Sort rentals by price
function sortRentalsByPrice(order = 'asc') {
  const container = document.getElementById('rentalListingsContainer');
  if (!container) return;
  
  const cards = Array.from(container.querySelectorAll('.rental-card'));
  
  cards.sort((a, b) => {
    const priceA = parseFloat(a.querySelector('.card-price').textContent.match(/\$(\d+)/)[1]);
    const priceB = parseFloat(b.querySelector('.card-price').textContent.match(/\$(\d+)/)[1]);
    
    return order === 'asc' ? priceA - priceB : priceB - priceA;
  });
  
  cards.forEach(card => container.appendChild(card));
}

// Filter by price range
function filterByPriceRange(minPrice, maxPrice) {
  const container = document.getElementById('rentalListingsContainer');
  if (!container) return;
  
  const cards = container.querySelectorAll('.rental-card');
  
  cards.forEach(card => {
    const price = parseFloat(card.querySelector('.card-price').textContent.match(/\$(\d+)/)[1]);
    
    if (price >= minPrice && price <= maxPrice) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('userEmail');
  navigateTo('login.html');
}
