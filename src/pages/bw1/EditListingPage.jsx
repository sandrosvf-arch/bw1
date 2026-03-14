import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [listing, setListing] = useState(null);

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

      setForm({
        title: l.title || "",
        description: l.description || det.description || "",
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

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price || !form.state || !form.city) {
      setError("Preencha título, preço, estado e cidade.");
      return;
    }
    try {
      setSaving(true);
      setError(null);

      const isVehicle = listing?.type === "vehicle";
      const isProperty = listing?.type === "property";

      const payload = {
        title: form.title.trim(),
        price: form.price,
        dealType: form.dealType,
        location: {
          state: form.state,
          city: form.city,
          country: listing?.location?.country || "Brasil",
        },
        contact: { whatsapp: form.whatsapp },
        details: {
          description: form.description,
          ...(isVehicle && {
            year: form.year,
            km: form.km,
            fuel: form.fuel,
            bodyType: form.bodyType,
            transmission: form.transmission,
            color: form.color,
            doors: form.doors,
          }),
          ...(isProperty && {
            beds: form.beds,
            baths: form.baths,
            area: form.area,
            parkingSpaces: form.parkingSpaces,
            acceptsPets: form.acceptsPets,
            furnished: form.furnished,
            floor: form.floor,
          }),
          // preservar campos extras como video_url
          ...(() => {
            const d = typeof listing?.details === "string"
              ? JSON.parse(listing.details)
              : listing?.details || {};
            const { description: _d, year: _y, km: _k, fuel: _f, bodyType: _b, transmission: _t,
              color: _c, doors: _do, beds: _be, baths: _ba, area: _a, parkingSpaces: _p,
              acceptsPets: _ap, furnished: _fu, floor: _fl, ...rest } = d;
            return rest;
          })(),
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
                disabled={saving || success}
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
