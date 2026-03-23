// ===== APP.JS � Home page dynamic product/category loading =====
var API_BASE = 'https://shopify-store-o6wo.onrender.com/api';

function renderHomeProducts(products) {
  var grid = document.getElementById('product-grid');
  if (!grid) return;
  var html = '';
  var list = products.slice(0, 4);
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var img = Array.isArray(p.images) ? p.images[0] : (p.image || '');
    var old = p.compareAtPrice || p.price;
    var id  = p._id || p.id || '';
    var stars = '';
    var r = Math.floor(p.rating || 5);
    for (var s = 0; s < r; s++) stars += '\u2605';
    for (var s = r; s < 5; s++) stars += '\u2606';
    html +=
      '<div class="product-card">' +
        '<div class="product-img-wrap">' +
          '<img src="' + img + '" alt="' + p.title + '" loading="lazy" />' +
          '<span class="product-badge">Popular</span>' +
          '<button class="product-wishlist"><i class="far fa-heart"></i></button>' +
        '</div>' +
        '<div class="product-body">' +
          '<h3>' + p.title + '</h3>' +
          '<div class="stars">' + stars + ' <span>(' + (p.reviews || 0) + ')</span></div>' +
          '<div class="product-price">' +
            '<span class="price-current">&#8377;' + Number(p.price).toFixed(2) + '</span>' +
            (old > p.price ? '<span class="price-old">&#8377;' + Number(old).toFixed(2) + '</span>' : '') +
          '</div>' +
          '<button class="btn btn-primary" data-pid="' + id + '" onclick="handleAddToCart(this)">' +
            '<i class="fas fa-cart-plus"></i> Add to Cart' +
          '</button>' +
        '</div>' +
      '</div>';
  }
  grid.innerHTML = html;
}

function renderHomeCategories(cats) {
  var grid = document.getElementById('category-grid');
  if (!grid) return;
  var staticImgs = [
    'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572980697803-0f6f3810f1a5?auto=format&fit=crop&w=600&q=80'
  ];
  var html = '';
  for (var i = 0; i < cats.length; i++) {
    var c = cats[i];
    var img = c.image || staticImgs[i % staticImgs.length];
    html +=
      '<div class="category-card" onclick="window.location.href=\'pages/shop.html\'">' +
        '<img src="' + img + '" alt="' + c.name + '" loading="lazy" />' +
        '<div class="category-card-body"><p>' + c.name + '</p><span>20+ items</span></div>' +
      '</div>';
  }
  grid.innerHTML = html;
}

// Called by Add to Cart buttons on home page
function handleAddToCart(btn) {
  var pid = btn.getAttribute('data-pid');
  if (!pid) return;
  if (typeof cartManager !== 'undefined') {
    cartManager.addToCart(pid, 1);
  }
}

// Load on home page
document.addEventListener('DOMContentLoaded', function () {
  var productGrid = document.getElementById('product-grid');
  var categoryGrid = document.getElementById('category-grid');
  if (!productGrid && !categoryGrid) return; // not home page

  var staticProducts = [
    { title:'Whirl Chew Toy', price:1999, compareAtPrice:2999, rating:5, reviews:128, images:['https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80'] },
    { title:'Cloud Pet Bed', price:3999, compareAtPrice:5499, rating:5, reviews:94, images:['https://images.unsplash.com/photo-1572980697803-0f6f3810f1a5?auto=format&fit=crop&w=600&q=80'] },
    { title:'Eco Grooming Kit', price:2799, compareAtPrice:3599, rating:4, reviews:67, images:['https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80'] },
    { title:'Smart Water Bottle', price:1999, compareAtPrice:3299, rating:5, reviews:234, images:['https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&q=80'] }
  ];
  var staticCats = [
    { name:'Dog Toys', image:'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80' },
    { name:'Pet Grooming', image:'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80' },
    { name:'Accessories', image:'https://images.unsplash.com/photo-1572980697803-0f6f3810f1a5?auto=format&fit=crop&w=600&q=80' }
  ];

  fetch(API_BASE + '/products')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderHomeProducts(data && data.length ? data : staticProducts);
    })
    .catch(function () { renderHomeProducts(staticProducts); });

  fetch(API_BASE + '/collections')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderHomeCategories(data && data.length ? data : staticCats);
    })
    .catch(function () { renderHomeCategories(staticCats); });
});
