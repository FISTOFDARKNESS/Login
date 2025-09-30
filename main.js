let products = [], currentProductId = null, selectedRating = 0;
const SITE_KEY = '6LdOEdgrAAAAAN7VCLzmZj1ilE0frmol09Hfd-4V';

document.addEventListener("DOMContentLoaded", async () => {
  // Theme setup
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "Light Mode";
  }
  
  // Load products
  await loadProducts();
  setupListeners();
});

async function loadProducts() {
  try {
    console.log('Loading products from Neon...');
    products = await fetchProducts();
    console.log('Products loaded:', products);
    displayProducts(products);
    populateCategories(products);
  } catch (error) {
    console.error("Failed to load products from Neon:", error);
    displayError("Failed to load products from database. Please check the console for details.");
  }
}

function setupListeners() {
  document.getElementById("search-input").addEventListener("input", () => filterProducts());
  document.getElementById("category-filter").addEventListener("change", () => filterProducts());
  document.getElementById("rating-filter").addEventListener("change", () => filterProducts());
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("cancel-feedback").addEventListener("click", closeModal);

  // Star rating functionality
  document.querySelectorAll("#rating-stars .star").forEach(star => {
    star.addEventListener("click", () => selectRating(star));
    star.addEventListener("mouseover", () => highlightStars(parseInt(star.dataset.value)));
    star.addEventListener("mouseout", () => highlightStars(selectedRating));
  });

  document.getElementById("feedback-form").addEventListener("submit", e => submitFeedback(e));
  
  // Adicionar reCAPTCHA v3 aos botões "View Product"
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('product-link')) {
      e.preventDefault();
      handleViewProduct(e.target.href);
    }
  });
}

// Função para executar reCAPTCHA v3
async function executeRecaptcha(action = 'submit') {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === 'undefined') {
      reject(new Error('reCAPTCHA not loaded'));
      return;
    }
    
    grecaptcha.ready(async () => {
      try {
        const token = await grecaptcha.execute(SITE_KEY, { action });
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Função para verificar reCAPTCHA no servidor
async function verifyRecaptcha(token) {
  try {
    const response = await fetch('/.netlify/functions/verifyRecaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    const result = await response.json();
    return result.success && result.score > 0.5; // Score mínimo de 0.5
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Função para lidar com "View Product" com reCAPTCHA v3
async function handleViewProduct(url) {
  try {
    // Executar reCAPTCHA v3
    const token = await executeRecaptcha('view_product');
    
    // Verificar o token do reCAPTCHA
    const isValid = await verifyRecaptcha(token);
    
    if (isValid) {
      // Se válido, redirecionar para o produto
      window.open(url, '_blank');
    } else {
      alert('Security verification failed. Please try again.');
    }
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    alert('Security verification error. Please try again.');
  }
}

async function fetchProducts() {
  try {
    const response = await fetch("/.netlify/functions/getProducts");
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }
    
    const products = await response.json();
    
    // Verifica se a resposta é um array válido
    if (!Array.isArray(products)) {
      throw new Error('Invalid response format: expected array but got ' + typeof products);
    }
    
    return products;
  } catch (error) {
    console.error("Fetch products error:", error);
    throw error;
  }
}

function displayError(message) {
  const container = document.getElementById("products-container");
  container.innerHTML = `
    <div class="no-results">
      <h3>Error</h3>
      <p>${message}</p>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}

async function displayProducts(list) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";
  
  if (!list || !list.length) {
    container.innerHTML = '<div class="no-results">No products found in database.</div>';
    return;
  }

  for (const p of list) {
    const card = await createCard(p);
    container.appendChild(card);
  }
}

async function createCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";

  const avgRating = await fetchAvgRating(p.id);
  console.log(`Product ${p.id} average rating:`, avgRating);

  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200/cccccc/666666?text=No+Image'">
    <div class="product-info">
      <div class="product-category">${p.category}</div>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-description">${p.description}</p>
      <div class="product-rating">
        <div class="stars">${generateStars(avgRating)}</div>
        <span class="rating-value">${avgRating.toFixed(1)}</span>
      </div>
      <a href="${p.link}" target="_blank" class="product-link">Buy Product</a>
      <button class="feedback-btn" data-id="${p.id}" style="margin-top:.5rem;background:none;border:none;color:var(--primary);cursor:pointer;text-decoration:underline;">Rate</button>
    </div>
  `;

  card.querySelector(".feedback-btn").addEventListener("click", () => openModal(p.id));
  return card;
}

async function fetchAvgRating(productId) {
  try {
    console.log(`Fetching reviews for product ${productId}...`);
    const response = await fetch(`/.netlify/functions/getReviews?productId=${productId}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch reviews for product ${productId}:`, response.status);
      return 0;
    }
    
    const reviews = await response.json();
    console.log(`Reviews for product ${productId}:`, reviews);
    
    if (!Array.isArray(reviews) || !reviews.length) {
      return 0;
    }
    
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    console.log(`Calculated average for product ${productId}:`, avg);
    return avg;
  } catch (error) {
    console.warn(`Rating fetch error for product ${productId}:`, error.message);
    return 0;
  }
}

function generateStars(rating) {
  let html = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += '<span class="star">★</span>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      html += '<span class="star">★</span>';
    } else {
      html += '<span class="star" style="color:#ccc;">★</span>';
    }
  }
  return html;
}

function openModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  currentProductId = id;
  document.getElementById("modal-product-name").textContent = `Rate: ${product.name}`;
  document.getElementById("product-id").value = id;
  selectedRating = 0;
  document.getElementById("rating-value").value = "";
  document.getElementById("user-name").value = "";
  document.getElementById("comment").value = "";
  highlightStars(0);
  
  document.getElementById("feedback-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("feedback-modal").style.display = "none";
  currentProductId = null;
}

function selectRating(star) {
  selectedRating = parseInt(star.dataset.value);
  document.getElementById("rating-value").value = selectedRating;
  highlightStars(selectedRating);
}

function highlightStars(rating) {
  document.querySelectorAll("#rating-stars .star").forEach((star, index) => {
    star.style.color = index < rating ? "#ffc107" : "#ccc";
  });
}

function filterProducts() {
  const search = document.getElementById("search-input").value.toLowerCase();
  const category = document.getElementById("category-filter").value;

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || 
                         p.description.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    
    return matchesSearch && matchesCategory;
  });

  displayProducts(filtered);
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("theme-toggle").textContent = isDark ? "Light Mode" : "Dark Mode";
}

