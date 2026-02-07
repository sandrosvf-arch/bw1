// Keep Alive Service - Mantém o backend do Render ativo

const isDev = import.meta.env.DEV;
const API_URL = isDev 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
  : (import.meta.env.VITE_API_URL_PROD || 'https://bw1-backend-g2vf.onrender.com');

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutos em milissegundos

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  async ping() {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Keep-alive ping successful:', data.timestamp);
      }
    } catch (error) {
      console.warn('⚠️ Keep-alive ping failed:', error.message);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Keep-alive service already running');
      return;
    }

    console.log('🔄 Starting keep-alive service...');
    
    // Fazer o primeiro ping imediatamente
    this.ping();
    
    // Configurar pings periódicos
    this.intervalId = setInterval(() => {
      this.ping();
    }, PING_INTERVAL);
    
    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('⏹️ Keep-alive service stopped');
    }
  }
}

// Exportar instância única
const keepAliveService = new KeepAliveService();
export default keepAliveService;
