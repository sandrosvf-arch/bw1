import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";
import ListingsGrid from "./components/ListingsGrid";
import Footer from "./components/Footer";

import * as BrandMod from "./content/brand.js";
import * as FooterMod from "./content/footer.js";
import listings from "./data/listings.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

export default function FavoritesPage() {
  const [logoOk, setLogoOk] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Carregar favoritos do localStorage
    const saved = localStorage.getItem("bw1-favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const favoriteListings = listings.filter((item) =>
    favorites.includes(item.id)
  );

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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-20 pb-28 lg:pb-8 pt-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Meus Favoritos
            </h1>
            <p className="text-slate-600">
              {favoriteListings.length === 0
                ? "Você ainda não tem anúncios favoritos"
                : `${favoriteListings.length} ${
                    favoriteListings.length === 1 ? "anúncio favoritado" : "anúncios favoritados"
                  }`}
            </p>
          </div>

          {favoriteListings.length === 0 ? (
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
            <ListingsGrid listings={favoriteListings} />
          )}

          <Footer brand={BRAND} footer={FOOTER} />
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
