import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Heart,
  Bell,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Car,
  Home as HomeIcon,
  Package,
  ArrowLeft,
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

const CategoryCard = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-4 bg-white rounded-xl hover:shadow-lg transition text-center group"
  >
    <div className="text-4xl mb-2">{icon}</div>
    <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
      {label}
    </span>
  </button>
);

export default function MenuPage() {
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = React.useState(true);

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
                    <span className="font-bold">Menu</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 pb-28 lg:pb-8 pt-6">
          {/* Perfil rápido */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Olá, Usuário!</h2>
                <p className="text-blue-100">usuario@email.com</p>
              </div>
            </div>
          </div>

          {/* Categorias principais */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Categorias
            </h2>
            
            {/* Veículos */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Veículos</h3>
                  <p className="text-sm text-slate-600">Todos os tipos de veículos</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Sedan
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  SUV
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Hatchback
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Pickup
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Van
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Motos
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Caminhões
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Utilitários
                </button>
                <button
                  onClick={() => navigate("/veiculos")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                >
                  Peças e acessórios
                </button>
              </div>
            </div>

            {/* Imóveis */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <HomeIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Imóveis</h3>
                  <p className="text-sm text-slate-600">Todos os tipos de imóveis</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Apartamentos
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Casas
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Chácaras
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Sítios e fazendas
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Terrenos
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Comércio
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Galpões
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Temporada
                </button>
                <button
                  onClick={() => navigate("/imoveis")}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 transition text-left"
                >
                  Estúdios
                </button>
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
                icon={Heart}
                label="Favoritos"
                onClick={() => navigate("/favoritos")}
              />
              <MenuItem
                icon={Bell}
                label="Notificações"
                badge="3"
                onClick={() => navigate("/notificacoes")}
              />
              <MenuItem
                icon={User}
                label="Perfil"
                onClick={() => navigate("/perfil")}
              />
            </div>
          </div>

          {/* Configurações e ajuda */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Configurações
            </h2>
            <div className="space-y-3">
              <MenuItem
                icon={Settings}
                label="Configurações"
                onClick={() => navigate("/configuracoes")}
              />
              <MenuItem
                icon={HelpCircle}
                label="Ajuda e suporte"
                onClick={() => navigate("/ajuda")}
              />
              <MenuItem
                icon={Shield}
                label="Privacidade e segurança"
                onClick={() => navigate("/privacidade")}
              />
            </div>
          </div>

          {/* Sair */}
          <button className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition mb-8">
            <LogOut size={20} />
            Sair
          </button>

          <Footer brand={BRAND} footer={FOOTER} />
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
