import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { activitiesApi } from '@/services/api'
import { formatRelativeTime } from '@/lib/utils'
import { Activity as ActivityIcon } from 'lucide-react'

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝', call: '📞', email: '✉️', meeting: '🤝', deal_update: '📊', status_change: '🔄',
}

const TYPES = ['', 'note', 'call', 'email', 'meeting', 'deal_update', 'status_change']

export function ActivitiesPage() {
  const [type, setType] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['activities', type],
    queryFn: () => activitiesApi.list({ type }).then(r => r.data),
  })

  const activities = data?.data || []

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time activity feed across your CRM</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {TYPES.map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              type === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t ? `${ACTIVITY_ICONS[t] || ''} ${t.replace('_', ' ')}` : 'All types'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <ActivityIcon size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No activities found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map(a => (
              <div key={a.id} className="flex gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-base flex-shrink-0">
                  {ACTIVITY_ICONS[a.activity_type] || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed">{a.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {a.user_name && (
                      <span className="text-xs font-medium text-gray-700">{a.user_name}</span>
                    )}
                    {a.contact_name && (
                      <span className="text-xs text-gray-500">· {a.contact_name}</span>
                    )}
                    {a.deal_title && (
                      <span className="text-xs text-gray-500">· {a.deal_title}</span>
                    )}
                    <span className="text-xs text-gray-400">{formatRelativeTime(a.created_at)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 capitalize">
                  {a.activity_type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
