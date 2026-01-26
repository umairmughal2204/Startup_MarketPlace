import React, { useState } from 'react';
import { ArrowLeft, Star, ShoppingCart, Package, Download, Shield, CreditCard, X, MessageCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';

interface Product {
  id: string;
  name: string;
  supplier: string;
  price: number;
  rating: number;
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
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({ isOpen: false });

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
  };

  const handlePlaceOrder = () => {
    addNotification({
      type: 'order',
      title: 'Order Placed Successfully',
      message: `You have successfully purchased ${productData.name}`,
    });
    handleClosePaymentModal();
    onBack();
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

  const totalPrice = productData.price;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#0066cc] hover:text-[#004080] font-semibold transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      {/* Product Detail Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="space-y-4">
            <img
              src={productData.image}
              alt={productData.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            
            {/* Supplier Info */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Sold by:</p>
              <p className="text-xl font-bold text-[#0066cc] mb-1">{productData.supplier}</p>
              <p className="text-sm text-gray-600 mb-4">{productData.supplierCompany}</p>
              <button
                onClick={handleMessageSupplier}
                className="w-full bg-[#0066cc] text-white py-2.5 rounded-lg font-semibold hover:bg-[#004080] transition flex items-center justify-center gap-2"
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
                <span className="bg-blue-100 text-[#0066cc] text-sm px-3 py-1 rounded-full font-semibold">
                  {productData.category}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{productData.rating}</span>
                  <span className="text-gray-500">(128 reviews)</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg">{productData.fullDescription}</p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-[#0066cc]">${productData.price}</p>
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
                className="w-full bg-[#0066cc] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#004080] transition flex items-center justify-center gap-2 shadow-lg"
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
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Product Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {productData.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#0066cc] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-gray-700">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-[#0066cc]" />
            </div>
            <h3 className="font-bold text-lg">Instant Access</h3>
          </div>
          <p className="text-gray-600">Download and use immediately after purchase</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#0066cc]" />
            </div>
            <h3 className="font-bold text-lg">Support</h3>
          </div>
          <p className="text-gray-600">24/7 customer support and documentation</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-[#0066cc]" />
            </div>
            <h3 className="font-bold text-lg">Secure Payment</h3>
          </div>
          <p className="text-gray-600">Safe & encrypted transactions</p>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Complete Your Order</h2>
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
                
                <div className="flex justify-between">
                  <span className="text-gray-600">License Type:</span>
                  <span className="font-semibold">Single User</span>
                </div>
                
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-2xl text-[#0066cc]">${totalPrice}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-bold mb-3">Payment Method</h3>
                <div className="border border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-[#0066cc]" />
                  <div>
                    <p className="font-semibold">Credit Card</p>
                    <p className="text-sm text-gray-500">Secure payment processing</p>
                  </div>
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
                  <CreditCard className="w-5 h-5" />
                  Pay ${totalPrice}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};