import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Trash2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WishlistPage = () => {
  const { user, toggleWishlist } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Filter out any null/deleted products and ensure they are populated objects
  const validWishlist = user && user.wishlist 
    ? user.wishlist.filter(product => product != null && typeof product === 'object' && product._id)
    : [];

  if (validWishlist.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Heart size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Your wishlist is empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Save items you love here</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your Wishlist ({validWishlist.length} item{validWishlist.length !== 1 ? 's' : ''})</h2>
      <div className="grid grid-cols-4">
        {validWishlist.map((product) => (
          <div key={product._id} className="product-card glass-panel" id={`wishlist-item-${product._id}`} style={{ padding: 0, position: 'relative' }}>
            <img src={product.imageUrl} alt={product.title} className="product-image" loading="lazy" />
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => addToCart(product._id, 1)}
                    id={`wishlist-add-to-cart-${product._id}`}
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product._id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    id={`wishlist-remove-${product._id}`}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
