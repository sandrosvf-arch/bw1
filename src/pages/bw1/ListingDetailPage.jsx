import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Gauge,
  Bed,
  Bath,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import listings from "./data/listings.js";
import * as BrandMod from "./content/brand.js";
import AppShell from "./components/AppShell.jsx";

const BRAND = BrandMod.default ?? BrandMod.BRAND;

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=1400&q=80";

const DEMO_WHATSAPP = "5541999999999";

function extractWhats(item) {
  return (
    item?.contact?.whatsapp ??
    item?.contact?.whats ??
    item?.contact?.phone ??
    item?.whatsapp ??
    item?.whats ??
    item?.phone ??
    ""
  );
}

function normalizeWhatsapp(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return null;

  digits = digits.replace(/^0+/, "");

  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 10) return digits;

  return null;
}

function normalizeImages(item) {
  const imgs = [];

  if (Array.isArray(item?.images)) {
    for (const u of item.images) {
      if (typeof u === "string" && u.trim()) imgs.push(u.trim());
    }
  }

  if (typeof item?.image === "string" && item.image.trim()) {
    if (!imgs.includes(item.image.trim())) imgs.unshift(item.image.trim());
  }

  if (imgs.length === 0) imgs.push(PLACEHOLDER_IMG);

  return Array.from(new Set(imgs));
}

function formatDateBR(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const [y, m, dd] = String(value).split("-");
    if (y && m && dd) return `${dd}/${m}/${y}`;
    return String(value);
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const item = useMemo(() => {
    return listings.find((l) => String(l.id) === String(id));
  }, [id]);

  const images = useMemo(() => (item ? normalizeImages(item) : []), [item]);
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const [logoOk, setLogoOk] = useState(true);
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    setImgIndex(0);
  }, [id]);

  useEffect(() => {
    lastYRef.current = window.scrollY || 0;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const lastY = lastYRef.current;

        const goingDown = y > lastY;
        const goingUp = y < lastY;

        const SHOW_AT_TOP_Y = 10;
        const HIDE_AFTER_Y = 80;
        const DELTA = 6;

        if (y <= SHOW_AT_TOP_Y) {
          setHidden(false);
        } else if (y > HIDE_AFTER_Y) {
          if (goingDown && y - lastY > DELTA) setHidden(true);
          if (goingUp && lastY - y > DELTA) setHidden(false);
        }

        lastYRef.current = y;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const diff = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) < minSwipeDistance) return;

    if (diff > 0) {
      setImgIndex((prev) => (prev + 1) % images.length);
    } else {
      setImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }

    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };

  const nextImage = () => {
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Anúncio não encontrado
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  const rawWhatsFromItem = extractWhats(item);
  const rawWhats = rawWhatsFromItem || DEMO_WHATSAPP;
  const waDigits = normalizeWhatsapp(rawWhats);
  const hasWhats = Boolean(waDigits);

  const waMsg = encodeURIComponent(
    `Olá! Vi seu anúncio na BW1 e tenho interesse em: ${item.title} (${item.price}) - ${item.location}.`
  );
  const waLink = hasWhats ? `https://wa.me/${waDigits}?text=${waMsg}` : "#";

  const currentImg = images[imgIndex] || PLACEHOLDER_IMG;
  const tag = item?.tag || "—";
  const isVenda = String(tag).toLowerCase().includes("venda");
  const tagClass = isVenda ? "bg-emerald-500" : "bg-blue-500";

  const createdAtLabel = item?.createdAt
    ? `Publicado em ${formatDateBR(item.createdAt)}`
    : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <AppShell
        header={
          <header
            className={[
              "fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-white/10",
              "transition-transform duration-200 ease-out",
              hidden ? "-translate-y-full" : "translate-y-0",
            ].join(" ")}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                {/* Botão voltar + Logo */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/")}
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                  >
                    <ArrowLeft size={24} />
                  </button>

                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    {logoOk && BRAND?.logoSrc && (
                      <img
                        src={BRAND.logoSrc}
                        alt={BRAND.name}
                        className="h-8 w-auto object-contain"
                        onError={() => setLogoOk(false)}
                      />
                    )}
                    {!logoOk && (
                      <div className="text-lg font-bold">{BRAND.name}</div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                    title="Favoritar"
                  >
                    <Heart size={20} />
                  </button>
                  <button
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                    title="Compartilhar"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </header>
        }
      >
        {/* Conteúdo */}
        <main className="pb-32">
          {/* Galeria de imagens */}
          <div className="relative bg-slate-900">
            <div
              className="relative h-[400px] md:h-[500px] overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
            <img
              src={currentImg}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMG;
              }}
            />

            {/* Tag */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-sm ${tagClass}`}
              >
                {tag}
              </span>
            </div>

            {/* Navegação de imagens */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === imgIndex
                            ? "w-6 bg-white/90"
                            : "w-2.5 bg-white/50"
                        }`}
                        aria-label={`Imagem ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 text-sm px-3 py-1.5 rounded-full bg-black/30 text-white backdrop-blur">
                  {imgIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Informações */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Preço e título */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <p className="text-3xl font-extrabold text-slate-900 mb-2">
              {item.price}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              {item.title}
            </h1>

            <div className="flex items-center text-slate-600 mb-2">
              <MapPin size={16} className="mr-1" />
              {item.location}
            </div>

            {createdAtLabel && (
              <p className="text-sm text-slate-400">{createdAtLabel}</p>
            )}
          </div>

          {/* Características */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Características
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {item.type === "vehicle" ? (
                <>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                    <Calendar size={24} className="text-blue-500 mb-2" />
                    <span className="text-xs text-slate-500 mb-1">Ano</span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.details.year}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                    <Gauge size={24} className="text-blue-500 mb-2" />
                    <span className="text-xs text-slate-500 mb-1">KM</span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.details.km}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-500 mb-2">
                      F
                    </div>
                    <span className="text-xs text-slate-500 mb-1">
                      Combustível
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.details.fuel}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                    <Bed size={24} className="text-blue-500 mb-2" />
                    <span className="text-xs text-slate-500 mb-1">Quartos</span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.details.beds}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                    <Bath size={24} className="text-blue-500 mb-2" />
                    <span className="text-xs text-slate-500 mb-1">
                      Banheiros
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.details.baths}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center text-[10px] font-bold text-blue-500 mb-2">
                      M²
                    </div>
                    <span className="text-xs text-slate-500 mb-1">Área</span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.details.area}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Descrição</h2>
            <p className="text-slate-600 leading-relaxed">
              {item.description ||
                "Este é um excelente anúncio. Entre em contato para mais informações!"}
            </p>
          </div>
        </div>
      </main>

      {/* Barra inferior fixa com botão de chat */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (!hasWhats) e.preventDefault();
            }}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-3 ${
              hasWhats
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            <MessageCircle size={24} />
            Iniciar Conversa
          </a>
        </div>
      </div>
      </AppShell>
    </div>
  );
}
