const API = '/api';

async function request(url, options = {}) {
    const config = {
        credentials: 'include',
        headers: {},
        ...options
    };

    if (config.body && !(config.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(config.body);
    }

    const res = await fetch(`${API}${url}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

export const api = {
    // Public
    getHome: () => request('/home'),
    getClub: (slug) => request(`/clubs/${slug}`),

    // Auth
    login: (username, password) => request('/admin/login', { method: 'POST', body: { username, password } }),
    logout: () => request('/admin/logout', { method: 'POST' }),
    getMe: () => request('/admin/me'),

    // Dashboard
    getDashboard: () => request('/admin/dashboard'),

    // Settings
    getSettings: () => request('/admin/settings'),
    updateSettings: (data) => request('/admin/settings', { method: 'POST', body: data }),

    // Faculty
    getFaculty: () => request('/admin/faculty'),
    addFaculty: (formData) => request('/admin/faculty', { method: 'POST', body: formData, headers: {} }),
    updateFaculty: (id, formData) => request(`/admin/faculty/${id}`, { method: 'PUT', body: formData, headers: {} }),
    deleteFaculty: (id) => request(`/admin/faculty/${id}`, { method: 'DELETE' }),

    // Council
    getCouncil: () => request('/admin/council'),
    addCouncil: (formData) => request('/admin/council', { method: 'POST', body: formData, headers: {} }),
    updateCouncil: (id, formData) => request(`/admin/council/${id}`, { method: 'PUT', body: formData, headers: {} }),
    deleteCouncil: (id) => request(`/admin/council/${id}`, { method: 'DELETE' }),

    // Clubs
    getClubs: () => request('/admin/clubs'),
    addClub: (formData) => request('/admin/clubs', { method: 'POST', body: formData, headers: {} }),
    updateClub: (id, formData) => request(`/admin/clubs/${id}`, { method: 'PUT', body: formData, headers: {} }),
    deleteClub: (id) => request(`/admin/clubs/${id}`, { method: 'DELETE' }),

    // Members
    getMembers: (clubId) => request(`/admin/clubs/${clubId}/members`),
    addMember: (clubId, formData) => request(`/admin/clubs/${clubId}/members`, { method: 'POST', body: formData, headers: {} }),
    updateMember: (id, formData) => request(`/admin/members/${id}`, { method: 'PUT', body: formData, headers: {} }),
    deleteMember: (id) => request(`/admin/members/${id}`, { method: 'DELETE' }),

    // Advisors
    addAdvisor: (clubId, formData) => request(`/admin/clubs/${clubId}/advisors`, { method: 'POST', body: formData, headers: {} }),
    deleteAdvisor: (id) => request(`/admin/advisors/${id}`, { method: 'DELETE' }),

    // Remove photo
    removePhoto: (table, id) => request(`/admin/remove-photo/${table}/${id}`, { method: 'DELETE' })
};
