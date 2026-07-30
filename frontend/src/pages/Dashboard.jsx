import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Package, Users, DollarSign, Plus, ShoppingBag, Edit3, Trash2, X, Shield } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchOrders();
    if (user.role === 'Admin' || user.role === 'Sales Person') {
      fetchMyProducts();
    }
    if (user.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const res = await api.get('/products');
      if (user.role === 'Admin') {
        setProducts(res.data);
      } else {
        setProducts(res.data.filter(p => p.sellerId?._id === user._id || p.sellerId === user._id));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setAllUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImage(null);
    setEditingProduct(null);
    setShowProductForm(false);
    setFormError('');
  };

  // Open edit form
  const handleEdit = (product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setImage(null);
    setShowProductForm(true);
    setFormError('');
  };

  // Submit product (create or update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    if (image) formData.append('image', image);

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        if (!image) {
          setFormError('Product image is required');
          setFormLoading(false);
          return;
        }
        await api.post('/products', formData);
      }
      resetForm();
      fetchMyProducts();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchMyProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Update user role (Admin only)
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update role');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--surface-border)',
          borderTop: '3px solid var(--accent-color)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        Loading dashboard...
      </div>
    );
  }

  const displayStats = stats || {
    totalSales: orders.reduce((acc, o) => acc + o.totalAmount, 0),
    totalOrders: orders.length,
    totalUsers: 0,
    totalProducts: products.length
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Welcome back, {user.name} — <span style={{ color: 'var(--accent-color)' }}>{user.role}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards (Admin & Sales Person) */}
      {(user.role === 'Admin' || user.role === 'Sales Person') && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card">
            <DollarSign size={28} style={{ color: 'var(--accent-color)', margin: '0 auto 0.75rem' }} />
            <div className="stat-value">₹{displayStats.totalSales?.toLocaleString('en-IN') || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Sales</div>
          </div>
          <div className="glass-panel stat-card">
            <Package size={28} style={{ color: 'var(--success-color)', margin: '0 auto 0.75rem' }} />
            <div className="stat-value">{displayStats.totalOrders || orders.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Orders</div>
          </div>
          <div className="glass-panel stat-card">
            <ShoppingBag size={28} style={{ color: '#f472b6', margin: '0 auto 0.75rem' }} />
            <div className="stat-value">{displayStats.totalProducts || products.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Products</div>
          </div>
          {user.role === 'Admin' && (
            <div className="glass-panel stat-card">
              <Users size={28} style={{ color: '#a78bfa', margin: '0 auto 0.75rem' }} />
              <div className="stat-value">{displayStats.totalUsers || 0}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Users</div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-nav" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={16} /> Orders
        </button>
        {(user.role === 'Admin' || user.role === 'Sales Person') && (
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={16} /> Products
          </button>
        )}
        {user.role === 'Admin' && (
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Shield size={16} /> User Management
          </button>
        )}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Order History</h2>
          <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  {(user.role === 'Admin' || user.role === 'Sales Person') && <th style={{ padding: '1rem' }}>Customer</th>}
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Items</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={user.role === 'Admin' || user.role === 'Sales Person' ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--accent-color)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {order.razorpayOrderId?.substring(0, 20) || order._id.substring(0, 12)}
                      </td>
                      {(user.role === 'Admin' || user.role === 'Sales Person') && (
                        <td style={{ padding: '1rem' }}>{order.user?.name || 'Unknown'}</td>
                      )}
                      <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '1rem' }}>
                        {order.products?.length || 0} item{(order.products?.length || 0) !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status-badge ${order.paymentStatus === 'Success' ? 'status-success' : 'status-failed'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (user.role === 'Admin' || user.role === 'Sales Person') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Manage Products</h2>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowProductForm(true); }}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="glass-panel" style={{ marginBottom: '2rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={resetForm} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.5rem' }}>
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Product name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home</option>
                    <option value="Books">Books</option>
                    <option value="Sports">Sports</option>
                    <option value="Beauty">Beauty</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="1" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Image {editingProduct && '(leave empty to keep current)'}</label>
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} {...(!editingProduct ? { required: true } : {})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" placeholder="Product description..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ gridColumn: '1 / -1' }}>
                  {formLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
                </button>
              </form>
            </div>
          )}

          {/* Products List */}
          {products.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No products yet. Click "Add Product" to create your first listing.
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {products.map(product => (
                <div key={product._id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {product.category}
                    </div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{product.title}</h4>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.75rem' }}>
                      ₹{product.price?.toLocaleString('en-IN')}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleEdit(product)}>
                        <Edit3 size={14} style={{ marginRight: '0.35rem' }} /> Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(product._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Management Tab (Admin only) */}
      {activeTab === 'users' && user.role === 'Admin' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>User Management</h2>
          <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Current Role</th>
                  <th style={{ padding: '1rem' }}>Joined</th>
                  <th style={{ padding: '1rem' }}>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  allUsers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>
                        {u.name} {u._id === user._id && <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem' }}>(You)</span>}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`role-badge-inline role-${u.role.toLowerCase().replace(' ', '-')}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u._id !== user._id ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', minWidth: '130px' }}
                          >
                            <option value="User">User</option>
                            <option value="Sales Person">Sales Person</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
