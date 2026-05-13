const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0] ?? 'Erro ao comunicar com a API.');
  }

  return data;
}

export const tasksApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const query = params.toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },
  create: (task) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  }),
  update: (id, task) => request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(task)
  }),
  remove: (id) => request(`/tasks/${id}`, {
    method: 'DELETE'
  })
};
