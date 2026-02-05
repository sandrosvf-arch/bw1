import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  User,
  Heart,
  Bell,
  Package,
  ArrowLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

const MenuItem = ({ icon: Icon, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 transition group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
        <Icon size={20} />
      </div>
      <span className="font-semibold text-slate-900">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
          {badge}
        </span>
      )}
      <ChevronRight size={20} className="text-slate-400" />
    </div>
  </button>
);

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [logoOk, setLogoOk] = React.useState(true);

  const handleLogout = async () => {
    logout();
    window.location.href = '/';
  };

  // Se não estiver logado, redireciona para login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/conta' } } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AppShell
        header={
          <nav className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                    title="Voltar"
                  >
                    <ArrowLeft size={24} />
                  </Link>
                  <Link to="/">
                    <div
                      className="rounded-xl px-3 py-2 flex items-center cursor-pointer hover:opacity-80 transition"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {logoOk ? (
                        <img
                          src="/logo-bw1.png"
                          alt={BRAND?.name || "BW1"}
                          className="h-10 w-auto"
                          onError={() => setLogoOk(false)}
                        />
                      ) : (
                        <span className="text-xl font-bold tracking-tighter text-slate-900">
                          {BRAND?.name || "BW1"}
                        </span>
                      )}
                    </div>
                  </Link>
                  <span className="text-base sm:text-lg border-l border-slate-700/80 pl-3">
                    <span className="font-bold">Conta</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8 pt-6">
          {/* Perfil - Foto editável */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button 
                  onClick={() => {/* TODO: Implementar upload */}}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg hover:bg-blue-50 transition"
                  title="Alterar foto"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {user?.name}
                </h2>
                <p className="text-blue-100">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Minha conta */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Minha conta
            </h2>
            <div className="space-y-3">
              <MenuItem
                icon={User}
                label="Perfil"
                onClick={() => navigate("/perfil")}
              />
              <MenuItem
                icon={Heart}
                label="Favoritos"
                onClick={() => navigate("/favoritos")}
              />
              <MenuItem
                icon={Package}
                label="Meus anúncios"
                onClick={() => navigate("/meus-anuncios")}
              />
              <MenuItem
                icon={Bell}
                label="Notificações"
                badge="3"
                onClick={() => navigate("/notificacoes")}
              />
            </div>
          </div>

          {/* Sair */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition mb-8"
          >
            <LogOut size={20} />
            Sair
          </button>
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
