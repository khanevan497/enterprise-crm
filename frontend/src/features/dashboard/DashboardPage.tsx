import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/services/api'
import { formatCurrency, formatRelativeTime, STAGE_COLORS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Users, TrendingUp, DollarSign, Award, Activity, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STAGE_PIE_COLORS = ['#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝',
  call: '📞',
  email: '✉️',
  meeting: '🤝',
  deal_update: '📊',
  status_change: '🔄',
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const kpis = [
    {
      label: 'Total Contacts',
      value: data.kpis.total_contacts.toLocaleString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      change: '+12%',
    },
    {
      label: 'Active Deals',
      value: data.kpis.active_deals.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      change: '+8%',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(data.kpis.pipeline_value),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      change: '+23%',
    },
    {
      label: 'Won Revenue',
      value: formatCurrency(data.kpis.won_revenue),
      icon: Award,
      color: 'bg-orange-50 text-orange-600',
      change: '+41%',
    },
  ]

  const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  const dealsByStage = stageOrder.map(stage => {
    const found = data.deals_by_stage.find(d => d.stage === stage)
    return { stage: stage.replace('_', ' '), count: found?.count || 0, value: found?.total_value || 0 }
  })

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your sales pipeline and CRM metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, color, change }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2.5 rounded-lg', color)}>
                  <Icon size={18} />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                  <ArrowUpRight size={12} />
                  {change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.monthly_revenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v as number), 'Revenue']} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deals by stage pie */}
        <Card>
          <CardHeader>
            <CardTitle>Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dealsByStage.filter(d => d.count > 0)}
                  dataKey="count"
                  nameKey="stage"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {dealsByStage.filter(d => d.count > 0).map((_, index) => (
                    <Cell key={index} fill={STAGE_PIE_COLORS[index % STAGE_PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {dealsByStage.filter(d => d.count > 0).map((d, i) => (
                <div key={d.stage} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STAGE_PIE_COLORS[i % STAGE_PIE_COLORS.length] }} />
                    <span className="text-gray-600 capitalize">{d.stage}</span>
                  </div>
                  <span className="font-medium text-gray-900">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline bar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline Value by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dealsByStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v as number), 'Value']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Activity size={15} className="text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="divide-y divide-gray-50">
              {data.recent_activities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex gap-3 px-6 py-3">
                  <span className="text-base flex-shrink-0">{ACTIVITY_ICONS[a.type] || '📌'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{a.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{a.user_name}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(a.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
