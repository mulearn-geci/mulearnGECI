const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || '/api';

// ─────────────────────────────────────────────────────────────
// In-memory response cache with stale-while-revalidate
// ─────────────────────────────────────────────────────────────
interface CacheEntry {
  data: any;
  timestamp: number;
  /** Active fetch promise to deduplicate concurrent requests */
  inflight?: Promise<any>;
}

const cache = new Map<string, CacheEntry>();

/** How long cached data is considered fresh (ms). */
const CACHE_TTL: Record<string, number> = {
  events:      5 * 60_000,   // 5 min
  posts:       5 * 60_000,
  execom:      10 * 60_000,  // 10 min — rarely changes
  alumni:      10 * 60_000,
  leaderboard: 5 * 60_000,
  homepage:    3 * 60_000,   // 3 min — admin may tweak often
  about:       5 * 60_000,   // 5 min
  default:     5 * 60_000,
};

function ttlFor(url: string): number {
  for (const key of Object.keys(CACHE_TTL)) {
    if (key !== 'default' && url.includes(key)) return CACHE_TTL[key];
  }
  return CACHE_TTL.default;
}

/**
 * Cached GET request. Returns cached data immediately when available,
 * and silently revalidates in the background if stale.
 * Deduplicates concurrent in-flight requests to the same URL.
 */
async function cachedGet(url: string, headers?: Record<string, string>): Promise<any> {
  const entry = cache.get(url);
  const now = Date.now();

  // If we have a fresh cache hit, return it immediately
  if (entry && (now - entry.timestamp) < ttlFor(url)) {
    return entry.data;
  }

  // If a request is already in-flight for this URL, wait for it
  if (entry?.inflight) {
    return entry.inflight;
  }

  // Create the fetch promise
  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${url}`);
      }
      const data = await response.json();
      cache.set(url, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // On error, if we have stale data, return it instead of crashing
      const stale = cache.get(url);
      if (stale && stale.data) {
        // Keep old data but clear inflight
        cache.set(url, { data: stale.data, timestamp: stale.timestamp });
        return stale.data;
      }
      // Clean up inflight on failure with no stale data
      cache.delete(url);
      throw error;
    }
  })();

  // Store the in-flight promise so concurrent callers share it
  cache.set(url, { data: entry?.data, timestamp: entry?.timestamp ?? 0, inflight: fetchPromise });

  // If we have stale data, return it immediately AND trigger background refresh
  if (entry?.data) {
    // Fire-and-forget: the fetchPromise will update the cache when done
    fetchPromise.catch(() => {}); // prevent unhandled rejection
    return entry.data;
  }

  // No cached data at all — must wait for the fetch
  return fetchPromise;
}

/** Invalidate all cache entries whose key contains the given substring. */
function invalidateCache(pattern: string) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Posts API (Gallery)
// ─────────────────────────────────────────────────────────────
export const postsAPI = {
  getAll: async (status?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/posts?${params}`;
    return cachedGet(url);
  },

  getById: async (id: string) => {
    const url = `${API_BASE_URL}/posts/${id}`;
    return cachedGet(url);
  },

  create: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: isFormData ? createFileUploadHeaders() : createAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || 'Failed to create post');
    }
    
    invalidateCache('/posts');
    return result || { success: true };
  },

  update: async (id: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: isFormData ? createFileUploadHeaders() : createAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || 'Failed to update post');
    }
    
    invalidateCache('/posts');
    return result || { success: true };
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
    
    invalidateCache('/posts');
    return response.json();
  }
};

// ─────────────────────────────────────────────────────────────
// Events API
// ─────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: async (status?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/events?${params}`;
    return cachedGet(url);
  },

  getById: async (id: string) => {
    const url = `${API_BASE_URL}/events/${id}`;
    return cachedGet(url);
  },

  create: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: isFormData ? createFileUploadHeaders() : createAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || result?.errors?.[0]?.msg || 'Failed to create event');
    }
    
    invalidateCache('/events');
    return result || { success: true };
  },

  update: async (id: string, data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: isFormData ? createFileUploadHeaders() : createAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });
    
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.message || result?.errors?.[0]?.msg || 'Failed to update event');
    }
    
    invalidateCache('/events');
    return result || { success: true };
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    
    invalidateCache('/events');
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
    
    invalidateCache('/events');
    return response.json();
  }
};

