import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Phone, MapPin } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppShell from "./components/AppShell";

import * as BrandMod from "./content/brand.js";
import * as NavMod from "./content/navigation.js";

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;

export default function ChatConversationPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Carrega conversa do localStorage
    const stored = localStorage.getItem("bw1_conversations");
    if (stored) {
      const conversations = JSON.parse(stored);
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setConversation(conv);
        setMessages(conv.messages || []);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    // Auto-scroll para última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "me",
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Atualiza localStorage
    const stored = localStorage.getItem("bw1_conversations");
    if (stored) {
      const conversations = JSON.parse(stored);
      const index = conversations.findIndex((c) => c.id === conversationId);
      if (index !== -1) {
        conversations[index].messages = updatedMessages;
        conversations[index].lastMessage = newMessage;
        conversations[index].lastMessageTime = new Date().toISOString();
        localStorage.setItem("bw1_conversations", JSON.stringify(conversations));
      }
    }

    setNewMessage("");

    // Simula resposta automática (apenas para demo)
    setTimeout(() => {
      const autoReply = {
        id: (Date.now() + 1).toString(),
        text: "Obrigado pela mensagem! Responderei em breve.",
        sender: "other",
        timestamp: new Date().toISOString(),
      };
      const withReply = [...updatedMessages, autoReply];
      setMessages(withReply);

      // Atualiza localStorage com resposta
      const stored2 = localStorage.getItem("bw1_conversations");
      if (stored2) {
        const conversations = JSON.parse(stored2);
        const index = conversations.findIndex((c) => c.id === conversationId);
        if (index !== -1) {
          conversations[index].messages = withReply;
          conversations[index].lastMessage = autoReply.text;
          conversations[index].lastMessageTime = autoReply.timestamp;
          localStorage.setItem("bw1_conversations", JSON.stringify(conversations));
        }
      }
    }, 2000);
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
                    onClick={() => navigate("/chat")}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <img
                    src={conversation.listingImage}
                    alt={conversation.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">
                      {conversation.title}
                    </h2>
                    <p className="text-xs text-slate-600">{conversation.price}</p>
                  </div>
                </div>
                <Link
                  to={`/anuncio/${conversation.listingId}`}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Ver Anúncio
                </Link>
              </div>
            </div>
          </nav>
        }
      >
        <main className="flex-1 flex flex-col pt-16 pb-24 lg:pb-8">
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
          <div className="fixed bottom-20 lg:bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
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
