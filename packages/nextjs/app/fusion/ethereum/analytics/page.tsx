'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalVolume: string;
  totalOrders: number;
  avgGasSaved: string;
  successRate: number;
  topTokens: Array<{
    symbol: string;
    volume: string;
    change24h: number;
  }>;
  recentActivity: Array<{
    type: 'swap' | 'order_created' | 'order_filled';
    amount: string;
    token: string;
    time: string;
    txHash: string;
  }>;
}

const mockAnalyticsData: AnalyticsData = {
  totalVolume: '$2,450,000',
  totalOrders: 1247,
  avgGasSaved: '23%',
  successRate: 98.5,
  topTokens: [
    { symbol: 'USDC', volume: '$850,000', change24h: 12.5 },
    { symbol: 'WETH', volume: '$720,000', change24h: -3.2 },
    { symbol: 'USDT', volume: '$480,000', change24h: 8.7 },
    { symbol: 'DAI', volume: '$400,000', change24h: 15.3 }
  ],
  recentActivity: [
    {
      type: 'order_filled',
      amount: '1,000',
      token: 'USDC',
      time: '2025-07-27 12:28:00',
      txHash: '0xabc123...def456'
    },
    {
      type: 'swap',
      amount: '0.5',
      token: 'WETH',
      time: '2025-07-27 12:25:00',
      txHash: '0xdef456...ghi789'
    },
    {
      type: 'order_created',
      amount: '2,500',
      token: 'USDT',
      time: '2025-07-27 12:22:00',
      txHash: '0xghi789...jkl012'
    }
  ]
};

export default function EthereumAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [data] = useState<AnalyticsData>(mockAnalyticsData);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄';
      case 'order_created': return '📝';
      case 'order_filled': return '✅';
      default: return '📊';
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'swap': return '即时交换';
      case 'order_created': return '创建订单';
      case 'order_filled': return '订单完成';
      default: return '未知活动';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">以太坊分析</h1>
        <p className="text-gray-600">实时监控 Fusion 在以太坊网络上的表现</p>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">时间范围</h2>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: '24h', label: '24小时' },
              { key: '7d', label: '7天' },
              { key: '30d', label: '30天' },
              { key: '90d', label: '90天' }
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key as any)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  timeRange === range.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💰</div>
            <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +12.5%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{data.totalVolume}</div>
          <div className="text-sm text-gray-600">总交易量</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📋</div>
            <div className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              +8.3%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{data.totalOrders.toLocaleString()}</div>
          <div className="text-sm text-gray-600">总订单数</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">⛽</div>
            <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +5.2%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{data.avgGasSaved}</div>
          <div className="text-sm text-gray-600">平均Gas节省</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">✅</div>
            <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +0.3%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{data.successRate}%</div>
          <div className="text-sm text-gray-600">成功率</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Tokens */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">热门代币</h2>
            <Link 
              href="/fusion/ethereum/tokens"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {data.topTokens.map((token, index) => (
              <div key={token.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{token.symbol}</div>
                    <div className="text-sm text-gray-600">{token.volume}</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">最近活动</h2>
            <Link 
              href="/fusion/ethereum/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{getActivityText(activity.type)}</div>
                    <div className="text-sm text-gray-600">
                      {activity.amount} {activity.token}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{activity.time}</div>
                  <a 
                    href={`https://etherscan.io/tx/${activity.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    查看交易 ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">交易量趋势</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-gray-600">交易量图表</div>
              <div className="text-sm text-gray-500 mt-1">即将推出</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gas 费用分析</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⛽</div>
              <div className="text-gray-600">Gas费用图表</div>
              <div className="text-sm text-gray-500 mt-1">即将推出</div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">网络状态</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <div className="font-semibold text-gray-900">网络状态</div>
            <div className="text-sm text-green-600">正常运行</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold text-gray-900">当前 Gas Price</div>
            <div className="text-sm text-gray-600">25 Gwei</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔗</div>
            <div className="font-semibold text-gray-900">最新区块</div>
            <div className="text-sm text-gray-600">#18,950,123</div>
          </div>
        </div>
      </div>
    </div>
  );
}