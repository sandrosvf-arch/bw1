import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  ExternalLink,
  Plus,
  Eye,
  Share2,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  Image as ImageIcon,
  MessageCircle,
  Home,
  List,
  Sparkles,
  ChevronRight,
} from "lucide-react";

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

export default function ListingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  // Dados vindos da página anterior
  const { listingData, listingId } = location.state || {};

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Parar confetti após uns segundos
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Se não tiver dados, redirecionar
  useEffect(() => {
    if (!listingData) {
      navigate("/", { replace: true });
    }
  }, [listingData, navigate]);

  const handleViewListing = () => {
    if (listingId) {
      navigate(`/anuncio/${listingId}`);
    } else {
      if (listingData?.type === "vehicle") {
        navigate("/veiculos");
      } else {
        navigate("/imoveis");
      }
    }
  };

  const handleCreateAnother = () => {
    navigate("/criar-anuncio");
  };

  const handleGoToMyListings = () => {
    navigate("/meus-anuncios");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleBrowseCategory = () => {
    if (listingData?.type === "vehicle") {
      navigate("/veiculos");
    } else {
      navigate("/imoveis");
    }
  };

  // Formatar preço
  const formatPrice = (price) => {
    if (!price) return "—";
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Traduzir tipo de negócio
  const dealTypeLabel = (dt) => {
    if (dt === "Venda") return "Venda";
    if (dt === "Aluguel") return "Aluguel";
    return dt || "Venda";
  };

  // Traduzir tipo
  const typeLabel = (type) => {
    if (type === "vehicle") return "Veículo";
    if (type === "property") return "Imóvel";
    return type || "—";
  };

  if (!listingData) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AppShell
        header={
          <Navbar
            brand={BRAND}
            links={NAVIGATION?.links || []}
            cta={NAVIGATION?.cta}
          />
        }
      >
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-12">
          {/* Confetti / celebration background */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                    fontSize: `${12 + Math.random() * 16}px`,
                    opacity: 0.8,
                  }}
                >
                  {["🎉", "✨", "🎊", "⭐", "🥳"][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>
          )}

          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6 shadow-lg shadow-green-200/50">
              <CheckCircle2 className="text-green-600" size={56} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Anúncio publicado! 🎉
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Seu anúncio já está no ar e visível para milhares de compradores
            </p>
          </div>

          {/* Listing Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-slate-100">
            {/* Cover image if available */}
            {listingData.images && listingData.images.length > 0 && (
              <div className="relative h-48 sm:h-56 bg-slate-200">
                <img
                  src={listingData.images[0]}
                  alt={listingData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    Publicado agora
                  </span>
                  {listingData.images.length > 1 && (
                    <span className="px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <ImageIcon size={12} />
                      {listingData.images.length} fotos
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Info grid */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {listingData.title}
              </h2>
              {listingData.description && (
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {listingData.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Preço</p>
                    <p className="font-bold text-slate-900 text-sm">
                      {formatPrice(listingData.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Tag size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tipo</p>
                    <p className="font-bold text-slate-900 text-sm capitalize">
                      {dealTypeLabel(listingData.dealType)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Categoria</p>
                    <p className="font-bold text-slate-900 text-sm capitalize">
                      {listingData.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Localização</p>
                    <p className="font-bold text-slate-900 text-sm">
                      {listingData.location?.city || "—"}, {listingData.location?.state || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {listingData.type === "vehicle" ? (
                      <span className="text-lg">🚗</span>
                    ) : (
                      <span className="text-lg">🏠</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Seção</p>
                    <p className="font-bold text-slate-900 text-sm">
                      {typeLabel(listingData.type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="font-bold text-green-600 text-sm">Ativo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleViewListing}
              className="group flex items-center justify-center gap-3 py-4 px-6 
                       bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 
                       text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg"
            >
              <Eye size={22} className="group-hover:scale-110 transition-transform" />
              Ver meu anúncio
              <ChevronRight size={18} className="opacity-60" />
            </button>

            <button
              onClick={handleCreateAnother}
              className="group flex items-center justify-center gap-3 py-4 px-6 
                       bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 
                       text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg"
            >
              <Plus size={22} className="group-hover:scale-110 transition-transform" />
              Anunciar mais
              <ChevronRight size={18} className="opacity-60" />
            </button>
          </div>

          {/* Secondary Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <button
              onClick={handleGoToMyListings}
              className="flex flex-col items-center gap-2 py-4 px-3 
                       bg-white text-slate-700 hover:text-blue-600 rounded-xl
                       border border-slate-200 hover:border-blue-300
                       font-medium transition-all hover:shadow-md text-sm"
            >
              <List size={22} />
              Meus anúncios
            </button>
            <button
              onClick={handleBrowseCategory}
              className="flex flex-col items-center gap-2 py-4 px-3 
                       bg-white text-slate-700 hover:text-purple-600 rounded-xl
                       border border-slate-200 hover:border-purple-300
                       font-medium transition-all hover:shadow-md text-sm"
            >
              <ExternalLink size={22} />
              Ver {listingData?.type === "vehicle" ? "veículos" : "imóveis"}
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="flex flex-col items-center gap-2 py-4 px-3 
                       bg-white text-slate-700 hover:text-emerald-600 rounded-xl
                       border border-slate-200 hover:border-emerald-300
                       font-medium transition-all hover:shadow-md text-sm"
            >
              <MessageCircle size={22} />
              Mensagens
            </button>
            <button
              onClick={handleGoHome}
              className="flex flex-col items-center gap-2 py-4 px-3 
                       bg-white text-slate-700 hover:text-slate-900 rounded-xl
                       border border-slate-200 hover:border-slate-300
                       font-medium transition-all hover:shadow-md text-sm"
            >
              <Home size={22} />
              Início
            </button>
          </div>

          {/* What happens next */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              O que acontece agora?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Seu anúncio já está visível</p>
                  <p className="text-sm text-slate-600">
                    Compradores podem encontrá-lo nas buscas e na página de {listingData?.type === "vehicle" ? "veículos" : "imóveis"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Receba mensagens de interessados</p>
                  <p className="text-sm text-slate-600">
                    Quando alguém se interessar, você receberá uma mensagem no chat da plataforma
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Negocie e feche o negócio</p>
                  <p className="text-sm text-slate-600">
                    Combine os detalhes diretamente com o comprador pelo WhatsApp ou chat
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              💡 Dicas para vender mais rápido
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <span className="text-sm text-slate-700">Responda rapidamente às mensagens dos interessados</span>
              </div>
              <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <span className="text-sm text-slate-700">Mantenha suas fotos de alta qualidade e bem iluminadas</span>
              </div>
              <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <span className="text-sm text-slate-700">Atualize o preço regularmente para ficar competitivo</span>
              </div>
              <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
                <span className="text-green-500 text-lg mt-0.5">✓</span>
                <span className="text-sm text-slate-700">Seja transparente sobre o estado do produto</span>
              </div>
            </div>
          </div>

          {/* Diretrizes de Segurança - Vendedor */}
          <div className="bg-white rounded-2xl shadow-md border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Diretrizes de segurança para vendedores
                </h3>
                <p className="text-xs text-slate-500">Leia com atenção antes de negociar</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>⚠️ Importante:</strong> A BW1 é uma plataforma de anúncios que conecta compradores e vendedores. Não intermediamos, garantimos ou nos responsabilizamos por nenhuma transação realizada entre os usuários. Ao publicar seu anúncio, você concorda em seguir as diretrizes abaixo.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-green-500 mt-0.5 font-bold">✓</span>
                <p className="text-sm text-slate-700">
                  <strong>Sempre</strong> encontre o comprador em local público e movimentado para mostrar o produto.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-green-500 mt-0.5 font-bold">✓</span>
                <p className="text-sm text-slate-700">
                  <strong>Confirme</strong> o pagamento na sua conta antes de entregar o produto. Não confie em comprovantes de transferência — aguarde a confirmação real.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-green-500 mt-0.5 font-bold">✓</span>
                <p className="text-sm text-slate-700">
                  <strong>Formalize</strong> a transação com recibo, contrato ou termo de compra e venda assinado por ambas as partes.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <p className="text-sm text-slate-700">
                  <strong>Nunca</strong> envie o produto ou entregue documentos antes de receber o pagamento confirmado.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-red-500 mt-0.5 font-bold">✕</span>
                <p className="text-sm text-slate-700">
                  <strong>Desconfie</strong> de compradores que oferecem pagar mais que o preço pedido ou que pedem seus dados bancários por meios não convencionais.
                </p>
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Termo de responsabilidade:</strong> A BW1 atua exclusivamente como plataforma de conexão entre anunciantes e interessados. Não participamos, intermediamos ou garantimos nenhuma negociação. Golpes, fraudes ou prejuízos decorrentes de transações que não seguiram as diretrizes de segurança acima são de responsabilidade exclusiva dos usuários envolvidos. Ao utilizar a plataforma, você reconhece e aceita estes termos.
              </p>
            </div>
          </div>
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
