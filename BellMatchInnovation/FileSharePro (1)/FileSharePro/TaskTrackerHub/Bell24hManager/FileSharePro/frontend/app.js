// Bell24h - RFQ Marketplace Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize GridStack
  var grid = GridStack.init({
    cellHeight: 80,
    margin: 10,
    float: true,
    animate: true
  });
  
  // Initialize the UI components
  initializeApp();

  // If we're on the RFQ listing page, load the RFQs
  if (window.location.pathname === '/rfqs.html') {
    fetchAndDisplayRFQs();
  }

  // If we're on the supplier listing page, load the suppliers
  if (window.location.pathname === '/suppliers.html') {
    fetchAndDisplaySuppliers();
  }

  // If we're on the dashboard page, load the dashboard data
  if (window.location.pathname === '/dashboard.html') {
    loadDashboardData();
  }
});

// Initialize the application UI
function initializeApp() {
  console.log('Bell24h marketplace initialized');

  // Setup event listeners for navigation and dropdowns
  setupNavigation();
  
  // Initialize trading stats
  updateTradingStats();

  // Highlight active navigation item
  highlightActiveNavItem();

  // Fetch recent RFQs for the homepage
  if (document.getElementById('recent-rfqs')) {
    loadRFQs();// Use the new function to load RFQs
  }

  // Initialize WebSocket connection
  const socket = new Bell24hRealTimeClient();

  // Update connection status
  socket.onConnect(() => {
    document.getElementById('connection-status').textContent = 'Connected';
    document.getElementById('connection-status').style.background = '#86efac';
  });

  socket.onDisconnect(() => {
    document.getElementById('connection-status').textContent = 'Disconnected';
    document.getElementById('connection-status').style.background = '#fca5a5';
  });

  // Listen for new RFQs
  socket.on('new_rfq', (rfq) => {
    displayRFQ(rfq);
  });
}

// Set up navigation event listeners
function setupNavigation() {
  const dropdowns = document.querySelectorAll('.dropdown-toggle');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function(event) {
      event.preventDefault();
      const dropdownMenu = this.nextElementSibling;
      dropdownMenu.classList.toggle('show');
    });
  });
}

// Highlight the active navigation item based on current URL
function highlightActiveNavItem() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// Fetch recent RFQs for homepage
function fetchRecentRFQs() {
  fetch('/api/rfqs')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'success' && data.data && data.data.length > 0) {
        displayRecentRFQs(data.data.slice(0, 3)); // Display up to 3 recent RFQs
      } else {
        console.log('No RFQs found or empty response');
      }
    })
    .catch(error => {
      console.error('Error fetching recent RFQs:', error);
    });
}

// Display recent RFQs on the homepage
// Fetch and display RFQs
async function fetchRFQs() {
  try {
    const response = await fetch('/api/rfqs');
    const rfqs = await response.json();
    displayRecentRFQs(rfqs);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    displayRecentRFQs([]);
  }
}

// Initialize on page load
window.addEventListener('load', fetchRFQs);

