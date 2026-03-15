import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import ListingsGrid from "./components/ListingsGrid";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as FooterMod from "./content/footer.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

export default function FavoritesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [logoOk, setLogoOk] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    loadFavorites();
  }, [isAuthenticated, authLoading]);

  const loadFavorites = async () => {
    try {
      setLoading(true);

      // IDs salvos localmente (favoritados mesmo sem login)
      const saved = localStorage.getItem("bw1-favorites");
      const localIds = saved ? JSON.parse(saved) : [];

      if (isAuthenticated) {
        // 1. Busca favoritos do banco
        const response = await api.getFavorites();
        const apiListings = (response.favorites || [])
          .map((fav) => fav.listings)
          .filter(Boolean);
        const apiIds = apiListings.map((item) => item.id);

        // 2. Sincroniza IDs locais que ainda não estão no banco
        const idsToSync = localIds.filter((id) => !apiIds.includes(id));
        if (idsToSync.length > 0) {
          await Promise.allSettled(idsToSync.map((id) => api.addFavorite(id)));
        }

        // 3. Busca os listings dos IDs locais que não vieram da API
        const extraListings = idsToSync.length > 0
          ? (await Promise.allSettled(
              idsToSync.map((id) => api.getListing(id, { forceRefresh: true }))
            ))
              .filter((r) => r.status === "fulfilled" && r.value?.listing)
              .map((r) => r.value.listing)
          : [];

        const allListings = [...apiListings, ...extraListings];

        // 4. Atualiza localStorage com todos os IDs
        const allIds = allListings.map((item) => item.id);
        localStorage.setItem("bw1-favorites", JSON.stringify(allIds));
        setFavorites(allListings);
        return;
      }

      // Não autenticado: busca cada listing por ID
      if (!localIds.length) {
        setFavorites([]);
        return;
      }

      const results = await Promise.allSettled(
        localIds.map((id) => api.getListing(id, { forceRefresh: true }))
      );
      const listings = results
        .filter((r) => r.status === "fulfilled" && r.value?.listing)
        .map((r) => r.value.listing);
      setFavorites(listings);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
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
                  <span className="text-base sm:text-lg border-l border-slate-700/80 pl-3 flex items-center gap-2">
                    <Heart size={20} />
                    <span className="font-bold">Favoritos</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-28 lg:pb-8 pt-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Meus Favoritos
            </h1>
            <p className="text-slate-600">
              {favorites.length === 0
                ? "Você ainda não tem anúncios favoritos"
                : `${favorites.length} ${
                    favorites.length === 1 ? "anúncio favoritado" : "anúncios favoritados"
                  }`}
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Carregando favoritos...</h3>
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Heart size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-slate-600 mb-6">
                Comece a favoritar anúncios que você gosta para vê-los aqui!
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Explorar anúncios
              </Link>
            </div>
          ) : (
            <ListingsGrid listings={favorites} />
          )}
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
