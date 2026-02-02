import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, Search, Truck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { supplierApi } from '../../api/supplierApi';

interface Order {
  id: string;
  entrepreneurName?: string;
  entrepreneurEmail?: string;
  productName: string;
  supplier: string;
  quantity: number;
  price: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string;
  estimatedDelivery: string;
}

export const OrderManagement = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    supplierApi
      .getOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load orders');
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

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await supplierApi.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((order) => (order.id === orderId ? updated : order)));
    } catch (e) {
      alert('Failed to update order status. Please try again.');
      return;
    }

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
      (order.entrepreneurName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Processing: orders.filter((o) => o.status === 'Processing').length,
    Shipped: orders.filter((o) => o.status === 'Shipped').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
  };

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
          <div className="text-3xl font-bold text-[#0088dd] mb-1">
            {statusCounts.Shipped}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipped
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-[#00aaee] mb-1">
            {statusCounts.Delivered}
          </div>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered
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
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                    Loading orders...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td className="px-6 py-4 text-sm text-red-600" colSpan={6}>
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && filteredOrders.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                    No orders found matching your search.
                  </td>
                </tr>
              )}
              {!isLoading && !error && filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {order.entrepreneurName || 'Entrepreneur'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.entrepreneurEmail || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{order.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">
                      ${(order.price * order.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
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
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
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