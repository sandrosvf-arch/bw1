import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bath,
  Bed,
  Bot,
  Calendar,
  Car,
  ChevronRight,
  Filter,
  Gauge,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  Send,
  Star,
  X,
} from 'lucide-react';

// Logo: no preview usamos texto (no seu projeto real, você pode voltar a usar a imagem local)

/**
 * Pequeno helper puro para facilitar testes.
 */
export function filterListings(listings, activeTab, searchTerm, dealType) {
    const term = String(searchTerm || '').toLowerCase();
  const deal = String(dealType || 'all');
  return (listings || []).filter((item) => {
    const matchesTab =
      activeTab === 'all' ||
      item.type === (activeTab === 'vehicles' ? 'vehicle' : 'property');

    const matchesSearch =
      !term ||
      String(item.title || '').toLowerCase().includes(term) ||
      String(item.location || '').toLowerCase().includes(term);

        const matchesDeal = deal === 'all' || String(item.tag || '') === deal;
    return matchesTab && matchesSearch && matchesDeal;
  });
}

function runDevSelfTests() {
  // Rodar apenas em dev (sem quebrar produção/preview).
  // Guard extra pra ambientes sem import.meta.
  const isDev =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.DEV || import.meta.env.MODE === 'development');

  if (!isDev) return;

    const sample = [
    { type: 'vehicle', title: 'BMW', location: 'Curitiba', tag: 'Venda' },
    { type: 'property', title: 'Casa', location: 'SP', tag: 'Aluguel' },
    { type: 'vehicle', title: 'Audi', location: 'SP', tag: 'Aluguel' },
  ];

    console.assert(filterListings(sample, 'all', '', 'all').length === 3, 'Test: all + empty');
    console.assert(filterListings(sample, 'vehicles', '', 'all').length === 2, 'Test: vehicles');
    console.assert(filterListings(sample, 'properties', '', 'all').length === 1, 'Test: properties');
    console.assert(filterListings(sample, 'all', 'curi', 'all').length === 1, 'Test: search term');
  console.assert(filterListings(sample, 'all', '', 'Venda').length === 1, 'Test: deal Venda');
  console.assert(filterListings(sample, 'vehicles', '', 'Aluguel').length === 1, 'Test: deal Aluguel + vehicles');
}

