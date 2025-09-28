let products = [], currentProductId = null, selectedRating = 0;

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
  
  // Adicionar reCAPTCHA aos botões "View Product"
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('product-link')) {
      e.preventDefault();
      handleViewProduct(e.target.href);
    }
  });
}

// Função para verificar reCAPTCHA
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
    return result.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Função para lidar com "View Product" com reCAPTCHA
async function handleViewProduct(url) {
  // Verificar se o reCAPTCHA já foi resolvido
  const recaptchaResponse = grecaptcha.getResponse();
  
  if (!recaptchaResponse) {
    // Se não foi resolvido, pedir para o usuário completar
    alert('Please complete the reCAPTCHA verification first.');
    
    // Abrir modal para completar reCAPTCHA
    openRecaptchaModal(url);
    return;
  }
  
  // Verificar o token do reCAPTCHA
  const isValid = await verifyRecaptcha(recaptchaResponse);
  
  if (isValid) {
    // Se válido, redirecionar para o produto
    window.open(url, '_blank');
    // Resetar reCAPTCHA
    grecaptcha.reset();
  } else {
    alert('reCAPTCHA verification failed. Please try again.');
    grecaptcha.reset();
  }
}

// Modal para reCAPTCHA em View Product
function openRecaptchaModal(url) {
  const modal = document.createElement('div');
  modal.className = 'feedback-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Verification Required</h2>
        <button class="close-modal" id="close-recaptcha-modal">&times;</button>
      </div>
      <div style="text-align: center;">
        <p>Please complete the reCAPTCHA to view the product:</p>
        <div class="recaptcha-container">
          <div class="g-recaptcha" data-sitekey="6LdOEdgrAAAAAN7VCLzmZj1ilE0frmol09Hfd-4V"></div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" id="cancel-recaptcha">Cancel</button>
          <button type="button" class="submit-btn" id="proceed-recaptcha">Proceed</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners para o modal de reCAPTCHA
  document.getElementById('close-recaptcha-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
    grecaptcha.reset();
  });
  
  document.getElementById('cancel-recaptcha').addEventListener('click', () => {
    document.body.removeChild(modal);
    grecaptcha.reset();
  });
  
  document.getElementById('proceed-recaptcha').addEventListener('click', async () => {
    const recaptchaResponse = grecaptcha.getResponse();
    
    if (!recaptchaResponse) {
      alert('Please complete the reCAPTCHA.');
      return;
    }
    
    const isValid = await verifyRecaptcha(recaptchaResponse);
    
    if (isValid) {
      window.open(url, '_blank');
      document.body.removeChild(modal);
      grecaptcha.reset();
    } else {
      alert('reCAPTCHA verification failed. Please try again.');
      grecaptcha.reset();
    }
  });
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
      <a href="${p.link}" target="_blank" class="product-link">View Product</a>
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
  
  // Reset reCAPTCHA no modal
  if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
    grecaptcha.reset();
  }
  
  document.getElementById("feedback-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("feedback-modal").style.display = "none";
  currentProductId = null;
  
  // Reset reCAPTCHA ao fechar modal
  if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
    grecaptcha.reset();
  }
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
  
  const id = document.getElementById("product-id").value;
  const user = document.getElementById("user-name").value.trim();
  const rating = parseInt(document.getElementById("rating-value").value);
  const comment = document.getElementById("comment").value.trim();

  if (!id || !user || !rating || !comment) {
    alert("Please fill all fields.");
    return;
  }

  if (rating < 1 || rating > 5) {
    alert("Please select a rating between 1 and 5 stars.");
    return;
  }

  // Verificar reCAPTCHA
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert("Please complete the reCAPTCHA verification.");
    return;
  }

  // Verificar o token do reCAPTCHA
  const isValidRecaptcha = await verifyRecaptcha(recaptchaResponse);
  if (!isValidRecaptcha) {
    alert("reCAPTCHA verification failed. Please try again.");
    grecaptcha.reset();
    return;
  }

  try {
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
    // Resetar reCAPTCHA
    grecaptcha.reset();
  }
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
