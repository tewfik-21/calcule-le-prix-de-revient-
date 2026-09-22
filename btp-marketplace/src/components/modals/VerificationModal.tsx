import React from 'react';
import { X, ShieldCheck, Mail, MessageCircle, Crown, Lock } from 'lucide-react';
import type { UserSession } from '../../types';

interface VerificationModalProps {
  onClose: () => void;
  user: UserSession | null;
  lang: 'fr' | 'ar' | 'en';
  onUpgrade: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ onClose, user, lang, onUpgrade }) => {
  const adminWhatsApp = "213555555555"; // Replace with real number
  const adminEmail = "admin@binadz.com"; // Replace with real email
  
  const whatsappMessage = lang === 'ar' 
    ? `مرحباً، أود توثيق حسابي في منصة Binadz. كود حسابي هو: ${user?.id}`
    : `Bonjour, je souhaite faire vérifier mon compte sur Binadz. Mon ID est: ${user?.id}`;

  const mailtoLink = `mailto:${adminEmail}?subject=Demande de vérification de compte (ID: ${user?.id})&body=${encodeURIComponent(whatsappMessage)}`;
  const waLink = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50 relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                {lang === 'ar' ? 'مركز التوثيق' : 'Centre de Vérification'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {lang === 'ar' ? 'احصل على العلامة الزرقاء' : 'Obtenez le badge bleu'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!user?.isPremium ? (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center relative border border-white/5">
                <ShieldCheck className="h-10 w-10 text-slate-500" />
                <div className="absolute -bottom-2 -right-2 bg-orange-500 p-2 rounded-full border-4 border-slate-900">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">
                  {lang === 'ar' ? 'ميزة حصرية للمشتركين' : 'Fonctionnalité Premium'}
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  {lang === 'ar' 
                    ? 'توثيق الحساب والحصول على العلامة الزرقاء متاح فقط لأصحاب الاشتراك (Premium) لضمان أعلى درجات المصداقية في المنصة.'
                    : 'La vérification de compte et le badge bleu sont exclusifs aux abonnés Premium pour garantir la plus haute crédibilité sur la plateforme.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  onUpgrade();
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-500/20"
              >
                <Crown className="h-5 w-5" />
                {lang === 'ar' ? 'الترقية إلى Premium' : 'Passer au Premium'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-400 shrink-0" />
                <p className="text-sm text-blue-200">
                  {lang === 'ar' 
                    ? 'أنت مشترك مميز! لتوثيق حسابك كبائع معتمد، يرجى إرسال صورة من سجلك التجاري أو بطاقة هويتك عبر إحدى الطرق التالية.'
                    : 'Vous êtes un abonné Premium! Pour vérifier votre compte, veuillez envoyer une copie de votre registre de commerce ou pièce d\'identité via l\'une des méthodes ci-dessous.'}
                </p>
              </div>

              <div className="space-y-3">
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {lang === 'ar' ? 'توثيق سريع عبر واتساب' : 'Vérification via WhatsApp'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'أرسل وثائقك مباشرة' : 'Envoyez vos documents directement'}
                      </p>
                    </div>
                  </div>
                </a>

                <a 
                  href={mailtoLink}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {lang === 'ar' ? 'توثيق عبر الإيميل' : 'Vérification par Email'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {lang === 'ar' ? 'أرسل ملفاتك الرسمية' : 'Envoyez vos dossiers officiels'}
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
