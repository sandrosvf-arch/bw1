import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, MapPin, DollarSign, Image as ImageIcon } from "lucide-react";

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

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Categoria, 2: Detalhes, 3: Fotos
  const [formData, setFormData] = useState({
    type: "", // vehicle ou property
    category: "",
    title: "",
    description: "",
    price: "",
    dealType: "Venda",
    country: "Brasil",
    state: "",
    city: "",
    whatsapp: "",
    // Veículos
    year: "",
    km: "",
    fuel: "",
    bodyType: "", // Tipo de carroceria
    transmission: "", // Câmbio
    color: "", // Cor
    doors: "", // Número de portas
    // Imóveis
    beds: "",
    baths: "",
    area: "",
    parkingSpaces: "", // Vagas de garagem
    acceptsPets: "", // Aceita pet
    furnished: "", // Mobiliado
    floor: "", // Andar
  });
  const [images, setImages] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Gera o campo location automaticamente baseado na hierarquia
    const location = formData.city && formData.state 
      ? `${formData.city}, ${formData.state}`
      : formData.state || formData.city || "Brasil";
    
    // Cria o objeto de anúncio com location gerado
    const listingData = {
      ...formData,
      location, // location gerado automaticamente
      images,
    };
    
    console.log("Dados do anúncio:", listingData);
    
    // Aqui você implementaria o envio real para o backend
    alert("Anúncio criado com sucesso!\n\nLocalização: " + location);
    navigate("/meus-anuncios");
  };

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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 pb-28 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Anunciar gratuitamente
            </h1>
            <p className="text-slate-600 mt-2">
              Preencha os dados do seu anúncio para começar a vender
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 ${
                  step >= 1 ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200"
                  }`}
                >
                  1
                </div>
                <span className="font-semibold hidden sm:inline">Categoria</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200"></div>
              <div
                className={`flex items-center gap-2 ${
                  step >= 2 ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200"
                  }`}
                >
                  2
                </div>
                <span className="font-semibold hidden sm:inline">Detalhes</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200"></div>
              <div
                className={`flex items-center gap-2 ${
                  step >= 3 ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 3 ? "bg-blue-600 text-white" : "bg-slate-200"
                  }`}
                >
                  3
                </div>
                <span className="font-semibold hidden sm:inline">Fotos</span>
              </div>
            </div>
          </div>

          {/* Step 1: Categoria */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                O que você está anunciando?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    handleInputChange("type", "vehicle");
                    setStep(2);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-4xl mb-3">🚗</div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600">
                    Veículo
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Carros, motos, caminhões...
                  </p>
                </button>

                <button
                  onClick={() => {
                    handleInputChange("type", "property");
                    setStep(2);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                >
                  <div className="text-4xl mb-3">🏠</div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600">
                    Imóvel
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Casas, apartamentos, terrenos...
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Detalhes */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Dados do anúncio
              </h2>

              <div className="space-y-6">
                {/* Categoria específica */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    {formData.type === "vehicle" ? (
                      <>
                        <option value="carro">Carro</option>
                        <option value="moto">Moto</option>
                        <option value="caminhao">Caminhão</option>
                        <option value="van">Van</option>
                        <option value="pickup">Pickup</option>
                      </>
                    ) : (
                      <>
                        <option value="apartamento">Apartamento</option>
                        <option value="casa">Casa</option>
                        <option value="terreno">Terreno</option>
                        <option value="comercial">Comércio/Loja</option>
                        <option value="sitio">Sítio</option>
                        <option value="fazenda">Fazenda</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Título do anúncio *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Honda Civic 2020 automático"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descreva seu item..."
                    rows="5"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>

                {/* Tipo de negócio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de negócio *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("dealType", "Venda")}
                      className={`py-3 px-4 rounded-xl font-semibold transition ${
                        formData.dealType === "Venda"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("dealType", "Aluguel")}
                      className={`py-3 px-4 rounded-xl font-semibold transition ${
                        formData.dealType === "Aluguel"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Aluguel
                    </button>
                  </div>
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Preço *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="R$ 50.000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Campos específicos para veículos */}
                {formData.type === "vehicle" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Ano *
                        </label>
                        <input
                          type="number"
                          value={formData.year}
                          onChange={(e) => handleInputChange("year", e.target.value)}
                          placeholder="2020"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          KM *
                        </label>
                        <input
                          type="text"
                          value={formData.km}
                          onChange={(e) => handleInputChange("km", e.target.value)}
                          placeholder="50.000 km"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Combustível *
                        </label>
                        <select
                          value={formData.fuel}
                          onChange={(e) => handleInputChange("fuel", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="Flex">Flex</option>
                          <option value="Gasolina">Gasolina</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Elétrico">Elétrico</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Tipo de Carroceria */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tipo de Carroceria
                      </label>
                      <select
                        value={formData.bodyType}
                        onChange={(e) => handleInputChange("bodyType", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione (opcional)</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatch">Hatch</option>
                        <option value="SUV">SUV</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Van">Van</option>
                        <option value="Caminhonete">Caminhonete</option>
                        <option value="Conversível">Conversível</option>
                        <option value="Coupé">Coupé</option>
                        <option value="Minivan">Minivan</option>
                      </select>
                    </div>
                    
                    {/* Campos adicionais em grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Câmbio */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Câmbio *
                        </label>
                        <select
                          value={formData.transmission}
                          onChange={(e) => handleInputChange("transmission", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="Manual">Manual</option>
                          <option value="Automático">Automático</option>
                          <option value="Automatizado">Automatizado (CVT)</option>
                        </select>
                      </div>
                      
                      {/* Cor */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Cor *
                        </label>
                        <select
                          value={formData.color}
                          onChange={(e) => handleInputChange("color", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="Branco">Branco</option>
                          <option value="Preto">Preto</option>
                          <option value="Prata">Prata</option>
                          <option value="Cinza">Cinza</option>
                          <option value="Vermelho">Vermelho</option>
                          <option value="Azul">Azul</option>
                          <option value="Verde">Verde</option>
                          <option value="Amarelo">Amarelo</option>
                          <option value="Bege">Bege</option>
                          <option value="Marrom">Marrom</option>
                          <option value="Laranja">Laranja</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      
                      {/* Número de Portas */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Portas
                        </label>
                        <select
                          value={formData.doors}
                          onChange={(e) => handleInputChange("doors", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione (opcional)</option>
                          <option value="2">2 portas</option>
                          <option value="4">4 portas</option>
                          <option value="5">5 portas</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Campos específicos para imóveis */}
                {formData.type === "property" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Quartos
                        </label>
                        <input
                          type="number"
                          value={formData.beds}
                          onChange={(e) => handleInputChange("beds", e.target.value)}
                          placeholder="3"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Banheiros
                        </label>
                        <input
                          type="number"
                          value={formData.baths}
                          onChange={(e) => handleInputChange("baths", e.target.value)}
                          placeholder="2"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Área (m²)
                        </label>
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) => handleInputChange("area", e.target.value)}
                          placeholder="120 m²"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Novos campos essenciais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Vagas de Garagem */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Vagas de Garagem
                        </label>
                        <select
                          value={formData.parkingSpaces}
                          onChange={(e) => handleInputChange("parkingSpaces", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione (opcional)</option>
                          <option value="0">Sem vaga</option>
                          <option value="1">1 vaga</option>
                          <option value="2">2 vagas</option>
                          <option value="3">3 vagas</option>
                          <option value="4">4+ vagas</option>
                        </select>
                      </div>
                      
                      {/* Aceita Pet */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Aceita Pet
                        </label>
                        <select
                          value={formData.acceptsPets}
                          onChange={(e) => handleInputChange("acceptsPets", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione (opcional)</option>
                          <option value="yes">Sim</option>
                          <option value="no">Não</option>
                          <option value="negotiate">A negociar</option>
                        </select>
                      </div>
                      
                      {/* Mobiliado */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Mobiliado
                        </label>
                        <select
                          value={formData.furnished}
                          onChange={(e) => handleInputChange("furnished", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione (opcional)</option>
                          <option value="yes">Sim, mobiliado</option>
                          <option value="semi">Semi-mobiliado</option>
                          <option value="no">Não mobiliado</option>
                        </select>
                      </div>
                      
                      {/* Andar */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Andar/Posição
                        </label>
                        <select
                          value={formData.floor}
                          onChange={(e) => handleInputChange("floor", e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione (opcional)</option>
                          <option value="terreo">Térreo</option>
                          <option value="baixo">Baixo (1-5)</option>
                          <option value="medio">Médio (6-10)</option>
                          <option value="alto">Alto (11+)</option>
                          <option value="cobertura">Cobertura</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Localização Hierárquica */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <MapPin size={16} className="inline mr-1" />
                    Localização *
                  </label>
                  <div className="space-y-3">
                    {/* País */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">País</label>
                      <input
                        type="text"
                        value={formData.country}
                        disabled
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 cursor-not-allowed text-slate-600"
                      />
                    </div>
                    {/* Estado */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Estado *</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Ex: Paraná, São Paulo, Rio de Janeiro"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    {/* Cidade */}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Cidade *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Ex: Curitiba, São Paulo, Rio de Janeiro"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 A localização completa será: {formData.city ? `${formData.city}, ` : ""}{formData.state || "[Estado]"}
                  </p>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Fotos */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Adicionar fotos
              </h2>

              {/* Upload de imagens */}
              <div className="mb-6">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                    <ImageIcon size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600 font-semibold mb-2">
                      Clique para adicionar fotos
                    </p>
                    <p className="text-sm text-slate-500">
                      Adicione até 10 fotos (PNG, JPG até 5MB cada)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview das imagens */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                          Capa
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Botões finais */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transition shadow-lg"
                >
                  Publicar anúncio
                </button>
              </div>
            </div>
          )}

          <Footer brand={BRAND} footer={FOOTER} />
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
