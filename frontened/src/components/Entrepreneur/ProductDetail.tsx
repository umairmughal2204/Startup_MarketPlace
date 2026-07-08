import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Package, Download, Shield, X, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { useAuth } from '../../context/AuthContext';
import { parseValidatedNumber, preventInvalidNumberKey, sanitizeNumberInput } from '../../utils/validation';
import { ApiError } from '../../api/apiError';

interface Product {
  id: string;
  name: string;
  supplier: string;
  price: number;
  image: string;
  category: string;
  description: string;
  fullDescription?: string;
  features?: string[];
  supplierEmail?: string;
  supplierCompany?: string;
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

interface PaymentModal {
  isOpen: boolean;
}

export const ProductDetail = ({ product, onBack }: ProductDetailProps) => {
  const { addNotification } = useNotifications();
  const { openChatWithContact } = useChat();
  const { user } = useAuth();
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({ isOpen: false });
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Enhanced product data
  const productData: Product = {
    ...product,
    fullDescription: product.fullDescription || product.description,
    features: product.features || [
      'Professional software solution',
      '24/7 customer support available',
      'Regular updates included',
      'Cloud-based access',
      'Multi-platform compatibility',
    ],
    supplierEmail: product.supplierEmail || 'contact@supplier.com',
    supplierCompany: product.supplierCompany || 'Supplier Company',
  };

  const handleOpenPaymentModal = () => {
    setPaymentModal({ isOpen: true });
  };

  const handleClosePaymentModal = () => {
    setPaymentModal({ isOpen: false });
    setQuantity(1);
    setQuantityError(null);
  };

  const handlePlaceOrder = async () => {
    const quantityCheck = parseValidatedNumber(quantity, { min: 1, max: 999, integer: true, label: 'Quantity' });
    setQuantityError(quantityCheck.error);
    if (quantityCheck.error) return;

    const confirmOrder = window.confirm('Place this order?');
    if (!confirmOrder) return;

    try {
      await entrepreneurApi.createOrder({
        productName: productData.name,
        supplier: productData.supplier,
        quantity: quantityCheck.value || 1,
        price: productData.price,
        entrepreneurName: user?.name || 'Entrepreneur',
        entrepreneurEmail: user?.email || '',
      });

      toast.success('Order placed successfully.');
      addNotification({
        type: 'order',
        title: 'Order Placed Successfully',
        message: `You have successfully placed an order for ${productData.name}`,
      });
      setOrderSuccess(true);
      handleClosePaymentModal();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to place order. Please try again.');
    }
  };

  const handleMessageSupplier = () => {
    // Open chat with the supplier
    openChatWithContact({
      id: productData.id,
      name: productData.supplier,
      role: 'Supplier' as const,
    });
    
    addNotification({
      type: 'general',
      title: 'Opening Chat',
      message: `Starting conversation with ${productData.supplier}`,
    });
  };

  const totalPrice = productData.price * quantity;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      {/* Product Detail Card */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="space-y-4">
            <img
              src={productData.image}
              alt={productData.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            
            {/* Supplier Info */}
            <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Sold by:</p>
              <p className="text-xl font-bold text-pink-600 mb-1">{productData.supplier}</p>
              <p className="text-sm text-gray-600 mb-4">{productData.supplierCompany}</p>
              <button
                onClick={handleMessageSupplier}
                className="w-full bg-gradient-aurora-entrepreneur text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Message Supplier
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{productData.name}</h1>
                <span className="bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded-full font-semibold">
                  {productData.category}
                </span>
              </div>

              <p className="text-gray-600 text-lg mt-2">{productData.fullDescription}</p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-pink-600">${productData.price}</p>
                  <p className="text-sm text-gray-500 mt-1">Single User License</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">✓ Instant Access</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleOpenPaymentModal}
                className="w-full bg-gradient-aurora-entrepreneur text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-pink-500/25 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                Place Order - ${totalPrice}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Secure payment processing • Fast delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6">Product Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {productData.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gradient-aurora-entrepreneur rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-gray-700">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
              <Download className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-bold text-lg">Instant Access</h3>
          </div>
          <p className="text-gray-600">Download and use immediately after purchase</p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-bold text-lg">Support</h3>
          </div>
          <p className="text-gray-600">24/7 customer support and documentation</p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-bold text-lg">Secure Payment</h3>
          </div>
          <p className="text-gray-600">Safe & encrypted transactions</p>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {paymentModal.isOpen && (
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
                  <span className="font-semibold">{productData.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1}
                    value={quantity}
                    onKeyDown={(e) => preventInvalidNumberKey(e)}
                    onChange={(e) => {
                      const value = sanitizeNumberInput(e.target.value, { maxLength: 3 });
                      setQuantity(value ? Number(value) : 1);
                      if (quantityError) setQuantityError(null);
                    }}
                    className={`w-20 px-2 py-1 border rounded-lg text-right ${
                      quantityError ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {quantityError && <p className="text-xs text-red-600 text-right">{quantityError}</p>}

                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-2xl text-pink-600">${totalPrice.toFixed(2)}</span>
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
                  className="flex-1 bg-gradient-aurora-entrepreneur text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition flex items-center justify-center gap-2"
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
                onClick={() => {
                  setOrderSuccess(false);
                  onBack();
                }}
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
                Order placed for <span className="font-semibold">{productData.name}</span>.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setOrderSuccess(false);
                    onBack();
                  }}
                  className="px-6 py-2 bg-gradient-aurora-entrepreneur text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition"
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
