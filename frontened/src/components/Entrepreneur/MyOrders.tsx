import React, { useEffect, useMemo, useState } from 'react';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { entrepreneurApi } from '../../api/entrepreneurApi';

interface Order {
  id: string;
  productName: string;
  supplier: string;
  quantity: number;
  price: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string;
  estimatedDelivery: string;
}

export const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    entrepreneurApi
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-pink-600" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-violet-600" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-fuchsia-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Processing':
        return 'bg-pink-100 text-pink-700';
      case 'Shipped':
        return 'bg-violet-100 text-violet-700';
      case 'Delivered':
        return 'bg-fuchsia-100 text-fuchsia-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      processing: orders.filter((o) => o.status === 'Processing').length,
      shipped: orders.filter((o) => o.status === 'Shipped').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {orderStats.total}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-pink-600 mb-1">
            {orderStats.processing}
          </div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-violet-600 mb-1">
            {orderStats.shipped}
          </div>
          <div className="text-sm text-gray-600">Shipped</div>
        </div>
        <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
          <div className="text-3xl font-bold text-fuchsia-600 mb-1">
            {orderStats.delivered}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pink-100">
          <h2 className="text-xl font-bold">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pink-50/70">
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
              {isLoading && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                    Loading orders...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td className="px-6 py-4 text-sm text-red-600" colSpan={7}>
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && orders.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>
                    No orders yet.
                  </td>
                </tr>
              )}
              {!isLoading && !error && orders.map((order) => (
                <tr key={order.id} className="hover:bg-pink-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
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
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
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
