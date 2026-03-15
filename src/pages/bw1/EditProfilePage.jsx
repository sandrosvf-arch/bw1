import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, Camera, CheckCircle2, Loader2, User, Phone, Mail, Pencil, Check, X } from "lucide-react";
import api from "../../services/api";
import AppShell from "./components/AppShell";
import BottomNav from "./components/BottomNav";
import * as BrandMod from "./content/brand.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [logoOk, setLogoOk] = useState(true);
  const [editingField, setEditingField] = useState(null); // 'name' | 'phone' | null
  const [draftName, setDraftName] = useState(user?.name || "");
  const [draftPhone, setDraftPhone] = useState(user?.phone || "");
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  const startEdit = (field) => {
    if (field === 'name') setDraftName(name);
    if (field === 'phone') setDraftPhone(phone);
    setEditingField(field);
    setTimeout(() => {
      if (field === 'name') nameInputRef.current?.focus();
      if (field === 'phone') phoneInputRef.current?.focus();
    }, 50);
  };

  const confirmEdit = (field) => {
    if (field === 'name') setName(draftName);
    if (field === 'phone') setPhone(draftPhone);
    setEditingField(null);
  };

  const cancelEdit = (field) => {
    if (field === 'name') setDraftName(name);
    if (field === 'phone') setDraftPhone(phone);
    setEditingField(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem (jpg, png, webp etc).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 5 MB.");
      return;
    }
    setError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return user?.avatar || null;
    setUploadingAvatar(true);
    try {
      const { signedUrl, publicUrl } = await api.getAvatarUploadUrl();
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": avatarFile.type || "image/jpeg" },
        body: avatarFile,
      });
      if (!res.ok) throw new Error("Falha no upload da foto.");
      return publicUrl;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const avatarUrl = await uploadAvatar();
      const { user: updated } = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatarUrl,
      });
      updateUser(updated);
      setSuccess(true);
      setTimeout(() => navigate("/conta"), 1400);
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AppShell
        header={
          <nav className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/conta")}
                    className="p-2 rounded-xl hover:bg-slate-800 transition text-white"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <Link to="/">
                    <div
                      className="rounded-xl px-3 py-2 flex items-center cursor-pointer hover:opacity-80 transition"
                      style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                    >
                      {logoOk ? (
                        <img
                          src="/logo-bw1.png"
                          alt={BRAND?.name || "BW1"}
                          className="h-10 w-auto"
                          onError={() => setLogoOk(false)}
                        />
                      ) : (
                        <span className="text-xl font-bold tracking-tighter text-slate-900">
                          {BRAND?.name || "BW1"}
                        </span>
                      )}
                    </div>
                  </Link>
                  <span className="text-base sm:text-lg border-l border-slate-700/80 pl-3">
                    <span className="font-bold">Editar perfil</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        }
      >
        <main className="max-w-lg mx-auto px-4 py-8 pb-28 lg:pb-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera size={28} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Camera size={16} className="text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-sm text-slate-500 mt-3">Toque na foto para alterar</p>
            {uploadingAvatar && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Enviando foto…
              </p>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            {/* Nome */}
            <div className="p-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <User size={14} /> Nome
              </label>
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit('name'); if (e.key === 'Escape') cancelEdit('name'); }}
                    placeholder="Seu nome completo"
                    className="flex-1 text-slate-900 font-medium bg-slate-50 border border-blue-400 rounded-lg px-3 py-1.5 outline-none text-base focus:ring-2 focus:ring-blue-200 transition"
                  />
                  <button onClick={() => confirmEdit('name')} className="w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex-shrink-0" title="Confirmar">
                    <Check size={16} />
                  </button>
                  <button onClick={() => cancelEdit('name')} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition flex-shrink-0" title="Cancelar">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-900 font-medium text-base flex-1 truncate">
                    {name || <span className="text-slate-400">Não informado</span>}
                  </span>
                  <button
                    onClick={() => startEdit('name')}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                </div>
              )}
            </div>

            {/* Telefone */}
            <div className="p-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <Phone size={14} /> Telefone / WhatsApp
              </label>
              {editingField === 'phone' ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit('phone'); if (e.key === 'Escape') cancelEdit('phone'); }}
                    placeholder="(11) 99999-9999"
                    className="flex-1 text-slate-900 font-medium bg-slate-50 border border-blue-400 rounded-lg px-3 py-1.5 outline-none text-base focus:ring-2 focus:ring-blue-200 transition"
                  />
                  <button onClick={() => confirmEdit('phone')} className="w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex-shrink-0" title="Confirmar">
                    <Check size={16} />
                  </button>
                  <button onClick={() => cancelEdit('phone')} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition flex-shrink-0" title="Cancelar">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-900 font-medium text-base flex-1 truncate">
                    {phone || <span className="text-slate-400">Não informado</span>}
                  </span>
                  <button
                    onClick={() => startEdit('phone')}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                </div>
              )}
            </div>

            {/* Email (somente leitura) */}
            <div className="p-4 bg-slate-50 rounded-b-2xl">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                <Mail size={14} /> E-mail
              </label>
              <p className="text-slate-500 font-medium text-base">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} /> Perfil atualizado! Redirecionando…
            </div>
          )}

          {/* Salvar */}
          <button
            onClick={handleSave}
            disabled={saving || success}
            className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-base shadow"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando…
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={20} />
                Salvo!
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
