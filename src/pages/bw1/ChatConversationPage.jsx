import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare, Check, CheckCheck } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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
      setLoading(true);
      setNotFound(false);
      
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
          advertiserUserId: conv?.other_user?.id || null,
        });
      } else {
        // Se não encontrou a conversa, marca como não encontrada
        setNotFound(true);
        setConversation({
          id: conversationId,
          title: "Anúncio de interesse",
          listingImage: CHAT_IMG_FALLBACK,
          price: "",
          listingId: null,
          advertiserName: "Anunciante",
          advertiserUserId: null,
        });
      }

      const messages = messagesRes.status === "fulfilled"
        ? (messagesRes.value?.messages || [])
        : [];

      setMessages(normalizeMessages(messages));
    } catch (error) {
      console.error("Erro ao carregar conversa:", error);
      setNotFound(true);
      setConversation({
        id: conversationId,
        title: "Anúncio de interesse",
        listingImage: CHAT_IMG_FALLBACK,
        price: "",
        listingId: null,
        advertiserName: "Anunciante",
        advertiserUserId: null,
      });
      setMessages([]);
    } finally {
      setLoading(false);
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
      const tempId = `temp-${Date.now()}`;
      setNewMessage("");

      // Adiciona mensagem otimisticamente (aparece instantaneamente)
      const optimisticMessage = {
        id: tempId,
        text: content,
        sender: "me",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMessage]);

      // Envia para o backend
      const response = await api.sendMessage({
        conversationId,
        content,
      });

      // Substitui a mensagem temporária pela real do servidor
      if (response?.message) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? {
                id: String(response.message.id),
                text: response.message.content || content,
                sender: "me",
                timestamp: response.message.created_at || msg.timestamp,
              }
            : msg
        ));
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Remove mensagem otimista em caso de erro
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      alert("Erro ao enviar mensagem. Tente novamente.");
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

  // Mostra loading enquanto carrega
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  // Mostra erro apenas se realmente não encontrou
  if (notFound) {
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

  if (!conversation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Header fixo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
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
              <div className="flex-1 min-w-0">
                {conversation.advertiserUserId ? (
                  <Link 
                    to={`/perfil/${conversation.advertiserUserId}`}
                    className="font-bold text-slate-900 text-sm truncate hover:text-blue-600 transition block"
                  >
                    {conversation.advertiserName}
                  </Link>
                ) : (
                  <h2 className="font-bold text-slate-900 text-sm truncate">
                    {conversation.advertiserName}
                  </h2>
                )}
                <p className="text-xs text-slate-600 truncate">
                  {conversation.title}
                  {conversation.price ? ` • ${conversation.price}` : ""}
                </p>
              </div>
            </div>
            {conversation.listingId ? (
              <Link
                to={`/anuncio/${conversation.listingId}`}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
              >
                Ver anúncio
              </Link>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Main content com altura fixa */}
      <main className="flex-1 flex flex-col pt-16" style={{ height: '100vh' }}>
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-1 bg-gradient-to-b from-slate-50 to-slate-100">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Nenhuma mensagem ainda
                  </h3>
                  <p className="text-sm text-slate-500">
                    Envie a primeira mensagem para iniciar a conversa
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const nextMsg = messages[index + 1];
                const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender;
                const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;
                const isSingleMessage = isFirstInGroup && isLastInGroup;
                
                // Estilo WhatsApp: cantos arredondados específicos
                let roundedClass = '';
                if (msg.sender === "me") {
                  if (isSingleMessage) {
                    roundedClass = 'rounded-2xl';
                  } else if (isFirstInGroup) {
                    roundedClass = 'rounded-2xl rounded-br-md';
                  } else if (isLastInGroup) {
                    roundedClass = 'rounded-2xl rounded-tr-md';
                  } else {
                    roundedClass = 'rounded-2xl rounded-tr-md rounded-br-md';
                  }
                } else {
                  if (isSingleMessage) {
                    roundedClass = 'rounded-2xl';
                  } else if (isFirstInGroup) {
                    roundedClass = 'rounded-2xl rounded-bl-md';
                  } else if (isLastInGroup) {
                    roundedClass = 'rounded-2xl rounded-tl-md';
                  } else {
                    roundedClass = 'rounded-2xl rounded-tl-md rounded-bl-md';
                  }
                }
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    } ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-lg ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-900 shadow-sm"
                      } ${roundedClass} px-3 py-2`}
                    >
                      <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text}
                      </p>
                      {isLastInGroup && (
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            msg.sender === "me" ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          <span>{formatTime(msg.timestamp)}</span>
                          {msg.sender === "me" && (
                            <span className="inline-flex items-center ml-0.5">
                              {/* Sempre mostra 1 check para mensagens enviadas (sem sistema de leitura ainda) */}
                              <Check size={14} className={msg.id.startsWith('temp-') ? "opacity-50" : "opacity-90"} />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <div className="sticky bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex items-end gap-3 pb-safe">
              <textarea
                rows="1"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-[120px] overflow-y-auto"
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end"
                aria-label="Enviar mensagem"
                title={sending ? "Enviando..." : "Enviar mensagem"}
              >
                {sending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
}
