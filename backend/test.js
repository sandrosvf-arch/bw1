// Script de teste simples do backend
const testBackend = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('✅ Backend funcionando!');
    console.log('Resposta:', data);
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
  }
};

testBackend();
