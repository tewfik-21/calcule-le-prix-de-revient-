import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { fetchConversations, fetchMessages, sendMessage, markMessagesAsRead } from '../../lib/supabaseQueries';
import { Send, ArrowLeft, Loader2, MessageCircle, User } from 'lucide-react';
import type { Conversation, Message, UserSession } from '../../types';

interface ChatViewProps {
  user: UserSession;
  t: any;
  lang: string;
  initialConversation?: Conversation | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ user, t, lang, initialConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(initialConversation || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConversation) {
      setSelectedConv(initialConversation);
    }
  }, [initialConversation]);

  useEffect(() => {
    loadConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMsg = payload.new as Message;
        
        // If message belongs to active conversation, append it
        setMessages(prev => {
          if (selectedConv && newMsg.conversation_id === selectedConv.id) {
            // Mark as read if we are receiving it and looking at the chat
            if (newMsg.sender_id !== user.id) {
              markMessagesAsRead(selectedConv.id, user.id);
            }
            return [...prev, newMsg];
          }
          return prev;
        });

        // Always reload conversations to update last_message and unread_counts
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv]);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      markMessagesAsRead(selectedConv.id, user.id);
    }
  }, [selectedConv]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const data = await fetchConversations(user.id);
    setConversations(data);
    setLoadingConvs(false);
  };

  const loadMessages = async (convId: string) => {
    setLoadingMsgs(true);
    const data = await fetchMessages(convId);
    setMessages(data);
    setLoadingMsgs(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    
    setSending(true);
    try {
      await sendMessage(selectedConv.id, user.id, newMessage.trim());
      setNewMessage('');
      // Optimistic or real-time will handle appending
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-140px)] bg-[#0a0d16] rounded-2xl border border-white/5 overflow-hidden">
      
      {/* Conversations List (Sidebar) */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 bg-slate-900/50">
          <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            {lang === 'ar' ? 'الرسائل' : 'Messages'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loadingConvs ? (
            <div className="p-8 text-center text-slate-400 flex justify-center"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              {lang === 'ar' ? 'لا توجد رسائل واردة' : 'Aucun message reçu'}
            </div>
          ) : (
            conversations.map(conv => (
              <button 
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition flex items-center gap-4 ${selectedConv?.id === conv.id ? 'bg-white/5 border-l-2 border-l-emerald-500' : ''}`}
              >
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                    {conv.other_user?.avatar_url ? (
                      <img src={conv.other_user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white text-sm truncate">
                      {conv.other_user?.full_name || conv.other_user?.company_name || 'Utilisateur'}
                    </span>
                  </div>
                  {conv.listing && (
                    <p className="text-[10px] text-emerald-400 truncate mb-1">{conv.listing.title}</p>
                  )}
                  <p className="text-xs text-slate-400 truncate">
                    {conv.last_message?.content || '...'}
                  </p>
                </div>
                {conv.unread_count && conv.unread_count > 0 ? (
                  <div className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unread_count}
                  </div>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
            <MessageCircle className="h-16 w-16 opacity-20" />
            <p>{lang === 'ar' ? 'اختر محادثة للبدء' : 'Sélectionnez une conversation'}</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center gap-4">
              <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 hover:bg-white/5 rounded-xl text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                {selectedConv.other_user?.avatar_url ? (
                  <img src={selectedConv.other_user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white">
                  {selectedConv.other_user?.full_name || selectedConv.other_user?.company_name || 'Utilisateur'}
                </h3>
                {selectedConv.listing && (
                  <p className="text-xs text-emerald-400">{selectedConv.listing.title}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {loadingMsgs ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-slate-400" /></div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-800 text-white rounded-tl-sm border border-slate-700/50'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400 font-medium'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(msg.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Read Only Notice */}
            <div className="p-4 border-t border-white/5 bg-slate-900/30 text-center">
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'يمكنك التواصل مع صاحب الرسالة عبر الهاتف للرد.' : 'Vous pouvez contacter l\'expéditeur par téléphone pour répondre.'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
