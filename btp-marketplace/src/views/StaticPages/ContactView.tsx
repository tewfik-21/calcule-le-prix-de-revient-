import React, { useState } from 'react';
import { ChevronLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ContactViewProps {
  onBack: () => void;
}

export function ContactView({ onBack }: ContactViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // 1. Save to Supabase (Archive)
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }]);

      if (submitError) {
        console.error("Error saving message to Supabase:", submitError);
      }

      // 2. Send Email via Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "ca281c19-9b6d-4c0f-8b64-b75850415978",
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Nouveau message de contact',
          message: formData.message,
          from_name: "Binadz"
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setIsSent(false), 5000);
      } else {
        setError('Une erreur est survenue lors de l\'envoi de l\'email.');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez vérifier votre internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 md:pb-0 relative text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center h-16 px-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 mr-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Contactez-nous</h1>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-5xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Restons en contact</h2>
              <p className="text-slate-400">Notre équipe est là pour répondre à toutes vos questions concernant la plateforme.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Téléphone</p>
                  <p className="font-semibold">00213676673495</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="bg-orange-500/10 p-3 rounded-full text-orange-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Adresse</p>
                  <p className="font-semibold text-sm">Algérie</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nom complet</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Sujet</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Sujet de votre message"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSent ? (
                    'Message envoyé !'
                  ) : (
                    <>
                      <span>Envoyer le message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-xl text-center">
                    {error}
                  </div>
                )}
                {isSent && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold rounded-xl text-center">
                    Votre message a été envoyé avec succès. Nous vous contacterons bientôt !
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
