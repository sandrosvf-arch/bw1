import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Video, CheckCircle2, ArrowRight, Upload, X } from "lucide-react";
import api from "../../../services/api";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;

const MAX_VIDEO_SIZE_MB = 50;

export default function VideoUploadPage() {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan || "premium";

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Arquivo inválido. Envie um vídeo (mp4, mov, etc).");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      setError(`O vídeo é muito grande (${sizeMB.toFixed(1)} MB). Máximo: ${MAX_VIDEO_SIZE_MB} MB.`);
      return;
    }

    setError("");
    setVideoFile(file);
  };

  const handleUpload = async () => {
    if (!videoFile || !listingId) return;
    setUploading(true);
    setUploadProgress(10);
    setError("");

    try {
      setUploadProgress(40);
      const result = await api.uploadVideo(listingId, videoFile);
      setUploadProgress(100);
      setVideoUrl(result.video_url);
      setUploaded(true);
    } catch (err) {
      setError(err.message || "Erro ao enviar o vídeo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    navigate("/anuncio-publicado", {
      state: { listingId, fromPayment: true, plan },
    });
  };

  const handleContinue = () => {
    navigate("/anuncio-publicado", {
      state: { listingId, fromPayment: true, plan },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AppShell
        header={
          <Navbar
            brand={BRAND}
            links={NAVIGATION?.links || []}
            cta={NAVIGATION?.cta}
          />
        }
      >
        <main className="max-w-lg mx-auto px-4 py-10 pb-28">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4 shadow">
              <Video className="text-amber-600" size={40} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3">
              ★ SUPER DESTAQUE PREMIUM
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Adicione um vídeo ao seu anúncio
            </h1>
            <p className="text-slate-500 text-sm">
              Anúncios com vídeo vendem até 3× mais rápido. Máximo {MAX_VIDEO_SIZE_MB} MB.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {uploaded ? (
              /* ✅ Vídeo adicionado */
              <div className="text-center">
                <CheckCircle2 size={56} className="mx-auto text-green-500 mb-3" />
                <h2 className="text-xl font-bold text-slate-900 mb-1">Vídeo adicionado!</h2>
                <p className="text-slate-500 text-sm mb-4">{videoFile?.name}</p>
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-xl mb-6 max-h-64 bg-black"
                />
                <button
                  onClick={handleContinue}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              /* Upload */
              <>
                <label
                  htmlFor="video-input"
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-300 rounded-xl p-8 cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition mb-4"
                >
                  <Upload size={36} className="text-amber-500" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-800">Clique para selecionar o vídeo</p>
                    <p className="text-xs text-slate-500 mt-1">MP4, MOV, AVI — até {MAX_VIDEO_SIZE_MB} MB</p>
                  </div>
                  {videoFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full text-sm font-medium text-amber-800">
                      <Video size={14} /> {videoFile.name}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setVideoFile(null); }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </label>
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Enviando vídeo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                  onClick={handleUpload}
                  disabled={!videoFile || uploading}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {uploading ? "Enviando..." : "Enviar vídeo"}
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-700 transition text-sm"
                >
                  Pular por agora
                </button>
              </>
            )}
          </div>
        </main>
        <BottomNav />
      </AppShell>
    </div>
  );
}

export default function VideoUploadPage() {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan || "premium";

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Arquivo inválido. Envie um vídeo (mp4, mov, etc).");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      setError(`O vídeo é muito grande (${sizeMB.toFixed(1)} MB). Máximo: ${MAX_VIDEO_SIZE_MB} MB.`);
      return;
    }

    setError("");
    setVideoFile(file);
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    setError("");

    try {
      // Upload via URL gerada localmente para preview (sem backend para vídeo ainda)
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      setUploaded(true);
    } catch (err) {
      setError("Erro ao enviar o vídeo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    navigate("/anuncio-publicado", {
      state: { listingId, fromPayment: true, plan },
    });
  };

  const handleContinue = () => {
    navigate("/anuncio-publicado", {
      state: { listingId, fromPayment: true, plan },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AppShell
        header={
          <Navbar
            brand={BRAND}
            links={NAVIGATION?.links || []}
            cta={NAVIGATION?.cta}
          />
        }
      >
        <main className="max-w-lg mx-auto px-4 py-10 pb-28">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4 shadow">
              <Video className="text-amber-600" size={40} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-3">
              ★ SUPER DESTAQUE PREMIUM
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Adicione um vídeo ao seu anúncio
            </h1>
            <p className="text-slate-500 text-sm">
              Anúncios com vídeo vendem até 3× mais rápido. Máximo {MAX_VIDEO_SIZE_MB} MB.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {uploaded ? (
              /* ✅ Vídeo adicionado */
              <div className="text-center">
                <CheckCircle2 size={56} className="mx-auto text-green-500 mb-3" />
                <h2 className="text-xl font-bold text-slate-900 mb-1">Vídeo adicionado!</h2>
                <p className="text-slate-500 text-sm mb-6">
                  {videoFile?.name}
                </p>
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-xl mb-6 max-h-64 bg-black"
                  />
                )}
                <button
                  onClick={handleContinue}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              /* Upload */
              <>
                {/* Área de drop */}
                <label
                  htmlFor="video-input"
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-amber-300 rounded-xl p-8 cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition mb-4"
                >
                  <Upload size={36} className="text-amber-500" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-800">Clique para selecionar o vídeo</p>
                    <p className="text-xs text-slate-500 mt-1">MP4, MOV, AVI — até {MAX_VIDEO_SIZE_MB} MB</p>
                  </div>
                  {videoFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full text-sm font-medium text-amber-800">
                      <Video size={14} /> {videoFile.name}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setVideoFile(null); }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </label>
                <input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!videoFile || uploading}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {uploading ? "Enviando vídeo..." : "Enviar vídeo"}
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-700 transition text-sm"
                >
                  Pular por agora
                </button>
              </>
            )}
          </div>
        </main>
        <BottomNav />
      </AppShell>
    </div>
  );
}
