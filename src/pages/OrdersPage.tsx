import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ordersAPI, productsAPI } from '../services/api';
import { Order, Product } from '../types';
import { Button, Card, Badge, LoadingSpinner, Alert, EmptyState, Select, Modal, Table } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const statusVariant = (s: string): any => {
  const map: Record<string, any> = {
    pending: 'yellow', confirmed: 'blue', shipped: 'purple', delivered: 'green', cancelled: 'red',
  };
  return map[s] || 'gray';
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const OrdersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Place order modal
  const [placeModal, setPlaceModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product_id: number; quantity: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await ordersAPI.all() : await ordersAPI.mine();
      setOrders(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openPlaceOrder = async () => {
    setCart([]);
    setSelectedProduct('');
    setQuantity(1);
    const res = await productsAPI.list({ limit: 200 });
    setProducts(res.data.filter((p: Product) => p.stock > 0));
    setPlaceModal(true);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    const pid = parseInt(selectedProduct);
    const existing = cart.find(c => c.product_id === pid);
    if (existing) {
      setCart(cart.map(c => c.product_id === pid ? { ...c, quantity: c.quantity + quantity } : c));
    } else {
      setCart([...cart, { product_id: pid, quantity }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (pid: number) => setCart(cart.filter(c => c.product_id !== pid));

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      await ordersAPI.place(cart);
      setSuccess('Order placed successfully!');
      setPlaceModal(false);
      fetchOrders();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setSuccess(`Order #${orderId} updated to ${status}`);
      fetchOrders();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to update order');
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="space-y-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isAdmin ? 'All Orders' : 'My Orders'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} total orders</p>
        </div>
        <Button onClick={openPlaceOrder}><Plus size={16} /> Place Order</Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={28} />}
          title="No orders yet"
          description="Place your first order to get started"
          action={<Button onClick={openPlaceOrder} size="sm"><Plus size={14} /> Place Order</Button>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Order #{order.id}</span>
                  <Badge label={order.status} variant={statusVariant(order.status)} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">${order.total_price.toFixed(2)}</span>
                  {order.created_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  )}
                  {expandedOrder === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* Order Items */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                  <Table headers={['Product', 'Qty', 'Unit Price', 'Subtotal']}>
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.product?.name || `Product #${item.product_id}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${item.unit_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </Table>
                  <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      Total: ${order.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Place Order Modal */}
      <Modal isOpen={placeModal} onClose={() => setPlaceModal(false)} title="Place New Order" size="lg">
        <div className="space-y-4">
          {/* Add item */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select
                label="Select Product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                options={[
                  { value: '', label: 'Choose a product...' },
                  ...products.map(p => ({ value: String(p.id), label: `${p.name} — $${p.price.toFixed(2)} (${p.stock} left)` })),
                ]}
              />
            </div>
            <div className="w-24">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Qty</label>
              <input
                type="number" min={1} value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>
            <Button onClick={addToCart} disabled={!selectedProduct}><Plus size={14} /> Add</Button>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table headers={['Product', 'Qty', 'Price', '']}>
                {cart.map((item) => {
                  const p = products.find(p => p.id === item.product_id);
                  return (
                    <tr key={item.product_id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm font-semibold">${((p?.price || 0) * item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </Table>
              <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  ${cart.reduce((sum, item) => {
                    const p = products.find(p => p.id === item.product_id);
                    return sum + (p?.price || 0) * item.quantity;
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setPlaceModal(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder} loading={placing} disabled={cart.length === 0}>
              Confirm Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
