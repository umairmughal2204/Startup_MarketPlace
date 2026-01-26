import React from 'react';
import { Package, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';

export const SupplierHome = () => {
  const stats = [
    { label: 'Total Products', value: '24', icon: <Package className="w-6 h-6" />, color: 'bg-[#0066cc]' },
    { label: 'Active Orders', value: '18', icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-[#0088cc]' },
    { label: 'Monthly Revenue', value: '$12,450', icon: <DollarSign className="w-6 h-6" />, color: 'bg-[#0099dd]' },
    { label: 'Growth Rate', value: '+23%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-[#00aaee]' },
  ];

  const recentOrders = [
    { id: 'ORD-001', entrepreneur: 'John Doe', product: 'Cloud Hosting Package', quantity: 1, amount: 299, status: 'Processing' },
    { id: 'ORD-002', entrepreneur: 'Sarah Smith', product: 'Logo Design Service', quantity: 2, amount: 998, status: 'Shipped' },
    { id: 'ORD-003', entrepreneur: 'Mike Johnson', product: 'SEO Package', quantity: 1, amount: 899, status: 'Pending' },
  ];

  const topProducts = [
    { name: 'Cloud Hosting Package', sales: 45, revenue: '$13,455' },
    { name: 'Logo Design Service', sales: 32, revenue: '$15,968' },
    { name: 'SEO Optimization Package', sales: 28, revenue: '$25,172' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Entrepreneur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.entrepreneur}</div>
                      <div className="text-xs text-gray-500">{order.product}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Shipped'
                            ? 'bg-blue-50 text-[#0088cc]'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-[#0066cc]'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.sales} sales</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#0066cc]">{product.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0066cc] to-[#0088dd] text-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Add New Product</h3>
          <p className="mb-4 text-blue-100">
            List a new product or service to expand your offerings to entrepreneurs.
          </p>
          <button className="bg-white text-[#0066cc] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Add Product
          </button>
        </div>

        <div className="bg-white border-2 border-[#0066cc] rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2">Manage Orders</h3>
          <p className="mb-4 text-gray-600">
            Update order statuses and communicate with entrepreneurs about their purchases.
          </p>
          <button className="bg-[#0066cc] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#004080] transition">
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};