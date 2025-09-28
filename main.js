let products = [], currentProductId = null, selectedRating = 0;

document.addEventListener("DOMContentLoaded", async () => {
  // Theme setup
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "Light Mode";
  }
  
  // Load products
  products = await fetchProducts();
  setupListeners(products);
  displayProducts(products);
  populateCategories(products);
});

function setupListeners(products) {
  document.getElementById("search-input").addEventListener("input", () => filterProducts(products));
  document.getElementById("category-filter").addEventListener("change", () => filterProducts(products));
  document.getElementById("rating-filter").addEventListener("change", () => filterProducts(products));
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("cancel-feedback").addEventListener("click", closeModal);

  // Star rating functionality
  document.querySelectorAll("#rating-stars .star").forEach(star => {
    star.addEventListener("click", () => selectRating(star));
    star.addEventListener("mouseover", () => highlightStars(parseInt(star.dataset.value)));
    star.addEventListener("mouseout", () => highlightStars(selectedRating));
  });

  document.getElementById("feedback-form").addEventListener("submit", e => submitFeedback(e, products));
}

async function fetchProducts() {
  try {
    const res = await fetch("/.netlify/functions/getProducts");
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

async function displayProducts(list) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";
  
  if (!list.length) {
    container.innerHTML = '<div class="no-results">No products found.</div>';
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

  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
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
    const res = await fetch(`/.netlify/functions/getReviews?productId=${productId}`);
    if (!res.ok) return 0;
    const reviews = await res.json();
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  } catch (error) {
    console.error("Rating fetch error:", error);
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

function filterProducts(products) {
  const search = document.getElementById("search-input").value.toLowerCase();
  const category = document.getElementById("category-filter").value;
  const minRating = parseInt(document.getElementById("rating-filter").value);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || 
                         p.description.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    
    // For rating filter, we'd need to fetch ratings, but for simplicity we'll skip rating filter
    // or implement it with a more complex async approach
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

async function submitFeedback(e, products) {
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

  try {
    const res = await fetch(`/.netlify/functions/addReview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productId: id, 
        userName: user, 
        rating, 
        comment 
      })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Failed to submit review");
    }

    closeModal();
    // Refresh the products to show updated ratings
    products = await fetchProducts();
    displayProducts(products);
    alert("Review submitted successfully!");
  } catch (err) {
    console.error("Submit error:", err);
    alert("Error submitting review: " + err.message);
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