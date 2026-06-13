import React, { useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import {
  Upload, Trash2, Plus, ToggleLeft, ToggleRight,
  ExternalLink, Users, ShieldCheck, AlertTriangle, Copy, Check, X,
} from "lucide-react";

// ── SQL de setup — copiado diretamente, sem depender da API ──────
const SETUP_SQL = `-- Execute no Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS master_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  added_by text,
  created_at timestamptz DEFAULT now()
);
INSERT INTO master_users (email, added_by)
  VALUES ('sandrosvf@gmail.com', 'system')
  ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  desktop_url text NOT NULL,
  mobile_url text NOT NULL,
  alt text DEFAULT '',
  link text DEFAULT '',
  order_index int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- No Supabase Dashboard → Storage:
-- Crie um bucket chamado "banners" marcando "Public bucket"`;

// ── Helpers ────────────────────────────────────────────────────────
function PreviewImage({ src, label }) {
  if (!src) return (
    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">{label}</div>
  );
  return <img src={src} alt={label} className="w-full h-full object-cover" />;
}

function FileInput({ label, accept, onChange, preview, ratio }) {
  const ref = useRef();
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <div
        className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition bg-slate-50"
        style={{ aspectRatio: ratio }}
        onClick={() => ref.current?.click()}
      >
        <PreviewImage src={preview} label="Clique para selecionar" />
        {preview && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <span className="text-white text-xs font-semibold">Trocar imagem</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={onChange} />
    </div>
  );
}

// ── Banner Card ────────────────────────────────────────────────────
function BannerCard({ banner, onToggle, onDelete, onEdit }) {
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border ${banner.active ? "border-slate-200" : "border-slate-100 opacity-60"} overflow-hidden`}>
      {/* Desktop thumb */}
      <div className="w-full bg-slate-100" style={{ aspectRatio: "1440/560" }}>
        <PreviewImage src={banner.desktop_url} label="Desktop" />
      </div>

      <div className="p-4 space-y-3">
        {/* Mobile thumb */}
        <div className="flex gap-3 items-start">
          <div className="w-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden" style={{ aspectRatio: "390/520" }}>
            <PreviewImage src={banner.mobile_url} label="Mobile" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-1">Alt / SEO</p>
            <p className="text-sm font-medium text-slate-800 truncate">{banner.alt || "—"}</p>
            {banner.link && (
              <a href={banner.link} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
                <ExternalLink size={11} /> {banner.link}
              </a>
            )}
            <p className="text-xs text-slate-400 mt-1">Ordem: {banner.order_index}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(banner)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
              banner.active ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {banner.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {banner.active ? "Ativo" : "Inativo"}
          </button>
          <button
            onClick={() => onEdit(banner)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            Editar
          </button>
          {confirmDel ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(banner.id)} className="px-3 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition">Sim</button>
              <button onClick={() => setConfirmDel(false)} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"><X size={12}/></button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Banner Form Modal ──────────────────────────────────────────────
function BannerFormModal({ existing, onClose, onSaved }) {
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(existing?.desktop_url || null);
  const [mobilePreview, setMobilePreview] = useState(existing?.mobile_url || null);
  const [alt, setAlt] = useState(existing?.alt || "");
  const [link, setLink] = useState(existing?.link || "");
  const [orderIndex, setOrderIndex] = useState(existing?.order_index ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pickFile = (setter, previewSetter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!existing && (!desktopFile || !mobileFile)) {
      setError("Selecione as imagens desktop e mobile.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      if (desktopFile) fd.append("desktop", desktopFile);
      if (mobileFile) fd.append("mobile", mobileFile);
      fd.append("alt", alt);
      fd.append("link", link);
      fd.append("order_index", String(orderIndex));

      if (existing) {
        await api.updateBanner(existing.id, fd);
      } else {
        await api.createBanner(fd);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-slate-900">{existing ? "Editar banner" : "Novo banner"}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Imagens */}
          <div className="grid grid-cols-2 gap-4">
            <FileInput label="Desktop (1440×560)" accept="image/*" ratio="1440/560"
              preview={desktopPreview} onChange={pickFile(setDesktopFile, setDesktopPreview)} />
            <FileInput label="Mobile (390×520)" accept="image/*" ratio="390/520"
              preview={mobilePreview} onChange={pickFile(setMobileFile, setMobilePreview)} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Texto alternativo (SEO)</label>
            <input value={alt} onChange={e => setAlt(e.target.value)}
              placeholder="Ex: Promoção de imóveis BW1"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Link ao clicar (opcional)</label>
            <input value={link} onChange={e => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Ordem de exibição</label>
            <input type="number" value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))}
              className="w-32 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? "Salvando..." : existing ? "Salvar alterações" : "Criar banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function BannersAdmin() {
  const [tab, setTab] = useState("banners"); // "banners" | "masters"
  const [banners, setBanners] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupSql] = useState(SETUP_SQL); // sempre disponível, sem chamada à API
  const [sqlCopied, setSqlCopied] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newMasterEmail, setNewMasterEmail] = useState("");
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState("");

  const loadBanners = async () => {
    try {
      const res = await api.getAdminBanners();
      setBanners(res.banners || []);
      setSetupRequired(false); // tabelas existem
    } catch (err) {
      const msg = err.message || '';
      // Só mostra aviso de setup se a tabela realmente não existe
      const isSetupError =
        msg.includes('does not exist') ||
        msg.includes('Could not find') ||
        msg.includes('schema cache') ||
        msg.includes('relation "public.banners"') ||
        msg.includes('setupRequired');
      if (isSetupError) setSetupRequired(true);
      // outros erros (auth, rede) são ignorados silenciosamente
    }
  };

  const loadMasters = async () => {
    try {
      const res = await api.getMasters();
      setMasters(res.masters || []);
    } catch {}
  };

  useEffect(() => {
    Promise.all([loadBanners(), loadMasters()]).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (banner) => {
    // Atualização otimista imediata
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: !b.active } : b));
    try {
      const fd = new FormData();
      fd.append("active", String(!banner.active));
      await api.updateBanner(banner.id, fd);
      // Invalida cache público para refletir no Hero
      await api.getPublicBanners();
    } catch {
      await loadBanners();
    }
  };

  const handleDelete = async (id) => {
    // Atualização otimista imediata
    setBanners(prev => prev.filter(b => b.id !== id));
    try {
      await api.deleteBanner(id);
      // Invalida cache público para refletir no Hero
      await api.getPublicBanners();
    } catch {
      await loadBanners();
    }
  };

  const handleFormSaved = async () => {
    setFormOpen(false);
    setEditingBanner(null);
    await loadBanners();
    // Invalida cache público para refletir no Hero
    await api.getPublicBanners();
  };

  const handleAddMaster = async () => {
    if (!newMasterEmail) return;
    setMasterLoading(true);
    setMasterError("");
    try {
      await api.addMaster(newMasterEmail);
      setNewMasterEmail("");
      loadMasters();
    } catch (err) {
      setMasterError(err.message);
    } finally {
      setMasterLoading(false);
    }
  };

  const handleRemoveMaster = async (email) => {
    await api.removeMaster(email).catch(() => {});
    loadMasters();
  };

  const copySetupSql = () => {
    navigator.clipboard.writeText(setupSql).then(() => {
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Setup warning */}
      {setupRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold">
            <AlertTriangle size={18} /> Configuração inicial necessária
          </div>
          <p className="text-sm text-amber-600 mb-3">
            Execute o SQL abaixo no <strong>Supabase Dashboard → SQL Editor</strong> para criar as tabelas e o bucket de imagens.
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{setupSql}</pre>
            <button onClick={copySetupSql}
              className="absolute top-2 right-2 flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-xs px-2 py-1 rounded-lg transition">
              {sqlCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
            </button>
          </div>
          <p className="text-xs text-amber-500 mt-2">Após executar o SQL, recarregue esta página.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setTab("banners")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${tab === "banners" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          <Upload size={16} /> Banners
        </button>
        <button onClick={() => setTab("masters")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${tab === "masters" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          <Users size={16} /> Usuários Mestres
        </button>
      </div>

      {/* ── BANNERS TAB ── */}
      {tab === "banners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{banners.length} banner(s) cadastrado(s)</p>
              <p className="text-xs text-slate-400">Desktop: 1440×560px · Mobile: 390×520px</p>
            </div>
            <button onClick={() => { setEditingBanner(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              <Plus size={16} /> Novo banner
            </button>
          </div>

          {banners.length === 0 && !setupRequired && (
            <div className="text-center py-16 text-slate-400">
              <Upload size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold">Nenhum banner cadastrado</p>
              <p className="text-sm">Clique em "Novo banner" para adicionar o primeiro.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b => (
              <BannerCard key={b.id} banner={b}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={(b) => { setEditingBanner(b); setFormOpen(true); }} />
            ))}
          </div>
        </div>
      )}

      {/* ── MASTERS TAB ── */}
      {tab === "masters" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Usuários mestres têm acesso total ao painel de administração. Adicione apenas pessoas de confiança.
            </p>
          </div>

          {/* Add master */}
          <div className="flex gap-2">
            <input value={newMasterEmail} onChange={e => setNewMasterEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddMaster()}
              placeholder="email@dominio.com"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleAddMaster} disabled={masterLoading || !newMasterEmail}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              <Plus size={16} /> Adicionar
            </button>
          </div>
          {masterError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{masterError}</p>}

          {/* List */}
          <div className="space-y-2">
            {masters.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.email}</p>
                  <p className="text-xs text-slate-400">
                    {m.id === "bootstrap" ? "Mestre raiz (não removível)" : `Adicionado por ${m.added_by || "—"}`}
                  </p>
                </div>
                {m.id !== "bootstrap" && (
                  <button onClick={() => handleRemoveMaster(m.email)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de form */}
      {formOpen && (
        <BannerFormModal
          existing={editingBanner}
          onClose={() => { setFormOpen(false); setEditingBanner(null); }}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
