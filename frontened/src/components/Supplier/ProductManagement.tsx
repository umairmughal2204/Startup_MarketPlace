import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../../context/NotificationContext';
import { useConfirm } from '../../context/ConfirmContext';
import { supplierApi } from '../../api/supplierApi';
import { useAuth } from '../../context/AuthContext';
import { isBlank, parseValidatedNumber, preventInvalidNumberKey, sanitizeNumberInput, validateMeaningfulDescription } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imageUrl?: string;
  imageName?: string;
  features: string[];
}

export const ProductManagement = () => {
  const { addNotification } = useNotifications();
  const confirm = useConfirm();
  const { user } = useAuth();
  const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    imageUrl: '',
    imageName: '',
    features: [],
  });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    supplierApi
      .getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load products');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const validateProductForm = () => {
    const errors: Record<string, string> = {};
    if (isBlank(newProduct.name)) {
      errors.name = 'Product name is required.';
    }
    if (isBlank(newProduct.description)) {
      errors.description = 'Description is required.';
    } else {
      const descriptionError = validateMeaningfulDescription(newProduct.description);
      if (descriptionError) errors.description = descriptionError;
    }
    if (isBlank(newProduct.category)) {
      errors.category = 'Category is required.';
    }
    const price = parseValidatedNumber(newProduct.price, { min: 0.01, label: 'Price' });
    if (price.error) errors.price = price.error;
    return errors;
  };

  const validateImageFile = (file: File | null) => {
    if (!file) return null;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return 'Only PNG, JPG, and WEBP images are allowed.';
    if (file.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB.';
    return null;
  };

  const handleAddProduct = async () => {
    const errors = validateProductForm();
    const imageError = validateImageFile(imageFile);
    if (imageError) toast.error(imageError);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || imageError) return;

    const confirmCreate = await confirm({
      title: 'Create product',
      description: `Add "${newProduct.name}" to your catalog?`,
    });
    if (!confirmCreate) return;

    try {
      const product = await supplierApi.createProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        image: newProduct.image,
        features: newProduct.features,
        imageFile,
        supplierName: user?.professionalDetails?.businessName || user?.name || '',
      });

      setProducts([product, ...products]);
      setShowModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        imageUrl: '',
        imageName: '',
        features: [],
      });
      setImageFile(null);
      setFormErrors({});

      toast.success('Product added to your catalog.');
      addNotification({
        type: 'general',
        title: 'Product Added',
        message: `${product.name} has been added to your catalog`,
      });
    } catch (e) {
      if (e instanceof ApiError && e.errors) setFormErrors(e.errors);
      toast.error(e instanceof ApiError ? e.message : 'Failed to create product. Please try again.');
      return;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = await confirm({
      title: 'Delete product',
      description: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmDelete) return;
    try {
      await supplierApi.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to delete product. Please try again.');
      return;
    }
    toast.success('Product removed from your catalog.');
    addNotification({
      type: 'general',
      title: 'Product Deleted',
      message: 'The product has been removed from your catalog',
    });
  };

  const handleEditProduct = (product: Product) => {
    setFormErrors({});
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image || '',
      imageUrl: product.imageUrl || '',
      imageName: product.imageName || '',
      features: product.features,
    });
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const errors = validateProductForm();
    const imageError = validateImageFile(imageFile);
    if (imageError) toast.error(imageError);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || imageError) return;

    const confirmUpdate = await confirm({
      title: 'Update product',
      description: `Save changes to "${editingProduct.name}"?`,
    });
    if (!confirmUpdate) return;

    try {
      const updatedProduct: Product = await supplierApi.updateProduct(editingProduct.id, {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        image: newProduct.image,
        imageFile,
        features: newProduct.features,
        supplierName: user?.professionalDetails?.businessName || user?.name || '',
      });

      setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
      setShowEditModal(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        imageUrl: '',
        imageName: '',
        features: [],
      });
      setImageFile(null);
      setFormErrors({});

      toast.success('Product updated.');
      addNotification({
        type: 'general',
        title: 'Product Updated',
        message: `${updatedProduct.name} has been updated in your catalog`,
      });
    } catch (e) {
      if (e instanceof ApiError && e.errors) setFormErrors(e.errors);
      toast.error(e instanceof ApiError ? e.message : 'Failed to update product. Please try again.');
      return;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setFormErrors({});
            setShowModal(true);
          }}
          className="bg-gradient-aurora-supplier text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6 text-gray-500">Loading products...</div>
        )}
        {!isLoading && error && (
          <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6 text-red-600">{error}</div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6 text-gray-500">No products yet.</div>
        )}
        {!isLoading && !error && products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-100 transition-all">
            <img
              src={product.imageUrl ? `${API_BASE}${product.imageUrl}` : (product.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400')}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <span className="bg-cyan-100 text-teal-700 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-teal-600">${product.price}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-cyan-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    formErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Cloud Hosting Package"
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <span className="block text-xs text-gray-500 mb-2">Minimum 8 words</span>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    formErrors.description ? 'border-red-400' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Describe your product..."
                />
                {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newProduct.price || ''}
                    onKeyDown={(e) => preventInvalidNumberKey(e, { allowDecimal: true })}
                    onChange={(e) => {
                      const value = sanitizeNumberInput(e.target.value, { allowDecimal: true, maxLength: 10 });
                      setNewProduct({ ...newProduct, price: value ? Number(value) : 0 });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                      formErrors.price ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="299"
                  />
                  {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, category: e.target.value });
                    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    formErrors.category ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Legal">Legal</option>
                </select>
                {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image (Upload)
                </label>
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-3 space-y-2">
                  {imageFile ? (
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {imageFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                        aria-label="Remove selected image"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No image selected.</p>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      const validationError = validateImageFile(file);
                      if (validationError) {
                        toast.error(validationError);
                        e.target.value = '';
                        return;
                      }
                      setImageFile(file);
                    }}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-teal-600 hover:file:bg-cyan-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features
                </label>
                <textarea
                  value={newProduct.features.join(', ')}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value.split(',').map(f => f.trim()) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
                  rows={4}
                  placeholder="Enter features separated by commas..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setImageFile(null);
                    setFormErrors({});
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-gradient-aurora-supplier text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-cyan-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    formErrors.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Cloud Hosting Package"
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <span className="block text-xs text-gray-500 mb-2">Minimum 8 words</span>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    formErrors.description ? 'border-red-400' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Describe your product..."
                />
                {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newProduct.price || ''}
                    onKeyDown={(e) => preventInvalidNumberKey(e, { allowDecimal: true })}
                    onChange={(e) => {
                      const value = sanitizeNumberInput(e.target.value, { allowDecimal: true, maxLength: 10 });
                      setNewProduct({ ...newProduct, price: value ? Number(value) : 0 });
                      if (formErrors.price) setFormErrors({ ...formErrors, price: '' });
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                      formErrors.price ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="299"
                  />
                  {formErrors.price && <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, category: e.target.value });
                    if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 ${
                    formErrors.category ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Legal">Legal</option>
                </select>
                {formErrors.category && <p className="text-xs text-red-600 mt-1">{formErrors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Image (Upload)
                </label>
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-3 space-y-2">
                  {(newProduct.imageName || newProduct.imageUrl) && !imageFile && (
                    <p className="text-sm text-gray-600">
                      Current: <span className="font-medium">{newProduct.imageName || 'Uploaded image'}</span>
                    </p>
                  )}
                  {imageFile ? (
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {imageFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                        aria-label="Remove selected image"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No new image selected.</p>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      const validationError = validateImageFile(file);
                      if (validationError) {
                        toast.error(validationError);
                        e.target.value = '';
                        return;
                      }
                      setImageFile(file);
                    }}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-teal-600 hover:file:bg-cyan-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features
                </label>
                <textarea
                  value={newProduct.features.join(', ')}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value.split(',').map(f => f.trim()) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
                  rows={4}
                  placeholder="Enter features separated by commas..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setImageFile(null);
                    setFormErrors({});
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-gradient-aurora-supplier text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
