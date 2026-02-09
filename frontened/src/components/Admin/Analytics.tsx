import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, Package, Lightbulb, CheckCircle2, Clock } from 'lucide-react';
import { entrepreneurApi } from '../../api/entrepreneurApi';
import { supplierApi } from '../../api/supplierApi';
import { useAuth } from '../../context/AuthContext';

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
  category: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
}

export const Analytics = () => {
  const { users } = useAuth();
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
        setError('Failed to load analytics data');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { platformMetrics, categoryBreakdown, monthlyGrowth, approvalRates, roleCounts, ideaStatusCounts, productStatusCounts } =
    useMemo(() => {
      const totalIdeas = ideas.length;
      const totalProducts = products.length;
      const approvedIdeas = ideas.filter((idea) => idea.status === 'Approved').length;
      const approvedProducts = products.filter((product) => (product.status || 'Pending') === 'Approved').length;
      const pendingIdeas = ideas.filter(
        (idea) => idea.status === 'Pending' || idea.status === 'Under Review'
      ).length;
      const pendingProducts = products.filter((product) => (product.status || 'Pending') === 'Pending').length;

      const approvalRateIdeas = totalIdeas === 0 ? 0 : Math.round((approvedIdeas / totalIdeas) * 100);
      const approvalRateProducts = totalProducts === 0 ? 0 : Math.round((approvedProducts / totalProducts) * 100);

      const totalUsers = users.length;
      const roleCountsLocal = users.reduce(
        (acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const categoryMap = ideas.reduce((acc, idea) => {
        const category = idea.category?.trim() || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryBreakdownLocal = Object.entries(categoryMap)
        .map(([category, count]) => ({
          category,
          ideas: count,
          percentage: totalIdeas === 0 ? 0 : Math.round((count / totalIdeas) * 100),
        }))
        .sort((a, b) => b.ideas - a.ideas)
        .slice(0, 6);

      const now = new Date();
      const monthKeys = Array.from({ length: 6 }).map((_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        return {
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
        };
      });

      const countByMonth = (items: Array<{ createdAt?: string }>) =>
        monthKeys.map((month) =>
          items.filter((item) => {
            if (!item.createdAt) return false;
            const createdAt = new Date(item.createdAt);
            return createdAt >= month.start && createdAt <= month.end;
          }).length
        );

      const usersByMonth = countByMonth(users);
      const ideasByMonth = countByMonth(ideas);
      const productsByMonth = countByMonth(products);

      const monthlyGrowthLocal = monthKeys.map((month, index) => ({
        month: month.label,
        users: usersByMonth[index],
        ideas: ideasByMonth[index],
        products: productsByMonth[index],
      }));

      const metrics = [
        {
          label: 'Total Users',
          value: totalUsers.toLocaleString(),
          change: `${roleCountsLocal.Admin || 0} admins`,
          icon: <Users className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          label: 'Total Ideas',
          value: totalIdeas.toLocaleString(),
          change: `${pendingIdeas} pending`,
          icon: <Lightbulb className="w-6 h-6" />,
          color: 'bg-yellow-500',
        },
        {
          label: 'Total Products',
          value: totalProducts.toLocaleString(),
          change: `${pendingProducts} pending`,
          icon: <Package className="w-6 h-6" />,
          color: 'bg-purple-500',
        },
        {
          label: 'Approval Rate',
          value: `${Math.round((approvalRateIdeas + approvalRateProducts) / 2)}%`,
          change: `${approvedIdeas + approvedProducts} approved`,
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'bg-green-500',
        },
      ];

      return {
        platformMetrics: metrics,
        categoryBreakdown: categoryBreakdownLocal,
        monthlyGrowth: monthlyGrowthLocal,
        approvalRates: {
          ideas: approvalRateIdeas,
          products: approvalRateProducts,
        },
        roleCounts: roleCountsLocal,
        ideaStatusCounts: {
          approved: approvedIdeas,
          pending: pendingIdeas,
          rejected: ideas.filter((idea) => idea.status === 'Rejected').length,
        },
        productStatusCounts: {
          approved: approvedProducts,
          pending: pendingProducts,
          rejected: products.filter((product) => (product.status || 'Pending') === 'Rejected').length,
        },
      };
    }, [ideas, products, users]);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.color} text-white p-3 rounded-lg`}>
                {metric.icon}
              </div>
              <span className="text-gray-600 text-sm font-semibold">{metric.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500">Loading analytics...</div>
      )}
      {!isLoading && error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Monthly Growth Chart (Simplified) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Platform Growth Trends</h2>
          <p className="text-gray-600">Monthly user, idea, and product growth over the last 6 months</p>
        </div>
        <div className="space-y-4">
          {monthlyGrowth.map((data, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm font-semibold text-gray-600">{data.month}</div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Users</span>
                    <span className="text-sm font-semibold text-blue-600">{data.users}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${data.users === 0 ? 0 : Math.min(100, (data.users / Math.max(1, users.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Ideas</span>
                    <span className="text-sm font-semibold text-yellow-600">{data.ideas}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${data.ideas === 0 ? 0 : Math.min(100, (data.ideas / Math.max(1, ideas.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Products</span>
                    <span className="text-sm font-semibold text-purple-600">{data.products}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${data.products === 0 ? 0 : Math.min(100, (data.products / Math.max(1, products.length)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Ideas by Category</h2>
          <div className="space-y-4">
            {!isLoading && categoryBreakdown.length === 0 && (
              <div className="text-sm text-gray-500">No ideas submitted yet.</div>
            )}
            {categoryBreakdown.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{cat.ideas} ideas</span>
                    <span className="text-sm font-semibold text-[#0066cc]">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0066cc] to-[#008b8b] rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Status Breakdown</h2>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-gray-700">Ideas</span>
                </div>
                <span className="text-sm text-gray-500">{ideas.length} total</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  {ideaStatusCounts.approved} approved
                </div>
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-4 h-4" />
                  {ideaStatusCounts.pending} pending
                </div>
                <div className="text-red-600">{ideaStatusCounts.rejected} rejected</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Products</span>
                </div>
                <span className="text-sm text-gray-500">{products.length} total</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  {productStatusCounts.approved} approved
                </div>
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-4 h-4" />
                  {productStatusCounts.pending} pending
                </div>
                <div className="text-red-600">{productStatusCounts.rejected} rejected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{approvalRates.ideas}%</div>
          <div className="text-blue-100">Idea Approval Rate</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <Package className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{approvalRates.products}%</div>
          <div className="text-green-100">Product Approval Rate</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">{roleCounts.Investor || 0}</div>
          <div className="text-purple-100">Investors Registered</div>
        </div>
      </div>
    </div>
  );
};