function displayRecentRFQs(rfqs) {
  const rfqContainer = document.getElementById('recent-rfqs');
  if (!rfqContainer) return;

  // Clear any existing content
  rfqContainer.innerHTML = '';

  // If no RFQs, show a message
  if (rfqs.length === 0) {
    rfqContainer.innerHTML = '<div class="col-12 text-center"><p>No RFQs available at the moment.</p></div>';
    return;
  }

  // Add each RFQ to the container
  rfqs.forEach(rfq => {
    const dueDate = new Date(rfq.deadline);
    const today = new Date();
    const diffTime = Math.abs(dueDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rfqElement = document.createElement('div');
    rfqElement.className = 'col-md-6 col-lg-4';
    rfqElement.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <span class="badge bg-primary mb-2">${rfq.category || 'General'}</span>
          <h5 class="card-title">${rfq.title}</h5>
          <p class="card-text">${rfq.description.substring(0, 100)}...</p>
          <div class="d-flex justify-content-between align-items-center">
            <span><i class="bi bi-calendar"></i> Due in ${diffDays} days</span>
            <span><i class="bi bi-geo-alt"></i> ${rfq.deliveryLocation || 'Not specified'}</span>
          </div>
        </div>
        <div class="card-footer bg-white">
          <a href="/rfq-details.html?id=${rfq.id}" class="btn btn-outline-primary w-100">View Details</a>
        </div>
      </div>
    `;

    rfqContainer.appendChild(rfqElement);
  });
}

// Fetch and display all RFQs for the RFQ listing page
function fetchAndDisplayRFQs() {
  fetch('/api/rfqs')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'success') {
        displayRFQs(data.data);
      } else {
        console.error('Error in API response:', data.message);
      }
    })
    .catch(error => {
      console.error('Error fetching RFQs:', error);
    });
}

// Display list of RFQs on the RFQ listing page
function displayRFQs(rfqs) {
  const rfqListContainer = document.getElementById('rfq-list');
  if (!rfqListContainer) return;

  // Clear any existing content
  rfqListContainer.innerHTML = '';

  // If no RFQs, show a message
  if (rfqs.length === 0) {
    rfqListContainer.innerHTML = '<div class="col-12 text-center"><p>No RFQs available at the moment.</p></div>';
    return;
  }

  // Add each RFQ to the container
  rfqs.forEach(rfq => {
    const rfqElement = document.createElement('div');
    rfqElement.className = 'col-md-6 col-lg-4 mb-4';

    const dueDate = rfq.deadline ? new Date(rfq.deadline) : null;
    const dueDateFormatted = dueDate ? dueDate.toLocaleDateString() : 'Not specified';

    rfqElement.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <span class="badge bg-primary mb-2">${rfq.category || 'General'}</span>
          <h5 class="card-title">${rfq.title}</h5>
          <p class="card-text">${rfq.description.substring(0, 100)}...</p>
          <div class="d-flex justify-content-between align-items-center">
            <span><i class="bi bi-calendar"></i> Due: ${dueDateFormatted}</span>
            <span><i class="bi bi-geo-alt"></i> ${rfq.deliveryLocation || 'Not specified'}</span>
          </div>
        </div>
        <div class="card-footer bg-white">
          <a href="/rfq-details.html?id=${rfq.id}" class="btn btn-outline-primary w-100">View Details</a>
        </div>
      </div>
    `;

    rfqListContainer.appendChild(rfqElement);
  });
}

// Fetch and display suppliers on the supplier listing page
function fetchAndDisplaySuppliers() {
  // This would fetch from an API in a real implementation
  // For now, we'll use mock data
  const suppliers = [
    { id: 1, name: 'TechSupplies Ltd.', location: 'Mumbai', rating: 4.8, categories: ['Electronics', 'Manufacturing'] },
    { id: 2, name: 'IndustrialParts Co.', location: 'Delhi', rating: 4.5, categories: ['Industrial', 'Automotive'] },
    { id: 3, name: 'ChemSolutions', location: 'Bangalore', rating: 4.7, categories: ['Chemicals', 'Pharmaceuticals'] }
  ];

  displaySuppliers(suppliers);
}

// Display list of suppliers on the supplier listing page
function displaySuppliers(suppliers) {
  const supplierListContainer = document.getElementById('supplier-list');
  if (!supplierListContainer) return;

  // Clear any existing content
  supplierListContainer.innerHTML = '';

  // If no suppliers, show a message
  if (suppliers.length === 0) {
    supplierListContainer.innerHTML = '<div class="col-12 text-center"><p>No suppliers available at the moment.</p></div>';
    return;
  }

  // Add each supplier to the container
  suppliers.forEach(supplier => {
    const supplierElement = document.createElement('div');
    supplierElement.className = 'col-md-6 col-lg-4 mb-4';

    const stars = generateStarRating(supplier.rating);

    supplierElement.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${supplier.name}</h5>
          <p class="text-muted"><i class="bi bi-geo-alt"></i> ${supplier.location}</p>
          <div class="mb-3">
            ${supplier.categories.map(cat => `<span class="badge bg-secondary me-1">${cat}</span>`).join('')}
          </div>
          <div class="rating text-warning mb-3">
            ${stars}
            <span class="ms-2 text-dark">${supplier.rating}</span>
          </div>
        </div>
        <div class="card-footer bg-white">
          <a href="/supplier-details.html?id=${supplier.id}" class="btn btn-outline-primary w-100">View Profile</a>
        </div>
      </div>
    `;

    supplierListContainer.appendChild(supplierElement);
  });
}

// Generate star rating HTML based on rating value
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let starsHTML = '';

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="bi bi-star-fill"></i>';
  }

  // Add half star if needed
  if (halfStar) {
    starsHTML += '<i class="bi bi-star-half"></i>';
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="bi bi-star"></i>';
  }

  return starsHTML;
}

// Load dashboard data for the dashboard page
function loadDashboardData() {
  // This would fetch from an API in a real implementation
  // For now, we'll use mock data
  const dashboardData = {
    rfqsPublished: 24,
    quotesReceived: 87,
    activeSuppliers: 152,
    completedDeals: 19,
    rfqsByCategory: {
      labels: ['Electronics', 'Chemicals', 'Manufacturing', 'Services', 'Other'],
      data: [30, 15, 25, 20, 10]
    },
    monthlyActivity: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      rfqs: [5, 8, 12, 6, 10, 24],
      quotes: [12, 19, 35, 14, 30, 87]
    }
  };

  displayDashboardData(dashboardData);
}

// Display dashboard data on the dashboard page
function displayDashboardData(data) {
  // Update the stats
  updateDashboardStats(data);

  // Initialize charts if Chart.js is available
  if (typeof Chart !== 'undefined') {
    initializeCharts(data);
  }
}

// Update dashboard statistics
function updateDashboardStats(data) {
  // Update stats counters
  if (document.getElementById('rfqs-count')) {
    document.getElementById('rfqs-count').textContent = data.rfqsPublished;
  }

  if (document.getElementById('quotes-count')) {
    document.getElementById('quotes-count').textContent = data.quotesReceived;
  }

  if (document.getElementById('suppliers-count')) {
    document.getElementById('suppliers-count').textContent = data.activeSuppliers;
  }

  if (document.getElementById('deals-count')) {
    document.getElementById('deals-count').textContent = data.completedDeals;
  }
}

// Initialize dashboard charts
function initializeCharts(data) {
  // RFQs by Category chart (pie/doughnut)
  const categoryChartCtx = document.getElementById('rfq-category-chart');
  if (categoryChartCtx) {
    new Chart(categoryChartCtx, {
      type: 'doughnut',
      data: {
        labels: data.rfqsByCategory.labels,
        datasets: [{
          data: data.rfqsByCategory.data,
          backgroundColor: [
            '#3B82F6', // blue
            '#10B981', // green
            '#F97316', // orange
            '#8B5CF6', // purple
            '#6B7280'  // gray
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  // Monthly activity chart (line)
  const activityChartCtx = document.getElementById('monthly-activity-chart');
  if (activityChartCtx) {
    new Chart(activityChartCtx, {
      type: 'line',
      data: {
        labels: data.monthlyActivity.labels,
        datasets: [
          {
            label: 'RFQs Published',
            data: data.monthlyActivity.rfqs,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Quotes Received',
            data: data.monthlyActivity.quotes,
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}


// Initialize WebSocket connection (moved to initializeApp)

// Display RFQs
function displayRFQ(rfq) {
  const rfqElement = document.createElement('div');
  rfqElement.className = 'rfq-card';
  rfqElement.innerHTML = `
    <h3>${rfq.title}</h3>
    <p>${rfq.description}</p>
    <div class="rfq-meta">
      <span>Category: ${rfq.category}</span>
      <span>Location: ${rfq.deliveryLocation}</span>
    </div>
  `;
  document.getElementById('recent-rfqs').appendChild(rfqElement);
}

// Fetch and display initial RFQs
async function loadRFQs() {
  try {
    const response = await fetch('/api/rfqs');
    const rfqs = await response.json();
    document.getElementById('recent-rfqs').innerHTML = '';
    rfqs.forEach(displayRFQ);
  } catch (error) {
    console.error('Error loading RFQs:', error);
  }
}

// Update trading statistics
function updateTradingStats() {
  fetch('/api/rfqs')
    .then(response => response.json())
    .then(rfqs => {
      document.getElementById('active-rfqs').textContent = rfqs.length;
      document.getElementById('response-rate').textContent = 
        Math.round((rfqs.filter(r => r.responses > 0).length / rfqs.length) * 100) + '%';
    })
    .catch(error => console.error('Error updating stats:', error));
}

// Update stats every 30 seconds
setInterval(updateTradingStats, 30000);

// WebSocket connection for real-time updates
const ws = new WebSocket(`ws://${window.location.hostname}:5000/ws`);

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'rfq_update') {
    updateTradingStats();
    showNotification(data.message);
  }
};

ws.onclose = function() {
  console.log('WebSocket connection closed. Attempting to reconnect...');
  setTimeout(() => {
    window.location.reload();
  }, 5000);
};

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}