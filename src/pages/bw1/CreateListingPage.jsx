import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, MapPin, DollarSign, Image as ImageIcon, GripVertical, Star } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

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
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1); // 1: Categoria, 2: Detalhes, 3: Fotos
  const [loading, setLoading] = useState(false);
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Scroll para o topo quando mudar de step
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [step]);

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }
    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    setImages(newImages);
    handleDragEnd();
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setImages(newImages);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Formatação de preço em tempo real
  const handlePriceChange = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (numbers === '') {
      setFormData({ ...formData, price: '' });
      return;
    }
    
    // Converte para número e formata
    const numberValue = parseInt(numbers) / 100;
    const formatted = numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    setFormData({ ...formData, price: formatted });
  };

  // Converter imagem para base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Comprimir imagem para reduzir tamanho
  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar mantendo proporção
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Converter para base64 com compressão
          canvas.toBlob(
            (blob) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                resolve(reader.result);
              };
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    if (images.length + files.length > 10) {
      alert('Você pode adicionar no máximo 10 fotos.');
      return;
    }
    
    setUploadingImages(true);
    
    try {
      const newImages = [];
      
      for (const file of files) {
        // Verificar tamanho do arquivo (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`A imagem ${file.name} é muito grande. Máximo 5MB por imagem.`);
          continue;
        }
        
        // Verificar tipo
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} não é uma imagem válida.`);
          continue;
        }
        
        // Comprimir e converter para base64
        const compressed = await compressImage(file);
        newImages.push(compressed);
      }
      
      setImages([...images, ...newImages]);
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
      alert('Erro ao processar as imagens. Tente novamente.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Cole a URL da imagem (ex: https://exemplo.com/foto.jpg):");
    if (url && url.trim()) {
      setImages([...images, url.trim()]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Verificar autenticação
      if (!isAuthenticated) {
        alert("❌ Você precisa estar logado para criar um anúncio.\n\nFaça login ou crie uma conta para continuar.");
        navigate("/login");
        return;
      }

      // Validação básica
      if (!formData.title || !formData.price || !formData.category) {
        alert("Por favor, preencha todos os campos obrigatórios (título, preço e categoria).");
        setLoading(false);
        return;
      }

      if (!formData.state || !formData.city) {
        alert("Por favor, preencha o Estado e a Cidade.");
        setLoading(false);
        return;
      }

      // Validar imagens (aceita URLs http/https e base64)
      const validImages = images.filter(img => {
        // Aceita base64 (data:image/...)
        if (img.startsWith('data:image/')) {
          return true;
        }
        // Aceita URLs http/https válidas
        return img.startsWith('http://') || img.startsWith('https://');
      });

      // Monta o objeto location
      const location = {
        country: formData.country,
        state: formData.state,
        city: formData.city,
      };

      // Monta o objeto details dependendo do tipo
      const details = {};
      if (formData.type === "vehicle") {
        if (formData.year) details.year = String(formData.year);
        if (formData.km) details.km = formData.km;
        if (formData.fuel) details.fuel = formData.fuel;
        if (formData.bodyType) details.bodyType = formData.bodyType;
        if (formData.transmission) details.transmission = formData.transmission;
        if (formData.color) details.color = formData.color;
        if (formData.doors) details.doors = formData.doors;
      } else if (formData.type === "property") {
        if (formData.beds) details.beds = formData.beds;
        if (formData.baths) details.baths = formData.baths;
        if (formData.area) details.area = formData.area;
        if (formData.parkingSpaces) details.parkingSpaces = formData.parkingSpaces;
        if (formData.acceptsPets) details.acceptsPets = formData.acceptsPets;
        if (formData.furnished) details.furnished = formData.furnished;
        if (formData.floor) details.floor = formData.floor;
      }

      // Monta o objeto contact
      const contact = {
        whatsapp: formData.whatsapp,
      };

      // Converter preço formatado para número
      const priceNumber = formData.price.replace(/[^\d,]/g, '').replace(',', '.');

      // Prepara os dados para enviar ao backend
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: priceNumber, // Preço em formato numérico
        category: formData.category,
        type: formData.type,
        dealType: formData.dealType,
        location,
        images: validImages, // Apenas imagens válidas (URLs http/https ou base64)
        details,
        contact,
      };

      console.log("Enviando anúncio:", listingData);
      console.log("Imagens válidas:", validImages);
      console.log("Details:", details);

      // Envia para o backend
      const response = await api.createListing(listingData);

      console.log("Anúncio criado com sucesso:", response);

      // Navegar para a página de sucesso com dados do anúncio
      navigate("/anuncio-publicado", {
        state: {
          listingData: {
            title: formData.title,
            price: priceNumber,
            category: formData.category,
            type: formData.type,
            dealType: formData.dealType,
            location,
            images: validImages,
            description: formData.description,
          },
          listingId: response?.listing?.id || response?.id || response?.data?.id || null,
        },
      });
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      alert(`❌ Erro ao criar anúncio: ${error.message}\n\nVerifique se você está logado e tente novamente.`);
    } finally {
      setLoading(false);
    }
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
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
              <div className="w-12 h-0.5 bg-slate-200"></div>
              <div
                className={`flex items-center gap-2 ${
                  step >= 4 ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 4 ? "bg-blue-600 text-white" : "bg-slate-200"
                  }`}
                >
                  4
                </div>
                <span className="font-semibold hidden sm:inline">Planos</span>
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
                  <div className="text-4xl mb-3">&#128664;</div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600">
                    Veículo
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Carros, SUVs, Caminhonetes...
                  </p>
                </button>

                <button
                  onClick={() => {
                    handleInputChange("type", "property");
                    setStep(2);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                >
                  <div className="text-4xl mb-3">&#127968;</div>
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
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="R$ 50.000,00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    💡 Digite apenas números. Ex: 50000 = R$ 500,00
                  </p>
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
                          value={formData.color && formData.color !== 'Outro' && !['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Bege', 'Marrom', 'Laranja'].includes(formData.color) ? 'Outro' : formData.color}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'Outro') {
                              setCustomColor('');
                              handleInputChange("color", '');
                            } else {
                              setCustomColor('');
                              handleInputChange("color", value);
                            }
                          }}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={!customColor}
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
                        
                        {/* Campo customizado quando seleciona "Outro" ou quando a cor não está na lista */}
                        {(formData.color === '' || formData.color === 'Outro' || (formData.color && !['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Bege', 'Marrom', 'Laranja'].includes(formData.color))) && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={customColor || (formData.color && !['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Bege', 'Marrom', 'Laranja'].includes(formData.color) ? formData.color : '')}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCustomColor(value);
                                handleInputChange("color", value);
                              }}
                              placeholder="Digite a cor do veículo"
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/30"
                              required
                            />
                            <p className="text-xs text-slate-500 mt-1">💡 Ex: Vermelho metálico, Azul marinho, Verde musgo</p>
                          </div>
                        )}
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Adicionar fotos
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                📸 Adicione fotos do seu anúncio. Você pode fazer upload de arquivos ou adicionar URLs de imagens.
              </p>

              {/* Upload de arquivos */}
              <div className="mb-4">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                    <Upload size={48} className="mx-auto text-blue-500 mb-4" />
                    <p className="text-slate-900 font-semibold mb-2">
                      {uploadingImages ? "Processando imagens..." : "Clique para fazer upload de fotos"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Até 10 fotos • PNG, JPG • Máximo 5MB cada
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </label>
              </div>

              {/* Ou adicionar URL */}
              <div className="mb-6">
                <div className="text-center text-sm text-slate-500 mb-3">ou</div>
                <button
                  type="button"
                  onClick={handleImageUrlAdd}
                  className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <ImageIcon size={20} />
                  Adicionar imagem por URL
                </button>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  💡 Você também pode usar links de imagens do Imgur, Google Fotos, etc.
                </p>
              </div>

              {/* Preview das imagens com drag & drop */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700">
                      {images.length} foto{images.length > 1 ? 's' : ''} adicionada{images.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      Arraste para reordenar • A primeira é a foto de capa
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`relative group cursor-grab active:cursor-grabbing rounded-xl transition-all duration-200 ${
                          draggedIndex === index ? 'opacity-40 scale-95' : ''
                        } ${
                          dragOverIndex === index && draggedIndex !== index
                            ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                            : ''
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl pointer-events-none"
                        />
                        {/* Drag handle */}
                        <div className="absolute top-2 left-2 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                          <GripVertical size={16} />
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        {/* Cover badge */}
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded flex items-center gap-1">
                            <Star size={12} fill="white" />
                            Capa
                          </div>
                        )}
                        {/* Set as cover button */}
                        {index !== 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setAsCover(index); }}
                            className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition hover:bg-black/80 flex items-center gap-1"
                          >
                            <Star size={12} />
                            Definir como capa
                          </button>
                        )}
                        {/* Image number */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 transition shadow-lg"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Planos de Monetização */}
          {step === 4 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Impulsione seu anúncio
              </h2>
              <p className="text-slate-600 mb-8">
                Escolha um plano para dar mais visibilidade e vender mais rápido
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Plano Básico - Grátis */}
                <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Básico</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full">
                      Grátis
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-extrabold text-slate-900">R$ 0</p>
                    <p className="text-sm text-slate-500">Publicação simples</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Anúncio ativo por 30 dias
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Até 5 fotos
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Aparece nos resultados normais
                    </li>
                  </ul>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? "Publicando..." : "Publicar grátis"}
                  </button>
                </div>

                {/* Plano Destaque */}
                <div className="border-2 border-blue-600 rounded-2xl p-6 relative bg-blue-50/50">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    MAIS POPULAR
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Destaque</h3>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-extrabold text-blue-600">R$ 29</p>
                    <p className="text-sm text-slate-500">Por 30 dias</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-500 mt-0.5 font-bold">✓</span>
                      <strong>Aparece 3x mais</strong> nos resultados
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-500 mt-0.5 font-bold">✓</span>
                      <strong>Badge "Destaque"</strong> no anúncio
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-500 mt-0.5 font-bold">✓</span>
                      Até 10 fotos
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-green-500 mt-0.5 font-bold">✓</span>
                      Prioridade no chat
                    </li>
                  </ul>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Publicando..." : "Escolher Destaque"}
                  </button>
                </div>

                {/* Plano Super Destaque */}
                <div className="border-2 border-amber-500 rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Super Destaque</h3>
                    <span className="px-3 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
                      Premium
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-extrabold text-amber-600">R$ 59</p>
                    <p className="text-sm text-slate-500">Por 30 dias</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 mt-0.5 font-bold">★</span>
                      <strong>Sempre no topo</strong> da categoria
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 mt-0.5 font-bold">★</span>
                      <strong>Badge "Super Destaque"</strong> dourado
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 mt-0.5 font-bold">★</span>
                      Até 20 fotos
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 mt-0.5 font-bold">★</span>
                      Destaque na home por 7 dias
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 mt-0.5 font-bold">★</span>
                      Estatísticas detalhadas
                    </li>
                  </ul>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Publicando..." : "Escolher Super Destaque"}
                  </button>
                </div>
              </div>

              {/* Add-ons Extras */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Recursos extras (opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 cursor-pointer transition">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Renovação Automática</p>
                      <p className="text-sm text-slate-600">Seu anúncio nunca expira</p>
                    </div>
                    <span className="font-bold text-blue-600">+R$ 15</span>
                  </label>
                  
                  <label className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 cursor-pointer transition">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Refresh Diário</p>
                      <p className="text-sm text-slate-600">Volta ao topo todo dia</p>
                    </div>
                    <span className="font-bold text-blue-600">+R$ 20</span>
                  </label>
                </div>
              </div>

              {/* Botões finais */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer brand={BRAND} footer={FOOTER} />
        <BottomNav />
      </AppShell>
    </div>
  );
}
