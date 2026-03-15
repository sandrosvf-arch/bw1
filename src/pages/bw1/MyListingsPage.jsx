import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Zap, TrendingUp, Loader2 } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, paused, sold
  const [showMenu, setShowMenu] = useState(null);
  const [logoOk, setLogoOk] = useState(true);
  const [togglingId, setTogglingId] = useState(null);


  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('bw1_redirect_after_login', '/meus-anuncios');
      navigate("/login");
      return;
    }
    loadMyListings();
  }, [isAuthenticated]);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const response = await api.getMyListings();
      setListings(response.listings || []);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      alert("Erro ao carregar seus anúncios. Verifique se você está logado.");
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (filter === "all") return true;
    if (filter === "paused") return item.status === "paused" || item.status === "inactive";
    if (filter === "active") return item.status === "active";
    return item.status === filter;
  });

  const BUMP_INTERVALS_DAYS = { standard: 11, pro: 12, premium: 7 };

  const getNextBumpInfo = (listing) => {
    if (!listing.plan || listing.plan === 'basic') return null;
    const interval = BUMP_INTERVALS_DAYS[listing.plan];
    if (!interval) return null;
    const isPremium = listing.plan === 'premium';
    if (!isPremium && (!listing.bumps_remaining || listing.bumps_remaining <= 0)) {
      return { label: 'Ciclo encerrado', color: 'text-gray-400' };
    }
    if (!listing.bumped_at) {
      return { label: 'Volta ao topo: em breve', color: 'text-green-600' };
    }
    const nextBump = new Date(listing.bumped_at).getTime() + interval * 24 * 60 * 60 * 1000;
    const diffMs = nextBump - Date.now();
    if (diffMs <= 0) return { label: 'Volta ao topo: em breve', color: 'text-green-600' };
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return { label: `Volta ao topo em: ${diffDays}d`, color: 'text-blue-600' };
  };

  // Visualizações fake baseadas no tempo (10-20 no dia 1, 20-35 no dia 2, etc.)
  const getDisplayViews = (listing) => {
    const real = listing.views || 0;
    const seed = (listing.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const createdAt = listing.created_at ? new Date(listing.created_at).getTime() : Date.now();
    const daysOld = Math.max(0, (Date.now() - createdAt) / (24 * 60 * 60 * 1000));
    const dailyRate = 8 + (seed % 7);   // 8–14 views por dia (fixo por anúncio)
    const jitter = seed % 5;             // 0–4 extra
    const fakeViews = Math.floor(daysOld * dailyRate) + jitter;
    return real + fakeViews;
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'standard':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white">
            <span className="w-1 h-1 rounded-full bg-white/60" />
            DESTAQUE
            <span className="w-1 h-1 rounded-full bg-white/60" />
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-600 text-white">
            <span className="w-1 h-1 rounded-full bg-white/60" />
            DESTAQUE PRO
            <span className="w-1 h-1 rounded-full bg-white/60" />
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <span className="w-1 h-1 rounded-full bg-white/60" />
            ★ SUPER DESTAQUE PREMIUM
            <span className="w-1 h-1 rounded-full bg-white/60" />
          </span>
        );
      default:
        return null;
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este anúncio?")) {
      try {
        await api.deleteListing(id);
        setListings(listings.filter((item) => item.id !== id));
        alert("Anúncio excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir anúncio. Tente novamente.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const listing = listings.find((item) => item.id === id);
    const newStatus = listing.status === "active" ? "paused" : "active";
    setTogglingId(id);
    try {
      await api.updateListing(id, { status: newStatus });
      setListings(
        listings.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status do anúncio.");
    } finally {
      setTogglingId(null);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "string" && price.startsWith("R$")) return price;
    return `R$ ${Number(price).toLocaleString("pt-BR")}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            Ativo
          </span>
        );
      case "inactive":
      case "paused":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
            Pausado
          </span>
        );
      case "sold":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Vendido
          </span>
        );
      default:
        return null;
    }
  };

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
                    <span className="font-bold">Meus anúncios</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8 pt-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Meus anúncios
              </h1>
              <p className="text-slate-600 mt-2">
                Gerencie todos os seus anúncios
              </p>
            </div>
            <button
              onClick={() => navigate("/criar-anuncio")}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transition shadow-lg"
            >
              <Plus size={20} />
              Novo anúncio
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {[
              { value: "all", label: "Todos", count: listings.length },
              {
                value: "active",
                label: "Ativos",
                count: listings.filter((l) => l.status === "active").length,
              },
              {
                value: "paused",
                label: "Pausados",
                count: listings.filter((l) => l.status === "paused" || l.status === "inactive").length,
              },
              {
                value: "sold",
                label: "Vendidos",
                count: listings.filter((l) => l.status === "sold").length,
              },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition ${
                  filter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {/* Lista de anúncios */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Carregando seus anúncios...
              </h3>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Nenhum anúncio encontrado
              </h3>
              <p className="text-slate-600 mb-6">
                Comece a anunciar seus produtos agora mesmo!
              </p>
              <button
                onClick={() => navigate("/criar-anuncio")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Criar primeiro anúncio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 flex flex-col sm:flex-row gap-4 border-2 ${
                    listing.plan === 'premium' ? 'border-amber-500'
                    : listing.plan === 'pro' ? 'border-violet-600'
                    : listing.plan === 'standard' ? 'border-blue-600'
                    : 'border-transparent'
                  }`}
                >
                  {/* Imagem + badge de plano */}
                  <div className="w-full sm:w-48 flex-shrink-0 flex flex-col">
                    <div
                      className={`w-full h-48 sm:h-32 overflow-hidden cursor-pointer bg-slate-200 ${
                        listing.plan && listing.plan !== 'basic' ? 'rounded-t-xl' : 'rounded-xl'
                      }`}
                      onClick={() => navigate(`/anuncio/${listing.id}`)}
                    >
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                          📷
                        </div>
                      )}
                    </div>
                    {listing.plan && listing.plan !== 'basic' && (
                      <div className={`w-full flex items-center justify-center gap-1 py-1 rounded-b-xl text-[10px] font-bold text-white ${
                        listing.plan === 'standard' ? 'bg-blue-600'
                        : listing.plan === 'pro' ? 'bg-violet-600'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}>
                        {listing.plan === 'standard' && '· DESTAQUE ·'}
                        {listing.plan === 'pro' && '· DESTAQUE PRO ·'}
                        {listing.plan === 'premium' && '★ SUPER DESTAQUE PREMIUM'}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex flex-col gap-1">
                          <h3
                            className="text-lg font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/anuncio/${listing.id}`)}
                          >
                            {listing.title}
                          </h3>
                        </div>
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <p className="text-2xl font-extrabold text-slate-900">
                          {formatPrice(listing.price)}
                        </p>
                        {(!listing.plan || listing.plan === 'basic') ? (
                          <button
                            onClick={() => navigate('/criar-anuncio', { state: { impulsionar: listing.id, step: 4 } })}
                            className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-400/50 hover:shadow-amber-400/80 transition"
                          >
                            <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                            <Zap size={12} /> Impulsionar
                          </button>
                        ) : (() => {
                          const info = getNextBumpInfo(listing);
                          return info ? (
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 ${info.color}`}>
                              <TrendingUp size={11} />{info.label}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{getDisplayViews(listing).toLocaleString('pt-BR')} views</span>
                      </div>
                    </div>

                      {/* Ações */}
                      <div className="space-y-2">
                        {/* Linha 1: ações principais */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/anuncio/${listing.id}`)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                          >
                            <Eye size={14} /> Ver
                          </button>
                          <button
                            onClick={() => navigate(`/editar-anuncio/${listing.id}`)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          >
                            <Edit size={14} /> Editar
                          </button>
                          <button
                            onClick={() => handleToggleStatus(listing.id)}
                            disabled={togglingId === listing.id}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition disabled:opacity-60"
                          >
                            {togglingId === listing.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : listing.status === "active" ? (
                              <><EyeOff size={14} /> Pausar</>
                            ) : (
                              <><Eye size={14} /> Ativar</>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition ml-auto"
                          >
                            <Trash2 size={14} /> Excluir
                          </button>
                        </div>


                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
