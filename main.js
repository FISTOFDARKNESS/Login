let products = [], currentProductId = null, selectedRating = 0;
const SITE_KEY = '6LdvNN8rAAAAADmepCKuP7jeUpwOdtrF8K-4X5R6';

window.addEventListener("load", () => {
  if (typeof grecaptcha === "undefined") {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    document.head.appendChild(script);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "Light Mode";
  }
  await loadProducts();
  setupListeners();
});

async function loadProducts() {
  try {
    products = await fetchProducts();
    displayProducts(products);
    populateCategories(products);
  } catch (error) {
    displayError("Failed to load products from database.");
  }
}

function setupListeners() {
  document.getElementById("search-input").addEventListener("input", filterProducts);
  document.getElementById("category-filter").addEventListener("change", filterProducts);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("cancel-feedback").addEventListener("click", closeModal);

  document.querySelectorAll("#rating-stars .star").forEach(star => {
    star.addEventListener("click", () => selectRating(star));
    star.addEventListener("mouseover", () => highlightStars(parseInt(star.dataset.value)));
    star.addEventListener("mouseout", () => highlightStars(selectedRating));
  });

  document.getElementById("feedback-form").addEventListener("submit", submitFeedback);

  document.addEventListener('click', e => {
    if (e.target.classList.contains('product-link')) {
      e.preventDefault();
      handleViewProduct(e.target.href);
    }
  });
}

async function executeRecaptcha(action='submit') {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === 'undefined') return reject('reCAPTCHA not loaded');
    grecaptcha.ready(async () => {
      try { resolve(await grecaptcha.execute(SITE_KEY, { action })); }
      catch (err) { reject(err); }
    });
  });
}

async function verifyRecaptcha(token) {
  try {
    const res = await fetch('/.netlify/functions/verifyRecaptcha', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ token })
    });
    const result = await res.json();
    return result.success && result.score > 0.5;
  } catch { return false; }
}

async function handleViewProduct(url) {
  const newTab = window.open('', '_blank');
  try {
    const token = await executeRecaptcha('view_product');
    const valid = await verifyRecaptcha(token);
    if (valid) newTab.location.href = url;
    else { newTab.close(); alert('Security verification failed'); }
  } catch { newTab.close(); alert('Security verification error'); }
}

async function fetchProducts() {
  const res = await fetch("/.netlify/functions/getProducts");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Invalid products format");
  return data;
}

function displayError(message) {
  document.getElementById("products-container").innerHTML = `<div class="no-results"><h3>Error</h3><p>${message}</p></div>`;
}

async function displayProducts(list) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";
  if (!list.length) { container.innerHTML='<div class="no-results">No products found.</div>'; return; }
  for (const p of list) container.appendChild(await createCard(p));
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
      <div class="product-rating"><div class="stars">${generateStars(avgRating)}</div><span class="rating-value">${avgRating.toFixed(1)}</span></div>
      <a href="${p.link}" class="product-link">Buy Product</a>
      <button class="feedback-btn" data-id="${p.id}" style="margin-top:.5rem;background:none;border:none;color:var(--primary);cursor:pointer;text-decoration:underline;">Rate</button>
    </div>`;
  card.querySelector(".feedback-btn").addEventListener("click", () => openModal(p.id));
  return card;
}

async function fetchAvgRating(productId) {
  try {
    const res = await fetch(`/.netlify/functions/getReviews?productId=${productId}`);
    if (!res.ok) return 0;
    const reviews = await res.json();
    if (!reviews.length) return 0;
    return reviews.reduce((sum,r)=>sum+r.rating,0)/reviews.length;
  } catch { return 0; }
}

function generateStars(rating) {
  let html="", full=Math.floor(rating), half=rating%1>=0.5;
  for(let i=1;i<=5;i++) html+=i<=full||i===full+1&&half?'<span class="star">★</span>':'<span class="star" style="color:#ccc;">★</span>';
  return html;
}

function openModal(id) {
  const p=products.find(p=>p.id===id);
  if(!p)return;
  currentProductId=id;
  document.getElementById("modal-product-name").textContent=`Rate: ${p.name}`;
  document.getElementById("product-id").value=id;
  selectedRating=0;
  document.getElementById("rating-value").value="";
  document.getElementById("user-name").value="";
  document.getElementById("comment").value="";
  highlightStars(0);
  document.getElementById("feedback-modal").style.display="flex";
}

function closeModal() {
  document.getElementById("feedback-modal").style.display="none";
  currentProductId=null;
}

function selectRating(star) {
  selectedRating=parseInt(star.dataset.value);
  document.getElementById("rating-value").value=selectedRating;
  highlightStars(selectedRating);
}

function highlightStars(rating) {
  document.querySelectorAll("#rating-stars .star").forEach((s,i)=>s.style.color=i<rating?"#ffc107":"#ccc");
}

function filterProducts() {
  const search=document.getElementById("search-input").value.toLowerCase();
  const category=document.getElementById("category-filter").value;
  displayProducts(products.filter(p=>(p.name.toLowerCase().includes(search)||p.description.toLowerCase().includes(search))&&(!category||p.category===category)));
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const dark=document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode",dark);
  document.getElementById("theme-toggle").textContent=dark?"Light Mode":"Dark Mode";
}

async function submitFeedback(e) {
  e.preventDefault();
  const btn=document.getElementById("submit-review-btn");
  const txt=document.getElementById("submit-text");
  const load=document.getElementById("submit-loading");
  txt.style.display='none';
  load.style.display='inline';
  btn.disabled=true;

  const id=document.getElementById("product-id").value;
  const user=document.getElementById("user-name").value.trim();
  const rating=parseInt(document.getElementById("rating-value").value);
  const comment=document.getElementById("comment").value.trim();

  if(!id||!user||!rating||!comment||rating<1||rating>5){alert("Please fill all fields correctly.");resetSubmitButton(btn,txt,load);return;}

  try {
    const token=await executeRecaptcha('submit_review');
    const valid=await verifyRecaptcha(token);
    if(!valid){alert("Security verification failed");resetSubmitButton(btn,txt,load);return;}
    const res=await fetch(`/.netlify/functions/addReview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:id,userName:user,rating,comment})});
    if(!res.ok){const t=await res.text();throw new Error(t);}
    await res.json();
    closeModal();
    await loadProducts();
    alert("Review submitted successfully!");
  } catch(err){alert("Error submitting review: "+err.message);}
  finally{resetSubmitButton(btn,txt,load);}
}

function resetSubmitButton(btn,txt,load){txt.style.display='inline';load.style.display='none';btn.disabled=false;}

function populateCategories(products){
  const select=document.getElementById("category-filter");
  const cats=[...new Set(products.map(p=>p.category))].sort();
  select.innerHTML='<option value="">All categories</option>';
  cats.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;select.appendChild(o);});
}
