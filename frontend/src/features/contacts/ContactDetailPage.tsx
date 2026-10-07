import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsApi, aiApi } from '@/services/api'
import { formatDate, formatCurrency, formatRelativeTime, STATUS_COLORS, STAGE_COLORS, cn, getInitials } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Building2, Edit2, Trash2, TrendingUp, CheckSquare, Activity, Bot, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Select, Textarea } from '@/components/ui/input'

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝', call: '📞', email: '✉️', meeting: '🤝', deal_update: '📊', status_change: '🔄',
}

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'overview' | 'deals' | 'tasks' | 'activities' | 'ai'>('overview')
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([])
  const [insight, setInsight] = useState<Record<string, unknown> | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.get(Number(id)).then(r => r.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: (d: Record<string, string>) => contactsApi.update(Number(id), d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contact', id] }); setShowEdit(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: () => contactsApi.delete(Number(id)),
    onSuccess: () => navigate('/contacts'),
  })

  const loadInsight = async () => {
    setAiLoading(true)
    try {
      const res = await aiApi.customerInsight({ contact_id: Number(id) })
      setInsight(res.data.data)
    } finally {
      setAiLoading(false)
    }
  }

  const sendChat = async () => {
    if (!aiMessage.trim()) return
    const msg = aiMessage.trim()
    setAiMessage('')
    setAiChat(c => [...c, { role: 'user', content: msg }])
    setAiLoading(true)
    try {
      const res = await aiApi.chat(msg, { contact_id: Number(id) })
      setAiChat(c => [...c, { role: 'ai', content: res.data.data.reply }])
    } finally {
      setAiLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!data) return <div className="p-6 text-gray-500">Contact not found</div>

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'deals', label: `Deals (${data.deals?.length || 0})` },
    { key: 'tasks', label: `Tasks (${data.tasks?.length || 0})` },
    { key: 'activities', label: `Activities (${data.activities?.length || 0})` },
    { key: 'ai', label: 'AI Insights' },
  ]

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <Link to="/contacts" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft size={14} /> Back to Contacts
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
              {getInitials(data.full_name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.full_name}</h1>
              <p className="text-gray-500 text-sm">{data.job_title}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium capitalize', STATUS_COLORS[data.status])}>
                  {data.status}
                </span>
                {data.company_name && (
                  <Link to={`/companies/${data.company_id}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Building2 size={12} /> {data.company_name}
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit2 size={14} /> Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} className="text-gray-400" />
            <a href={`mailto:${data.email}`} className="hover:text-blue-600 truncate">{data.email || '—'}</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} className="text-gray-400" />
            {data.phone || '—'}
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-gray-400 text-xs">Owner:</span> {data.owner_name || '—'}
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-gray-400 text-xs">Created:</span> {formatDate(data.created_at)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-5 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-blue-500" /> Active Deals</h3>
            {!data.deals?.length ? (
              <p className="text-sm text-gray-400">No deals yet</p>
            ) : (
              <div className="space-y-3">
                {data.deals.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{d.title}</div>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded capitalize', STAGE_COLORS[d.stage])}>{d.stage.replace('_', ' ')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CheckSquare size={15} className="text-green-500" /> Open Tasks</h3>
            {!data.tasks?.length ? (
              <p className="text-sm text-gray-400">No tasks</p>
            ) : (
              <div className="space-y-2">
                {data.tasks.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', t.priority === 'urgent' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : 'bg-gray-300')} />
                    <span className="text-gray-700 flex-1 truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'activities' && (
        <div className="bg-white rounded-xl border border-gray-200">
          {!data.activities?.length ? (
            <div className="p-8 text-center text-gray-400 text-sm">No activities yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.activities.map(a => (
                <div key={a.id} className="flex gap-3 px-6 py-4">
                  <span className="text-xl flex-shrink-0">{ACTIVITY_ICONS[a.activity_type] || '📌'}</span>
                  <div>
                    <p className="text-sm text-gray-800">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'deals' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Deal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.deals?.map(d => (
                <tr key={d.id} className="border-b border-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{d.title}</td>
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs capitalize', STAGE_COLORS[d.stage])}>{d.stage.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-2">
          {data.tasks?.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', t.priority === 'urgent' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : t.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-300')} />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{t.title}</div>
                  <div className="text-xs text-gray-400">{t.status.replace('_', ' ')} · {t.priority}</div>
                </div>
              </div>
              {t.due_at && <div className="text-xs text-gray-500">{formatDate(t.due_at)}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Insight panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Bot size={15} className="text-blue-500" /> AI Customer Insight</h3>
              <Button size="sm" variant="secondary" onClick={loadInsight} loading={aiLoading && !aiChat.length}>
                Analyze
              </Button>
            </div>
            {insight ? (
              <div className="space-y-4 text-sm">
                <div><div className="text-xs font-semibold text-gray-500 uppercase mb-1">Summary</div><p className="text-gray-700">{insight.summary as string}</p></div>
                <div><div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div><p className="text-gray-700">{insight.status as string}</p></div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Risks</div>
                  <ul className="space-y-1">{(insight.risks as string[]).map((r, i) => <li key={i} className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">⚠</span>{r}</li>)}</ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommended Actions</div>
                  <ul className="space-y-1">{(insight.recommended_actions as string[]).map((a, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">→</span>{a}</li>)}</ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Click "Analyze" to get AI-powered insights about this contact.</p>
            )}
          </div>

          {/* Chat panel */}
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-80">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><Bot size={15} className="text-purple-500" /> Ask AI about this contact</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiChat.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-4">
                  Ask anything about this contact's history, deals, or next steps.
                </div>
              )}
              {aiChat.map((msg, i) => (
                <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] px-3 py-2 rounded-xl text-sm', msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800')}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && aiChat.length > 0 && <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 size={13} className="animate-spin" /> Thinking...</div>}
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                value={aiMessage}
                onChange={e => setAiMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
                placeholder="What is happening with this customer?"
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="icon" onClick={sendChat} disabled={!aiMessage.trim() || aiLoading}>
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Contact">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" defaultValue={data.first_name} id="first_name" />
            <Input label="Last Name" defaultValue={data.last_name} id="last_name" />
          </div>
          <Input label="Email" type="email" defaultValue={data.email} id="email" />
          <Input label="Phone" defaultValue={data.phone} id="phone" />
          <Input label="Job Title" defaultValue={data.job_title} id="job_title" />
          <Select label="Status" defaultValue={data.status} id="status">
            {['lead', 'prospect', 'customer', 'inactive'].map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowEdit(false)} className="flex-1">Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => {
                const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value
                updateMutation.mutate({
                  first_name: get('first_name'),
                  last_name: get('last_name'),
                  email: get('email'),
                  phone: get('phone'),
                  job_title: get('job_title'),
                  status: get('status'),
                })
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Contact" size="sm">
        <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete <strong>{data.full_name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
