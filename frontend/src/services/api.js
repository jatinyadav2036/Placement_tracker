import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placeiq_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('placeiq_token')
      localStorage.removeItem('placeiq_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ AUTH ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  firebaseLogin: (idToken) => api.post('/auth/firebase', { id_token: idToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
}

// ============ PLACEMENTS ============
export const placementAPI = {
  create: (data) => api.post('/placements/', data),
  getAll: (params) => api.get('/placements/', { params }),
  getById: (id) => api.get(`/placements/${id}`),
  update: (id, data) => api.put(`/placements/${id}`, data),
  delete: (id) => api.delete(`/placements/${id}`),
  getStats: () => api.get('/placements/stats'),
  exportExcel: () => api.get('/placements/export/excel', { responseType: 'blob' }),
}

// ============ RESUME ============
export const resumeAPI = {
  analyze: (formData) => api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }),
  extractText: (formData) => api.post('/resume/extract-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ============ JD ANALYZER ============
export const jdAPI = {
  analyze: (data) => api.post('/jd/analyze', data),
  getHistory: () => api.get('/jd/history'),
}

// ============ AI ============
export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
  chat: (messages) => api.post('/ai/chat', { messages }),
  getSkillRecommendations: () => api.get('/ai/skill-recommendations'),
}

export default api
