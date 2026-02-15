import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Calendar,
  Gauge,
  Bed,
  Bath,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

const CAROUSEL_INTERVAL_MS = 2500;

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=1400&q=80";

const WHATS_LOGO_SRC = "/whats-logo.png";

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
  
  // Se for qualquer outra coisa, tenta converter para string
  return String(location);
}

function formatPrice(price) {
  if (!price) return "—";
  
  // Se já é uma string formatada, retorna
  if (typeof price === "string" && price.includes("R$")) return price;
  
  // Se é número, formata
  const num = typeof price === "number" ? price : parseFloat(price);
  if (isNaN(num)) return price;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function FlagChip({ text }) {
  if (!text) return null;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold
                 bg-amber-50 text-amber-800 border border-amber-200"
      title={text}
    >
      {text}
    </span>
  );
}

function TagChip({ tag }) {
  const t = tag || "—";
  const tagLower = String(t).toLowerCase().trim();
  const isVenda = tagLower === "venda" || tagLower.includes("venda");
  const cls = isVenda
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${cls}`}
      title={t}
    >
      {t}
    </span>
  );
}

function ListingCard({ item, onViewMore }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const images = useMemo(() => normalizeImages(item), [item]);
  const imagesKey = images.join("||");

  const [imgIndex, setImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const isSwipingRef = useRef(false);

  useEffect(() => {
    setImgIndex(0);
  }, [item?.id, imagesKey]);

  useEffect(() => {
    // Verificar se está nos favoritos
    const saved = localStorage.getItem("bw1-favorites");
    if (saved) {
      const favorites = JSON.parse(saved);
      setIsFavorite(favorites.includes(item.id));
    }
  }, [item.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const saved = localStorage.getItem("bw1-favorites");
    let favorites = saved ? JSON.parse(saved) : [];
    
    const wasFavorite = favorites.includes(item.id);

    if (wasFavorite) {
      favorites = favorites.filter((id) => id !== item.id);
      setIsFavorite(false);
    } else {
      favorites.push(item.id);
      setIsFavorite(true);
    }
    
    localStorage.setItem("bw1-favorites", JSON.stringify(favorites));

    if (isAuthenticated) {
      try {
        if (wasFavorite) {
          await api.removeFavorite(item.id);
        } else {
          await api.addFavorite(item.id);
        }
      } catch (error) {
        console.error("Erro ao sincronizar favorito:", error);
      }
    }
  };

  const startChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const receiverId = item?.user_id;
    if (!receiverId || receiverId === user?.id) {
      navigate(`/anuncio/${item.id}`);
      return;
    }

    try {
      const response = await api.createConversation({
        listingId: item.id,
        receiverId,
      });

      if (response?.conversation?.id) {
        navigate(`/chat/${response.conversation.id}`);
      } else {
        navigate("/chat");
      }
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error);
      navigate(`/anuncio/${item.id}`);
    }
  };

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
        // Swipe left - próxima imagem
        setImgIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe right - imagem anterior
        setImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }

    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
    touchEndXRef.current = 0;
    touchEndYRef.current = 0;
    isSwipingRef.current = false;
  };

  const currentImg = images[imgIndex] || PLACEHOLDER_IMG;

  const createdAtLabel = item?.created_at
    ? `Publicado em ${formatDateBR(item.created_at)}`
    : "";

  // Venda/Aluguel
  const tag = item?.dealType || item?.tag || "—";
  const tagLower = String(tag).toLowerCase().trim();
  const isVenda = tagLower === "venda" || tagLower.includes("venda");
  const tagClass = isVenda ? "bg-green-600" : "bg-blue-600";

  // WhatsApp
  const rawWhatsFromItem = extractWhats(item);
  const rawWhats = rawWhatsFromItem;
  const waDigits = normalizeWhatsapp(rawWhats);
  const hasWhats = Boolean(waDigits);

  const waMsg = encodeURIComponent(
    `Olá! Vi seu anúncio na BW1 e tenho interesse em: ${item.title} (${item.price}) - ${formatLocation(item.location)}.`
  );
  const waLink = hasWhats ? `https://wa.me/${waDigits}?text=${waMsg}` : "#";

  const [showWhatsLogo, setShowWhatsLogo] = useState(true);

  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col relative">
      {/* Image */}
      <Link to={`/anuncio/${item.id}`} className="block">
        <div 
          className="relative h-64 overflow-hidden cursor-pointer rounded-t-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentImg}
            alt={item.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMG;
            }}
          />

        {/* ✅ Tag no topo esquerdo */}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-sm ${tagClass}`}
          >
            {tag}
          </span>
        </div>

        {/* Heart */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleFavorite}
            className={`p-2 backdrop-blur-md rounded-full transition-colors ${
              isFavorite 
                ? "bg-white text-red-500" 
                : "bg-white/20 text-white hover:bg-white hover:text-red-500"
            }`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Botões de navegação */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setImgIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="flex absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-900 hover:bg-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setImgIndex((prev) => (prev + 1) % images.length);
              }}
              className="flex absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-900 hover:bg-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Carousel Dots + Counter */}
        {images.length > 1 && (
          <>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIndex ? "w-6 bg-white/90" : "w-2.5 bg-white/50"
                    }`}
                    aria-label={`Imagem ${i + 1}`}
                    title={`Imagem ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-3 right-3 text-[11px] px-2 py-1 rounded-full bg-black/30 text-white backdrop-blur">
              {imgIndex + 1}/{images.length}
            </div>
          </>
        )}
        </div>
      </Link>

      {/* Badges de Destaque - Fora da imagem, embaixo */}
      {(item.badge === "destaque" || item.badge === "super-destaque") && (
        <div className="w-full">
          {item.badge === "destaque" && (
            <div className="w-full py-2 px-4 bg-blue-600 text-white text-center text-xs font-bold uppercase tracking-wide">
              ⭐ DESTAQUE
            </div>
          )}
          
          {item.badge === "super-destaque" && (
            <div className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center text-xs font-bold uppercase tracking-wide">
              ⭐ SUPER DESTAQUE
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* ✅ Preço + chips (tag venda/aluguel + flag extra) */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-slate-900 text-2xl font-extrabold leading-none">
            {formatPrice(item.price)}
          </p>

          <div className="flex items-center gap-2">
            {/* ✅ Venda/Aluguel ao lado do preço */}
            <TagChip tag={tag} />
            {/* Flag extra opcional */}
            <FlagChip text={item?.flag} />
          </div>
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900 line-clamp-1">
          {item.title}
        </h3>

        {/* Cidade + Data - Updated 2026-02-07 */}
        <div className="mt-2 mb-4">
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin size={14} className="mr-1" />
            <span>{formatLocation(item.location)}</span>
          </div>

          {createdAtLabel && (
            <div className="text-xs text-slate-400 mt-1">{createdAtLabel}</div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-100 mb-4">
          {item.type === "vehicle" ? (
            <>
              <div className="text-center">
                <Calendar size={18} className="mx-auto mb-1 text-blue-500" />
                <span className="text-xs text-slate-600 font-medium">
                  {item.details?.year || "—"}
                </span>
              </div>
              <div className="text-center border-l border-slate-100">
                <Gauge size={18} className="mx-auto mb-1 text-blue-500" />
                <span className="text-xs text-slate-600 font-medium">
                  {item.details?.km ? `${item.details.km} km` : "—"}
                </span>
              </div>
              <div className="text-center border-l border-slate-100">
                <div className="w-4 h-4 mx-auto mb-1 rounded-full border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-500">
                  F
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {item.details?.fuel || "—"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <Bed size={18} className="mx-auto mb-1 text-blue-500" />
                <span className="text-xs text-slate-600 font-medium">
                  {item.details?.bedrooms || item.details?.beds || 0} Quartos
                </span>
              </div>
              <div className="text-center border-l border-slate-100">
                <Bath size={18} className="mx-auto mb-1 text-blue-500" />
                <span className="text-xs text-slate-600 font-medium">
                  {item.details?.bathrooms || item.details?.baths || 0} Banheiros
                </span>
              </div>
              <div className="text-center border-l border-slate-100">
                <div className="w-4 h-4 mx-auto mb-1 border-2 border-blue-500 rounded flex items-center justify-center text-[8px]">
                  M²
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {item.details?.area || "—"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          {/* CONTATAR / CHAT */}
          {hasWhats ? (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE57] text-white shadow-sm hover:shadow-md"
              title="Chamar no WhatsApp"
            >
              {showWhatsLogo && (
                <img
                  src={WHATS_LOGO_SRC}
                  alt="WhatsApp"
                  className="w-[18px] h-[18px] object-contain"
                  onError={() => setShowWhatsLogo(false)}
                />
              )}
              Contatar
            </a>
          ) : (
            <button
              onClick={startChat}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
              title="Iniciar conversa no chat"
            >
              <MessageCircle size={18} />
              Chat
            </button>
          )}

          {/* VER MAIS */}
          <Link
            to={`/anuncio/${item.id}`}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                       bg-gradient-to-r from-blue-600 to-indigo-700
                       hover:from-blue-700 hover:to-indigo-800
                       shadow-sm hover:shadow-md transition-all
                       flex items-center justify-center gap-2"
          >
            Ver mais <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ListingCard);
