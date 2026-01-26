import React from 'react';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  productName: string;
  supplier: string;
  quantity: number;
  price: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  orderDate: Date;
  estimatedDelivery: Date;
}

export const MyOrders = () => {
  const orders: Order[] = [
    {
      id: 'ORD-001',
      productName: 'Cloud Hosting Package',
      supplier: 'TechSupply Co.',
      quantity: 1,
      price: 299,
      status: 'Delivered',
      orderDate: new Date('2026-01-10'),
      estimatedDelivery: new Date('2026-01-12'),
    },
    {
      id: 'ORD-002',
      productName: 'Logo Design Service',
      supplier: 'Creative Studio',
      quantity: 1,
      price: 499,
      status: 'Processing',
      orderDate: new Date('2026-01-13'),
      estimatedDelivery: new Date('2026-01-20'),
    },
    {
      id: 'ORD-003',
      productName: 'SEO Optimization Package',
      supplier: 'Digital Growth',
      quantity: 1,
      price: 899,
      status: 'Pending',
      orderDate: new Date('2026-01-15'),
      estimatedDelivery: new Date('2026-01-22'),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-[#0066cc]" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-[#0088dd]" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-[#00aaee]" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Processing':
        return 'bg-blue-100 text-[#0066cc]';
      case 'Shipped':
        return 'bg-blue-50 text-[#0088dd]';
      case 'Delivered':
        return 'bg-blue-50 text-[#00aaee]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {orders.length}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-[#0066cc] mb-1">
            {orders.filter(o => o.status === 'Processing').length}
          </div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-[#0088dd] mb-1">
            {orders.filter(o => o.status === 'Shipped').length}
          </div>
          <div className="text-sm text-gray-600">Shipped</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-[#00aaee] mb-1">
            {orders.filter(o => o.status === 'Delivered').length}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Est. Delivery
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {order.orderDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      ${order.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.estimatedDelivery.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};