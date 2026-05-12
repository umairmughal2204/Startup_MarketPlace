import React, { useEffect, useMemo, useState } from 'react';
import { Package, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { supplierApi } from '../../api/supplierApi';

interface SupplierHomeProps {
  onNavigate?: (pageId: string) => void;
}

export const SupplierHome = ({ onNavigate }: SupplierHomeProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([supplierApi.getProducts(), supplierApi.getOrders()])
      .then(([productData, orderData]) => {
        if (isMounted) {
          setProducts(productData);
          setOrders(orderData);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError('Failed to load dashboard data');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeOrders = orders.filter((o: any) => o.status !== 'Delivered').length;
    const revenue = orders.reduce((sum: number, o: any) => sum + (o.price * o.quantity), 0);
    return [
      { label: 'Total Products', value: String(totalProducts), icon: <Package className="w-6 h-6" />, color: 'bg-gradient-aurora-supplier' },
      { label: 'Active Orders', value: String(activeOrders), icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-gradient-to-br from-teal-500 to-cyan-500' },
      { label: 'Total Revenue', value: `$${revenue.toFixed(2)}`, icon: <DollarSign className="w-6 h-6" />, color: 'bg-gradient-to-br from-cyan-500 to-violet-500' },
      { label: 'Growth Rate', value: '+0%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-gradient-to-br from-teal-500 to-violet-500' },
    ];
  }, [products, orders]);

  const recentOrders = orders.slice(0, 5);

  const topProducts = useMemo(() => {
    const totals: Record<string, { sales: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      if (!totals[o.productName]) {
        totals[o.productName] = { sales: 0, revenue: 0 };
      }
      totals[o.productName].sales += o.quantity;
      totals[o.productName].revenue += o.price * o.quantity;
    });
    return Object.entries(totals)
      .map(([name, data]) => ({ name, sales: data.sales, revenue: `$${data.revenue.toFixed(2)}` }))
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/90 rounded-2xl border border-cyan-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-100 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} text-white p-3 rounded-2xl shadow-lg shadow-cyan-500/20`}>
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
        <div className="bg-white/90 rounded-2xl border border-cyan-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-cyan-100">
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyan-50/70">
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
                {isLoading && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>
                      Loading orders...
                    </td>
                  </tr>
                )}
                {!isLoading && error && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-red-600" colSpan={3}>
                      {error}
                    </td>
                  </tr>
                )}
                {!isLoading && !error && recentOrders.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>
                      No orders yet.
                    </td>
                  </tr>
                )}
                {!isLoading && !error && recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-cyan-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.entrepreneurName || 'Entrepreneur'}</div>
                      <div className="text-xs text-gray-500">{order.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Shipped'
                            ? 'bg-cyan-100 text-cyan-700'
                            : order.status === 'Processing'
                            ? 'bg-teal-100 text-teal-700'
                            : order.status === 'Delivered'
                            ? 'bg-violet-100 text-violet-700'
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
        <div className="bg-white/90 rounded-2xl border border-cyan-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-cyan-100">
            <h2 className="text-xl font-bold">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {isLoading && <div className="text-sm text-gray-500">Loading top products...</div>}
            {!isLoading && !error && topProducts.length === 0 && (
              <div className="text-sm text-gray-500">No product sales yet.</div>
            )}
            {!isLoading && !error && topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.sales} sales</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-teal-600">{product.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-aurora-supplier text-white rounded-2xl shadow-lg shadow-cyan-500/20 p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Add New Product</h3>
          <p className="mb-4 text-white/80">
            List a new product or service to expand your offerings to entrepreneurs.
          </p>
          <button
            onClick={() => onNavigate?.('products')}
            className="bg-white text-teal-600 px-6 py-2 rounded-xl font-semibold hover:bg-cyan-50 transition"
          >
            Add Product
          </button>
        </div>

        <div className="bg-white/90 border border-cyan-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-2">Manage Orders</h3>
          <p className="mb-4 text-gray-600">
            Update order statuses and communicate with entrepreneurs about their purchases.
          </p>
          <button
            onClick={() => onNavigate?.('orders')}
            className="bg-gradient-aurora-supplier text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};
