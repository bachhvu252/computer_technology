const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...options.headers },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
};

export const authAPI = {
  register: async (name, email, password, role) => {
    const data = await apiCall('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  login: async (email, password) => {
    const data = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  getMe: () => apiCall('/auth/me'),
  logout: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token')
};

export const documentsAPI = {
  getAll: () => apiCall('/documents'),
  getOne: (id) => apiCall(`/documents/${id}`),
  create: (title, content) => apiCall('/documents', { method: 'POST', body: JSON.stringify({ title, content }) }),
  update: (id, data) => apiCall(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/documents/${id}`, { method: 'DELETE' }),
  restore: (docId, revId) => apiCall(`/documents/${docId}/restore/${revId}`, { method: 'POST' })
};
