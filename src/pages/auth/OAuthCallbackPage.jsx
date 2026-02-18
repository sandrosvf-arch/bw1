import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader } from 'lucide-react';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        console.log('OAuth Callback - Token:', token ? 'Presente' : 'Ausente', 'Error:', error);

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=' + error);
          return;
        }

        if (token) {
          // Verificar se já processou este token (evita execução duplicada)
          const processedKey = `bw1_processed_${token.substring(0, 20)}`;
          if (localStorage.getItem(processedKey)) {
            console.log('Token já processado, ignorando execução duplicada');
            return;
          }
          
          // Marcar como processado IMEDIATAMENTE
          localStorage.setItem(processedKey, 'true');
          
          // Pegar URL de redirecionamento ANTES de qualquer operação assíncrona
          const redirectTo = localStorage.getItem('bw1_oauth_redirect') || '/';
          console.log('OAuth callback - Vai redirecionar para:', redirectTo);
          
          // Limpar chaves de redirecionamento
          localStorage.removeItem('bw1_oauth_redirect');
          localStorage.removeItem('bw1_redirect_after_login');
          
          // Salvar token no localStorage
          localStorage.setItem('bw1_token', token);
          console.log('Token salvo no localStorage');
          
          // Verificar autenticação
          try {
            await checkAuth();
            console.log('CheckAuth concluído');
          } catch (authError) {
            console.error('Erro no checkAuth:', authError);
            // Mesmo com erro, redirecionar (o token está salvo)
          }
          
          // Se for um redirect com ação de abrir chat, processar aqui mesmo sem carregar a página
          if (redirectTo.includes('openChat=true')) {
            console.log('Detectado openChat=true, processando direto sem carregar página...');
            
            // Extrair ID do anúncio da URL
            const match = redirectTo.match(/\/anuncio\/([^?]+)/);
            if (match && match[1]) {
              const listingId = match[1];
              
              try {
                const apiUrl = import.meta.env.DEV 
                  ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
                  : (import.meta.env.VITE_API_URL_PROD || 'https://bw1-backend-g2vf.onrender.com');
                
                // Buscar dados do listing
                const listingResponse = await fetch(`${apiUrl}/api/listings/${listingId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (listingResponse.ok) {
                  const listingData = await listingResponse.json();
                  const listing = listingData.listing;
                  
                  if (listing && listing.user_id) {
                    // Criar/buscar conversa
                    const chatResponse = await fetch(`${apiUrl}/api/chat/conversations`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        listingId: listing.id,
                        receiverId: listing.user_id
                      })
                    });
                    
                    if (chatResponse.ok) {
                      const chatData = await chatResponse.json();
                      if (chatData.conversation?.id) {
                        console.log('Redirecionando direto para chat:', chatData.conversation.id);
                        navigate(`/chat/${chatData.conversation.id}`, { replace: true });
                        setTimeout(() => localStorage.removeItem(processedKey), 5000);
                        return;
                      }
                    }
                  }
                }
                
                // Se falhou, vai pro chat geral
                console.log('Falha ao processar chat, indo para /chat');
                navigate('/chat', { replace: true });
                setTimeout(() => localStorage.removeItem(processedKey), 5000);
                return;
              } catch (error) {
                console.error('Erro ao processar openChat:', error);
                navigate('/chat', { replace: true });
                setTimeout(() => localStorage.removeItem(processedKey), 5000);
                return;
              }
            }
          }
          
          // Redirecionar normalmente
          console.log('Redirecionando para:', redirectTo);
          navigate(redirectTo, { replace: true });
          
          // Limpar flag de processamento após 5 segundos (para não acumular lixo)
          setTimeout(() => {
            localStorage.removeItem(processedKey);
          }, 5000);
        } else {
          console.error('Token não encontrado na URL');
          navigate('/login?error=no_token');
        }
      } catch (error) {
        console.error('Erro no handleCallback:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 font-semibold">Autenticando...</p>
      </div>
    </div>
  );
}
