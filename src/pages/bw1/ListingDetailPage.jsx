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
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Flag,
} from "lucide-react";

import api from "../../services/api";
import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";
import * as FooterMod from "./content/footer.js";
import AppShell from "./components/AppShell.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import BottomNav from "./components/BottomNav.jsx";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const FOOTER = FooterMod.default ?? FooterMod.FOOTER;

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

function formatLocation(location) {
  if (!location) return "—";
  
  // Se é uma string JSON, tenta fazer parse
  if (typeof location === "string") {
    // Se parece com JSON (começa com {), tenta parsear
    if (location.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(location);
        const parts = [];
        if (parsed.neighborhood) parts.push(parsed.neighborhood);
        if (parsed.city) parts.push(parsed.city);
        if (parsed.state) parts.push(parsed.state);
        return parts.length > 0 ? parts.join(", ") : "Localização não informada";
      } catch (e) {
        console.warn("Erro ao parsear location:", e);
        return location;
      }
    }
    // Se já é uma string formatada, retorna
    return location;
  }
  
  // Se é um objeto, formata
  if (typeof location === "object" && location !== null) {
    const parts = [];
    if (location.neighborhood) parts.push(location.neighborhood);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.join(", ") : "Localização não informada";
  }
  
  return String(location);
}

function formatPrice(price) {
  if (!price) return "—";
  
  if (typeof price === "string" && price.includes("R$")) return price;
  
  const num = typeof price === "number" ? price : parseFloat(price);
  if (isNaN(num)) return price;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const response = await api.getListing(id);
      setItem(response.listing);
    } catch (error) {
      console.error('Erro ao carregar anúncio:', error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top quando a página carrega ou o id muda
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // Detectar quando o botão de contato sai da tela para mostrar barra flutuante
  useEffect(() => {
    if (!item) return;
    
    const handleScroll = () => {
      if (contactButtonRef.current) {
        const rect = contactButtonRef.current.getBoundingClientRect();
        // Se o botão saiu da tela (topo está acima da viewport)
        setShowFloatingBar(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Verificar posição inicial
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [item]);

  const [logoOk, setLogoOk] = useState(true);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const contactButtonRef = useRef(null);

  const images = useMemo(() => {
    if (!item) return [PLACEHOLDER_IMG];
    
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
  }, [item]);
  
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const isSwipingRef = useRef(false);

  useEffect(() => {
    setImgIndex(0);
  }, [id]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStartXRef.current || !touchStartYRef.current) return;

    touchEndXRef.current = e.targetTouches[0].clientX;
    touchEndYRef.current = e.targetTouches[0].clientY;

    const diffX = Math.abs(touchStartXRef.current - touchEndXRef.current);
    const diffY = Math.abs(touchStartYRef.current - touchEndYRef.current);

    // Se o movimento horizontal é maior que o vertical, é um swipe horizontal
    if (diffX > diffY && diffX > 10) {
      isSwipingRef.current = true;
      e.preventDefault(); // Previne o scroll da página
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipingRef.current) {
      touchStartXRef.current = 0;
      touchStartYRef.current = 0;
      touchEndXRef.current = 0;
      touchEndYRef.current = 0;
      return;
    }

    const diffX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) >= minSwipeDistance) {
      if (diffX > 0) {
        setImgIndex((prev) => (prev + 1) % images.length);
      } else {
        setImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }

    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
    touchEndXRef.current = 0;
    touchEndYRef.current = 0;
    isSwipingRef.current = false;
  };

  const nextImage = () => {
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Carregando anúncio...</p>
        </div>
      </div>
    );
  }

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
    `Olá! Vi seu anúncio na BW1 e tenho interesse em: ${item.title} (${formatPrice(item.price)}) - ${formatLocation(item.location)}.`
  );
  const waLink = hasWhats ? `https://wa.me/${waDigits}?text=${waMsg}` : "#";

  const currentImg = images[imgIndex] || PLACEHOLDER_IMG;
  const tag = item?.tag || "—";
  const isVenda = String(tag).toLowerCase().includes("venda");
  const tagClass = isVenda ? "bg-emerald-500" : "bg-blue-500";

  const createdAtLabel = item?.created_at
    ? `Publicado em ${formatDateBR(item.created_at)}`
    : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <AppShell
        header={
          <nav className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                {/* Left - Botão Voltar + Logo */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                    title="Voltar"
                  >
                    <ArrowLeft size={24} />
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="rounded-xl px-3 py-2 flex items-center hover:opacity-80 transition cursor-pointer"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {logoOk && BRAND?.logoSrc ? (
                      <img
                        src={BRAND.logoSrc}
                        alt={BRAND.name}
                        className="h-10 w-auto object-contain"
                        onError={() => setLogoOk(false)}
                      />
                    ) : (
                      <span className="text-xl font-bold tracking-tighter text-slate-900">
                        {BRAND?.name || "BW1"}
                      </span>
                    )}
                  </button>
                </div>

                {/* Right - Ações */}
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
          </nav>
        }
      >
        {/* Conteúdo */}
        <main className="pb-20 lg:pb-0">
          {/* Layout Desktop com Grid - Imagens à esquerda, Info à direita */}
          <div className="max-w-7xl mx-auto lg:px-4 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
              
              {/* Coluna Esquerda - Galeria de imagens (2/3 no desktop) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Galeria de imagens - Mobile: Carrossel sem arredondamento, Desktop: Grid com arredondamento */}
                <div className="relative bg-slate-900 lg:rounded-3xl overflow-hidden">
                  {/* Mobile: Carrossel */}
                  <div
                    className="lg:hidden relative h-[400px] overflow-hidden"
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

                    {/* Tag Mobile */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-sm ${tagClass}`}
                      >
                        {tag}
                      </span>
                    </div>

                    {/* Navegação Mobile */}
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

                  {/* Desktop: Grid de imagens */}
                  <div className="hidden lg:grid grid-cols-2 gap-2 p-2">
                    {images.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                          i === 0 ? "col-span-2 row-span-2 h-[400px]" : "h-[199px]"
                        }`}
                        onClick={() => setImgIndex(i)}
                      >
                        <img
                          src={img}
                          alt={`${item.title} - foto ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMG;
                          }}
                        />
                        {i === 0 && (
                          <div className="absolute top-4 left-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-sm ${tagClass}`}
                            >
                              {tag}
                            </span>
                          </div>
                        )}
                        {i === 4 && images.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              +{images.length - 5}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descrição - Desktop: Abaixo da galeria, Mobile: Mais abaixo */}
                <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Descrição</h2>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description ||
                      "Este é um excelente anúncio. Entre em contato para mais informações!"}
                  </p>
                </div>

                {/* Localização - Desktop */}
                <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Localização
                  </h2>
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin size={20} className="text-blue-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-900 mb-1">
                        {formatLocation(item.location)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Veja a localização exata do imóvel/veículo
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatLocation(item.location))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} />
                    Ver no Google Maps
                  </a>
                </div>

                {/* Características - Desktop */}
                <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Detalhes
                  </h2>

                  <div className="grid grid-cols-3 gap-4">
                    {item.type === "vehicle" ? (
                      <>
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <Calendar size={24} className="text-blue-500 mb-2" />
                          <span className="text-xs text-slate-500 mb-1">Ano</span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.details?.year}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <Gauge size={24} className="text-blue-500 mb-2" />
                          <span className="text-xs text-slate-500 mb-1">KM</span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.details?.km}
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
                            {item.details?.fuel}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <Bed size={24} className="text-blue-500 mb-2" />
                          <span className="text-xs text-slate-500 mb-1">Quartos</span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.details?.bedrooms || item.details?.beds || 0}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <Bath size={24} className="text-blue-500 mb-2" />
                          <span className="text-xs text-slate-500 mb-1">
                            Banheiros
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.details?.bathrooms || item.details?.baths || 0}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                          <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center text-[10px] font-bold text-blue-500 mb-2">
                            M²
                          </div>
                          <span className="text-xs text-slate-500 mb-1">Área</span>
                          <span className="text-sm font-bold text-slate-900">
                            {item.details?.area}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Coluna Direita - Informações principais (1/3 no desktop) */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Preço e título */}
                  <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-sm">
                    {/* Tag de Venda/Aluguel */}
                    {item.dealType && (
                      <div className="mb-3">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          item.dealType === 'Venda' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.dealType}
                        </span>
                      </div>
                    )}
                    <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-2">
                      {formatPrice(item.price)}
                    </p>
                    <h1 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 lg:mb-3">
                      {item.title}
                    </h1>

                    <div className="flex items-center text-slate-600 mb-2 lg:mb-3">
                      <MapPin size={16} className="mr-1" />
                      {formatLocation(item.location)}
                    </div>

                    {createdAtLabel && (
                      <p className="text-sm text-slate-400 mb-4">{createdAtLabel}</p>
                    )}

                    {/* Botões de ação */}
                    <div className="space-y-2">
                      <button
                        ref={contactButtonRef}
                        onClick={() => {
                          // Criar ou recuperar conversa
                          const conversations = JSON.parse(localStorage.getItem('bw1_conversations') || '[]');
                          
                          // Verificar se já existe conversa com este anúncio
                          let conversation = conversations.find(c => c.listingId === item.id);
                          
                          if (!conversation) {
                            // Criar nova conversa
                            conversation = {
                              id: Date.now(),
                              listingId: item.id,
                              listingTitle: item.title,
                              listingImage: images[0],
                              listingPrice: item.price,
                              userName: 'BW1 Imóveis',
                              userAvatar: null,
                              lastMessage: 'Olá! Tenho interesse neste anúncio.',
                              timestamp: new Date().toISOString(),
                              unread: 0,
                              messages: [
                                {
                                  id: 1,
                                  text: 'Olá! Tenho interesse neste anúncio.',
                                  sender: 'me',
                                  timestamp: new Date().toISOString()
                                }
                              ]
                            };
                            conversations.unshift(conversation);
                            localStorage.setItem('bw1_conversations', JSON.stringify(conversations));
                          }
                          
                          navigate(`/chat/${conversation.id}`);
                        }}
                        className="w-full py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={20} />
                        Chat Interno
                      </button>
                      
                      {hasWhats && (
                        <a
                          href={`https://wa.me/${waDigits}?text=${encodeURIComponent(`Olá! Tenho interesse no anúncio: ${item.title}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Phone size={20} />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                {/* Anunciante - Desktop */}
                <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 mb-4">
                    Anunciante
                  </h2>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {item?.users?.name || 'Usuário BW1'}
                      </p>
                      {item?.users?.email && (
                        <p className="text-xs text-slate-500 mt-1">
                          {item.users.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <button className="w-full py-2.5 px-4 border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-900 rounded-xl font-semibold text-sm transition-all">
                    Acessar perfil
                  </button>

                  {/* Informações verificadas */}
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <h3 className="text-xs font-semibold text-slate-600 mb-3">
                      Informações verificadas
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-xs text-slate-700">E-mail</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-xs text-slate-700">Telefone</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dicas de segurança - Desktop */}
                <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert size={20} className="text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Dicas de segurança
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Não faça pagamentos antes de verificar o que está sendo anunciado.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Fique atento com excessos de facilidades e preços abaixo do mercado.
                      </p>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2.5 px-4 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-red-200">
                    <Flag size={16} />
                    Denunciar anúncio
                  </button>
                </div>
                </div>
              </div>
            </div>

            {/* Mobile - Seções que aparecem abaixo no mobile */}
            <div className="lg:hidden px-4 space-y-4 mt-4">
              {/* Características - Mobile */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
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
                          {item.details?.year}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                        <Gauge size={24} className="text-blue-500 mb-2" />
                        <span className="text-xs text-slate-500 mb-1">KM</span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.details?.km}
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
                          {item.details?.fuel}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                        <Bed size={24} className="text-blue-500 mb-2" />
                        <span className="text-xs text-slate-500 mb-1">Quartos</span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.details?.bedrooms || item.details?.beds || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                        <Bath size={24} className="text-blue-500 mb-2" />
                        <span className="text-xs text-slate-500 mb-1">
                          Banheiros
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.details?.bathrooms || item.details?.baths || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
                        <div className="w-6 h-6 border-2 border-blue-500 rounded flex items-center justify-center text-[10px] font-bold text-blue-500 mb-2">
                          M²
                        </div>
                        <span className="text-xs text-slate-500 mb-1">Área</span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.details?.area}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Descrição - Mobile */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Descrição</h2>
                <p className="text-slate-600 leading-relaxed">
                  {item.description ||
                    "Este é um excelente anúncio. Entre em contato para mais informações!"}
                </p>
              </div>

              {/* Localização - Mobile */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Localização
                </h2>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin size={20} className="text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900 mb-1">
                      {formatLocation(item.location)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Veja a localização exata do imóvel/veículo
                    </p>
                  </div>
                </div>
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatLocation(item.location))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MapPin size={18} />
                  Ver no Google Maps
                </a>
              </div>

              {/* Vendedor e Contato - Mobile */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Sobre o anunciante
                </h2>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <User size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-900 mb-1">
                      {item?.users?.name || 'Usuário BW1'}
                    </p>
                    {item?.users?.email && (
                      <p className="text-xs text-slate-500">
                        {item.users.email}
                      </p>
                    )}
                  </div>
                </div>

                <button className="w-full py-3 px-4 border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-900 rounded-xl font-semibold text-sm transition-all mb-6">
                  Acessar perfil do anunciante
                </button>

                {/* Informações verificadas */}
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Informações verificadas
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="text-sm text-slate-700">E-mail</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="text-sm text-slate-700">Telefone</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dicas de segurança - Mobile */}
              <div className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert size={22} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Dicas de segurança
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Não faça pagamentos antes de verificar o que está sendo anunciado.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Fique atento com excessos de facilidades e preços abaixo do mercado.
                    </p>
                  </div>
                </div>

                <button className="w-full mt-4 py-3 px-4 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-red-200">
                  <Flag size={18} />
                  Denunciar anúncio
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer brand={BRAND} footer={FOOTER} />

        <BottomNav />
      </AppShell>
    </div>
  );
}