async function submitFeedback(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById("submit-review-btn");
  const submitText = document.getElementById("submit-text");
  const submitLoading = document.getElementById("submit-loading");
  
  // Mostrar loading
  submitText.style.display = 'none';
  submitLoading.style.display = 'inline';
  submitBtn.disabled = true;

  const id = document.getElementById("product-id").value;
  const user = document.getElementById("user-name").value.trim();
  const rating = parseInt(document.getElementById("rating-value").value);
  const comment = document.getElementById("comment").value.trim();

  if (!id || !user || !rating || !comment) {
    alert("Please fill all fields.");
    resetSubmitButton(submitBtn, submitText, submitLoading);
    return;
  }

  if (rating < 1 || rating > 5) {
    alert("Please select a rating between 1 and 5 stars.");
    resetSubmitButton(submitBtn, submitText, submitLoading);
    return;
  }

  try {
    // Executar reCAPTCHA v3
    const token = await executeRecaptcha('submit_review');
    
    // Verificar o token do reCAPTCHA
    const isValidRecaptcha = await verifyRecaptcha(token);
    if (!isValidRecaptcha) {
      alert("Security verification failed. Please try again.");
      resetSubmitButton(submitBtn, submitText, submitLoading);
      return;
    }

    console.log('Submitting review to Neon...', { id, user, rating, comment });
    const response = await fetch(`/.netlify/functions/addReview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productId: id, 
        userName: user, 
        rating, 
        comment 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('Review submitted successfully:', result);

    closeModal();
    // Recarregar os produtos para atualizar as avaliações
    await loadProducts();
    alert("Review submitted successfully!");
    
  } catch (err) {
    console.error("Submit error:", err);
    alert("Error submitting review: " + err.message);
  } finally {
    resetSubmitButton(submitBtn, submitText, submitLoading);
  }
}

function resetSubmitButton(submitBtn, submitText, submitLoading) {
  submitText.style.display = 'inline';
  submitLoading.style.display = 'none';
  submitBtn.disabled = false;
}

function populateCategories(products) {
  const select = document.getElementById("category-filter");
  const categories = [...new Set(products.map(p => p.category))].sort();
  
  select.innerHTML = '<option value="">All categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

