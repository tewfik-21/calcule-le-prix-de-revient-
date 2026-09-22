import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import type { Listing, UserSession } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  user: UserSession | null;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, listing, user }) => {
  const [messages, setMessages] = useState<{id: string, sender_id: string, receiver_id: string, content: string, created_at: string}[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !listing || !user || user.id === 'guest') return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${listing.sellerId || 'mock'}),and(sender_id.eq.${listing.sellerId || 'mock'},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };
    
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as any]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, listing?.id, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !listing) return null;

  const handleSend = async () => {
    if (!input.trim() || !user || user.id === 'guest') return;
    
    const sellerId = listing.sellerId || 'mock'; // Depending on backend
    const newMessage = {
      sender_id: user.id,
      receiver_id: sellerId,
      content: input.trim(),
      is_read: false
    };

    setInput('');
    
    // Optimistic update
    const optimisticMsg = {
      id: Math.random().toString(),
      sender_id: user.id,
      receiver_id: sellerId,
      content: input.trim(),
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Insert to DB
    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 sm:p-4 sm:justify-center sm:items-center">
      {/* Overlay for desktop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm hidden sm:block" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative flex flex-col w-full h-full sm:h-[600px] sm:max-w-md bg-slate-900 sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-10 animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-white/5 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
              <User className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">{listing.companyName}</h3>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">En ligne</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!user || user.id === 'guest') && (
             <div className="text-center text-sm text-slate-400 p-4">Vous devez vous connecter pour envoyer un message.</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.sender_id === user?.id 
                  ? 'bg-orange-600 text-white rounded-br-sm' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 p-4 bg-slate-950 border-t border-white/5 pb-safe">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={user?.id !== 'guest' ? "Écrire un message..." : "Connectez-vous pour discuter"}
              disabled={!user || user.id === 'guest'}
              className="flex-1 bg-slate-900 border border-white/10 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50"
            />
            <button 
              onClick={handleSend}
              disabled={!user || user.id === 'guest'}
              className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white rounded-full transition shadow-lg shadow-orange-500/20 shrink-0 active:scale-95"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
