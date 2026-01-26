import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Search, Download } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface Order {
  id: string;
  entrepreneurName: string;
  entrepreneurEmail: string;
  product: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed';
  orderDate: Date;
}

export const OrderManagement = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      entrepreneurName: 'John Doe',
      entrepreneurEmail: 'john@example.com',
      product: 'Project Management Pro',
      totalAmount: 49,
      status: 'Processing',
      orderDate: new Date('2026-01-10'),
    },
    {
      id: 'ORD-002',
      entrepreneurName: 'Sarah Smith',
      entrepreneurEmail: 'sarah@example.com',
      product: 'CRM Suite Enterprise',
      totalAmount: 99,
      status: 'Completed',
      orderDate: new Date('2026-01-12'),
    },
    {
      id: 'ORD-003',
      entrepreneurName: 'Mike Johnson',
      entrepreneurEmail: 'mike@example.com',
      product: 'Analytics Dashboard',
      totalAmount: 89,
      status: 'Pending',
      orderDate: new Date('2026-01-14'),
    },
    {
      id: 'ORD-004',
      entrepreneurName: 'Emily Chen',
      entrepreneurEmail: 'emily@example.com',
      product: 'Code Editor Ultimate',
      totalAmount: 79,
      status: 'Completed',
      orderDate: new Date('2026-01-08'),
    },
  ]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    const order = orders.find((o) => o.id === orderId);
    if (order) {
      addNotification({
        type: 'order',
        title: 'Order Status Updated',
        message: `Order ${orderId} status changed to ${newStatus}`,
      });
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.entrepreneurName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Processing: orders.filter((o) => o.status === 'Processing').length,
    Completed: orders.filter((o) => o.status === 'Completed').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-[#0066cc]" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-[#0088cc]" />;
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
      case 'Completed':
        return 'bg-blue-50 text-[#0088cc]';
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
            {statusCounts.Pending}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Orders
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {statusCounts.Processing}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Processing
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-[#0088cc] mb-1">
            {statusCounts.Completed}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, entrepreneur, or product..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Entrepreneur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {order.orderDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.entrepreneurName}</div>
                    <div className="text-sm text-gray-500">{order.entrepreneurEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{order.product}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as Order['status'])
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No orders found matching your search.</p>
        </div>
      )}
    </div>
  );
};