import React, { useState } from 'react';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';
import { createOrGetConversation, sendMessage } from '../../lib/supabaseQueries';

interface MessageModalProps {
  onClose: () => void;
  senderId: string;
  recipientId: string;
  listingId?: string;
  listingTitle?: string;
  lang: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({ 
  onClose, 
  senderId, 
  recipientId, 
  listingId,
  listingTitle,
  lang 
}) => {
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !senderId || senderId === 'guest') return;

    setSending(true);
    setError('');

    try {
      const conv = await createOrGetConversation(senderId, recipientId, listingId);
      if (!conv) throw new Error('Impossible de créer la conversation');

      const fullMessage = contactPhone.trim() 
        ? `Tél: ${contactPhone}\n\n${message}` 
        : message;

      await sendMessage(conv.id, senderId, fullMessage);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error sending message', err);
      setError(lang === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة لاحقاً.' : 'Une erreur s\'est produite. Veuillez réessayer plus tard.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={!sending ? onClose : undefined} />
      
      <div className="relative w-full max-w-md bg-[#0a0d16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-white uppercase tracking-wider">
              {lang === 'ar' ? 'ترك رسالة' : 'Laisser un message'}
            </h3>
          </div>
          <button onClick={onClose} disabled={sending} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {success ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Send className="h-8 w-8 text-emerald-500" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                {lang === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message envoyé avec succès!'}
              </h4>
              <p className="text-sm text-slate-400">
                {lang === 'ar' ? 'سيقوم البائع بالتواصل معك قريباً.' : 'Le vendeur vous contactera bientôt.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {listingTitle && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4">
                  <p className="text-xs text-emerald-400 mb-1">{lang === 'ar' ? 'بخصوص الإعلان:' : 'Concernant l\'annonce :'}</p>
                  <p className="text-sm font-bold text-emerald-300 truncate">{listingTitle}</p>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  {lang === 'ar' ? 'رقم الهاتف (اختياري)' : 'Numéro de téléphone (Optionnel)'}
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: 0555555555' : 'Ex: 0555555555'}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition mb-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  {lang === 'ar' ? 'نص الرسالة' : 'Votre message'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب رسالتك هنا... (مثال: هل المعدات متوفرة؟)' : 'Écrivez votre message ici...'}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition resize-none min-h-[120px]"
                  required
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {lang === 'ar' ? 'إرسال الرسالة' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
