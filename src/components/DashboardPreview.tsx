import { TrendingUp, Users, MessageCircle, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { date: 'Jan', engagement: 120, leads: 45 },
  { date: 'Feb', engagement: 180, leads: 68 },
  { date: 'Mar', engagement: 250, leads: 95 },
  { date: 'Apr', engagement: 310, leads: 142 },
  { date: 'May', engagement: 380, leads: 178 },
  { date: 'Jun', engagement: 450, leads: 215 },
];

export function DashboardPreview() {
  return (
    <div className="relative">
      {/* Glow Effect Behind Dashboard */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-500/30 border-2 border-gray-200/80 overflow-hidden transform hover:scale-[1.02] transition-all duration-700">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-7 py-5 border-b border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white/90 animate-pulse"></div>
              <h3 className="text-sm font-bold text-white tracking-wide">AI Analytics Dashboard</h3>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white/60"></div>
              <div className="w-3 h-3 rounded-full bg-white/60"></div>
              <div className="w-3 h-3 rounded-full bg-white/60"></div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* KPI Tiles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-white p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <Users size={24} className="text-indigo-600" />
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  +23%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">2,847</div>
              <div className="text-xs text-gray-600 font-semibold mt-1">Total Engagement</div>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 via-purple-50/50 to-white p-5 rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <Target size={24} className="text-purple-600" />
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  +18%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">743</div>
              <div className="text-xs text-gray-600 font-semibold mt-1">AI-Qualified Leads</div>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 via-blue-50/50 to-white p-5 rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <MessageCircle size={24} className="text-blue-600" />
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  +4.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">26.1%</div>
              <div className="text-xs text-gray-600 font-semibold mt-1">Conversion Rate</div>
            </div>

            <div className="group bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-white p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp size={24} className="text-indigo-600" />
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  +12
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">84</div>
              <div className="text-xs text-gray-600 font-semibold mt-1">Avg. AI Score</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 hover:shadow-xl transition-all duration-300">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Engagement & Leads Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#d1d5db"
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#d1d5db"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  dot={{ fill: '#a855f7', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}