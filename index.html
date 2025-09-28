<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Product Catalog</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --bg: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  --bg-solid: #f8fafc;
  --fg: #1e293b;
  --card: rgba(255, 255, 255, 0.95);
  --border: rgba(226, 232, 240, 0.8);
  --primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-hover: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  --secondary: #64748b;
  --hover: rgba(99, 102, 241, 0.05);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --accent: #f59e0b;
  --success: #10b981;
  --glass: rgba(255, 255, 255, 0.25);
  --backdrop: backdrop-filter: blur(10px);
}

.dark-mode {
  --bg: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  --bg-solid: #0f172a;
  --fg: #f1f5f9;
  --card: rgba(30, 41, 59, 0.95);
  --border: rgba(71, 85, 105, 0.6);
  --primary: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  --primary-hover: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
  --secondary: #94a3b8;
  --hover: rgba(139, 92, 246, 0.1);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  --glass: rgba(30, 41, 59, 0.4);
}

* { 
  margin: 0; 
  padding: 0; 
  box-sizing: border-box; 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
}

body { 
  background: var(--bg);
  color: var(--fg); 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  line-height: 1.6;
  min-height: 100vh;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

header { 
  background: var(--card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1.5rem 0; 
  box-shadow: var(--shadow);
  position: sticky; 
  top: 0; 
  z-index: 100;
  border-bottom: 1px solid var(--border);
}

.header-content { 
  max-width: 1400px; 
  margin: auto; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  flex-wrap: wrap; 
  gap: 1.5rem;
  padding: 0 2rem;
}

h1 { 
  background: var(--primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem; 
  font-weight: 700;
  letter-spacing: -0.02em;
}

.controls { 
  display: flex; 
  gap: 1rem; 
  flex-wrap: wrap; 
  align-items: center; 
}

.search-box { 
  display: flex; 
  align-items: center; 
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border); 
  border-radius: 12px; 
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.search-box:hover::before {
  transform: translateX(100%);
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.search-box input { 
  border: none; 
  background: transparent; 
  color: var(--fg); 
  padding: 0.25rem; 
  width: 250px; 
  outline: none;
  font-size: 0.95rem;
  font-weight: 400;
}

.search-box input::placeholder {
  color: var(--secondary);
}

.filter-select, .theme-toggle { 
  padding: 0.75rem 1rem; 
  border-radius: 12px; 
  border: 1px solid var(--border); 
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--fg); 
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.filter-select:hover {
  background: var(--hover);
  border-color: var(--accent);
}

.theme-toggle { 
  background: var(--primary);
  color: white; 
  border: none; 
  font-weight: 600;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}

.theme-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.theme-toggle:hover::before {
  left: 100%;
}

.theme-toggle:hover { 
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

main { 
  max-width: 1400px; 
  margin: 3rem auto; 
  padding: 0 2rem; 
}

.products-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 2rem; 
}

.product-card { 
  background: var(--card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px; 
  overflow: hidden; 
  box-shadow: var(--shadow);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  display: flex; 
  flex-direction: column;
  border: 1px solid var(--border);
  position: relative;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.product-card:hover::before {
  transform: scaleX(1);
}

.product-card:hover { 
  transform: translateY(-8px) scale(1.02); 
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.product-image { 
  width: 100%; 
  height: 220px; 
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info { 
  padding: 1.5rem; 
  flex-grow: 1; 
  display: flex; 
  flex-direction: column; 
}

.product-category { 
  color: var(--secondary); 
  font-size: 0.85rem; 
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.product-name { 
  font-size: 1.3rem; 
  margin-bottom: 0.75rem; 
  background: var(--primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  line-height: 1.3;
}

.product-description { 
  font-size: 0.95rem; 
  margin-bottom: 1.5rem; 
  flex-grow: 1;
  color: var(--secondary);
  line-height: 1.6;
}

.product-rating { 
  display: flex; 
  align-items: center; 
  margin-bottom: 1.5rem; 
}

.stars { 
  display: flex; 
  margin-right: 0.75rem; 
}

.star { 
  color: var(--accent); 
  font-size: 1.1rem; 
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.3));
}

.star:hover {
  transform: scale(1.2);
}

.rating-value { 
  font-weight: 600;
  color: var(--fg);
}

.product-link { 
  background: var(--primary);
  color: white; 
  text-align: center; 
  padding: 1rem; 
  border-radius: 12px; 
  text-decoration: none; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  margin-top: auto;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.product-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.product-link:hover::before {
  left: 100%;
}

.product-link:hover { 
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.feedback-modal { 
  display: none; 
  position: fixed; 
  inset: 0; 
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000; 
  justify-content: center; 
  align-items: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content { 
  background: var(--card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 2.5rem; 
  border-radius: 20px; 
  width: 90%; 
  max-width: 500px; 
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  transform: scale(0.9);
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  to {
    transform: scale(1);
  }
}

.modal-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 2rem; 
}

.modal-header h2 {
  background: var(--primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.close-modal { 
  background: none; 
  border: none; 
  font-size: 1.5rem; 
  cursor: pointer; 
  color: var(--fg);
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 0.5rem;
}

.close-modal:hover {
  background: var(--hover);
  transform: rotate(90deg);
}

.feedback-form label { 
  display: block; 
  margin-bottom: 0.5rem; 
  font-weight: 600;
  color: var(--fg);
}

.feedback-form input, .feedback-form textarea { 
  width: 100%; 
  padding: 1rem; 
  margin-bottom: 1.5rem; 
  border: 1px solid var(--border); 
  border-radius: 12px; 
  background: var(--glass);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--fg);
  transition: all 0.3s ease;
  font-family: inherit;
}

.feedback-form input:focus, .feedback-form textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.feedback-form textarea { 
  min-height: 120px; 
  resize: vertical;
  line-height: 1.6;
}

.form-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 1rem; 
}

.submit-btn, .cancel-btn { 
  padding: 1rem 2rem; 
  border: none; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  color: white;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.submit-btn { 
  background: var(--primary);
  box-shadow: var(--shadow);
} 

.submit-btn:hover { 
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.cancel-btn { 
  background: var(--secondary);
  box-shadow: var(--shadow);
} 

.cancel-btn:hover { 
  background: #475569;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.no-results { 
  grid-column: 1/-1; 
  text-align: center; 
  padding: 4rem 2rem; 
  color: var(--secondary);
  font-size: 1.1rem;
}

/* Responsive Design */
@media(max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    padding: 0 1rem;
  } 
  
  .controls {
    justify-content: center;
  } 
  
  .search-box input {
    width: 180px;
  } 
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  main {
    padding: 0 1rem;
    margin: 2rem auto;
  }
  
  h1 {
    font-size: 2rem;
  }
}

@media(max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  } 
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  } 
  
  .search-box, .filter-select, .theme-toggle {
    width: 100%;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .modal-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-btn, .cancel-btn {
    width: 100%;
  }
}

/* Loading Animation */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.loading {
  background: linear-gradient(90deg, var(--card) 25%, var(--hover) 50%, var(--card) 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
</style>
</head>
<body>
<header>
  <div class="header-content">
    <h1>Product Catalog</h1>
    <div class="controls">
      <div class="search-box">
        <input id="search-input" placeholder="Search products..." />
      </div>
      <select id="category-filter" class="filter-select">
        <option value="">All categories</option>
      </select>
      <select id="rating-filter" class="filter-select">
        <option value="0">All ratings</option>
        <option value="5">5 stars</option>
        <option value="4">4+ stars</option>
        <option value="3">3+ stars</option>
        <option value="2">2+ stars</option>
        <option value="1">1+ stars</option>
      </select>
      <button id="theme-toggle" class="theme-toggle">Dark Mode</button>
    </div>
  </div>
</header>

<main>
  <div class="products-grid" id="products-container"></div>
</main>

<div class="feedback-modal" id="feedback-modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-product-name">Rate Product</h2>
      <button class="close-modal" id="close-modal">&times;</button>
    </div>
    <form class="feedback-form" id="feedback-form">
      <input type="hidden" id="product-id" />
      <label for="user-name">Your name:</label>
      <input id="user-name" required />
      <label>Rating:</label>
      <div class="stars" id="rating-stars">
        <span class="star" data-value="1">★</span>
        <span class="star" data-value="2">★</span>
        <span class="star" data-value="3">★</span>
        <span class="star" data-value="4">★</span>
        <span class="star" data-value="5">★</span>
      </div>
      <input type="hidden" id="rating-value" required />
      <label for="comment">Comment:</label>
      <textarea id="comment" required></textarea>
      <div class="form-actions">
        <button type="button" class="cancel-btn" id="cancel-feedback">Cancel</button>
        <button type="submit" class="submit-btn">Submit Review</button>
      </div>
    </form>
  </div>
</div>

<script src="main.js"></script>
</body>
</html>
