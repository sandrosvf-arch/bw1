// API Service - Cliente HTTP para comunicação com o backend

const isDev = import.meta.env.DEV;
const API_URL = isDev 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
  : (import.meta.env.VITE_API_URL_PROD || 'https://bw1-backend-g2vf.onrender.com');

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('bw1_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bw1_token', token);
    } else {
      localStorage.removeItem('bw1_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Listings
  async getListings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/listings?${queryString}` : '/api/listings';
    return this.request(endpoint);
  }

  async getListing(id) {
    return this.request(`/api/listings/${id}`);
  }

  async createListing(listingData) {
    return this.request('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id, listingData) {
    return this.request(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id) {
    return this.request(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyListings() {
    return this.request('/api/listings/user/my-listings');
  }

  // Chat
  async getConversations() {
    return this.request('/api/chat/conversations');
  }

  async getMessages(conversationId) {
    return this.request(`/api/chat/conversations/${conversationId}/messages`);
  }

  async createConversation(data) {
    return this.request('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMessage(data) {
    return this.request('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUser(id) {
    return this.request(`/api/users/${id}`);
  }

  async updateProfile(data) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Favorites
  async getFavorites() {
    return this.request('/api/users/favorites');
  }

  async addFavorite(listingId) {
    return this.request(`/api/users/favorites/${listingId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(listingId) {
    return this.request(`/api/users/favorites/${listingId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
