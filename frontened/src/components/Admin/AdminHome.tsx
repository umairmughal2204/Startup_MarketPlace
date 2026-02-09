import React, { useEffect, useMemo, useState } from 'react';
import { Users, Lightbulb, Package, TrendingUp } from 'lucide-react';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { supplierApi } from '../../api/supplierApi';

interface IdeaItem {
  id: string;
  title: string;
  category: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt?: string;
}

interface ProductItem {
  id: string;
  name: string;
  supplierName?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
}

export const AdminHome = () => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([entrepreneurApi.getIdeas(), supplierApi.getProducts()])
      .then(([ideaData, productData]) => {
        if (!isMounted) return;
        setIdeas(ideaData);
        setProducts(productData);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load admin data');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingIdeas = useMemo(
    () => ideas.filter((idea) => idea.status === 'Pending' || idea.status === 'Under Review'),
    [ideas]
  );
  const pendingProducts = useMemo(
    () => products.filter((product) => (product.status || 'Pending') === 'Pending'),
    [products]
  );

  const stats = useMemo(() => {
    return [
      { label: 'Total Users', value: '1,247', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500', change: '+12%' },
      { label: 'Pending Ideas', value: String(pendingIdeas.length), icon: <Lightbulb className="w-6 h-6" />, color: 'bg-yellow-500', change: `${pendingIdeas.length}` },
      { label: 'Pending Products', value: String(pendingProducts.length), icon: <Package className="w-6 h-6" />, color: 'bg-orange-500', change: `${pendingProducts.length}` },
      { label: 'Active Orders', value: '156', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-500', change: '+18%' },
    ];
  }, [pendingIdeas.length, pendingProducts.length]);

  const pendingApprovals = useMemo(() => {
    const ideaItems = pendingIdeas.map((idea) => ({
      type: 'Idea',
      title: idea.title,
      submitter: 'Entrepreneur',
      status: idea.status,
      createdAt: idea.createdAt,
    }));
    const productItems = pendingProducts.map((product) => ({
      type: 'Product',
      title: product.name,
      submitter: product.supplierName || 'Supplier',
      status: product.status || 'Pending',
      createdAt: product.createdAt,
    }));

    return [...ideaItems, ...productItems]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [pendingIdeas, pendingProducts]);

  const recentActivity = useMemo(() => {
    return pendingApprovals.map((item) => ({
      action: item.type === 'Idea' ? 'Idea submitted for review' : 'Product listed for approval',
      user: item.submitter,
      role: item.type === 'Idea' ? 'Entrepreneur' : 'Supplier',
      time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
    }));
  }, [pendingApprovals]);

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
              <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold">Pending Approvals</h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              {pendingApprovals.length} items
            </span>
          </div>
          <div className="p-6 space-y-4">
            {isLoading && (
              <div className="text-sm text-gray-500">Loading approvals...</div>
            )}
            {!isLoading && error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!isLoading && !error && pendingApprovals.length === 0 && (
              <div className="text-sm text-gray-500">No pending approvals.</div>
            )}
            {!isLoading && !error && pendingApprovals.map((item, index) => (
              <div key={index} className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      item.type === 'Idea' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type}
                    </span>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">by {item.submitter}</p>
                </div>
                <button className="text-[#0066cc] hover:underline font-semibold text-sm">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {isLoading && <li className="text-sm text-gray-500">Loading activity...</li>}
              {!isLoading && error && <li className="text-sm text-red-600">{error}</li>}
              {!isLoading && !error && recentActivity.length === 0 && (
                <li className="text-sm text-gray-500">No recent activity.</li>
              )}
              {!isLoading && !error && recentActivity.map((activity, index) => (
                <li key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-[#0066cc] rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span className="text-[#0066cc]">{activity.role}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">423</div>
          <div className="text-blue-100">Entrepreneurs</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <Package className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">87</div>
          <div className="text-green-100">Suppliers</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
          <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">156</div>
          <div className="text-purple-100">Investors</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-[#0066cc] text-[#0066cc] rounded-lg hover:bg-[#0066cc] hover:text-white transition font-semibold">
            Review Ideas
          </button>
          <button className="p-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold">
            Approve Products
          </button>
          <button className="p-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition font-semibold">
            Manage Users
          </button>
          <button className="p-4 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition font-semibold">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