// ─────────────────────────────────────────────────────────────
// Dashboard API (never cached — admin needs live stats)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Contact API (write-only, no caching needed)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Execom API
// ─────────────────────────────────────────────────────────────
export const execomAPI = {
  getAll: async () => {
    const url = `${API_BASE_URL}/execom`;
    return cachedGet(url);
  },

  getById: async (id: string) => {
    const url = `${API_BASE_URL}/execom/${id}`;
    return cachedGet(url);
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/execom`, {
      method: 'POST',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create Execom member');
    }
    invalidateCache('/execom');
    return response.json();
  },

  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/execom/${id}`, {
      method: 'PUT',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update Execom member');
    }
    invalidateCache('/execom');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/execom/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete Execom member');
    }
    invalidateCache('/execom');
    return response.json();
  },

  reorder: async (orders: { id: string; order: number }[]) => {
    const response = await fetch(`${API_BASE_URL}/execom/reorder`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ orders }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to reorder Execom members');
    }
    invalidateCache('/execom');
    return response.json();
  }
};

// ─────────────────────────────────────────────────────────────
// Alumni API
// ─────────────────────────────────────────────────────────────
export const alumniAPI = {
  getAll: async (year?: string) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    
    const url = `${API_BASE_URL}/alumni?${params}`;
    return cachedGet(url);
  },

  getById: async (id: string) => {
    const url = `${API_BASE_URL}/alumni/${id}`;
    return cachedGet(url);
  },

  create: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/alumni`, {
      method: 'POST',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create alumni member');
    }
    invalidateCache('/alumni');
    return response.json();
  },

  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/alumni/${id}`, {
      method: 'PUT',
      headers: createFileUploadHeaders(),
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update alumni member');
    }
    invalidateCache('/alumni');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/alumni/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete alumni member');
    }
    invalidateCache('/alumni');
    return response.json();
  },

  reorder: async (orders: { id: string; order: number }[]) => {
    const response = await fetch(`${API_BASE_URL}/alumni/reorder`, {
      method: 'PUT',
      headers: createAuthHeaders(),
      body: JSON.stringify({ orders }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to reorder alumni members');
    }
    invalidateCache('/alumni');
    return response.json();
  }
};

// ─────────────────────────────────────────────────────────────
// Leaderboard API
// ─────────────────────────────────────────────────────────────
export const leaderboardAPI = {
  getAll: async () => {
    const url = `${API_BASE_URL}/leaderboard`;
    return cachedGet(url);
  },

  sync: async (students: any[]) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/sync`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({ students }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to sync leaderboard data');
    }
    invalidateCache('/leaderboard');
    return response.json();
  },

  clear: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/clear`, {
      method: 'DELETE',
      headers: createAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to clear leaderboard data');
    }
    invalidateCache('/leaderboard');
    return response.json();
  }
};

// ─────────────────────────────────────────────────────────────
// Homepage Customizer API
// ─────────────────────────────────────────────────────────────
export const homepageAPI = {
  getConfig: async () => {
    // Homepage config uses its own cache key (no cache-busting timestamp)
    const url = `${API_BASE_URL}/homepage-config`;
    return cachedGet(url);
  },

  saveConfig: async (config: { cards?: any[]; igs?: any[]; execoms?: any[]; about?: any }) => {
    const response = await fetch(`${API_BASE_URL}/homepage-config`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save homepage configuration');
    }
    invalidateCache('/homepage-config');
    return response.json();
  }
};

// ─────────────────────────────────────────────────────────────
// About Page Customizer API
// ─────────────────────────────────────────────────────────────
export const aboutAPI = {
  getConfig: async () => {
    const url = `${API_BASE_URL}/about-config`;
    return cachedGet(url);
  },

  saveConfig: async (config: {
    hero?: { badge?: string; title?: string; description?: string };
    mission?: { title?: string; description?: string };
    vision?: { title?: string; description?: string };
    image?: string;
    imageAlt?: string;
    values?: Array<{ id?: string; icon?: string; title: string; description: string }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/about-config`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save about configuration');
    }
    invalidateCache('/about-config');
    return response.json();
  }
};