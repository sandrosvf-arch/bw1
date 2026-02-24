import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

const DEFAULT_BG_IMAGES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];
const BG_INTERVAL_MS = 5000;

export default function Hero({ hero, searchTerm, onSearchChange, onSearchSubmit, onSearchKeyDown, onSearchClear, committedSearchTerm }) {
  const bgImages = useMemo(() => {
    const arr = Array.isArray(hero?.backgroundImages)
      ? hero.backgroundImages
      : DEFAULT_BG_IMAGES;
    return arr.filter(Boolean);
  }, [hero]);

  const [idx, setIdx] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    bgImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [bgImages]);

  useEffect(() => {
    if (bgImages.length <= 1) return;

    const interval = setInterval(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % bgImages.length);
        setFadeOut(false);
      }, 250);
    }, BG_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [bgImages.length]);

  const currentBg = bgImages[idx] || DEFAULT_BG_IMAGES[0];

  return (
    <div className="relative bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src={currentBg}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
          alt="Banner"
          draggable={false}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-50" />

      {/* ✅ volta pra pt-10 normal, porque o pt-20 já é do layout global */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">{hero?.titleLine1}</span>
            <span className="block text-blue-500">{hero?.titleLine2}</span>
          </h1>

          <p className="mt-3 max-w-md mx-auto text-base text-slate-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {hero?.subtitle}
          </p>

          <div className="mt-10 max-w-xl mx-auto">
            {/* Dica visual — aparece ao digitar antes de submeter */}
            <div className={`text-center mb-2 transition-all duration-300 overflow-hidden ${searchTerm && searchTerm !== committedSearchTerm ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'}`}>
              <span className="text-blue-300 text-xs font-medium">
                Clique em Buscar para ver os resultados
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                className="block w-full pl-4 pr-28 py-4 border-none rounded-2xl leading-5 bg-white shadow-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 sm:text-sm transition-all"
                placeholder={hero?.searchPlaceholder || "Busque por modelo, cidade ou tipo..."}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onSearchKeyDown}
              />

              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                {/* Botão limpar — aparece quando há busca submetida */}
                {committedSearchTerm && (
                  <button
                    onClick={onSearchClear}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {/* Botão lupa — expande com texto "Buscar" ao digitar */}
                <button
                  onClick={onSearchSubmit}
                  title="Buscar"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                    searchTerm && searchTerm !== committedSearchTerm
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 px-2'
                  }`}
                >
                  <Search className="h-5 w-5 shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
                    searchTerm && searchTerm !== committedSearchTerm ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'
                  }`}>Buscar</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
