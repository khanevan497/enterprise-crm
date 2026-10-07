import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/services/api'
import { cn, PRIORITY_COLORS, TASK_STATUS_COLORS, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Select, Textarea } from '@/components/ui/input'
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react'
import type { Task } from '@/types'

const STATUSES = ['', 'todo', 'in_progress', 'completed', 'cancelled']
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent']

function CreateTaskForm({ onSave, onClose }: { onSave: (d: Partial<Task>) => Promise<unknown>; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Task> & { title: string; description: string; due_at: string }>({ title: '', description: '', status: 'todo', priority: 'medium', due_at: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }) as typeof form)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form); onClose() } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Task Title" value={form.title} onChange={e => set('title', e.target.value)} required />
      <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" value={form.priority} onChange={e => set('priority', e.target.value)}>
          {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </Select>
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          {['todo', 'in_progress', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </Select>
      </div>
      <Input label="Due Date" type="datetime-local" value={form.due_at} onChange={e => set('due_at', e.target.value)} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Create Task</Button>
      </div>
    </form>
  )
}

export function TasksPage() {
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', status, priority],
    queryFn: () => tasksApi.list({ status, priority }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (d: Partial<Task>) => tasksApi.create(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => tasksApi.update(id, { status } as Partial<Task>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const tasks = data?.data || []

  const grouped = tasks.reduce((acc, t) => {
    const key = t.status
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {} as Record<string, Task[]>)

  const STATUS_GROUPS = [
    { key: 'todo', label: 'To Do', color: 'text-gray-600 bg-gray-100' },
    { key: 'in_progress', label: 'In Progress', color: 'text-blue-700 bg-blue-100' },
    { key: 'completed', label: 'Completed', color: 'text-green-700 bg-green-100' },
    { key: 'cancelled', label: 'Cancelled', color: 'text-red-700 bg-red-100' },
  ]

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.meta?.total || 0} tasks total</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>)}
        </select>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All priorities'}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {STATUS_GROUPS.map(({ key, label, color }) => {
            const groupTasks = grouped[key] || []
            if (!groupTasks.length && status) return null
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', color)}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">{groupTasks.length}</span>
                </div>
                {groupTasks.length === 0 ? (
                  <div className="text-sm text-gray-400 px-2">No {label.toLowerCase()} tasks</div>
                ) : (
                  <div className="space-y-2">
                    {groupTasks.map(task => (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
                      >
                        <button
                          onClick={() => updateMutation.mutate({
                            id: task.id,
                            status: task.status === 'completed' ? 'todo' : 'completed'
                          })}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {task.status === 'completed'
                            ? <CheckCircle2 size={18} className="text-green-500" />
                            : <Circle size={18} className="text-gray-300 hover:text-blue-500 transition-colors" />
                          }
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className={cn('text-sm font-medium', task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900')}>
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium capitalize', PRIORITY_COLORS[task.priority])}>
                              {task.priority}
                            </span>
                            {task.assignee_name && (
                              <span className="text-xs text-gray-500">{task.assignee_name}</span>
                            )}
                            {task.contact_name && (
                              <span className="text-xs text-gray-500">→ {task.contact_name}</span>
                            )}
                          </div>
                        </div>

                        {task.due_at && (
                          <div className={cn(
                            'flex items-center gap-1 text-xs flex-shrink-0',
                            new Date(task.due_at) < new Date() && task.status !== 'completed'
                              ? 'text-red-500'
                              : 'text-gray-400'
                          )}>
                            <Clock size={11} />
                            {formatDate(task.due_at)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <CreateTaskForm
          onSave={(d) => createMutation.mutateAsync(d)}
          onClose={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  )
}
