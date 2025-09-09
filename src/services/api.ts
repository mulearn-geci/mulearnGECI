const API_BASE_URL =  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Create headers with auth token
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Create headers for file upload with auth token
const createFileUploadHeaders = () => {
  const token = getAuthToken();
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  }
};

// Posts API
export const postsAPI = {
  getAll: async (status?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/posts?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }
    return response.json();
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create post');
    }
    
    return response.json();
  },

  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update post');
    }
    
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    
    return response.json();
  }
};

// Events API
export const eventsAPI = {
  getAll: async (status?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/events?${params}`);
    if (!response.ok) {
      console.log("API Base URL:", API_BASE_URL);
      throw new Error('Failed to fetch events');
    }
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return response.json();
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    
    return response.json();
  },

  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    
    return response.json();
  },

  register: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to register for event');
    }
    
    return response.json();
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    
    return response.json();
  }
};

// Contact API
export const contactAPI = {
  submit: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit contact form');
    }
    
    return response.json();
  }
};