import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Safely compute total — skip items with null product
  const validCart = cart ? cart.filter(item => item.product != null) : [];
  const totalAmount = validCart.reduce((acc, item) => acc + ((item.product?.price || 0) * item.quantity), 0);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (validCart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    try {
      const orderRes = await api.post('/orders/create-razorpay-order');
      const { id: order_id, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: currency,
        name: 'NexusCart',
        description: 'Test Transaction',
        order_id: order_id,
        handler: async function (response) {
          try {
            const data = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyRes = await api.post('/orders/verify-payment', data);
            if (verifyRes.data) {
              clearCart();
              alert('Payment Successful! Your order has been placed.');
              navigate('/dashboard');
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });
      paymentObject.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    }
  };

  if (validCart.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <ShoppingCart size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add some products to get started</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3">
      <div style={{ gridColumn: 'span 2' }}>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Shopping Cart ({validCart.length} items)</h2>
          {validCart.map((item) => (
            <div key={item.product._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <img src={item.product.imageUrl} alt={item.product.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{item.product.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>₹{item.product.price?.toLocaleString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => updateCartItem(item.product._id, item.quantity - 1)}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                >−</button>
                <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                <button 
                  onClick={() => updateCartItem(item.product._id, item.quantity + 1)}
                  className="qty-btn"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <span style={{ fontWeight: 600, minWidth: '80px', textAlign: 'right' }}>
                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </span>
              <button onClick={() => removeFromCart(item.product._id)} className="remove-btn" aria-label="Remove item">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="glass-panel" style={{ position: 'sticky', top: '100px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal ({validCart.length} items)</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Shipping</span>
            <span style={{ color: 'var(--success-color)' }}>Free</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)', margin: '1rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-color)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCheckout} id="checkout-btn">
            Proceed to Checkout
          </button>
          <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Secured by Razorpay (Test Mode)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
