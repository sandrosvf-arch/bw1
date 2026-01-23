import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Phone, Mail, MessageCircle } from "lucide-react";

/**
 * ChatWidget (MODO MUDO / OFFLINE)
 * - Mantém o widget na tela
 * - Não chama nenhuma IA
 * - Responde com uma mensagem padrão e oferece botões de contato
 *
 * Para habilitar WhatsApp no futuro:
 * - adicione brand.whatsapp em content/brand.js (ex: "+55 41 99999-9999")
 */
export default function ChatWidget({ brand }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Olá! Sou o consultor virtual da BW1. No momento estou em modo offline (sem IA). Se quiser atendimento, use os botões de contato abaixo.",
    },
  ]);

  const endRef = useRef(null);

  function scrollToBottom() {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Tenta pegar WhatsApp do brand (se existir), senão esconde o botão
  const rawWhats = (brand?.whatsapp || "").toString();
  const whatsDigits = rawWhats.replace(/\D/g, "");
  const hasWhats = whatsDigits.length >= 10;

  const telLink = brand?.phone ? `tel:${brand.phone}` : "#";
  const mailLink = brand?.email ? `mailto:${brand.email}` : "#";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);

    // Resposta padrão (mudo)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "Entendi! No momento estou em modo offline. Para falar com a equipe BW1 agora, use os botões de contato abaixo.",
      },
    ]);
  }

  // WhatsApp com texto preenchido (se existir número)
  const waText = encodeURIComponent(
    `Olá! Vim pela BW1. Preciso de ajuda. Mensagem: "${messages
      .slice()
      .reverse()
      .find((m) => m.role === "user")?.text || ""}"`
  );
  const waLink = hasWhats ? `https://wa.me/${whatsDigits}?text=${waText}` : "#";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Consultor BW1</h3>
                <p className="text-[10px] text-slate-300">Modo offline</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Contact Buttons */}
          <div className="px-4 pb-3 bg-white border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2 pt-3">
              {hasWhats ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition-colors"
                  title="Abrir WhatsApp"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 text-xs font-bold bg-slate-200 text-slate-500 py-2 rounded-xl cursor-not-allowed"
                  title="WhatsApp não configurado"
                  disabled
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              )}

              <a
                href={telLink}
                className="flex items-center justify-center gap-2 text-xs font-bold bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800 transition-colors"
                title="Ligar"
              >
                <Phone size={14} /> Ligar
              </a>

              <a
                href={mailLink}
                className="flex items-center justify-center gap-2 text-xs font-bold bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors"
                title="Enviar e-mail"
              >
                <Mail size={14} /> E-mail
              </a>
            </div>

            {/* Input (continua existindo, mas não chama IA) */}
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Digite aqui (modo offline)..."
                className="flex-1 bg-slate-100 text-slate-800 text-sm px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!chatInput.trim()}
                title="Enviar"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-slate-900/30 transition-all duration-300 hover:scale-105"
        title="Ajuda"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Bot size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-semibold">
              Ajuda
            </span>
          </>
        )}
      </button>
    </div>
  );
}
