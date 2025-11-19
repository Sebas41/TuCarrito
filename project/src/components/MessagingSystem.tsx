import React, { useState, useEffect, useRef } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { localStorageService, Conversation, Message } from '../lib/localStorageService';
import { MessageCircle, Send, ArrowLeft, Loader2, CheckCheck, Check, AlertCircle, Bell, BellOff } from 'lucide-react';
import { checkSupabaseConnection } from '../lib/checkSupabase';

interface MessagingSystemProps {
  onBack: () => void;
  initialConversationId?: string;
  initialOtherUserId?: string;
  initialVehicleId?: string;
}

export default function MessagingSystem({
  onBack,
  initialConversationId,
  initialOtherUserId,
  initialVehicleId
}: MessagingSystemProps) {
  const { user } = useSimpleAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef<Message[]>([]);

  // Verificar conexión a Supabase al montar
  useEffect(() => {
    checkSupabaseConnection().then(isConnected => {
      if (!isConnected) {
        setConnectionError(true);
        setError('No se pudo conectar con el servidor de mensajería. Por favor, contacta al administrador.');
      }
    });
    
    // Verificar si las notificaciones están habilitadas
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Cargar conversaciones
  useEffect(() => {
    loadConversations();
  }, [user]);

  // Cargar conversación inicial si se proporciona
  useEffect(() => {
    if (initialConversationId) {
      const conv = conversations.find(c => c.id === initialConversationId);
      if (conv) {
        handleSelectConversation(conv);
      }
    } else if (initialOtherUserId && user) {
      createNewConversation(initialOtherUserId, initialVehicleId);
    }
  }, [initialConversationId, initialOtherUserId, conversations]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Actualizar mensajes cada 3 segundos cuando hay una conversación seleccionada
  useEffect(() => {
    if (!selectedConversation) return;

    // Cargar mensajes inmediatamente
    loadMessages(selectedConversation.id);

    // Configurar polling cada 3 segundos
    const interval = setInterval(() => {
      loadMessages(selectedConversation.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Polling para actualizar conversaciones cada 5 segundos
  useEffect(() => {
    if (!user || selectedConversation) return;

    const interval = setInterval(() => {
      loadConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const convs = await localStorageService.getUserConversations(user.id);
      setConversations(convs);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (otherUserId: string, vehicleId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await localStorageService.getOrCreateConversation(
        user.id,
        otherUserId,
        vehicleId
      );

      if (result.success && result.conversation) {
        await loadConversations();
        setSelectedConversation(result.conversation);
        loadMessages(result.conversation.id);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Error al crear la conversación');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setError('');
    loadMessages(conversation.id);
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const msgs = await localStorageService.getConversationMessages(conversationId, user.id);
      
      // Detectar mensajes nuevos para notificaciones
      if (previousMessagesRef.current.length > 0 && msgs.length > previousMessagesRef.current.length) {
        const newMessages = msgs.filter(
          msg => !previousMessagesRef.current.find(prevMsg => prevMsg.id === msg.id)
        );
        
        // Notificar solo mensajes de otros usuarios y si no está en la conversación activa
        newMessages.forEach(msg => {
          if (msg.senderId !== user.id && document.hidden) {
            showNotification(msg);
          }
        });
      }
      
      previousMessagesRef.current = msgs;
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const showNotification = (message: Message) => {
    if (!notificationsEnabled || !('Notification' in window)) return;
    
    const conversation = conversations.find(c => c.id === message.conversationId) || selectedConversation;
    
    const title = `Nuevo mensaje de ${message.senderName}`;
    const body = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;
    
    const notification = new Notification(title, {
      body,
      icon: '/icon.png', // Puedes cambiar esto por tu icono
      badge: '/icon.png',
      tag: message.conversationId, // Evita duplicados de la misma conversación
      requireInteraction: false,
      silent: false
    });
    
    notification.onclick = () => {
      window.focus();
      if (conversation) {
        setSelectedConversation(conversation);
      }
      notification.close();
    };
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(false);
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      // Mostrar notificación de prueba
      new Notification('Notificaciones activadas', {
        body: 'Recibirás notificaciones cuando lleguen mensajes nuevos',
        icon: '/icon.png'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConversation || !user || !messageText.trim()) return;

    setSending(true);
    setError('');

    try {
      const result = await localStorageService.sendMessage(
        selectedConversation.id,
        user.id,
        messageText
      );

      if (result.success) {
        setMessageText('');
        await loadMessages(selectedConversation.id);
        await loadConversations(); // Actualizar lista de conversaciones
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return '';
    return localStorageService.getOtherParticipant(conversation, user.id)?.name || 'Usuario';
  };

  // Vista de lista de conversaciones
  if (!selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </button>
              <h1 className="text-xl font-bold text-slate-900">Mensajes</h1>
              <button
                onClick={requestNotificationPermission}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  notificationsEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={notificationsEnabled ? 'Notificaciones activadas' : 'Activar notificaciones'}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Activadas</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Activar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto py-8 px-4">
          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Error de Conexión</h3>
                  <p className="text-sm text-red-800 mb-3">
                    No se pudo conectar con el servidor de mensajería. Las tablas necesarias no existen en la base de datos.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Para solucionar:</p>
                    <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                      <li>Ve a tu Dashboard de Supabase</li>
                      <li>Abre SQL Editor → New Query</li>
                      <li>Copia el contenido de: <code className="bg-slate-100 px-1 rounded">supabase/migrations/20251111000000_create_messaging_tables.sql</code></li>
                      <li>Ejecuta el script</li>
                      <li>Recarga esta página</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No tienes conversaciones
              </h3>
              <p className="text-slate-600">
                Contacta a un vendedor desde el catálogo de vehículos para iniciar una conversación
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-200">
              {conversations.map((conversation) => {
                const otherName = getOtherParticipantName(conversation);
                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="w-full p-4 hover:bg-slate-50 transition-colors text-left flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-lg">
                        {otherName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {otherName}
                        </h3>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      {conversation.vehicleInfo && (
                        <p className="text-xs text-blue-600 mb-1">
                          {conversation.vehicleInfo.brand} {conversation.vehicleInfo.model} {conversation.vehicleInfo.year}
                        </p>
                      )}
                      {conversation.lastMessagePreview && (
                        <p className="text-sm text-slate-600 truncate">
                          {conversation.lastMessagePreview}
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista de conversación individual
  const otherParticipantName = getOtherParticipantName(selectedConversation);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setSelectedConversation(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center">
              <h2 className="font-semibold text-slate-900">{otherParticipantName}</h2>
              {selectedConversation.vehicleInfo && (
                <p className="text-xs text-slate-600">
                  {selectedConversation.vehicleInfo.brand} {selectedConversation.vehicleInfo.model} {selectedConversation.vehicleInfo.year}
                </p>
              )}
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay mensajes aún. ¡Envía el primero!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.sentAt)}
                      </span>
                      {isOwn && (
                        <span className="text-slate-400">
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Enviar</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