const BW1Platform = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'vehicles', 'properties'
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dealType, setDealType] = useState('all'); // 'all' | 'Venda' | 'Aluguel'
  const [searchTerm, setSearchTerm] = useState('');

  // Header transparency on scroll
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- GEMINI API STATE & LOGIC ---
  const apiKey = ''; // injetado no runtime
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'system',
      text: 'Olá! Sou o consultor virtual da BW1. Como posso ajudar você a encontrar seu próximo sonho hoje?',
    },
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  useEffect(() => {
    runDevSelfTests();
  }, []);

  const callGemini = async (prompt) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (!response.ok) throw new Error('Falha na API');
      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Desculpe, não consegui processar sua solicitação no momento.'
      );
    } catch (error) {
      console.error('Erro Gemini:', error);
      return 'Estou tendo dificuldades técnicas. Tente novamente em instantes.';
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const prompt = `Você é um consultor de vendas de luxo da BW1, uma plataforma premium de carros e imóveis. O usuário disse: "${userMsg}". Responda de forma curta, elegante, prestativa e persuasiva em português. Mantenha um tom profissional e sofisticado.`;
    const reply = await callGemini(prompt);

    setMessages((prev) => [...prev, { role: 'system', text: reply }]);
    setIsTyping(false);
  };

  // Mock Data
  const listings = useMemo(
    () => [
      {
        id: 1,
        type: 'vehicle',
        title: 'BMW 320i M Sport',
        price: 'R$ 289.900',
        location: 'Curitiba, PR',
        image:
          'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=800',
        details: { year: '2023', km: '12.000 km', fuel: 'Flex' },
        tag: 'Venda',
      },
      {
        id: 2,
        type: 'property',
        title: 'Apartamento Alto Padrão',
        price: 'R$ 1.250.000',
        location: 'Balneário Camboriú, SC',
        image:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
        details: { beds: 3, baths: 2, area: '145m²' },
        tag: 'Venda',
      },
      {
        id: 3,
        type: 'vehicle',
        title: 'Porsche Macan T',
        price: 'R$ 650.000',
        location: 'São Paulo, SP',
        image:
          'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800',
        details: { year: '2022', km: '8.500 km', fuel: 'Gasolina' },
        tag: 'Aluguel',
      },
      {
        id: 4,
        type: 'property',
        title: 'Casa em Condomínio',
        price: 'R$ 15.000/mês',
        location: 'Alphaville, SP',
        image:
          'https://images.unsplash.com/photo-1600596542815-2a4d04774c13?auto=format&fit=crop&q=80&w=800',
        details: { beds: 4, baths: 5, area: '450m²' },
        tag: 'Aluguel',
      },
      {
        id: 5,
        type: 'vehicle',
        title: 'Toyota Hilux GR-S',
        price: 'R$ 340.000',
        location: 'Goiânia, GO',
        image:
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
        details: { year: '2024', km: '0 km', fuel: 'Diesel' },
        tag: 'Venda',
      },
      {
        id: 6,
        type: 'property',
        title: 'Loft Moderno Centro',
        price: 'R$ 3.800/mês',
        location: 'Florianópolis, SC',
        image:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        details: { beds: 1, baths: 1, area: '55m²' },
        tag: 'Aluguel',
      },
    ],
    []
  );

    const filteredListings = useMemo(
    () => filterListings(listings, activeTab, searchTerm, dealType),
    [listings, activeTab, searchTerm, dealType]
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-xl overflow-hidden bg-white border border-slate-200 px-3 py-2">
                <div className="h-[40px] md:h-[45px] flex items-center">
                  <span className="text-slate-900 font-extrabold tracking-tight text-xl md:text-2xl">
                    BW1
                  </span>
                  <span className="ml-2 text-[10px] md:text-xs font-semibold text-slate-500">
                    Premium
                  </span>
                </div>
              </div>

              <span className="hidden md:block text-sm text-slate-500 border-l border-slate-200 pl-3">
                Carros &amp; Imóveis
              </span>
            </div>

            {/* Mobile (mesma linha da logo) */}
            <div className="md:hidden flex items-center gap-2 shrink-0">
              <button className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200">
                Comprar
              </button>
              <button className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200">
                Vender
              </button>
              <button className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200">
                Alugar
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-1 p-2 rounded-xl text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
              >
                Comprar
              </a>
              <a
                href="#"
                className="text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
              >
                Alugar
              </a>
              <a
                href="#"
                className="text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
              >
                Vender
              </a>

              <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-semibold transition-colors">
                Entrar
              </button>
            </div>
          </div>

          {/* Mobile dropdown extra */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-3">
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200">
                    Anunciar
                  </button>
                  <button className="py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800">
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/85 to-slate-50" />
        <div className="absolute -top-24 right-[-120px] w-[420px] h-[420px] bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -top-40 left-[-120px] w-[380px] h-[380px] bg-indigo-500/15 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[15px] md:pt-[40px] pb-16 sm:pb-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              <span className="block">Seu próximo sonho</span>
              <span className="block text-blue-400">está na BW1</span>
            </h1>
            <p className="mt-3 sm:mt-4 max-w-3xl mx-auto text-base sm:text-lg text-white/70">
              Carros e imóveis com curadoria e atendimento inteligente.
            </p>

            {/* Search */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-12 py-4 rounded-2xl bg-white/95 shadow-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-sm"
                  placeholder="Busque por modelo, cidade ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsFiltersOpen((v) => !v)}
                    className={`bg-slate-100 p-2 rounded-xl text-slate-500 hover:bg-slate-200 ${isFiltersOpen ? 'ring-2 ring-blue-500' : ''}`}
                    aria-label="Abrir filtros"
                  >
                    <Filter size={18} />
                  </button>
                </div>
              </div>
            </div>

                        {/* Tabs */}
            <div className="mt-6 flex justify-center">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl inline-flex items-center">
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'vehicles'
                      ? 'bg-blue-500 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Car size={16} /> Carros
                </button>

                <div className="w-px bg-white/15 my-1 mx-1" />

                <button
                  onClick={() => setActiveTab('properties')}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'properties'
                      ? 'bg-emerald-500 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Home size={16} /> Imóveis
                </button>

                <div className="hidden sm:block w-px bg-white/15 my-1 mx-1" />

                <button
                  onClick={() => setActiveTab('all')}
                  className={`hidden sm:flex px-5 py-2 rounded-xl text-sm font-semibold transition-all items-center ${
                    activeTab === 'all'
                      ? 'bg-violet-500 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="mt-4 flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDealType('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                    dealType === 'all'
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setDealType('Venda')}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                    dealType === 'Venda'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                  }`}
                >
                  Venda
                </button>
                <button
                  type="button"
                  onClick={() => setDealType('Aluguel')}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                    dealType === 'Aluguel'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                  }`}
                >
                  Aluguel
                </button>
              </div>
            </div>

            {/* Painel de filtros (toggle) */}
            {isFiltersOpen && (
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-bold text-sm">Filtros</div>
                    <button
                      type="button"
                      onClick={() => setIsFiltersOpen(false)}
                      className="text-white/70 hover:text-white"
                      aria-label="Fechar filtros"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                      <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wide mb-2">
                        Tipo de negócio
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'Venda', 'Aluguel'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setDealType(opt)}
                            className={`px-3 py-2 rounded-full text-xs font-bold border transition-colors ${
                              dealType === opt
                                ? 'bg-white text-slate-900 border-white'
                                : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                            }`}
                          >
                            {opt === 'all' ? 'Todos' : opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                      <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wide mb-2">
                        Dica de busca
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        Busque por <b className="text-white">cidade</b>, <b className="text-white">modelo</b> ou <b className="text-white">bairro</b>.
                        Ex: “Curitiba SUV” ou “Alphaville casa”.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDealType('all');
                        setActiveTab('all');
                        setSearchTerm('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white/80 border border-white/15 hover:bg-white/10"
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFiltersOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-white/90"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10 pb-20">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-sm ${
                      item.tag === 'Venda' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                    <Star size={16} />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/45 to-transparent" />
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                  {item.title}
                </h3>

                <div className="flex items-center text-slate-500 text-sm mt-2">
                  <MapPin size={14} className="mr-1" />
                  {item.location}
                </div>

                {/* Preço */}
                <div className="mt-4">
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-1 flex items-center justify-between">
                      <span>{item.tag}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                        item.tag === 'Venda' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {item.price}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-100 mt-4">
                  {item.type === 'vehicle' ? (
                    <>
                      <div className="text-center">
                        <Calendar
                          size={18}
                          className="mx-auto mb-1 text-blue-500"
                        />
                        <span className="text-xs text-slate-600 font-medium">
                          {item.details.year}
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <Gauge size={18} className="mx-auto mb-1 text-blue-500" />
                        <span className="text-xs text-slate-600 font-medium">
                          {item.details.km}
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <div className="w-4 h-4 mx-auto mb-1 rounded-full border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-500">
                          F
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          {item.details.fuel}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <Bed size={18} className="mx-auto mb-1 text-blue-500" />
                        <span className="text-xs text-slate-600 font-medium">
                          {item.details.beds} Quartos
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <Bath size={18} className="mx-auto mb-1 text-blue-500" />
                        <span className="text-xs text-slate-600 font-medium">
                          {item.details.baths} Banheiros
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <div className="w-4 h-4 mx-auto mb-1 border-2 border-blue-500 rounded flex items-center justify-center text-[8px]">
                          M²
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          {item.details.area}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom actions */}
                <div className="mt-auto pt-4 flex gap-2">
                  <button className="flex-1 bg-emerald-600 text-white py-2.5 rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Contato
                  </button>

                  <button className="flex-1 bg-slate-900 text-white py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    Ver mais <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm mt-10">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              Nenhum resultado encontrado
            </h3>
            <p className="text-slate-500">
              Tente ajustar seus termos de busca ou filtros.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">
                Quer vender seu carro ou imóvel?
              </h2>
              <p className="text-blue-100 max-w-xl text-lg">
                Anuncie na BW1 e alcance milhares de compradores qualificados hoje
                mesmo.
              </p>
            </div>
            <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-extrabold text-lg hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap">
              Anunciar Agora
            </button>
          </div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
      </main>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-1.5 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Consultor BW1 ✨</h3>
                  <p className="text-[10px] text-slate-300">Sempre online</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleChatSubmit}
              className="p-3 bg-white border-t border-slate-100 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ex: Procuro um SUV seguro..."
                className="flex-1 bg-slate-100 text-slate-800 text-sm px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isTyping || !chatInput.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-slate-900/30 transition-all duration-300 hover:scale-105"
          aria-label={isChatOpen ? 'Fechar chat' : 'Abrir chat'}
        >
          {isChatOpen ? <X size={24} /> : <Bot size={24} />}
        </button>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-white tracking-tighter">
                BW1
              </span>
              <p className="mt-4 text-sm">
                Conectando você aos melhores veículos e imóveis do mercado com
                segurança e transparência.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Veículos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Carros Esportivos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    SUVs de Luxo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blindados
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Imóveis</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Apartamentos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Casas em Condomínio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Coberturas
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>contato@bw1.com.br</li>
                <li>0800 123 4567</li>
                <li className="flex gap-4 mt-4">
                  <a
                    href="#"
                    className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    IG
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    FB
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    LN
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
            &copy; 2024 BW1 Platform. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BW1Platform;
