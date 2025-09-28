let products = [], currentProductId = null, selectedRating = 0;

document.addEventListener("DOMContentLoaded", () => {
  products = window.productCatalog || [];
  
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "Light Mode";
  }
  
  setupListeners();
  displayProducts(products).then(() => {
    populateCategories();
  });
});

function setupListeners(){
  document.getElementById("search-input").addEventListener("input", filterProducts);
  document.getElementById("category-filter").addEventListener("change", filterProducts);
  document.getElementById("rating-filter").addEventListener("change", filterProducts);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("cancel-feedback").addEventListener("click", closeModal);

  document.querySelectorAll(".star").forEach(s=>{
    s.addEventListener("click",()=>{
      selectedRating=parseInt(s.dataset.value);
      updateStars(selectedRating);
      document.getElementById("rating-value").value=selectedRating;
    });
    s.addEventListener("mouseover",()=>highlightStars(parseInt(s.dataset.value)));
    s.addEventListener("mouseout",()=>updateStars(selectedRating));
  });

  document.getElementById("feedback-form").addEventListener("submit", submitFeedback);
}

function populateCategories(){
  const select=document.getElementById("category-filter");
  [...new Set(products.map(p=>p.category))].forEach(c=>{
    const option=document.createElement("option");
    option.value=c;
    option.textContent=c;
    select.appendChild(option);
  });
}

async function displayProducts(list){
  const container=document.getElementById("products-container");
  container.innerHTML="";
  if(!list.length){container.innerHTML='<div class="no-results">No products found.</div>'; return;}
  for (const p of list) {
    container.appendChild(await createCard(p));
  }
}

async function createCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";
  
  const avg = await fetchRatingFromServer(p.id);

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
  card.querySelector(".feedback-btn").addEventListener("click",()=>openModal(p.id));
  return card;
}

async function fetchRatingFromServer(productId) {
  try {
    const res = await fetch(`/.netlify/functions/getReviews?productId=${productId}`);
    if (!res.ok) throw new Error("Erro ao buscar reviews");
    const reviews = await res.json();
    if (!reviews.length) return 4; // default
    const avg = reviews.reduce((a,b)=>a+b.rating,0)/reviews.length;
    return avg;
  } catch (err) {
    console.error("Erro buscando reviews:", err);
    return calcLocalRating(productId); // fallback local
  }
}

function calcLocalRating(id){
  const data=localStorage.getItem(`productRatings_${id}`);
  if(!data) return 4;
  const arr=JSON.parse(data);
  if(!arr.length) return 4;
  return arr.reduce((a,b)=>a+b.rating,0)/arr.length;
}

function genStars(r){
  let html="",f=Math.floor(r),half=r%1>=0.5;
  for(let i=1;i<=5;i++){
    html+=i<=f||i===f+1&&half?'<span class="star">★</span>':'<span class="star" style="color:#ccc;">★</span>';
  }
  return html;
}

function openModal(id){
  currentProductId=id;
  const p=products.find(x=>x.id===id);
  if(!p) return;
  document.getElementById("modal-product-name").textContent=`Rate: ${p.name}`;
  document.getElementById("product-id").value=id;
  document.getElementById("feedback-form").reset();
  selectedRating=0;updateStars(0);
  document.getElementById("feedback-modal").style.display="flex";
}

function closeModal(){
  document.getElementById("feedback-modal").style.display="none";
  currentProductId=null;
}

function updateStars(r){
  document.querySelectorAll("#rating-stars .star").forEach((s,i)=>{s.style.color=i<r?"#ffc107":"#ccc";});
}

function highlightStars(r){
  document.querySelectorAll("#rating-stars .star").forEach((s,i)=>{s.style.color=i<r?"#ffc107":"#ccc";});
}

function filterProducts(){
  const s=document.getElementById("search-input").value.toLowerCase(),
        c=document.getElementById("category-filter").value,
        r=parseInt(document.getElementById("rating-filter").value);
  displayProducts(products.filter(p=>{
    const mS=p.name.toLowerCase().includes(s)||p.description.toLowerCase().includes(s),
          mC=!c||p.category===c,
          mR=!r||calcLocalRating(p.id)>=r;
    return mS&&mC&&mR;
  }));
}

function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const dark=document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode",dark);
  document.getElementById("theme-toggle").textContent=dark?"Light Mode":"Dark Mode";
}

async function submitFeedback(e){
  e.preventDefault();
  const id=document.getElementById("product-id").value,
        user=document.getElementById("user-name").value,
        rating=parseInt(document.getElementById("rating-value").value),
        comment=document.getElementById("comment").value;
  if(!id||!user||!rating||!comment){alert("Fill all fields.");return;}

  saveLocalReview(id,user,rating,comment);

  try {
    await sendReviewNeon(id,user,rating,comment);
    await sendDiscord(id,user,rating,comment);
    closeModal();
    displayProducts(products);
    alert("Review submitted!");
  } catch(err){
    console.error(err);
    alert("Error sending review to server. Saved locally.");
  }
}

function saveLocalReview(id,user,rating,comment){
  const key=`productRatings_${id}`;
  const data=localStorage.getItem(key);
  const arr=data?JSON.parse(data):[];
  arr.push({userName:user,rating,comment,date:new Date().toISOString()});
  localStorage.setItem(key,JSON.stringify(arr));
}

async function sendReviewNeon(id,user,rating,comment){
  const res=await fetch(`/.netlify/functions/addReview`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({productId:id,userName:user,rating,comment})
  });
  if(!res.ok) throw new Error("Neon save error");
}

async function sendDiscord(id,user,rating,comment){
  const p=products.find(x=>x.id==id);
  if(!p) return;
  const color=rating>=4?0x00ff00:rating>=3?0xffff00:0xff0000;
  const body={embeds:[{
    title:`⭐ ${rating}/5 - New Review`,
    color,
    description:`**${p.name}** received a new review.`,
    fields:[
      {name:"📋 Details",value:`**Category:** ${p.category}\n**Reviewer:** ${user}\n**Date:** ${new Date().toLocaleString("en-US")}`},
      {name:"📝 Comment",value:comment.length>1000?comment.substring(0,997)+"...":comment}
    ],
    thumbnail:{url:p.image||"https://via.placeholder.com/64?text=📦"},
    footer:{text:"Catalog • Reviews"},
    timestamp:new Date().toISOString()
  }]};

  const res=await fetch("https://discord.com/api/webhooks/SEU_WEBHOOK",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok) throw new Error("Discord error");
}
