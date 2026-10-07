export interface User {
  id: number
  name: string
  email: string
  role: string
  organization_id: number
  organization_name: string
  created_at: string
}

export interface Contact {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  job_title: string
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  company_id: number | null
  company_name: string | null
  owner_id: number | null
  owner_name: string | null
  created_at: string
  updated_at: string
  deals?: Deal[]
  tasks?: Task[]
  activities?: Activity[]
}

export interface Company {
  id: number
  name: string
  industry: string
  website: string
  phone: string
  description: string
  contacts_count: number
  deals_count: number
  total_pipeline_value: number
  created_at: string
  updated_at: string
  contacts?: Contact[]
  deals?: Deal[]
  activities?: Activity[]
}

export interface Deal {
  id: number
  title: string
  value: number
  currency: string
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expected_close_date: string | null
  company_id: number | null
  company_name: string | null
  contact_id: number | null
  contact_name: string | null
  owner_id: number | null
  owner_name: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_at: string | null
  assigned_to: number | null
  assignee_name: string | null
  contact_id: number | null
  contact_name: string | null
  deal_id: number | null
  deal_title: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: number
  activity_type: string
  description: string
  user_id: number | null
  user_name: string | null
  contact_id: number | null
  contact_name: string | null
  company_id: number | null
  company_name: string | null
  deal_id: number | null
  deal_title: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditLog {
  id: number
  action: string
  resource_type: string
  resource_id: number
  user_id: number | null
  user_name: string | null
  metadata: Record<string, unknown>
  ip_address: string
  created_at: string
}

export interface DashboardData {
  kpis: {
    total_contacts: number
    active_deals: number
    pipeline_value: number
    won_revenue: number
  }
  deals_by_stage: Array<{ stage: string; count: number; total_value: number }>
  monthly_revenue: Array<{ month: string; value: number }>
  new_contacts_over_time: Array<{ month: string; count: number }>
  recent_activities: Array<{ id: number; type: string; description: string; user_name: string; created_at: string }>
}

export interface ApiResponse<T> {
  data: T
  error: string | null
  meta: {
    total?: number
    page?: number
  }
}
