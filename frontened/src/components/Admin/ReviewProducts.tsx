import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../../context/NotificationContext';
import { useConfirm } from '../../context/ConfirmContext';
import { supplierApi } from '../../api/supplierApi';
import { isBlank, parseValidatedNumber, preventInvalidNumberKey, sanitizeNumberInput, validateMeaningfulDescription } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

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
  const confirm = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    status: 'Pending' as Product['status'],
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

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
      const label = status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : 'updated';
      toast.success(`"${product.name}" has been ${label}.`);
      addNotification({
        type: 'general',
        title: status === 'Approved' ? 'Product Approved' : status === 'Rejected' ? 'Product Rejected' : 'Product Status Updated',
        message: `"${product.name}" has been ${label}.`,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update product status.');
    }
  };

  const handleStatusChange = async (product: Product, status: Product['status']) => {
    if (status === product.status) return;
    const confirmUpdate = await confirm({
      title: 'Update product status',
      description: `Update status for "${product.name}" to ${status}?`,
    });
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
    setEditErrors({});
    setShowEditModal(true);
  };

  const closeEdit = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (isBlank(editForm.name)) {
      errors.name = 'Product name is required.';
    }
    if (isBlank(editForm.description)) {
      errors.description = 'Description is required.';
    } else {
      const descriptionError = validateMeaningfulDescription(editForm.description);
      if (descriptionError) errors.description = descriptionError;
    }
    if (isBlank(editForm.category)) {
      errors.category = 'Please select a category.';
    }
    const price = parseValidatedNumber(editForm.price, { min: 0.01, label: 'Price' });
    if (price.error) errors.price = price.error;
    return errors;
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const errors = validateEditForm();
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const confirmUpdate = await confirm({
      title: 'Update product',
      description: `Save changes to "${editForm.name.trim() || editingProduct.name}"?`,
    });
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
      toast.success(`"${updated.name}" has been updated.`);
      addNotification({
        type: 'general',
        title: 'Product Updated',
        message: `"${updated.name}" has been updated.`,
      });
      closeEdit();
    } catch (err) {
      if (err instanceof ApiError && err.errors) setEditErrors(err.errors);
      toast.error(err instanceof ApiError ? err.message : 'Failed to update product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    const confirmDelete = await confirm({
      title: 'Delete product',
      description: `Delete "${editingProduct.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await supplierApi.deleteProduct(editingProduct.id);
      setProducts((prev) => prev.filter((item) => item.id !== editingProduct.id));
      toast.success(`"${editingProduct.name}" has been deleted.`);
      addNotification({
        type: 'general',
        title: 'Product Deleted',
        message: `"${editingProduct.name}" has been removed.`,
      });
      closeEdit();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingCount = useMemo(
    () => products.filter((product) => product.status !== 'Approved' && product.status !== 'Rejected').length,
    [products]
  );

  return (
    <>
      <div className="space-y-8">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {pendingCount}
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

      {/* All Products */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Products</h2>
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Loading products...
          </div>
        )}
        {!isLoading && error && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-red-600">
            {error}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No products yet</p>
          </div>
        )}
        {!isLoading && !error && products.length > 0 && (
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEdit(product)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
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
                  onChange={(event) => {
                    setEditForm({ ...editForm, name: event.target.value });
                    if (editErrors.name) setEditErrors({ ...editErrors, name: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {editErrors.name && <p className="text-xs text-red-600 mt-1">{editErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(event) => {
                    setEditForm({ ...editForm, category: event.target.value });
                    if (editErrors.category) setEditErrors({ ...editErrors, category: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.category ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {editErrors.category && <p className="text-xs text-red-600 mt-1">{editErrors.category}</p>}
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
                    if (editErrors.price) setEditErrors({ ...editErrors, price: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.price ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {editErrors.price && <p className="text-xs text-red-600 mt-1">{editErrors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(event) => {
                    setEditForm({ ...editForm, description: event.target.value });
                    if (editErrors.description) setEditErrors({ ...editErrors, description: '' });
                  }}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent ${
                    editErrors.description ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {editErrors.description && <p className="text-xs text-red-600 mt-1">{editErrors.description}</p>}
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleDeleteProduct}
                  disabled={isDeleting || isSaving}
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Trash2 className="w-5 h-5" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={closeEdit}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || isDeleting}
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
