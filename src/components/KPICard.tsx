import { LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number | null; // allow optional/null
  icon: LucideIcon;
  sparklineData?: number[] | null; // allow optional/null
}

function normalizeSparkline(input: KPICardProps['sparklineData']): number[] {
  if (!Array.isArray(input)) return [];
  // filter invalid numbers, coerce to finite
  return input
    .map((v) => (typeof v === 'number' ? v : Number(v)))
    .filter((v) => Number.isFinite(v));
}

export function KPICard({
  title,
  value,
  change = null,
  icon: Icon,
  sparklineData,
}: KPICardProps) {
  const hasChange = typeof change === 'number' && Number.isFinite(change);
  const isPositive = hasChange ? change >= 0 : true;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  const data = normalizeSparkline(sparklineData);
  const hasSparkline = data.length >= 2;
  const chartData = hasSparkline ? data.map((v, index) => ({ value: v, index })) : [];

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Icon className="text-white" size={20} />
        </div>

        {hasChange && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor}`}>
            <span className={`text-xs font-bold ${changeColor}`}>
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mb-4">{value}</p>

      <div className="h-12 w-full">
        {hasSparkline ? (
          <ResponsiveContainer width="100%" height={48}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No trend data
          </div>
        )}
      </div>
    </div>
  );
}