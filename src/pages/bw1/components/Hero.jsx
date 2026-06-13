import React, { useEffect, useRef, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../services/api";

/**
 * Fallback exibido enquanto os banners personalizados não forem enviados.
 * Substitua adicionando as imagens em /public/banners/ e editando hero.js.
 */
const FALLBACK_BANNER = {
  desktop: null,
  mobile: null,
  alt: "BW1 — Imóveis e Veículos",
};

export default function Hero({
  hero,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onSearchKeyDown,
  onSearchClear,
  committedSearchTerm,
}) {
  // Tenta buscar banners do banco; usa config estática como fallback
  const staticBanners =
    Array.isArray(hero?.banners) && hero.banners.length > 0
      ? hero.banners.map(b => ({ desktop_url: b.desktop, mobile_url: b.mobile, alt: b.alt, link: b.link }))
      : [FALLBACK_BANNER];

  const [banners, setBanners] = useState(staticBanners);

  useEffect(() => {
    api.getPublicBanners()
      .then(res => {
        if (res?.banners?.length > 0) setBanners(res.banners);
      })
      .catch(() => {}); // mantém fallback silenciosamente
  }, []);

  const intervalMs = hero?.intervalMs ?? 6000;

  const [idx, setIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  /** Pré-carrega imagens para eliminar flash */
  useEffect(() => {
    banners.forEach((b) => {
      const d = b.desktop_url || b.desktop;
      const m = b.mobile_url  || b.mobile;
      if (d) { const i = new Image(); i.src = d; }
      if (m) { const i = new Image(); i.src = m; }
    });
  }, [banners]);

  const goTo = (next) => {
    if (isAnimating || next === idx) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIdx(next);
      setIsAnimating(false);
    }, 350);
  };

  const prev = () => goTo((idx - 1 + banners.length) % banners.length);
  const next = () => goTo((idx + 1) % banners.length);

  /** Auto-play */
  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(next, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [banners.length, intervalMs, idx]);

  const current = banners[idx] ?? FALLBACK_BANNER;

  return (
    // Altura responsiva: mobile usa aspect-ratio do banner, desktop também
    <div className="relative bg-slate-900 overflow-hidden"
      style={{ minHeight: '280px' }}
    >
      {/* ── BANNER DE FUNDO — ocupa toda a área do container ── */}
      <div
        className={`absolute inset-0 transition-opacity duration-350 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Desktop (≥768 px) — 1440 × 560 px */}
        {(current.desktop_url || current.desktop) ? (
          <img
            key={`d-${current.id ?? idx}`}
            src={current.desktop_url || current.desktop}
            alt={current.alt ?? "Banner"}
            draggable={false}
            className="hidden md:block w-full h-full object-cover object-center"
          />
        ) : (
          <div className="hidden md:block w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}

        {/* Mobile (<768 px) — 390 × 520 px */}
        {(current.mobile_url || current.mobile) ? (
          <img
            key={`m-${current.id ?? idx}`}
            src={current.mobile_url || current.mobile}
            alt={current.alt ?? "Banner"}
            draggable={false}
            className="block md:hidden w-full h-full object-cover object-center"
          />
        ) : (
          <div className="block md:hidden w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
      </div>

      {/* ── Container que define a altura E posiciona a busca ── */}
      {/* pb-20 mobile, md:pb-36 desktop — sobe a barra no desktop */}
      <div className="relative flex items-end justify-center pb-20 md:pb-36 px-4"
        style={{ paddingTop: 'clamp(140px, 38.89vw, 560px)' }}
      >
        {/* Mobile: usa altura menor para não ficar gigante */}
        <div className="w-full max-w-xl relative z-10">
            <div
              className={`text-center mb-2 transition-all duration-300 overflow-hidden ${
                searchTerm && searchTerm !== committedSearchTerm
                  ? "max-h-8 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <span className="text-blue-300 text-xs font-medium drop-shadow">
                Clique em Buscar para ver os resultados
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                className="block w-full pl-4 pr-28 py-4 border-none rounded-2xl leading-5 bg-white shadow-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 sm:text-sm transition-all"
                placeholder={
                  hero?.searchPlaceholder ?? "Busque por modelo, cidade ou tipo..."
                }
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onSearchKeyDown}
              />

              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                {committedSearchTerm && (
                  <button
                    onClick={onSearchClear}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onSearchSubmit}
                  title="Buscar"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                    searchTerm && searchTerm !== committedSearchTerm
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 px-2"
                  }`}
                >
                  <Search className="h-5 w-5 shrink-0" />
                  <span
                    className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
                      searchTerm && searchTerm !== committedSearchTerm
                        ? "max-w-[60px] opacity-100"
                        : "max-w-0 opacity-0"
                    }`}
                  >
                    Buscar
                  </span>
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* ── SETAS DE NAVEGAÇÃO ────────────────────────────────── */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Bolinhas indicadoras */}
          <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === idx ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Ir para banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Link clicável opcional */}
      {(current.link) && (
        <a
          href={current.link}
          className="absolute inset-0"
          aria-label={current.alt ?? "Ver oferta"}
        />
      )}
    </div>
  );
}

