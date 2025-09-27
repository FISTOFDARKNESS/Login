// Produtos
window.productCatalog = [
  { id:1, name:"Designer Dashboard Pro", category:"Dashboard", description:"Dashboard profissional para designers.", image:"https://via.placeholder.com/300x200?text=Dashboard+Pro", link:"https://sketchfab.com/search?type=models"},
  { id:2, name:"Workspace Analytics Tool", category:"Analytics", description:"Ferramenta completa de análise.", image:"https://via.placeholder.com/300x200?text=Analytics+Tool", link:"#"},
  { id:3, name:"Modern Web Templates", category:"Templates", description:"Templates modernos para web.", image:"https://via.placeholder.com/300x200?text=Web+Templates", link:"#"}
];

let products=[], currentProductId=null, selectedRating=0;

document.addEventListener("DOMContentLoaded", () => {
  products = window.productCatalog || [];
  if(localStorage.getItem("darkMode")==="true"){
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent="Modo Claro";
  }
  setupListeners();
  displayProducts(products);
  populateCategories();
});

// Listeners
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

// Categorias
function populateCategories(){
  const select=document.getElementById("category-filter");
  [...new Set(products.map(p=>p.category))].forEach(c=>{
    const o=document.createElement("option");
    o.value=c; o.textContent=c;
    select.appendChild(o);
  });
}

// Produtos
function displayProducts(list){
  const c=document.getElementById("products-container");
  c.innerHTML="";
  if(!list.length){ c.innerHTML='<div class="no-results">Nenhum produto encontrado.</div>'; return; }
  list.forEach(p=> c.appendChild(createCard(p)));
}

function createCard(p){
  const avg = calcRating(p.id);
  const card = document.createElement("div");
  card.className = "product-card";
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
      <a href="${p.link}" target="_blank" class="product-link">Ver Produto</a>
      <button class="feedback-btn" data-id="${p.id}" style="margin-top:.5rem;background:none;border:none;color:var(--primary);cursor:pointer;text-decoration:underline;">Avaliar</button>
    </div>
  `;
  card.querySelector(".feedback-btn").addEventListener("click",()=>openModal(p.id));
  return card;
}

// Ratings
function calcRating(id){
  const data=localStorage.getItem(`productRatings_${id}`);
  if(!data) return 4;
  const arr=JSON.parse(data);
  if(!arr.length) return 4;
  return arr.reduce((a,b)=>a+b.rating,0)/arr.length;
}

function genStars(r){
  let s="", f=Math.floor(r), half=r%1>=.5;
  for(let i=1;i<=5;i++){
    s+=i<=f||i===f+1&&half?'<span class="star">★</span>':'<span class="star" style="color:#ccc;">★</span>';
  }
  return s;
}

// Modal
function openModal(id){
  currentProductId=id;
  const p=products.find(x=>x.id===id);
  if(!p) return;
  document.getElementById("modal-product-name").textContent=`Avaliar: ${p.name}`;
  document.getElementById("product-id").value=id;
  document.getElementById("feedback-form").reset();
  selectedRating=0;
  updateStars(0);
  document.getElementById("feedback-modal").style.display="flex";
}

function closeModal(){
  document.getElementById("feedback-modal").style.display="none";
  currentProductId=null;
}

function updateStars(r){
  document.querySelectorAll("#rating-stars .star").forEach((s,i)=>s.style.color=i<r?"#ffc107":"#ccc");
}

function highlightStars(r){
  document.querySelectorAll("#rating-stars .star").forEach((s,i)=>s.style.color=i<r?"#ffc107":"#ccc");
}

// Filtro
function filterProducts(){
  const s=document.getElementById("search-input").value.toLowerCase(),
        c=document.getElementById("category-filter").value,
        r=parseInt(document.getElementById("rating-filter").value);
  displayProducts(products.filter(p=>{
    const mS=p.name.toLowerCase().includes(s)||p.description.toLowerCase().includes(s);
    const mC=!c||p.category===c;
    const mR=!r||calcRating(p.id)>=r;
    return mS && mC && mR;
  }));
}

// Tema
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  const dark=document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode",dark);
  document.getElementById("theme-toggle").textContent=dark?"Modo Claro":"Modo Escuro";
}

// Envio de avaliação
async function submitFeedback(e){
  e.preventDefault();
  const id=document.getElementById("product-id").value,
        user=document.getElementById("user-name").value,
        rating=parseInt(document.getElementById("rating-value").value),
        comment=document.getElementById("comment").value;
  if(!id||!user||!rating||!comment){ alert("Preencha todos os campos."); return; }

  // Salva local
  const key=`productRatings_${id}`;
  const data=JSON.parse(localStorage.getItem(key)||"[]");
  data.push({user,rating,comment});
  localStorage.setItem(key,JSON.stringify(data));

  // Envia para Discord webhook
  sendToWebhook(id,user,rating,comment);

  closeModal();
  displayProducts(products);
  alert("Avaliação enviada!");
}

function sendToWebhook(id,user,rating,comment){
  const webhookUrl="SEU_WEBHOOK_AQUI"; // <- coloque seu webhook
  fetch(webhookUrl,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({content:`Produto ID:${id}\nUsuário:${user}\nAvaliação:${rating}\nComentário:${comment}`})
  }).catch(console.error);
}

