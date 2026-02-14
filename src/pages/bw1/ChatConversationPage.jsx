import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Phone, MapPin } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;
const CHAT_IMG_FALLBACK = "https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=300&q=80";
const READ_NOTIFICATIONS_KEY = "bw1-notifications-read";

export default function ChatConversationPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const normalizeMessages = (items = []) => {
    return items.map((msg) => ({
      id: String(msg.id),
      text: msg.content || msg.text || "",
      sender: msg.sender_id === user?.id ? "me" : "other",
      timestamp: msg.created_at || msg.timestamp || new Date().toISOString(),
    }));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadConversation();
  }, [conversationId, isAuthenticated]);

  useEffect(() => {
    if (!conversationId) return;

    try {
      const readMap = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || "{}");
      readMap[`chat-${conversationId}`] = true;
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readMap));
      window.dispatchEvent(new Event("bw1-activity-updated"));
    } catch {
      // noop
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const [conversationRes, messagesRes] = await Promise.allSettled([
        api.getConversation(conversationId),
        api.getMessages(conversationId),
      ]);

      const conv = conversationRes.status === "fulfilled"
        ? conversationRes.value?.conversation
        : null;

      if (conv) {
        setConversation({
          id: conv.id,
          title: conv?.listings?.title || "Anúncio de interesse",
          listingImage: Array.isArray(conv?.listings?.images)
            ? (conv.listings.images[0] || conv?.other_user?.avatar || CHAT_IMG_FALLBACK)
            : (conv?.listings?.images || conv?.other_user?.avatar || CHAT_IMG_FALLBACK),
          price: conv?.listings?.price || "",
          listingId: conv?.listings?.id || conv?.listing_id || null,
          advertiserName: conv?.other_user?.name || "Anunciante",
        });
      } else {
        setConversation({
          id: conversationId,
          title: "Anúncio de interesse",
          listingImage: CHAT_IMG_FALLBACK,
          price: "",
          listingId: null,
          advertiserName: "Anunciante",
        });
      }

      const messages = messagesRes.status === "fulfilled"
        ? (messagesRes.value?.messages || [])
        : [];

      setMessages(normalizeMessages(messages));
    } catch (error) {
      console.error("Erro ao carregar conversa:", error);
      setConversation({
        id: conversationId,
        title: "Anúncio de interesse",
        listingImage: CHAT_IMG_FALLBACK,
        price: "",
        listingId: null,
        advertiserName: "Anunciante",
      });
      setMessages([]);
    }
  };

  useEffect(() => {
    // Auto-scroll para última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const content = newMessage.trim();
      setNewMessage("");

      await api.sendMessage({
        conversationId,
        content,
      });

      const messagesRes = await api.getMessages(conversationId);
      setMessages(normalizeMessages(messagesRes?.messages || []));
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Conversa não encontrada</p>
          <button
            onClick={() => navigate("/chat")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Voltar para Mensagens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <AppShell
        header={
          <nav className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (window.history.length > 1) {
                        navigate(-1);
                        return;
                      }
                      navigate("/chat");
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <img
                    src={conversation.listingImage}
                    alt={conversation.title}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = CHAT_IMG_FALLBACK;
                    }}
                  />
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">
                      {conversation.advertiserName}
                    </h2>
                    <p className="text-xs text-slate-600">
                      {conversation.title}
                      {conversation.price ? ` • ${conversation.price}` : ""}
                    </p>
                  </div>
                </div>
                {conversation.listingId ? (
                  <Link
                    to={`/anuncio/${conversation.listingId}`}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Anúncio
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-semibold text-slate-400">
                    Anúncio
                  </span>
                )}
              </div>
            </div>
          </nav>
        }
      >
        <main className="flex-1 flex flex-col pt-16 pb-40 lg:pb-24">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-2 ${
                    msg.sender === "me"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-900"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "me" ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+92px)] lg:bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-8px_24px_rgba(2,6,23,0.06)]">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>

        <BottomNav />
      </AppShell>
    </div>
  );
}
