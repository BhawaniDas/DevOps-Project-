import api from './api';

const taskService = {
  getStats:   ()          => api.get('/tasks/stats'),
  getAll:     (params)    => api.get(`/tasks?${new URLSearchParams(params)}`),
  getOne:     (id)        => api.get(`/tasks/${id}`),
  create:     (data)      => api.post('/tasks', data),
  update:     (id, data)  => api.put(`/tasks/${id}`, data),
  patch:      (id, data)  => api.patch(`/tasks/${id}`, data),
  remove:     (id)        => api.delete(`/tasks/${id}`),
  bulkDelete: (ids)       => api.delete('/tasks', { ids }),
  seed:       ()          => api.post('/tasks/seed'),
};

export default taskService;
