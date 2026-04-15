const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private token: string | null = localStorage.getItem('token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }

    return response.json();
  }

  // Auth
  login(credentials: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getMe() {
    return this.request('/me');
  }

  // Admin
  getMembers() {
    return this.request('/admin/members');
  }

  approveMember(id: number) {
    return this.request(`/admin/members/${id}/approve`, {
      method: 'PATCH',
    });
  }

  rejectMember(id: number) {
    return this.request(`/admin/members/${id}/reject`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiClient();
