import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Search, Package, Tag, Image,
  Upload, Download, AlertTriangle, X, CheckCircle, FileSpreadsheet, Bell
} from 'lucide-react';
import { productsAPI } from '../services/api';
import { Product, LowStockProduct, BulkImportResult } from '../types';
import { Button, Card, Modal, Input, Textarea, Select, Badge, LoadingSpinner, Alert, EmptyState } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Dresses', label: 'Dresses' },
  { value: 'Tops', label: 'Tops' },
  { value: 'Bottoms', label: 'Bottoms' },
  { value: 'Outerwear', label: 'Outerwear' },
  { value: 'Accessories', label: 'Accessories' },
  { value: 'Shoes', label: 'Shoes' },
  { value: 'Bags', label: 'Bags' },
  { value: 'Activewear', label: 'Activewear' },
  { value: 'Swimwear', label: 'Swimwear' },
];

const COLORS = [
  { value: '', label: 'Select Color' },
  { value: 'black', label: 'Black' }, { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' }, { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' }, { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' }, { value: 'purple', label: 'Purple' },
  { value: 'beige', label: 'Beige' }, { value: 'brown', label: 'Brown' },
  { value: 'multicolor', label: 'Multicolor' }, { value: 'navy', label: 'Navy' },
];

const emptyForm = {
  name: '', description: '', price: '', stock: '', category: '',
  tags: '', color: '', image_url: '', alert_threshold: '5',
};
type FormData = typeof emptyForm;

const getStockStatus = (stock: number, threshold: number) => {
  if (stock === 0) return { label: 'Out of Stock', variant: 'red' as const, isAlert: true };
  if (stock <= threshold) return { label: 'Low Stock', variant: 'yellow' as const, isAlert: true };
  return { label: 'In Stock', variant: 'green' as const, isAlert: false };
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Dresses: '👗', Shoes: '👠', Bags: '👜', Accessories: '💍',
  Tops: '👕', Bottoms: '👖', Outerwear: '🧥', Activewear: '🩳',
  Swimwear: '👙',
};

export const ProductsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, lowRes] = await Promise.all([
        productsAPI.list({ search: search || undefined, category: categoryFilter || undefined }),
        productsAPI.lowStock(),
      ]);
      setProducts(prodRes.data);
      setLowStockItems(lowRes.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, categoryFilter]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      stock: String(p.stock), category: p.category || '', tags: p.tags || '',
      color: p.color || '', image_url: p.image_url || '',
      alert_threshold: String(p.alert_threshold ?? 5),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description || null,
        price: parseFloat(form.price), stock: parseInt(form.stock || '0'),
        category: form.category || null, tags: form.tags || null,
        color: form.color || null, image_url: form.image_url || null,
        alert_threshold: parseInt(form.alert_threshold || '5'),
      };
      if (editProduct) {
        await productsAPI.update(editProduct.id, payload);
        setSuccess('Product updated successfully');
      } else {
        await productsAPI.create(payload);
        setSuccess('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productsAPI.delete(id);
      setSuccess('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Cannot delete product');
      setDeleteId(null);
    }
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await productsAPI.bulkImport(file);
      setImportResult(res.data);
      if (res.data.imported > 0) fetchProducts();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'Name,Description,Price,Stock,Category,Color,Tags,Image URL,Alert Threshold\nFloral Dress,A beautiful dress,49.99,20,Dresses,pink,"summer,floral",,5';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'boutiquely_import_template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const f = (key: keyof FormData, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{products.length} items in catalogue</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Low stock badge */}
          {lowStockItems.length > 0 && (
            <button
              onClick={() => setShowLowStock(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <Bell size={15} />
              <span>{lowStockItems.length} Low Stock</span>
              <span className="bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {lowStockItems.length}
              </span>
            </button>
          )}
          {isAdmin && (
            <>
              <Button variant="secondary" onClick={() => setImportModalOpen(true)} size="md">
                <FileSpreadsheet size={16} /> Import Excel
              </Button>
              <Button onClick={openCreate} size="md">
                <Plus size={16} /> Add Product
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <select
          value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="No products found"
          description={search ? 'Try a different search term' : 'Add your first product to get started'}
          action={isAdmin ? <Button onClick={openCreate} size="sm"><Plus size={14} /> Add Product</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock, product.alert_threshold ?? 5);
            return (
              <div
                key={product.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${
                  stockStatus.isAlert
                    ? 'border-amber-200 dark:border-amber-700'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                {/* Low stock ribbon */}
                {stockStatus.isAlert && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1 flex items-center gap-1.5 border-b border-amber-100 dark:border-amber-800">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} left (alert: ≤${product.alert_threshold})`}
                    </span>
                  </div>
                )}

                {/* Image */}
                <div className="h-44 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-5xl opacity-40">
                      {CATEGORY_EMOJIS[product.category || ''] || '🛍️'}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{product.name}</h3>
                    <Badge label={stockStatus.label} variant={stockStatus.variant} />
                  </div>
                  {product.category && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-medium">{product.category}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 min-h-[2rem]">
                    {product.description || 'No description provided'}
                  </p>
                  {product.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.split(',').slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{product.stock} in stock</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal — clean, no dark overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modal-in">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editProduct ? 'Update product details below' : 'Fill in the product information'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Product Name *" value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="e.g. Floral Summer Dress" />
                </div>
                <div className="sm:col-span-2">
                  <Textarea label="Description" value={form.description} onChange={(e) => f('description', e.target.value)} placeholder="Describe the product..." rows={3} />
                </div>
                <Input label="Price ($) *" type="number" step="0.01" min="0" value={form.price} onChange={(e) => f('price', e.target.value)} placeholder="29.99" />
                <Input label="Stock Quantity" type="number" min="0" value={form.stock} onChange={(e) => f('stock', e.target.value)} placeholder="50" />
                <Select label="Category" value={form.category} onChange={(e) => f('category', e.target.value)} options={CATEGORIES} />
                <Select label="Color" value={form.color} onChange={(e) => f('color', e.target.value)} options={COLORS} />
                <div className="sm:col-span-2">
                  <Input
                    label="Tags (comma-separated)"
                    value={form.tags} onChange={(e) => f('tags', e.target.value)}
                    placeholder="summer, floral, casual"
                    leftIcon={<Tag size={14} />}
                  />
                  <p className="text-xs text-gray-400 mt-1">Tags improve AI recommendation accuracy</p>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Image URL"
                    value={form.image_url} onChange={(e) => f('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    leftIcon={<Image size={14} />}
                  />
                </div>
                <div>
                  <Input
                    label="Stock Alert Threshold"
                    type="number" min="0"
                    value={form.alert_threshold}
                    onChange={(e) => f('alert_threshold', e.target.value)}
                    placeholder="5"
                    leftIcon={<Bell size={14} />}
                  />
                  <p className="text-xs text-gray-400 mt-1">Alert fires when stock ≤ this value</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>{editProduct ? 'Save Changes' : 'Create Product'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>

      {/* Low Stock Alert Modal */}
      <Modal isOpen={showLowStock} onClose={() => setShowLowStock(false)} title="🔔 Low Stock Alerts" size="lg">
        <p className="text-sm text-gray-500 mb-4">{lowStockItems.length} products need attention</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Product', 'Category', 'Current Stock', 'Alert Threshold', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {lowStockItems.map((item) => (
                <tr key={item.id} className={`${item.status === 'out' ? 'bg-red-50 dark:bg-red-900/10' : item.status === 'critical' ? 'bg-orange-50 dark:bg-orange-900/10' : 'bg-amber-50 dark:bg-amber-900/10'}`}>
                  <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{item.category || '—'}</td>
                  <td className="px-3 py-2.5 font-bold text-red-600">{item.stock}</td>
                  <td className="px-3 py-2.5 text-gray-500">{item.alert_threshold}</td>
                  <td className="px-3 py-2.5">
                    <Badge
                      label={item.status === 'out' ? 'Out of Stock' : item.status === 'critical' ? 'Critical' : 'Low Stock'}
                      variant={item.status === 'out' ? 'red' : item.status === 'critical' ? 'red' : 'yellow'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => { if (!importing) setImportModalOpen(false); }} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Import Products</h2>
                <p className="text-xs text-gray-500 mt-0.5">Upload a CSV file to import multiple products at once</p>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Download template */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <FileSpreadsheet size={16} />
                  <span>Download the CSV template to get started</span>
                </div>
                <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                  <Download size={14} /> Template
                </Button>
              </div>

              {/* Drop zone */}
              {!importResult && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleImportFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  {importing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      <p className="text-sm text-gray-500">Importing products…</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag & drop your CSV file here</p>
                      <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">.csv and .xlsx files supported</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                  }} />
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Total Rows', value: importResult.total, color: 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
                      { label: 'Valid', value: importResult.valid, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
                      { label: 'Imported', value: importResult.imported, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
                      { label: 'Errors', value: importResult.invalid, color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-lg p-3 text-center ${s.color}`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {importResult.imported > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-sm">
                      <CheckCircle size={16} />
                      <span>{importResult.imported} products imported successfully!</span>
                    </div>
                  )}

                  {/* Error rows */}
                  {importResult.rows.filter(r => !r.is_valid).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rows with errors:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {importResult.rows.filter(r => !r.is_valid).map(row => (
                          <div key={row.row_index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg text-xs">
                            <span className="text-red-500 font-medium shrink-0">Row {row.row_index}:</span>
                            <span className="text-gray-600 dark:text-gray-400">{row.name || '(no name)'} — {row.errors.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setImportResult(null)} className="flex-1">
                      Import Another File
                    </Button>
                    <Button onClick={() => { setImportModalOpen(false); setImportResult(null); }} className="flex-1">
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
