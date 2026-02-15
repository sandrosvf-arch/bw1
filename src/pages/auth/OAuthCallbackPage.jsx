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
          // Salvar token no localStorage
          localStorage.setItem('bw1_token', token);
          console.log('Token salvo no localStorage');
          
          // Verificar autenticação
          try {
            await checkAuth();
            console.log('CheckAuth concluído, redirecionando...');
          } catch (authError) {
            console.error('Erro no checkAuth:', authError);
            // Mesmo com erro, redirecionar (o token está salvo)
          }
          
          // Redirecionar para rota salva (ou home)
          const redirectTo = localStorage.getItem('bw1_oauth_redirect') || '/';
          localStorage.removeItem('bw1_oauth_redirect');
          navigate(redirectTo, { replace: true });
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
