import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditLogsApi } from '@/services/api'
import { formatRelativeTime } from '@/lib/utils'
import { Shield, Filter } from 'lucide-react'

const ACTION_ICONS: Record<string, string> = {
  'user.login': '🔑',
  'user.created': '👤',
  'user.role_changed': '🔐',
  'contact.created': '👥',
  'contact.updated': '✏️',
  'contact.deleted': '🗑️',
  'deal.created': '💼',
  'deal.updated': '📝',
  'deal.stage_changed': '🔄',
  'deal.deleted': '🗑️',
  'company.created': '🏢',
  'company.updated': '✏️',
  'task.created': '✅',
}

export function AuditPage() {
  const [resourceType, setResourceType] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit_logs', resourceType],
    queryFn: () => auditLogsApi.list({ resource_type: resourceType }).then(r => r.data),
  })

  const logs = data?.data || []

  const getActionColor = (action: string) => {
    if (action.includes('deleted')) return 'text-red-600 bg-red-50'
    if (action.includes('created')) return 'text-green-600 bg-green-50'
    if (action.includes('stage_changed') || action.includes('updated')) return 'text-blue-600 bg-blue-50'
    if (action.includes('login')) return 'text-purple-600 bg-purple-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={22} className="text-blue-600" /> Audit Log
          </h1>
          <p className="text-gray-500 text-sm mt-1">Immutable record of all system events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <Filter size={15} className="text-gray-400" />
        <select
          value={resourceType}
          onChange={e => setResourceType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All resources</option>
          {['User', 'Contact', 'Company', 'Deal', 'Task'].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Resource</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Details</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No audit logs found</td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{ACTION_ICONS[log.action] || '📋'}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                    {log.resource_type} #{log.resource_id}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-700">{log.user_name || 'System'}</div>
                  {log.ip_address && <div className="text-xs text-gray-400">{log.ip_address}</div>}
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  {Object.keys(log.metadata || {}).length > 0 && (
                    <div className="text-xs text-gray-500">
                      {Object.entries(log.metadata).map(([k, v]) => (
                        <span key={k} className="mr-2">
                          {k}: <span className="font-medium text-gray-700">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
