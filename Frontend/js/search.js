// Search and Filter Functionality

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search-input');
  const resultsCount = document.getElementById('results-count');
  const searchTitle = document.getElementById('search-title');
  const resultsGrid = document.getElementById('search-results-grid');
  const emptyResult = document.getElementById('search-empty');

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || '';
  const category = urlParams.get('category') || '';

  let title = 'Search Results';
  if (query) title = `Search results for "${query}"`;
  else if (category) title = `Category: ${category}`;
  if (searchTitle) searchTitle.textContent = title;

  const products = await loadProducts();
  const filtered = filterProducts(products, query, category);

  renderResults(filtered);

  if (searchInput) {
    searchInput.value = query;
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value;
        window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`;
      }
    });
  }

  function renderResults(list) {
    if (!resultsGrid) return;
    if (!list.length) {
      emptyResult.style.display = 'block';
      resultsGrid.innerHTML = '';
      resultsCount.textContent = 'No products found. Try a broader term.';
      return;
    }
    emptyResult.style.display = 'none';
    resultsCount.textContent = `${list.length} products found`;
    resultsGrid.innerHTML = list.map(p => `
      <div class="product-card" style="background: white; border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; transition: transform 0.2s;">
        <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 280px; object-fit: cover;">
        <div style="padding: 20px;">
          <h3 style="margin-bottom: 8px; font-size: 18px;">${p.title}</h3>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><span style="color: #fbbf24;">${'⭐'.repeat(Math.round(p.rating || 4))}</span><span style="color: #64748b; font-size: 14px;">(${p.reviews || Math.floor(Math.random() * 200 + 20)})</span></div>
          <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px;"><span style="font-size: 24px; font-weight: 700; color: #2563eb;">$${Number(p.price||0).toFixed(2)}</span></div>
          <button class="btn btn-primary" style="width: 100%; padding: 12px;" onclick="app.addToCart('${p._id || p.id}')">Add to Cart</button>
        </div>
      </div>
    `).join('');
  }

  async function loadProducts() {
    try {
      const res = await fetch('https://shopify-store-o6mo.onrender.com/api/products');
      if (!res.ok) throw new Error('api');
      return await res.json();
    } catch (error) {
      return [
        { _id: '1', title: 'Premium Dog Food - Chicken', image: 'https://images.unsplash.com/photo-1589924691195-41432c84c161?auto=format&fit=crop&w=800&q=80', price: 29.99, rating: 5, reviews: 245, category: 'dog' },
        { _id: '2', title: 'Organic Peanut Butter Treats', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80', price: 14.99, rating: 4, reviews: 189, category: 'treats' },
        { _id: '3', title: 'Grain-Free Salmon Food', image: 'https://images.unsplash.com/photo-1601758123927-196d5f16cfd6?auto=format&fit=crop&w=800&q=80', price: 34.99, rating: 4, reviews: 156, category: 'cat' },
        { _id: '4', title: 'Puppy Food Formula - Small Breed', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80', price: 24.99, rating: 5, reviews: 98, category: 'puppy' }
      ];
    }
  }

  function filterProducts(products, query, category) {
    const lowerQuery = query.toLowerCase();
    const lowerCategory = category.toLowerCase();
    return products.filter(p => {
      const matchesQuery = !lowerQuery || p.title.toLowerCase().includes(lowerQuery) || (p.description || '').toLowerCase().includes(lowerQuery);
      const matchesCategory = !lowerCategory || p.category?.toLowerCase().includes(lowerCategory) || p.title.toLowerCase().includes(lowerCategory);
      return matchesQuery && matchesCategory;
    });
  }
});
