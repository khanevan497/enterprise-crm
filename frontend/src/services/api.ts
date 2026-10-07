import axios from 'axios'
import type { ApiResponse, Contact, Company, Deal, Task, Activity, AuditLog, DashboardData, User } from '@/types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/me'),
}

export const contactsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Contact[]>>('/contacts', { params }),
  get: (id: number) =>
    api.get<ApiResponse<Contact>>(`/contacts/${id}`),
  create: (data: Partial<Contact>) =>
    api.post<ApiResponse<Contact>>('/contacts', { contact: data }),
  update: (id: number, data: Partial<Contact>) =>
    api.patch<ApiResponse<Contact>>(`/contacts/${id}`, { contact: data }),
  delete: (id: number) =>
    api.delete(`/contacts/${id}`),
}

export const companiesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Company[]>>('/companies', { params }),
  get: (id: number) =>
    api.get<ApiResponse<Company>>(`/companies/${id}`),
  create: (data: Partial<Company>) =>
    api.post<ApiResponse<Company>>('/companies', { company: data }),
  update: (id: number, data: Partial<Company>) =>
    api.patch<ApiResponse<Company>>(`/companies/${id}`, { company: data }),
  delete: (id: number) =>
    api.delete(`/companies/${id}`),
}

export const dealsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Deal[]>>('/deals', { params }),
  get: (id: number) =>
    api.get<ApiResponse<Deal>>(`/deals/${id}`),
  create: (data: Partial<Deal>) =>
    api.post<ApiResponse<Deal>>('/deals', { deal: data }),
  update: (id: number, data: Partial<Deal>) =>
    api.patch<ApiResponse<Deal>>(`/deals/${id}`, { deal: data }),
  delete: (id: number) =>
    api.delete(`/deals/${id}`),
}

export const tasksApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Task[]>>('/tasks', { params }),
  create: (data: Partial<Task>) =>
    api.post<ApiResponse<Task>>('/tasks', { task: data }),
  update: (id: number, data: Partial<Task>) =>
    api.patch<ApiResponse<Task>>(`/tasks/${id}`, { task: data }),
  delete: (id: number) =>
    api.delete(`/tasks/${id}`),
}

export const activitiesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Activity[]>>('/activities', { params }),
  create: (data: Partial<Activity>) =>
    api.post<ApiResponse<Activity>>('/activities', { activity: data }),
}

export const auditLogsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<AuditLog[]>>('/audit_logs', { params }),
}

export const dashboardApi = {
  get: () => api.get<ApiResponse<DashboardData>>('/dashboard'),
}

export const searchApi = {
  search: (q: string) => api.get('/search', { params: { q } }),
}

export const aiApi = {
  customerInsight: (params: { contact_id?: number; company_id?: number }) =>
    api.post('/ai/customer-insight', params),
  chat: (message: string, params: { contact_id?: number; company_id?: number }) =>
    api.post('/ai/chat', { message, ...params }),
}
