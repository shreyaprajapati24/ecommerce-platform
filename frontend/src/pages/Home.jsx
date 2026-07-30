import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Search, Heart, SlidersHorizontal } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useContext(CartContext);
  const { user, toggleWishlist } = useContext(AuthContext);

  const isWishlisted = (productId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some(item => item === productId || item._id === productId);
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, category, minPrice, maxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    addToCart(productId, 1);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section glass-panel" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover Premium Products
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse our curated collection of high-quality products with secure checkout
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel filter-bar" style={{ marginBottom: '2rem' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              id="search-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            id="category-filter"
            style={{ minWidth: '160px' }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Books">Books</option>
            <option value="Sports">Sports</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>
        <div className="filter-row" style={{ marginTop: '1rem' }}>
          <SlidersHorizontal size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Price Range:</span>
          <input 
            type="number" 
            placeholder="Min ₹" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            id="min-price-filter"
            style={{ width: '120px' }}
            min="0"
          />
          <span style={{ color: 'var(--text-secondary)' }}>—</span>
          <input 
            type="number" 
            placeholder="Max ₹" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            id="max-price-filter"
            style={{ width: '120px' }}
            min="0"
          />
          {(minPrice || maxPrice || category || keyword) && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              onClick={() => { setKeyword(''); setCategory(''); setMinPrice(''); setMaxPrice(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid var(--surface-border)',
            borderTop: '3px solid var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          Loading products...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--danger-color)' }}>⚠️</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Connection Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Failed to connect to the backend API. Please verify the following:
          </p>
          <div style={{ textAlign: 'left', color: 'var(--text-secondary)', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>The backend server is running (e.g. run <code>npm run dev</code> or <code>npm start</code> in the <code>backend</code> folder).</li>
              <li>If deployed, the Render service is awake (Render's free tier spins down after 15m of inactivity; spin-up takes ~1 minute).</li>
              <li>Your frontend <code>VITE_API_URL</code> environment variable on Vercel is set exactly to your backend URL with the <code>/api</code> suffix.</li>
            </ul>
          </div>
          <div>
            <button className="btn btn-primary" onClick={fetchProducts}>
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4">
          {products.map(product => (
            <div key={product._id} className="product-card glass-panel" id={`product-${product._id}`} style={{ padding: 0, position: 'relative' }}>
              <img src={product.imageUrl} alt={product.title} className="product-image" loading="lazy" />
              {user && (
                <button 
                  onClick={() => toggleWishlist(product._id)}
                  className="wishlist-btn"
                  id={`wishlist-${product._id}`}
                  aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={20} fill={isWishlisted(product._id) ? 'var(--danger-color)' : 'none'} color={isWishlisted(product._id) ? 'var(--danger-color)' : 'white'} />
                </button>
              )}
              <div className="product-info" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {product.category}
                </div>
                <h3 className="product-title">{product.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>
                  {product.description && product.description.length > 60 
                    ? product.description.substring(0, 60) + '...' 
                    : product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="product-price">₹{product.price?.toLocaleString('en-IN')}</span>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => handleAddToCart(product._id)}
                    id={`add-to-cart-${product._id}`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && !loading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
