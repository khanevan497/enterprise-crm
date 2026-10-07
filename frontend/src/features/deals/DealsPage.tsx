import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealsApi } from '@/services/api'
import { formatCurrency, STAGE_COLORS, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Select } from '@/components/ui/input'
import { Plus, DollarSign, GripVertical } from 'lucide-react'
import type { Deal } from '@/types'

const STAGES: Deal['stage'][] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

const STAGE_BG: Record<string, string> = {
  lead: 'bg-gray-50 border-gray-200',
  qualified: 'bg-blue-50 border-blue-200',
  proposal: 'bg-purple-50 border-purple-200',
  negotiation: 'bg-yellow-50 border-yellow-200',
  closed_won: 'bg-green-50 border-green-200',
  closed_lost: 'bg-red-50 border-red-200',
}

function DealCard({ deal, onStageChange }: { deal: Deal; onStageChange: (id: number, stage: string) => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">{deal.title}</div>
          {deal.company_name && <div className="text-xs text-gray-500">{deal.company_name}</div>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
          <DollarSign size={13} className="text-gray-400" />
          {formatCurrency(deal.value)}
        </div>
        <div className="text-xs text-gray-400">{deal.probability}%</div>
      </div>

      {deal.owner_name && (
        <div className="mt-2 text-xs text-gray-400">{deal.owner_name}</div>
      )}

      {/* Quick stage change */}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <select
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none"
          value={deal.stage}
          onChange={e => onStageChange(deal.id, e.target.value)}
          onClick={e => e.stopPropagation()}
        >
          {STAGES.map(s => (
            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function CreateDealForm({ onSave, onClose }: { onSave: (d: Partial<Deal>) => Promise<unknown>; onClose: () => void }) {
  const [form, setForm] = useState({ title: '', value: '', stage: 'lead', probability: '20', currency: 'USD' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({ ...form, value: Number(form.value), probability: Number(form.probability) } as Partial<Deal>)
      onClose()
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Deal Title" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Enterprise Software License" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Value ($)" type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0" />
        <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={e => set('probability', e.target.value)} />
      </div>
      <Select label="Stage" value={form.stage} onChange={e => set('stage', e.target.value)}>
        {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
      </Select>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Create Deal</Button>
      </div>
    </form>
  )
}

export function DealsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list({ per_page: 100 }).then(r => r.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: string }) => dealsApi.update(id, { stage } as Partial<Deal>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<Deal>) => dealsApi.create(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  })

  const deals = data || []
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage)
    return acc
  }, {} as Record<string, Deal[]>)

  const totalPipelineValue = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((sum, d) => sum + Number(d.value), 0)

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">
            {deals.length} deals · Pipeline: <span className="font-semibold text-gray-900">{formatCurrency(totalPipelineValue)}</span>
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Deal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(s => (
            <div key={s} className="w-72 flex-shrink-0 h-96 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
          {STAGES.map(stage => {
            const stageDeals = dealsByStage[stage] || []
            const stageValue = stageDeals.reduce((sum, d) => sum + Number(d.value), 0)
            return (
              <div key={stage} className="w-72 flex-shrink-0 flex flex-col">
                {/* Column header */}
                <div className={cn('rounded-t-xl border px-4 py-3', STAGE_BG[stage])}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{STAGE_LABELS[stage]}</span>
                    <span className="text-xs font-medium bg-white px-1.5 py-0.5 rounded-md text-gray-600 shadow-sm">{stageDeals.length}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{formatCurrency(stageValue)}</div>
                </div>

                {/* Cards */}
                <div className={cn('flex-1 rounded-b-xl border border-t-0 p-2 space-y-2 min-h-[200px]', STAGE_BG[stage])}>
                  {stageDeals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onStageChange={(id, newStage) => updateMutation.mutate({ id, stage: newStage })}
                    />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Deal">
        <CreateDealForm
          onSave={(d) => createMutation.mutateAsync(d)}
          onClose={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  )
}
