import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, X, ImagePlus, Video, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
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

const FUEL_OPTIONS = ["Gasolina", "Etanol", "Flex", "Diesel", "Elétrico", "Híbrido", "GNV"];
const TRANSMISSION_OPTIONS = ["Manual", "Automático", "CVT", "Semi-automático"];
const BODY_OPTIONS = ["Sedan", "Hatch", "SUV", "Picape", "Coupe", "Conversível", "Minivan", "Van", "Caminhonete", "Outros"];
const DEAL_TYPES = ["Venda", "Aluguel", "Permuta"];
const FURNISHED_OPTIONS = ["Sim", "Não", "Semi-mobiliado"];
const MAX_VIDEO_SIZE_MB = 500;
const MAX_IMAGES = { basic: 5, standard: 10, pro: 15, premium: 15 };

const compressImageToBlob = (file, maxWidth = 1200, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const imageInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [listing, setListing] = useState(null);

  // Images
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = (idx) => setDraggingIdx(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggingIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDraggingIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { setDraggingIdx(null); setDragOverIdx(null); };

  const moveImage = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  // Video (premium only)
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoError, setVideoError] = useState("");
  const [videoUploaded, setVideoUploaded] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    dealType: "Venda",
    state: "",
    city: "",
    whatsapp: "",
    // veículo
    year: "",
    km: "",
    fuel: "",
    bodyType: "",
    transmission: "",
    color: "",
    doors: "",
    // imóvel
    beds: "",
    baths: "",
    area: "",
    parkingSpaces: "",
    acceptsPets: "",
    furnished: "",
    floor: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadListing();
  }, [id, isAuthenticated]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const data = await api.getListing(id);
      const l = data.listing || data;
      setListing(l);

      const loc = typeof l.location === "string" ? JSON.parse(l.location) : l.location || {};
      const det = typeof l.details === "string" ? JSON.parse(l.details) : l.details || {};
      const cont = typeof l.contact === "string" ? JSON.parse(l.contact) : l.contact || {};
      const imgs = typeof l.images === "string" ? JSON.parse(l.images) : l.images || [];

      setImages(Array.isArray(imgs) ? imgs : []);
      setVideoUrl(det.video_url || "");

      setForm({
        title: l.title || "",
        description: det.description || l.description || "",
        price: l.price || "",
        dealType: l.dealType || loc.dealType || "Venda",
        state: loc.state || "",
        city: loc.city || "",
        whatsapp: cont.whatsapp || "",
        // veículo
        year: det.year || "",
        km: det.km || "",
        fuel: det.fuel || "",
        bodyType: det.bodyType || "",
        transmission: det.transmission || "",
        color: det.color || "",
        doors: det.doors || "",
        // imóvel
        beds: det.beds || "",
        baths: det.baths || "",
        area: det.area || "",
        parkingSpaces: det.parkingSpaces || "",
        acceptsPets: det.acceptsPets || "",
        furnished: det.furnished || "",
        floor: det.floor || "",
      });
    } catch (err) {
      setError("Não foi possível carregar o anúncio.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ── Image handlers ──
  const maxImgs = MAX_IMAGES[listing?.plan] || 5;

  const handleImageFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > maxImgs) {
      alert(`Máximo de ${maxImgs} fotos para o plano ${listing?.plan || "básico"}.`);
      return;
    }
    setUploadingImages(true);
    setUploadProgress({ current: 0, total: files.length });
    try {
      const newUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });
        if (file.size > 10 * 1024 * 1024) { alert(`${file.name} muito grande (máx 10 MB).`); continue; }
        if (!file.type.startsWith("image/")) { alert(`${file.name} não é uma imagem.`); continue; }
        const blob = await compressImageToBlob(file);
        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
        const { url } = await api.uploadImage(compressed);
        newUrls.push(url);
      }
      setImages((prev) => [...prev, ...newUrls]);
    } catch {
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploadingImages(false);
      setUploadProgress({ current: 0, total: 0 });
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const setAsCover = (idx) => {
    if (idx === 0) return;
    setImages((prev) => { const a = [...prev]; const [item] = a.splice(idx, 1); a.unshift(item); return a; });
  };

  // ── Video handlers (premium) ──
  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { setVideoError("Envie um vídeo (mp4, mov, etc)."); return; }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) { setVideoError(`Vídeo muito grande (${sizeMB.toFixed(1)} MB). Máx ${MAX_VIDEO_SIZE_MB} MB.`); return; }
    setVideoError("");
    setVideoFile(file);
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setUploadingVideo(true);
    setVideoUploadProgress(5);
    setVideoError("");
    try {
      // 1. Obter URL assinada do backend
      setVideoUploadProgress(10);
      const { signedUrl, path } = await api.getVideoUploadUrl(id);

      // 2. Upload direto para o Supabase Storage (sem passar pelo backend)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", videoFile.type || "video/mp4");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setVideoUploadProgress(10 + Math.round((e.loaded / e.total) * 80));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Erro no upload: ${xhr.status} ${xhr.responseText}`));
        };
        xhr.onerror = () => reject(new Error("Erro de rede ao enviar vídeo."));
        xhr.send(videoFile);
      });

      // 3. Confirmar com o backend para salvar a URL no banco
      setVideoUploadProgress(95);
      const result = await api.confirmVideoUpload(id, path);
      setVideoUploadProgress(100);
      setVideoUrl(result.video_url);
      setVideoUploaded(true);
      setVideoFile(null);
    } catch (err) {
      setVideoError(err.message || "Erro ao enviar o vídeo.");
      setVideoUploadProgress(0);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || !form.state || !form.city) {
      setError("Preencha título, preço, estado e cidade.");
      return;
    }
    if (images.length === 0) {
      setError("Adicione pelo menos 1 foto.");
      return;
    }
    try {
      setSaving(true);
      setError(null);

      const isVehicle = listing?.type === "vehicle";
      const isProperty = listing?.type === "property";

      const det = typeof listing?.details === "string" ? JSON.parse(listing.details) : listing?.details || {};
      const { description: _d, year: _y, km: _k, fuel: _f, bodyType: _b, transmission: _t,
        color: _c, doors: _do, beds: _be, baths: _ba, area: _a, parkingSpaces: _p,
        acceptsPets: _ap, furnished: _fu, floor: _fl, ...restDetails } = det;

      const payload = {
        title: form.title.trim(),
        price: form.price,
        dealType: form.dealType,
        images,
        location: {
          state: form.state,
          city: form.city,
          country: listing?.location?.country || "Brasil",
        },
        contact: { whatsapp: form.whatsapp },
        details: {
          description: form.description,
          ...(isVehicle && { year: form.year, km: form.km, fuel: form.fuel, bodyType: form.bodyType, transmission: form.transmission, color: form.color, doors: form.doors }),
          ...(isProperty && { beds: form.beds, baths: form.baths, area: form.area, parkingSpaces: form.parkingSpaces, acceptsPets: form.acceptsPets, furnished: form.furnished, floor: form.floor }),
          ...restDetails,
        },
      };

      await api.updateListing(id, payload);
      setSuccess(true);
      setTimeout(() => navigate("/meus-anuncios"), 1500);
    } catch (err) {
      setError(err.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const isVehicle = listing?.type === "vehicle";
  const isProperty = listing?.type === "property";
  const isPremium = listing?.plan === "premium";
  const maxImgsDisplay = MAX_IMAGES[listing?.plan] || 5;

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const selectCls = `${inputCls} appearance-none`;
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <AppShell brand={BRAND} navigation={NAVIGATION} footer={FOOTER}>
      <Navbar brand={BRAND} navigation={NAVIGATION} />
      <main className="min-h-screen bg-slate-50 pb-24 pt-4">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/meus-anuncios")}
              className="p-2 rounded-xl hover:bg-slate-200 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Editar anúncio</h1>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          )}

          {!loading && error && !saving && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-700 text-sm font-medium flex items-center gap-2">
              ✓ Anúncio atualizado! Redirecionando...
            </div>
          )}

          {!loading && listing && (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── FOTOS ── */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">Fotos</h2>
                  <span className="text-xs text-slate-400">{images.length}/{maxImgsDisplay}</span>
                </div>
                {images.length > 0 && (
                  <>
                    <p className="text-xs text-slate-400 -mt-1">Arraste para reordenar · A primeira foto é a capa</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((url, idx) => (
                        <div
                          key={url + idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition cursor-grab active:cursor-grabbing
                            ${draggingIdx === idx ? "opacity-40 scale-95" : ""}
                            ${dragOverIdx === idx && draggingIdx !== idx ? "border-blue-500 ring-2 ring-blue-300" : "border-slate-100"}
                          `}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">Capa</span>
                          )}
                          {/* Drag handle hint */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                            <GripVertical size={14} className="text-white drop-shadow" />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            {idx !== 0 && (
                              <button type="button" onClick={() => setAsCover(idx)}
                                className="text-[10px] bg-white text-slate-800 px-2 py-1 rounded-lg font-semibold hover:bg-blue-50">
                                Capa
                              </button>
                            )}
                            <button type="button" onClick={() => removeImage(idx)}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">
                              <X size={12} />
                            </button>
                          </div>
                          {/* Move buttons - always visible, work on touch */}
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); moveImage(idx, -1); }}
                              disabled={idx === 0}
                              className="p-1 bg-black/60 text-white rounded disabled:opacity-30 hover:bg-black/80 active:scale-95"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); moveImage(idx, 1); }}
                              disabled={idx === images.length - 1}
                              className="p-1 bg-black/60 text-white rounded disabled:opacity-30 hover:bg-black/80 active:scale-95"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {images.length < maxImgsDisplay && (
                  <div>
                    <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageFilesChange} />
                    <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploadingImages}
                      className="w-full border-2 border-dashed border-slate-300 rounded-xl py-4 flex flex-col items-center gap-1 text-slate-500 hover:border-blue-400 hover:text-blue-500 transition disabled:opacity-60">
                      {uploadingImages ? (
                        <><Loader2 className="animate-spin" size={20} /><span className="text-sm">Enviando {uploadProgress.current}/{uploadProgress.total}...</span></>
                      ) : (
                        <><ImagePlus size={22} /><span className="text-sm font-medium">Adicionar fotos</span><span className="text-xs text-slate-400">JPG, PNG — máx 10 MB cada</span></>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* ── VÍDEO (premium) ── */}
              {isPremium && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={18} className="text-amber-600" />
                    <h2 className="font-semibold text-slate-800">Vídeo do anúncio</h2>
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full ml-auto">PREMIUM</span>
                  </div>
                  {videoUrl && !videoUploaded && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Vídeo atual:</p>
                      <video src={videoUrl} controls className="w-full rounded-xl max-h-48 bg-black" />
                    </div>
                  )}
                  {videoUploaded && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">✓ Novo vídeo enviado com sucesso!</div>
                  )}
                  {!videoUploaded && (
                    <div className="space-y-3">
                      <label className="w-full border-2 border-dashed border-amber-300 rounded-xl py-4 flex flex-col items-center gap-1 text-amber-600 hover:border-amber-500 transition cursor-pointer">
                        <Video size={22} />
                        <span className="text-sm font-medium">{videoFile ? videoFile.name : videoUrl ? "Substituir vídeo" : "Adicionar vídeo"}</span>
                        <span className="text-xs text-slate-400">MP4, MOV, AVI — até {MAX_VIDEO_SIZE_MB} MB</span>
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoFileChange} />
                      </label>
                      {videoFile && !uploadingVideo && (
                        <button type="button" onClick={handleVideoUpload}
                          className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition flex items-center justify-center gap-2">
                          <Video size={16} /> Enviar vídeo
                        </button>
                      )}
                      {uploadingVideo && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-amber-700">
                            <span>{videoUploadProgress < 10 ? "Preparando..." : videoUploadProgress < 95 ? "Enviando vídeo..." : "Finalizando..."}</span>
                            <span>{videoUploadProgress}%</span>
                          </div>
                          <div className="w-full bg-amber-100 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${videoUploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                      {videoError && <p className="text-red-600 text-xs">{videoError}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Informações básicas */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-semibold text-slate-800">Informações básicas</h2>

                <div>
                  <label className={labelCls}>Título *</label>
                  <input
                    className={inputCls}
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ex: Honda Civic 2020 LXS"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className={labelCls}>Descrição</label>
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Descreva o item com detalhes..."
                    maxLength={2000}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Preço (R$) *</label>
                    <input
                      className={inputCls}
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tipo deal</label>
                    <select
                      className={selectCls}
                      value={form.dealType}
                      onChange={(e) => handleChange("dealType", e.target.value)}
                    >
                      {DEAL_TYPES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-semibold text-slate-800">Localização</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Estado *</label>
                    <input
                      className={inputCls}
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="Ex: SP"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Cidade *</label>
                    <input
                      className={inputCls}
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                </div>
              </div>

              {/* Veículo */}
              {isVehicle && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="font-semibold text-slate-800">Dados do veículo</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Ano</label>
                      <input className={inputCls} value={form.year} onChange={(e) => handleChange("year", e.target.value)} placeholder="2020" />
                    </div>
                    <div>
                      <label className={labelCls}>KM</label>
                      <input className={inputCls} value={form.km} onChange={(e) => handleChange("km", e.target.value)} placeholder="50.000" />
                    </div>
                    <div>
                      <label className={labelCls}>Combustível</label>
                      <select className={selectCls} value={form.fuel} onChange={(e) => handleChange("fuel", e.target.value)}>
                        <option value="">Selecione</option>
                        {FUEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Câmbio</label>
                      <select className={selectCls} value={form.transmission} onChange={(e) => handleChange("transmission", e.target.value)}>
                        <option value="">Selecione</option>
                        {TRANSMISSION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Carroceria</label>
                      <select className={selectCls} value={form.bodyType} onChange={(e) => handleChange("bodyType", e.target.value)}>
                        <option value="">Selecione</option>
                        {BODY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Cor</label>
                      <input className={inputCls} value={form.color} onChange={(e) => handleChange("color", e.target.value)} placeholder="Ex: Prata" />
                    </div>
                    <div>
                      <label className={labelCls}>Portas</label>
                      <select className={selectCls} value={form.doors} onChange={(e) => handleChange("doors", e.target.value)}>
                        <option value="">Selecione</option>
                        {["2", "3", "4", "5"].map((o) => <option key={o} value={o}>{o} portas</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Imóvel */}
              {isProperty && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <h2 className="font-semibold text-slate-800">Dados do imóvel</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Quartos</label>
                      <input className={inputCls} value={form.beds} onChange={(e) => handleChange("beds", e.target.value)} placeholder="3" />
                    </div>
                    <div>
                      <label className={labelCls}>Banheiros</label>
                      <input className={inputCls} value={form.baths} onChange={(e) => handleChange("baths", e.target.value)} placeholder="2" />
                    </div>
                    <div>
                      <label className={labelCls}>Área (m²)</label>
                      <input className={inputCls} value={form.area} onChange={(e) => handleChange("area", e.target.value)} placeholder="80" />
                    </div>
                    <div>
                      <label className={labelCls}>Vagas garagem</label>
                      <input className={inputCls} value={form.parkingSpaces} onChange={(e) => handleChange("parkingSpaces", e.target.value)} placeholder="1" />
                    </div>
                    <div>
                      <label className={labelCls}>Mobiliado</label>
                      <select className={selectCls} value={form.furnished} onChange={(e) => handleChange("furnished", e.target.value)}>
                        <option value="">Selecione</option>
                        {FURNISHED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Aceita pet</label>
                      <select className={selectCls} value={form.acceptsPets} onChange={(e) => handleChange("acceptsPets", e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Andar</label>
                      <input className={inputCls} value={form.floor} onChange={(e) => handleChange("floor", e.target.value)} placeholder="Ex: 5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Contato */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-semibold text-slate-800">Contato</h2>
                <div>
                  <label className={labelCls}>WhatsApp</label>
                  <input
                    className={inputCls}
                    value={form.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving || success || uploadingImages || uploadingVideo}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 className="animate-spin" size={18} /> Salvando...</>
                ) : (
                  <><Save size={18} /> Salvar alterações</>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
      <BottomNav navigation={NAVIGATION} />
      <Footer footer={FOOTER} brand={BRAND} />
    </AppShell>
  );
}
