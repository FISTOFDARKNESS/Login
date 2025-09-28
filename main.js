let products = [], currentProductId = null, selectedRating = 0;

document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "Light Mode";
  }
  
  // CORREÇÃO: Aguardar o fetchProducts() antes de continuar
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

  document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", () => selectRating(star));
    star.addEventListener("mouseover", () => highlightStars(parseInt(star.dataset.value)));
    star.addEventListener("mouseout", () => highlightStars(selectedRating));
  });

  document.getElementById("feedback-form").addEventListener("submit", e => submitFeedback(e, products));
}

async function fetchProducts() {
  try {
    const res = await fetch("/.netlify/functions/getProducts");
    if (!res.ok) throw new Error("Erro ao buscar produtos");
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

  const avg = await fetchAvgRating(p.id);

  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="product-image">
    <div class="product-info">
      <div class="product-category">${p.category}</div>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-description">${p.description}</p>
      <div class="product-rating">
        <div class="stars">${genStars(avg)}</div>
        <span class="rating-value">${avg.toFixed(1)}</span>
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
    if (!res.ok) return 4;
    const reviews = await res.json();
    if (!reviews.length) return 4;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  } catch (error) {
    console.error("Rating fetch error:", error);
    return 4;
  }
}

function genStars(r) {
  let html = "", f = Math.floor(r), half = r % 1 >= 0.5;
  for (let i = 1; i <= 5; i++) {
    html += i <= f || (i === f + 1 && half) ? '<span class="star">★</span>' : '<span class="star" style="color:#ccc;">★</span>';
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

function highlightStars(r) {
  document.querySelectorAll("#rating-stars .star").forEach((s, i) => s.style.color = i < r ? "#ffc107" : "#ccc");
}

function filterProducts(products) {
  const search = document.getElementById("search-input").value.toLowerCase();
  const category = document.getElementById("category-filter").value;

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  displayProducts(filtered);
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const dark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", dark);
  document.getElementById("theme-toggle").textContent = dark ? "Light Mode" : "Dark Mode";
}

async function submitFeedback(e, products) {
  e.preventDefault();
  const id = document.getElementById("product-id").value;
  const user = document.getElementById("user-name").value;
  const rating = parseInt(document.getElementById("rating-value").value);
  const comment = document.getElementById("comment").value;

  if (!id || !user || !rating || !comment) { alert("Fill all fields."); return; }

  try {
    const res = await fetch(`/.netlify/functions/addReview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, userName: user, rating, comment })
    });

    if (!res.ok) throw new Error("Failed to submit review");

    closeModal();
    displayProducts(products);
    alert("Review submitted!");
  } catch (err) {
    console.error("Submit error:", err);
    alert("Error submitting review.");
  }
}

function populateCategories(products) {
  const select = document.getElementById("category-filter");
  select.innerHTML = '<option value="">All categories</option>';
  [...new Set(products.map(p => p.category))].forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}
