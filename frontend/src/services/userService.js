import api from './api';

const userService = {
  getAll:       (params) => api.get(`/users?${new URLSearchParams(params)}`),
  updateRole:   (id, role)     => api.patch(`/users/${id}/role`,   { role }),
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
  remove:       (id)           => api.delete(`/users/${id}`),
};

export default userService;
