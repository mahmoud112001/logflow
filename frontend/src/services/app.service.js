import api from './api';

// Fetch all applications for the authenticated developer
export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data.data.applications;
};

// Fetch a single application by name
export const getApplication = async (name) => {
  const response = await api.get(`/applications/${name}`);
  return response.data.data.application;
};

// Create a new application
export const createApplication = async (name) => {
  const response = await api.post('/applications', { name });
  return response.data.data.application;
};

// Delete an application (204 — no body returned)
export const deleteApplication = async (name) => {
  await api.delete(`/applications/${name}`);
};

// Fetch paginated/filtered logs for an application
// params: { page, limit, sort, level, search }
export const getLogs = async (name, params = {}) => {
  const response = await api.get(`/applications/${name}/logs`, { params });
  return response.data.data; // { logs, pagination }
};
