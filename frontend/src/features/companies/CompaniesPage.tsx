import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/services/api'
import { formatCurrency, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Textarea } from '@/components/ui/input'
import { Search, Plus, ChevronRight, Users, TrendingUp, Globe, Phone } from 'lucide-react'
import type { Company } from '@/types'

function CompanyForm({ initial, onSave, onClose }: {
  initial?: Partial<Company>
  onSave: (data: Partial<Company>) => Promise<unknown>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    industry: initial?.industry || '',
    website: initial?.website || '',
    phone: initial?.phone || '',
    description: initial?.description || '',
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
      <Input label="Company Name" value={form.name} onChange={e => set('name', e.target.value)} required />
      <Input label="Industry" value={form.industry} onChange={e => set('industry', e.target.value)} />
      <Input label="Website" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" />
      <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
      <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">{initial ? 'Save' : 'Create Company'}</Button>
      </div>
    </form>
  )
}

export function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search],
    queryFn: () => companiesApi.list({ q: search }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<Company>) => companiesApi.create(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  })

  const companies = data?.data || []

  const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)))

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.meta?.total || 0} companies</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Company
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Companies grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(c => (
            <Link
              key={c.id}
              to={`/companies/${c.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {getInitials(c.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.industry}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
              </div>

              {c.description && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{c.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm">
                  <Users size={13} className="text-gray-400" />
                  <span className="text-gray-600">{c.contacts_count} contacts</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <TrendingUp size={13} className="text-gray-400" />
                  <span className="text-gray-600">{c.deals_count} deals</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-400">Pipeline: </span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.total_pipeline_value)}</span>
                </div>
              </div>

              {(c.website || c.phone) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                  {c.website && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                      <Globe size={10} /> {c.website.replace('https://', '').replace('http://', '')}
                    </span>
                  )}
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Phone size={10} /> {c.phone}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Company">
        <CompanyForm
          onSave={(d) => createMutation.mutateAsync(d)}
          onClose={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  )
}
