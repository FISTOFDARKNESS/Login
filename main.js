// Enhanced Product Catalog JavaScript
class ProductCatalog {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentProductId = null;
    this.selectedRating = 0;
    this.cache = new Map();
    this.isLoading = false;
    
    // Debounce timers
    this.searchDebounceTimer = null;
    this.filterDebounceDelay = 300;
    
    // Performance tracking
    this.loadStartTime = null;
  }

  // Initialize the application
  async init() {
    try {
      this.loadStartTime = performance.now();
      await this.setupTheme();
      await this.loadProducts();
      this.setupEventListeners();
      this.logPerformanceMetrics();
    } catch (error) {
      console.error('Failed to initialize Product Catalog:', error);
      this.showNotification('Failed to initialize application', 'error');
    }
  }

  // Theme management
  async setupTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      this.updateThemeButton('Light Mode');
    }
  }

  updateThemeButton(text) {
    const button = document.getElementById('theme-toggle');
    if (button) button.textContent = text;
  }

  // Product loading with caching and error handling
  async loadProducts() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingState();
    
    try {
      console.log('🔄 Loading products from database...');
      
      // Check cache first
      if (this.cache.has('products')) {
        console.log('📋 Using cached products');
        this.products = this.cache.get('products');
      } else {
        this.products = await this.fetchProducts();
        this.cache.set('products', this.products);
      }
      
      this.filteredProducts = [...this.products];
      
      await Promise.all([
        this.displayProducts(this.products),
        this.populateCategories(this.products)
      ]);
      
      console.log(`✅ Successfully loaded ${this.products.length} products`);
      
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      this.displayError('Failed to load products from database', error.message);
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  // Enhanced fetch with better error handling
  async fetchProducts() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch('/.netlify/functions/getProducts', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      const products = await response.json();
      
      if (!Array.isArray(products)) {
        throw new Error(`Invalid response format: expected array, got ${typeof products}`);
      }
      
      // Validate product structure
      const validProducts = products.filter(product => this.validateProduct(product));
      
      if (validProducts.length !== products.length) {
        console.warn(`⚠️ Filtered out ${products.length - validProducts.length} invalid products`);
      }
      
      return validProducts;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw error;
    }
  }

  // Product validation
  validateProduct(product) {
    const requiredFields = ['id', 'name', 'category', 'description'];
    return requiredFields.every(field => product[field] && typeof product[field] === 'string');
  }

  // Event listeners setup
  setupEventListeners() {
    // Search with debouncing
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.debouncedFilter(e));
    }

    // Filter selects
    const categoryFilter = document.getElementById('category-filter');
    const ratingFilter = document.getElementById('rating-filter');
    
    if (categoryFilter) categoryFilter.addEventListener('change', () => this.filterProducts());
    if (ratingFilter) ratingFilter.addEventListener('change', () => this.filterProducts());

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());

    // Modal controls
    this.setupModalListeners();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Window resize handler
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));
  }

  setupModalListeners() {
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-feedback');
    const form = document.getElementById('feedback-form');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
    
    // Close modal on background click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Star rating functionality
    const stars = document.querySelectorAll('#rating-stars .star');
    stars.forEach(star => {
      star.addEventListener('click', () => this.selectRating(star));
      star.addEventListener('mouseover', () => this.highlightStars(parseInt(star.dataset.value)));
      star.addEventListener('mouseout', () => this.highlightStars(this.selectedRating));
    });

    if (form) form.addEventListener('submit', (e) => this.submitFeedback(e));
  }

  // Debounced filtering
  debouncedFilter() {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.filterProducts();
    }, this.filterDebounceDelay);
  }

  // Enhanced product display with virtual scrolling consideration
  async displayProducts(productList) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (!productList?.length) {
      container.innerHTML = `
        <div class="no-results">
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or browse all categories.</p>
        </div>
      `;
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Process products in batches to avoid blocking the UI
    const batchSize = 12;
    for (let i = 0; i < productList.length; i += batchSize) {
      const batch = productList.slice(i, i + batchSize);
      const cards = await Promise.all(
        batch.map(product => this.createProductCard(product))
      );
      
      cards.forEach(card => fragment.appendChild(card));
      
      // Allow UI to update between batches
      if (i + batchSize < productList.length) {
        await this.nextTick();
      }
    }

    container.appendChild(fragment);
    this.animateCardsIn();
  }

  // Enhanced card creation with lazy loading
  async createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;

    const avgRating = await this.fetchAverageRating(product.id);
    
    card.innerHTML = `
      <img 
        src="${product.image || 'https://via.placeholder.com/300x200/667eea/ffffff?text=No+Image'}" 
        alt="${this.escapeHtml(product.name)}" 
        class="product-image" 
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x200/cccccc/666666?text=Image+Not+Found'"
      >
      <div class="product-info">
        <div class="product-category">${this.escapeHtml(product.category)}</div>
        <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
        <p class="product-description">${this.escapeHtml(this.truncateText(product.description, 100))}</p>
        <div class="product-rating">
          <div class="stars">${this.generateStarsHTML(avgRating)}</div>
          <span class="rating-value">${avgRating.toFixed(1)} / 5.0</span>
        </div>
        <div class="card-actions">
          <a href="${product.link || '#'}" target="_blank" class="product-link" rel="noopener noreferrer">
            View Product
          </a>
          <button class="feedback-btn" data-id="${product.id}">
            ⭐ Rate this product
          </button>
        </div>
      </div>
    `;

    // Add event listener to rate button
    const rateBtn = card.querySelector('.feedback-btn');
    if (rateBtn) {
      rateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(product.id, product.name);
      });
    }

    return card;
  }

  // Enhanced rating fetch with caching
  async fetchAverageRating(productId) {
    const cacheKey = `rating_${productId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/.netlify/functions/getReviews?productId=${productId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Failed to fetch reviews for product ${productId}`);
        return 0;
      }
      
      const reviews = await response.json();
      
      if (!Array.isArray(reviews) || !reviews.length) {
        this.cache.set(cacheKey, 0);
        return 0;
      }
      
      const average = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
      const roundedAverage = Math.round(average * 10) / 10; // Round to 1 decimal
      
      this.cache.set(cacheKey, roundedAverage);
      return roundedAverage;
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn(`Error fetching rating for product ${productId}:`, error.message);
      }
      return 0;
    }
  }

  // Enhanced star generation
  generateStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span class="star filled">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
      starsHTML += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span class="star empty">★</span>';
    }
    
    return starsHTML;
  }

  // Enhanced filtering with performance optimization
  filterProducts() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const ratingFilter = parseFloat(document.getElementById('rating-filter')?.value) || 0;

    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      
      // For rating filter, we'd need to check cached ratings
      const matchesRating = ratingFilter === 0 || this.getProductRating(product.id) >= ratingFilter;
      
      return matchesSearch && matchesCategory && matchesRating;
    });

    this.displayProducts(this.filteredProducts);
    this.updateResultsCount();
  }

  getProductRating(productId) {
    const cacheKey = `rating_${productId}`;
    return this.cache.get(cacheKey) || 0;
  }

  updateResultsCount() {
    const total = this.products.length;
    const filtered = this.filteredProducts.length;
    
    // You could add a results counter element here
    console.log(`Showing ${filtered} of ${total} products`);
  }

  // Enhanced modal functionality
  openModal(productId, productName) {
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;

    this.currentProductId = productId;
    this.selectedRating = 0;
    
    // Update modal content
    const modalTitle = document.getElementById('modal-product-name');
    if (modalTitle) modalTitle.textContent = `Rate: ${productName}`;
    
    // Reset form
    const form = document.getElementById('feedback-form');
    if (form) form.reset();
    
    document.getElementById('product-id').value = productId;
    this.highlightStars(0);
    
    // Show modal with animation
    modal.style.display = 'flex';
    modal.offsetHeight; // Trigger reflow
    modal.classList.add('show');
    
    // Focus first input
    const firstInput = document.getElementById('user-name');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
      modal.style.display = 'none';
      this.currentProductId = null;
      document.body.style.overflow = '';
    }, 300);
  }

  // Enhanced feedback submission
  async submitFeedback(event) {
    event.preventDefault();
    
    const formData = this.getFormData();
    
    if (!this.validateFeedbackForm(formData)) {
      return;
    }
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    try {
      // Show loading state
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      
      const response = await fetch('/.netlify/functions/addReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: formData.productId,
          userName: formData.userName,
          rating: formData.rating,
          comment: formData.comment
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit review: ${response.status} ${errorText}`);
      }
      
      await response.json();
      
      // Clear rating cache for this product
      const cacheKey = `rating_${formData.productId}`;
      this.cache.delete(cacheKey);
      
      this.showNotification('Review submitted successfully!', 'success');
      this.closeModal();
      
      // Refresh the product display
      await this.loadProducts();
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      this.showNotification(`Failed to submit review: ${error.message}`, 'error');
      
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  getFormData() {
    return {
      productId: document.getElementById('product-id')?.value,
      userName: document.getElementById('user-name')?.value.trim(),
      rating: parseInt(document.getElementById('rating-value')?.value),
      comment: document.getElementById('comment')?.value.trim()
    };
  }

  validateFeedbackForm({ productId, userName, rating, comment }) {
    if (!productId || !userName || !rating || !comment) {
      this.showNotification('Please fill in all fields', 'error');
      return false;
    }
    
    if (rating < 1 || rating > 5) {
      this.showNotification('Please select a rating between 1 and 5 stars', 'error');
      return false;
    }
    
    if (userName.length < 2) {
      this.showNotification('Name must be at least 2 characters long', 'error');
      return false;
    }
    
    if (comment.length < 10) {
      this.showNotification('Comment must be at least 10 characters long', 'error');
      return false;
    }
    
    return true;
  }

  // Star rating functionality
  selectRating(star) {
    this.selectedRating = parseInt(star.dataset.value);
    document.getElementById('rating-value').value = this.selectedRating;
    this.highlightStars(this.selectedRating);
  }

  highlightStars(rating) {
    const stars = document.querySelectorAll('#rating-stars .star');
    stars.forEach((star, index) => {
      star.style.color = index < rating ? '#ffc107' : '#ccc';
      star.style.transform = index < rating ? 'scale(1.1)' : 'scale(1)';
    });
  }

  // Theme toggle
  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark.toString());
    this.updateThemeButton(isDark ? 'Light Mode' : 'Dark Mode');
    
    // Animate theme transition
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  // Category population
  populateCategories(products) {
    const select = document.getElementById('category-filter');
    if (!select) return;

    const categories = [...new Set(products.map(p => p.category))].sort();
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (categories.includes(currentValue)) {
      select.value = currentValue;
    }
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async nextTick() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  // Loading states
  showLoadingState() {
    const container = document.getElementById('products-container');
    if (container) {
      container.innerHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      `;
    }
  }

  hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
      loadingState.remove();
    }
  }

  // Error display
  displayError(message, details) {
    const container = document.getElementById('products-container');
    if (container) {
      container.innerHTML = `
        <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--secondary);">
          <h3>⚠️ Error Loading Products</h3>
          <p>${message}</p>
          ${details ? `<details><summary>Technical Details</summary><pre>${details}</pre></details>` : ''}
          <button onclick="window.catalog.loadProducts()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
            Try Again
          </button>
        </div>
      `;
    }
  }

  // Notifications
  showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
      `;
      document.body.appendChild(notification);
    }

    // Set notification style based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;

    // Show notification
    notification.style.transform = 'translateX(0)';

    // Hide after 4 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
    }, 4000);
  }

  // Keyboard shortcuts
  handleKeyboardShortcuts(event) {
    // Escape key closes modal
    if (event.key === 'Escape') {
      this.closeModal();
    }
    
    // Ctrl/Cmd + K focuses search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      document.getElementById('search-input')?.focus();
    }
  }

  // Responsive handling
  handleResize() {
    // Handle any responsive adjustments
    console.log('Window resized');
  }

  // Card animation
  animateCardsIn() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }

  // Performance logging
  logPerformanceMetrics() {
    if (this.loadStartTime) {
      const loadTime = performance.now() - this.loadStartTime;
      console.log(`🚀 Application loaded in ${loadTime.toFixed(2)}ms`);
      console.log(`📊 Products in memory: ${this.products.length}`);
      console.log(`💾 Cache entries: ${this.cache.size}`);
    }
  }
}

// Initialize the application
const catalog = new ProductCatalog();

// Make catalog globally available for debugging
window.catalog = catalog;

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => catalog.init());
} else {
  catalog.init();
}

// Service worker registration (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered: ', registration))
      .catch(registrationError => console.log('SW registration failed: ', registrationError));
  });
}
