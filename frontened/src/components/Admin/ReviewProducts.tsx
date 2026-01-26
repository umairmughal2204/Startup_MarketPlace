import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, Package } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  supplier: string;
  supplierEmail: string;
  image: string;
  submittedDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const ReviewProducts = () => {
  const { addNotification } = useNotifications();
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Cloud Hosting Package',
      description: 'Professional cloud hosting with 99.9% uptime guarantee, 24/7 support, and scalable infrastructure.',
      price: 299,
      stock: 100,
      category: 'Software',
      supplier: 'TechSupply Co.',
      supplierEmail: 'tech@supply.com',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      submittedDate: new Date('2026-01-13'),
      status: 'Pending',
    },
    {
      id: '2',
      name: 'Legal Consultation Package',
      description: 'Comprehensive startup legal consultation including business formation, contracts, and IP protection.',
      price: 750,
      stock: 20,
      category: 'Legal',
      supplier: 'Law Partners LLC',
      supplierEmail: 'contact@lawpartners.com',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      submittedDate: new Date('2026-01-14'),
      status: 'Pending',
    },
    {
      id: '3',
      name: 'SEO Optimization Package',
      description: '3-month SEO optimization and content strategy to boost organic traffic.',
      price: 899,
      stock: 75,
      category: 'Marketing',
      supplier: 'Digital Growth',
      supplierEmail: 'hello@digitalgrowth.com',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      submittedDate: new Date('2026-01-10'),
      status: 'Approved',
    },
  ]);

  const handleApprove = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId ? { ...product, status: 'Approved' as const } : product
    ));
    
    const product = products.find(p => p.id === productId);
    addNotification({
      type: 'general',
      title: 'Product Approved',
      message: `"${product?.name}" has been approved and is now available in the marketplace.`,
    });
  };

  const handleReject = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId ? { ...product, status: 'Rejected' as const } : product
    ));
    
    const product = products.find(p => p.id === productId);
    addNotification({
      type: 'general',
      title: 'Product Rejected',
      message: `"${product?.name}" has been rejected.`,
    });
  };

  const pendingProducts = products.filter(p => p.status === 'Pending');
  const reviewedProducts = products.filter(p => p.status !== 'Pending');

  return (
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
            {products.filter(p => p.status === 'Approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {products.filter(p => p.status === 'Rejected').length}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Pending Products */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Products</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {pendingProducts.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No pending products to review</p>
            </div>
          ) : (
            pendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <img
                  src={product.image}
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
                        Supplier: <span className="font-semibold text-gray-900">{product.supplier}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{product.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Price</span>
                      </div>
                      <div className="text-xl font-bold text-[#0066cc]">${product.price}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Package className="w-3 h-3" />
                        <span>Stock</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{product.stock}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Submitted: {product.submittedDate.toLocaleDateString()}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
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
      {reviewedProducts.length > 0 && (
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
                    <td className="px-6 py-4 text-sm text-gray-700">{product.supplier}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${product.price}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-[#0066cc] text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.submittedDate.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
