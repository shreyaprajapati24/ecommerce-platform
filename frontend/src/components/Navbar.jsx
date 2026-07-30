import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, LogOut, LayoutDashboard, Heart, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = cart ? cart.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">NexusCart</Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Shop</Link>
        
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            {(user.role === 'Admin' || user.role === 'Sales Person') && (
               <span className="role-badge">
                 {user.role}
               </span>
            )}
            <Link to="/wishlist" className="nav-link" style={{ display: 'flex', alignItems: 'center' }}>
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="nav-link cart-icon-link" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="cart-badge">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <div className="nav-user-info">
              <User size={16} />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="nav-link logout-btn" style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
