import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, DollarSign, Edit, Save, X, XCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { supplierApi } from '../../api/supplierApi';
import { isBlank, parseValidatedNumber, preventInvalidNumberKey, sanitizeNumberInput } from '../../utils/validation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  supplierName?: string;
  image?: string;
  imageUrl?: string;
  imageName?: string;
  createdAt?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const ReviewProducts = () => {
  const { addNotification } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    status: 'Pending' as Product['status'],
  });
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const categories = ['Software', 'Hardware', 'Services', 'Marketing', 'Legal', 'Other'];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    supplierApi
      .getProducts()
      .then((data) => {
        if (!isMounted) return;
        setProducts(
          data.map((product: Product) => ({
            ...product,
            status: product.status || 'Pending',
          }))
        );
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load products');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateProductStatus = async (product: Product, status: Product['status']) => {
    try {
      const updated = await supplierApi.updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image || product.imageUrl || '',
        supplierName: product.supplierName || '',
        status,
      });
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      addNotification({
        type: 'general',
        title: status === 'Approved' ? 'Product Approved' : 'Product Rejected',
        message: `"${product.name}" has been ${status === 'Approved' ? 'approved' : 'rejected'}.`,
      });
    } catch (err) {
      alert('Failed to update product status');
    }
  };

  const handleApprove = (product: Product) => updateProductStatus(product, 'Approved');
  const handleReject = (product: Product) => updateProductStatus(product, 'Rejected');
  const handleStatusChange = (product: Product, status: Product['status']) => {
    if (status === product.status) return;
    const confirmUpdate = window.confirm(`Update status for "${product.name}" to ${status}?`);
    if (!confirmUpdate) return;
    updateProductStatus(product, status);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      status: product.status,
    });
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const price = parseValidatedNumber(editForm.price, { min: 0.01, label: 'Price' });
    if (isBlank(editForm.name) || isBlank(editForm.description) || isBlank(editForm.category) || price.error) {
      alert(price.error || 'Please complete all product fields.');
      return;
    }
    const confirmUpdate = window.confirm('Update this product?');
    if (!confirmUpdate) return;
    setIsSaving(true);
    try {
      const updated = await supplierApi.updateProduct(editingProduct.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: editForm.price,
        category: editForm.category,
        image: editingProduct.image || editingProduct.imageUrl || '',
        supplierName: editingProduct.supplierName || '',
        status: editForm.status,
      });
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      addNotification({
        type: 'general',
        title: 'Product Updated',
        message: `"${updated.name}" has been updated.`,
      });
      closeEdit();
    } catch (err) {
      alert('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const pendingProducts = useMemo(
    () => products.filter((product) => product.status !== 'Approved' && product.status !== 'Rejected'),
    [products]
  );
  const reviewedProducts = useMemo(
    () => products.filter((product) => product.status !== 'Pending'),
    [products]
  );

  return (
    <>
      <div className="space-y-8">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {pendingProducts.length}
          </div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {products.filter((p) => p.status === 'Approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {products.filter((p) => p.status === 'Rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Pending Products */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Products</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {isLoading && (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center text-gray-500">
              Loading products...
            </div>
          )}
          {!isLoading && error && (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center text-red-600">
              {error}
            </div>
          )}
          {!isLoading && !error && pendingProducts.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No pending products to review</p>
            </div>
          ) : (
            !isLoading && !error && pendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <img
                  src={product.imageUrl ? `${API_BASE}${product.imageUrl}` : (product.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400')}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                          {product.category}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          {product.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Supplier: <span className="font-semibold text-gray-900">{product.supplierName || 'Supplier'}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{product.description}</p>

                  <div className="grid grid-cols-1 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Price</span>
                      </div>
                      <div className="text-xl font-bold text-[#0066cc]">${product.price}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Submitted: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleApprove(product)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(product)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reviewed Products */}
      {!isLoading && !error && reviewedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Reviewed Products</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{product.supplierName || 'Supplier'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${product.price}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={product.status}
                        onChange={(event) =>
                          handleStatusChange(product, event.target.value as Product['status'])
                        }
                        className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-200 bg-white text-gray-700"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm({ ...editForm, status: event.target.value as Product['status'] })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editForm.price}
                  onKeyDown={(event) => preventInvalidNumberKey(event, { allowDecimal: true })}
                  onChange={(event) => {
                    const value = sanitizeNumberInput(event.target.value, { allowDecimal: true, maxLength: 10 });
                    setEditForm({ ...editForm, price: value ? Number(value) : 0 });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={closeEdit}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
