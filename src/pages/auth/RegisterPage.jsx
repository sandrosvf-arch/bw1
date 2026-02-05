import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Loader } from 'lucide-react';
import Navbar from '../bw1/components/Navbar';
import * as BrandMod from '../bw1/content/brand.js';
import * as NavMod from '../bw1/content/navigation.js';

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (result.success) {
      // Redirecionar para a página que o usuário tentou acessar ou para home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Erro ao criar conta');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleRegister = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar brand={BRAND} links={NAVIGATION} hideNotifications={true} />
      
      <div className="flex items-center justify-center p-4 pt-32">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Logo/Título */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                <UserPlus size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Criar conta
              </h1>
              <p className="text-slate-600">
                Comece a anunciar na BW1
              </p>
            </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Telefone (opcional)
              </label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="(41) 99999-9999"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Criar conta
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">ou cadastre-se com</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full py-3 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition flex items-center justify-center gap-3 font-semibold text-slate-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
