// API Service - Cliente HTTP para comunicação com o backend

const isDev = import.meta.env.DEV;
const PROD_API_URL = import.meta.env.VITE_API_URL_PROD || 'https://bw1-backend-g2vf.onrender.com';
const API_URL = isDev 
  ? (import.meta.env.VITE_API_URL || PROD_API_URL)
  : PROD_API_URL;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos
const STALE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos para fallback rápido
const CACHE_KEY_PREFIX = 'bw1_cache_v3_';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('bw1_token');
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.cacheNamespace = `${CACHE_KEY_PREFIX}${encodeURIComponent(this.baseURL)}_`;
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

  getCacheKey(endpoint) {
    return `${this.cacheNamespace}${endpoint}`;
  }

  getMemoryCache(endpoint) {
    const cacheKey = this.getCacheKey(endpoint);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    this.cache.delete(cacheKey);
    return null;
  }

  getStorageCache(endpoint, maxAge = CACHE_DURATION) {
    const cacheKey = this.getCacheKey(endpoint);

    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed?.timestamp || !parsed?.data) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      if (Date.now() - parsed.timestamp < maxAge) {
        return parsed.data;
      }

      localStorage.removeItem(cacheKey);
      return null;
    } catch {
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  getFromCache(endpoint) {
    const memoryCached = this.getMemoryCache(endpoint);
    if (memoryCached) {
      console.log('📦 Cache hit:', endpoint);
      return memoryCached;
    }

    const storageCached = this.getStorageCache(endpoint);
    if (storageCached) {
      this.setCache(endpoint, storageCached);
      console.log('💾 Storage cache hit:', endpoint);
      return storageCached;
    }

    return null;
  }

  getStaleFromCache(endpoint) {
    const storageCached = this.getStorageCache(endpoint, STALE_CACHE_DURATION);
    if (!storageCached) return null;

    this.setCache(endpoint, storageCached);
    return storageCached;
  }

  setCache(endpoint, data) {
    const cacheKey = this.getCacheKey(endpoint);
    const value = {
      data,
      timestamp: Date.now(),
    };

    this.cache.set(cacheKey, value);

    try {
      localStorage.setItem(cacheKey, JSON.stringify(value));
    } catch {
      // Ignorar quota errors
    }
  }

  peek(endpoint) {
    return this.getFromCache(endpoint) || this.getStaleFromCache(endpoint);
  }

  clearCache() {
    this.cache.clear();

    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.cacheNamespace))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // noop
    }

    console.log('🗑️ Cache da API limpo');
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseURL}/api/listings/upload-image`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao fazer upload');
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async request(endpoint, options = {}) {
    const method = options.method || 'GET';
    const isGet = method === 'GET';
    const timeout = options.timeout || 30000; // 30 segundos padrão

    // Tentar buscar do cache apenas para GET requests
    if (isGet && !options.forceRefresh) {
      const cachedData = this.getFromCache(endpoint);
      if (cachedData) {
        return cachedData;
      }

      if (this.pendingRequests.has(endpoint)) {
        return this.pendingRequests.get(endpoint);
      }
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const requestPromise = (async () => {
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro na requisição');
        }

        // Salvar no cache apenas para GET requests
        if (isGet) {
          this.setCache(endpoint, data);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Tempo limite excedido. Tente novamente.');
        }
        throw error;
      }
    })();

    if (isGet) {
      this.pendingRequests.set(endpoint, requestPromise);
    }

    try {
      return await requestPromise;
    } catch (error) {
      if (isGet) {
        const staleData = this.getStaleFromCache(endpoint);
        if (staleData) {
          console.warn('⚠️ Usando cache stale para:', endpoint);
          return staleData;
        }
      }

      console.error('API Error:', error);
      throw error;
    } finally {
      if (isGet) {
        this.pendingRequests.delete(endpoint);
      }
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
  async getListings(params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/listings?${queryString}` : '/api/listings';
    return this.request(endpoint, options);
  }

  getListingsFromCache(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/listings?${queryString}` : '/api/listings';
    return this.peek(endpoint);
  }

  async preloadListings() {
    await Promise.allSettled([
      this.request('/api/listings', { forceRefresh: true }),
      this.request('/api/listings?category=vehicle', { forceRefresh: true }),
      this.request('/api/listings?category=property', { forceRefresh: true }),
    ]);
  }

  async getListing(id) {
    return this.request(`/api/listings/${id}`);
  }

  async createListing(listingData) {
    const result = await this.request('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });

    this.clearCache();
    return result;
  }

  async updateListing(id, listingData) {
    const result = await this.request(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });

    this.clearCache();
    return result;
  }

  async deleteListing(id) {
    const result = await this.request(`/api/listings/${id}`, {
      method: 'DELETE',
    });

    this.clearCache();
    return result;
  }

  async getMyListings() {
    return this.request('/api/listings/user/my-listings');
  }

  // Chat
  async getConversations() {
    return this.request('/api/chat/conversations');
  }

  async getConversation(conversationId) {
    return this.request(`/api/chat/conversations/${conversationId}`);
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
      timeout: 15000, // 15 segundos para envio de mensagem
    });
  }

  // Users
  async getUser(id) {
    return this.request(`/api/users/${id}`);
  }

  async getProfile(userId) {
    return this.request(`/api/profile/${userId}`);
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
