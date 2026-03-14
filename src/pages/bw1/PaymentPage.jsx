import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, Copy, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import Navbar from "./components/Navbar";
import AppShell from "./components/AppShell";
import BottomNav from "./components/BottomNav";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;

const PLAN_LABELS = {
  standard: "Destaque Standard",
  pro: "Destaque PRO",
  premium: "Super Destaque Premium",
};

const EXPIRY_MINUTES = 30;

export default function PaymentPage() {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const [qrCode, setQrCode] = useState(state.qrCode || "");
  const [qrCodeBase64, setQrCodeBase64] = useState(state.qrCodeBase64 || "");
  const [amount, setAmount] = useState(state.amount || 0);
  const [plan, setPlan] = useState(state.plan || "");
  const [listingId, setListingId] = useState(state.listingId || "");
  const [listingTitle] = useState(state.listingTitle || "seu anúncio");

  const [status, setStatus] = useState("pending"); // pending | approved | rejected | expired
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXPIRY_MINUTES * 60);
  const [polling, setPolling] = useState(true);

  // Se não veio com dados no state, busca do backend
  useEffect(() => {
    if (!qrCode && paymentId) {
      api.getPaymentStatus(paymentId).then((data) => {
        if (data.qrCode) setQrCode(data.qrCode);
        if (data.qrCodeBase64) setQrCodeBase64(data.qrCodeBase64);
        if (data.amount) setAmount(data.amount);
        if (data.plan) setPlan(data.plan);
        if (data.listingId) setListingId(data.listingId);
        if (data.status !== "pending") setStatus(data.status);
      });
    }
  }, [paymentId]);

  // Polling de status a cada 4 segundos
  const checkStatus = useCallback(async () => {
    try {
      const data = await api.getPaymentStatus(paymentId);
      if (data.status === "approved") {
        setStatus("approved");
        setPolling(false);
      } else if (data.status === "rejected" || data.status === "cancelled") {
        setStatus("rejected");
        setPolling(false);
      }
    } catch {
      // ignora erros de rede temporários
    }
  }, [paymentId]);

  useEffect(() => {
    if (!polling || !paymentId) return;
    checkStatus(); // verifica imediatamente ao montar
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [polling, paymentId, checkStatus]);

  // Countdown 30 minutos
  useEffect(() => {
    if (status !== "pending") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setStatus("expired");
          setPolling(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Aprovado → redireciona para sucesso
  useEffect(() => {
    if (status === "approved") {
      const timer = setTimeout(() => {
        navigate("/anuncio-publicado", {
          state: { listingId, fromPayment: true, plan },
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate, listingId, plan]);

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
        <main className="max-w-lg mx-auto px-4 py-8 pb-28 lg:pb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          {/* APROVADO */}
          {status === "approved" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Pagamento confirmado!</h2>
              <p className="text-slate-600 mb-2">
                Seu plano <strong>{PLAN_LABELS[plan]}</strong> foi ativado.
              </p>
              <p className="text-sm text-slate-500">Redirecionando para seu anúncio...</p>
            </div>
          )}

          {/* REJEITADO */}
          {(status === "rejected" || status === "expired") && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <XCircle size={64} className="mx-auto text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {status === "expired" ? "QR Code expirado" : "Pagamento não confirmado"}
              </h2>
              <p className="text-slate-600 mb-6">
                {status === "expired"
                  ? "O tempo limite de 30 minutos foi atingido."
                  : "Não recebemos a confirmação do pagamento."}
              </p>
              <button
                onClick={() => navigate("/criar-anuncio")}
                className="w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* PENDENTE - mostra QR Code */}
          {status === "pending" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-3">
                  🔑 PIX — Pagamento instantâneo
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {PLAN_LABELS[plan] || "Plano"}
                </h2>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">
                  R$ {Number(amount).toFixed(2).replace(".", ",")}
                </p>
                <p className="text-xs text-slate-500 mt-1">Para ativar o plano em "{listingTitle}"</p>
              </div>

              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 mb-5 text-orange-600">
                <Clock size={16} />
                <span className="text-sm font-semibold">
                  Expira em <span className="font-mono text-base">{formatTime(timeLeft)}</span>
                </span>
              </div>

              {/* QR Code Image */}
              {qrCodeBase64 ? (
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-xl">
                    <img
                      src={`data:image/png;base64,${qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="w-56 h-56 bg-slate-100 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <div className="text-3xl mb-2">📱</div>
                      <p className="text-xs">QR Code indisponível<br/>use o código abaixo</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-center text-sm text-slate-500 mb-3">
                Abra o app do seu banco, escolha <strong>PIX → Pagar com QR Code</strong> ou cole o código abaixo.
              </p>

              {/* Copia e cola */}
              {qrCode && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-600 mb-1">PIX Copia e Cola</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={qrCode}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 truncate"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                        copied
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <Copy size={14} />
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
              )}

              {/* Status polling indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-3">
                <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando automaticamente a cada 2 segundos...
              </div>
            </div>
          )}
        </main>
        <BottomNav />
      </AppShell>
    </div>
  );
}
