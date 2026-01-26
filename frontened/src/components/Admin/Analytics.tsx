import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Package, Lightbulb } from 'lucide-react';

export const Analytics = () => {
  const platformMetrics = [
    { label: 'Total Revenue', value: '$125,450', change: '+23%', icon: <DollarSign className="w-6 h-6" />, color: 'bg-green-500' },
    { label: 'Active Users', value: '1,247', change: '+12%', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Total Ideas', value: '423', change: '+8%', icon: <Lightbulb className="w-6 h-6" />, color: 'bg-yellow-500' },
    { label: 'Products Listed', value: '187', change: '+15%', icon: <Package className="w-6 h-6" />, color: 'bg-purple-500' },
  ];

  const categoryBreakdown = [
    { category: 'Technology', ideas: 145, percentage: 34 },
    { category: 'Healthcare', ideas: 89, percentage: 21 },
    { category: 'Education', ideas: 76, percentage: 18 },
    { category: 'Sustainability', ideas: 58, percentage: 14 },
    { category: 'Finance', ideas: 35, percentage: 8 },
    { category: 'Other', ideas: 20, percentage: 5 },
  ];

  const monthlyGrowth = [
    { month: 'Aug', users: 850, ideas: 245, products: 120 },
    { month: 'Sep', users: 920, ideas: 278, products: 135 },
    { month: 'Oct', users: 1010, ideas: 312, products: 148 },
    { month: 'Nov', users: 1098, ideas: 358, products: 165 },
    { month: 'Dec', users: 1175, ideas: 389, products: 178 },
    { month: 'Jan', users: 1247, ideas: 423, products: 187 },
  ];

  const topPerformers = [
    { name: 'John Doe', role: 'Entrepreneur', metric: '12 ideas submitted', score: 95 },
    { name: 'TechSupply Co.', role: 'Supplier', metric: '$45,230 revenue', score: 92 },
    { name: 'Sarah Investor', role: 'Investor', metric: '156 feedbacks', score: 88 },
  ];

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
              <span className="text-green-600 text-sm font-semibold">{metric.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>

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
                      style={{ width: `${(data.users / 1300) * 100}%` }}
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
                      style={{ width: `${(data.ideas / 450) * 100}%` }}
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
                      style={{ width: `${(data.products / 200) * 100}%` }}
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

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Top Performers</h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{performer.name}</div>
                    <div className="text-sm text-gray-500">{performer.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0066cc]">{performer.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{performer.metric}</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0066cc] rounded-full"
                    style={{ width: `${performer.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">87%</div>
          <div className="text-blue-100">Idea Approval Rate</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <Package className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">92%</div>
          <div className="text-green-100">Product Approval Rate</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-1">94%</div>
          <div className="text-purple-100">User Satisfaction</div>
        </div>
      </div>
    </div>
  );
};
