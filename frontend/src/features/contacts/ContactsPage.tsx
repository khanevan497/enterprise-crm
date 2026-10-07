import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { contactsApi } from '@/services/api'
import { cn, STATUS_COLORS, formatDate, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Select } from '@/components/ui/input'
import { Search, Plus, ChevronRight, Filter, Mail, Phone, Building2 } from 'lucide-react'
import type { Contact } from '@/types'

const statuses = ['', 'lead', 'prospect', 'customer', 'inactive']

function ContactForm({ initial, onSave, onClose }: {
  initial?: Partial<Contact>
  onSave: (data: Partial<Contact>) => Promise<unknown>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    first_name: initial?.first_name || '',
    last_name: initial?.last_name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    job_title: initial?.job_title || '',
    status: initial?.status || 'lead',
  })
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form); onClose() } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
        <Input label="Last Name" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
      </div>
      <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
      <Input label="Job Title" value={form.job_title} onChange={e => set('job_title', e.target.value)} />
      <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
        {['lead', 'prospect', 'customer', 'inactive'].map(s => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </Select>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">{initial ? 'Save Changes' : 'Create Contact'}</Button>
      </div>
    </form>
  )
}

export function ContactsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search, status],
    queryFn: () => contactsApi.list({ q: search, status }).then(r => r.data),
    staleTime: 30000,
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<Contact>) => contactsApi.create(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })

  const contacts = data?.data || []
  const total = data?.meta?.total || 0

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">{total} contacts total</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Filter size={15} className="text-gray-400 flex-shrink-0" />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All statuses'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact Info</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Owner</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No contacts found</td>
              </tr>
            ) : contacts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                      {getInitials(c.full_name)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{c.full_name}</div>
                      <div className="text-xs text-gray-500">{c.job_title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Building2 size={13} className="text-gray-400" />
                    {c.company_name || '—'}
                  </div>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="space-y-1">
                    {c.email && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={11} />{c.email}</div>}
                    {c.phone && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={11} />{c.phone}</div>}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={cn('inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize', STATUS_COLORS[c.status])}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className="text-sm text-gray-600">{c.owner_name || '—'}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/contacts/${c.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    View <ChevronRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Contact">
        <ContactForm
          onSave={(d) => createMutation.mutateAsync(d)}
          onClose={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  )
}
