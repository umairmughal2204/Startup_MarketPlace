import React, { useEffect, useState } from 'react';
import { Search, Filter, ShoppingCart, Star, X, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ProductDetail } from './ProductDetail';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { useAuth } from '../../context/AuthContext';
import { supplierApi } from '../../api/supplierApi';

interface Product {
  id: string;
  name: string;
  supplier: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  description: string;
  features?: string[];
  imageUrl?: string;
  imageName?: string;
}

interface PaymentModal {
  isOpen: boolean;
  product: Product | null;
}

export const MarketPlace = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({
    isOpen: false,
    product: null,
  });
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState<{ productName: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Software', 'Hardware', 'Services', 'Marketing', 'Legal'];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    supplierApi
      .getProducts()
      .then((data) => {
        if (isMounted) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            supplier: p.supplierName || 'Supplier',
            price: p.price,
            rating: 4.7,
            image: p.imageUrl ? `${API_BASE}${p.imageUrl}` : (p.image || ''),
            imageUrl: p.imageUrl || '',
            imageName: p.imageName || '',
            category: p.category,
            description: p.description,
            features: p.features || [],
          }));
          setProducts(mapped);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError('Failed to load products');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToOrder = (productId: string, productName: string) => {
    setCart([...cart, productId]);
    addNotification({
      type: 'order',
      title: 'Product Added',
      message: `${productName} has been added to your orders`,
    });
  };

  const handleOpenPaymentModal = (product: Product) => {
    setPaymentModal({ isOpen: true, product });
  };

  const handleClosePaymentModal = () => {
    setPaymentModal({ isOpen: false, product: null });
  };

  const handlePlaceOrder = async () => {
    if (!paymentModal.product) return;

    const confirmOrder = window.confirm('Place this order?');
    if (!confirmOrder) return;

    try {
      await entrepreneurApi.createOrder({
        productName: paymentModal.product.name,
        supplier: paymentModal.product.supplier,
        quantity,
        price: paymentModal.product.price,
        entrepreneurName: user?.name || 'Entrepreneur',
        entrepreneurEmail: user?.email || '',
      });

      addNotification({
        type: 'order',
        title: 'Order Placed',
        message: `You have successfully placed an order for ${paymentModal.product.name}`,
      });
      setOrderSuccess({ productName: paymentModal.product.name });
      handleClosePaymentModal();
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToMarketplace = () => {
    setSelectedProduct(null);
  };

  // If a product is selected, show the detail page
  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={handleBackToMarketplace} />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products or suppliers..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-6 text-gray-500">Loading products...</div>
        )}
        {!isLoading && error && (
          <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>
        )}
        {!isLoading && !error && filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition">
            <img
              src={product.imageUrl ? `${API_BASE}${product.imageUrl}` : (product.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400')}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{product.description}</p>

              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{product.rating}</span>
                <span className="text-sm text-gray-500">• {product.supplier}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-[#0066cc]">${product.price}</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleViewProduct(product)}
                  className="w-full bg-white text-[#0066cc] border-2 border-[#0066cc] py-2.5 rounded-lg font-semibold hover:bg-[#0066cc] hover:text-white transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleOpenPaymentModal(product)}
                  className="w-full bg-[#0066cc] text-white py-2.5 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Place Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {paymentModal.isOpen && paymentModal.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Confirm Your Order</h2>
              <button
                onClick={handleClosePaymentModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-lg mb-3">Order Summary</h3>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-semibold">{paymentModal.product.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity:</span>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                  />
                </div>
                
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-2xl text-[#0066cc]">
                    ${(paymentModal.product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClosePaymentModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-[#0066cc] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Confirmed</h2>
              <button
                onClick={() => setOrderSuccess(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <p className="font-semibold">Your order has been placed successfully.</p>
              </div>
              <p className="text-gray-600">
                Order placed for <span className="font-semibold">{orderSuccess.productName}</span>.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setOrderSuccess(null)}
                  className="px-6 py-2 bg-[#0066cc] text-white rounded-lg font-semibold hover:bg-[#004080] transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};