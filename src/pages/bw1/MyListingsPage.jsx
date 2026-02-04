import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical, ArrowLeft } from "lucide-react";

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

// Mock data - seus anúncios
const mockMyListings = [
  {
    id: 1,
    title: "Honda Civic 2020 Automático",
    price: "R$ 95.000",
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80",
    type: "vehicle",
    status: "active", // active, paused, sold
    views: 234,
    contacts: 12,
    createdAt: "2026-01-15",
  },
  {
    id: 2,
    title: "Apartamento 3 Quartos - Centro",
    price: "R$ 450.000",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
    type: "property",
    status: "active",
    views: 567,
    contacts: 28,
    createdAt: "2026-01-20",
  },
  {
    id: 3,
    title: "Moto Yamaha MT-03 2019",
    price: "R$ 22.000",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80",
    type: "vehicle",
    status: "paused",
    views: 89,
    contacts: 3,
    createdAt: "2026-01-10",
  },
];

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(mockMyListings);
  const [filter, setFilter] = useState("all"); // all, active, paused, sold
  const [showMenu, setShowMenu] = useState(null);
  const [logoOk, setLogoOk] = useState(true);

  const filteredListings = listings.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este anúncio?")) {
      setListings(listings.filter((item) => item.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setListings(
      listings.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "active" ? "paused" : "active",
            }
          : item
      )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            Ativo
          </span>
        );
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
                count: listings.filter((l) => l.status === "paused").length,
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
          {filteredListings.length === 0 ? (
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
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 flex flex-col sm:flex-row gap-4"
                >
                  {/* Imagem */}
                  <div
                    className="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/anuncio/${listing.id}`)}
                  >
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3
                          className="text-lg font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/anuncio/${listing.id}`)}
                        >
                          {listing.title}
                        </h3>
                        {getStatusBadge(listing.status)}
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 mb-3">
                        {listing.price}
                      </p>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{listing.views} visualizações</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">💬</span>
                        <span>{listing.contacts} contatos</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/anuncio/${listing.id}`)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Eye size={16} className="inline mr-1" />
                        Ver anúncio
                      </button>
                      <button
                        onClick={() => navigate(`/editar-anuncio/${listing.id}`)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        <Edit size={16} className="inline mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(listing.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                      >
                        {listing.status === "active" ? (
                          <>
                            <EyeOff size={16} className="inline mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Eye size={16} className="inline mr-1" />
                            Ativar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition"
                      >
                        <Trash2 size={16} className="inline mr-1" />
                        Excluir
                      </button>
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
