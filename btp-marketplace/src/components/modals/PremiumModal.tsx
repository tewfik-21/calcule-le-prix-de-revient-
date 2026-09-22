import React, { useState } from 'react';
import { X, Zap, ShieldCheck, Crown, Upload, CheckCircle, ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { uploadFileToSupabase } from '../../lib/upload';
import { submitPaymentRequest } from '../../lib/supabaseQueries';
import type { UserSession } from '../../types';

interface PremiumModalProps {
  onClose: () => void;
  user: UserSession | null;
  t: any;
  lang?: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, user, t, lang }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'vip' | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock Payment Info
  const paymentInfo = {
    ccp: "6300038 Clé 57",
    rip: "007 99999 0006300038 57",
    name: "MR ZAHI TOUFIK"
  };

  const isArabic = lang === 'ar' || t('login') !== 'Se Connecter';

  const texts = {
    titlePlan: isArabic ? 'اختر خطة الاشتراك' : 'Choisissez votre plan',
    titlePay: isArabic ? 'الدفع' : 'Paiement',
    titleConfirm: isArabic ? 'تأكيد' : 'Confirmation',
    monthly: isArabic ? 'شهري' : 'Mensuel',
    yearly: isArabic ? 'سنوي' : 'Annuel',
    freeMonths: isArabic ? '+ شهرين مجاناً' : '+2 Mois Gratuits',
    choosePremium: isArabic ? 'اختر باقة بريميوم' : 'Choisir Premium',
    chooseVip: isArabic ? 'اختر باقة VIP' : 'Choisir VIP',
    bestOffer: isArabic ? 'الأفضل' : 'Le Meilleur',
    premiumPrice: isYearly 
      ? (isArabic ? '25,000 دج / 12 شهر' : '25 000 DA / 12 Mois') 
      : (isArabic ? '2500 دج / شهر' : '2,500 DA / Mois'),
    vipPrice: isYearly 
      ? (isArabic ? '50,000 دج / 12 شهر' : '50 000 DA / 12 Mois') 
      : (isArabic ? '5000 دج / شهر' : '5,000 DA / Mois'),
    
    premiumBenefits: [
      isArabic ? "نشر ما يصل إلى 5 إعلانات في الشهر" : "Publier jusqu'à 5 Annonces/Mois",
      isArabic ? "حتى 20 صورة لكل إعلان (بدلاً من 5 في المجاني)" : "Jusqu'à 20 photos par annonce (au lieu de 5)",
      isArabic ? "متجر احترافي بشعار ووصف خاص" : "Boutique Pro avec logo et description",
      isArabic ? "شارة بائع موثوق" : "Badge Vendeur de Confiance",
      isArabic ? "تحديث وإعادة نشر إعلاناتك مرة أسبوعياً" : "Remonter vos annonces 1x/semaine",
      isArabic ? "مشاهدة أسعار المناقصات والأسواق العامة" : "Voir le prix des Marchés Publics"
    ],
    
    vipBenefits: [
      isArabic ? "إعلانات غير محدودة" : "Annonces illimitées",
      isArabic ? "صور غير محدودة لكل إعلان" : "Photos illimitées par annonce",
      isArabic ? "جميع مزايا الاشتراك المميز (Premium)" : "Tous les avantages Premium",
      isArabic ? "إعلاناتك تظهر دائماً في أعلى نتائج البحث" : "Annonces toujours en haut des résultats",
      isArabic ? "وصول كامل للمناقصات والصفقات" : "Accès complet aux appels d'offres",
      isArabic ? "إشعارات فورية عبر (رسائل SMS / بريد إلكتروني)" : "Notifications instantanées (SMS/Email)"
    ],

    payInstructions: isArabic ? 'تعليمات الدفع' : 'Instructions de Paiement',
    payDesc: isArabic 
      ? `يرجى دفع مبلغ ${selectedPlan === 'vip' ? (isYearly ? '50,000 دج' : '5000 دج') : (isYearly ? '25,000 دج' : '2500 دج')} إلى الحساب التالي:` 
      : `Veuillez effectuer le paiement de ${selectedPlan === 'vip' ? (isYearly ? '50 000 DA' : '5000 DA') : (isYearly ? '25 000 DA' : '2500 DA')} vers le compte suivant :`,
    
    accountName: isArabic ? 'الاسم واللقب' : 'Nom & Prénom',
    ccpNum: isArabic ? 'رقم الحساب الجاري CCP' : 'N° CCP',
    ripNum: isArabic ? 'رقم الحساب البريدي RIP (بريدي موب)' : 'N° RIP (BaridiMob)',
    uploadTitle: isArabic ? 'قم برفع صورة وصل الدفع' : 'Uploadez la photo du reçu de paiement',
    uploadPlaceholder: isArabic ? 'انقر أو اسحب الصورة هنا' : 'Cliquez ou glissez la photo ici',
    uploadTip: isArabic ? 'PNG, JPG حتى 5 ميغابايت' : 'PNG, JPG jusqu\'à 5MB',
    imageSelected: isArabic ? 'تم اختيار الصورة' : 'Photo sélectionnée',
    btnSend: isArabic ? 'إرسال للتحقق' : 'Envoyer pour vérification',
    btnSending: isArabic ? 'جاري الإرسال...' : 'Envoi en cours...',
    errorLogin: isArabic ? 'الرجاء تسجيل الدخول أولاً.' : 'Veuillez vous connecter d\'abord.',
    errorUpload: isArabic ? 'حدث خطأ أثناء رفع الوصل.' : 'Erreur lors du téléchargement du reçu.',
    errorGeneral: isArabic ? 'حدث خطأ ما.' : 'Une erreur est survenue.',
    
    successTitle: isArabic ? 'تم إرسال الوصل!' : 'Reçu envoyé !',
    successDesc: isArabic 
      ? 'تم إرسال وصل الدفع الخاص بك بنجاح. سيقوم فريقنا بمراجعته وتفعيل اشتراكك في أقرب وقت ممكن.' 
      : 'Votre reçu de paiement a été envoyé avec succès. Notre équipe va le vérifier et activer votre plan dans les plus brefs délais.',
    btnClose: isArabic ? 'إغلاق' : 'Fermer'
  };

  const handleSelectPlan = (plan: 'premium' | 'vip') => {
    if (!user || user.type === 'guest') {
      alert(texts.errorLogin);
      return;
    }
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile || !selectedPlan || !user) return;
    setIsUploading(true);
    
    try {
      // 1. Upload receipt to Storage
      const receiptUrl = await uploadFileToSupabase(receiptFile, 'receipts');
      
      if (!receiptUrl) {
        throw new Error(texts.errorUpload);
      }

      // 2. Insert into payment_requests (duration 1 month or 14 months)
      const durationMonths = isYearly ? 14 : 1;
      await submitPaymentRequest(user.id, selectedPlan, durationMonths, receiptUrl);
      
      // 3. Move to success step
      setStep(3);
    } catch (error: any) {
      console.error(error);
      alert(error.message || texts.errorGeneral);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-[#0a0d16] border border-white/10 rounded-3xl shadow-2xl animate-fade-in z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-full transition text-slate-400 hover:text-white">
                <ArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            )}
            <h2 className="text-xl font-black text-white uppercase tracking-widest">
              {step === 1 ? texts.titlePlan : step === 2 ? texts.titlePay : texts.titleConfirm}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-8">
              {/* Billing Toggle */}
              <div className="flex justify-center">
                <div className="bg-slate-900 p-1 rounded-full inline-flex border border-white/10 relative">
                  <button 
                    onClick={() => setIsYearly(false)}
                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer ${!isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {texts.monthly}
                  </button>
                  <button 
                    onClick={() => setIsYearly(true)}
                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${isYearly ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {texts.yearly} <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{texts.freeMonths}</span>
                  </button>
                  <div 
                    className="absolute top-1 bottom-1 bg-blue-600 rounded-full transition-transform duration-300 ease-in-out shadow-lg"
                    style={{ 
                      left: isArabic ? (isYearly ? '4px' : 'auto') : 'auto',
                      right: isArabic ? (isYearly ? 'auto' : '4px') : 'auto',
                      transform: isArabic 
                        ? 'none' 
                        : (isYearly ? 'translateX(100%)' : 'translateX(0)'),
                      width: isYearly ? 'calc(50% + 20px)' : '50%'
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Premium Card */}
                <div className="flex-1 border border-amber-500 rounded-3xl overflow-hidden shadow-xl shadow-amber-500/10 p-6 flex flex-col hover:-translate-y-1 transition duration-300">
                  <div className="text-center space-y-2 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-black text-white text-lg uppercase tracking-wider">Premium</h3>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-1.5 w-fit mx-auto text-xs font-black text-amber-400 uppercase tracking-widest">
                      {texts.premiumPrice}
                    </div>
                  </div>

                  <div className="space-y-3.5 flex-1 mb-8">
                    {texts.premiumBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
                        <span className="text-slate-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => handleSelectPlan('premium')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition shadow-lg shadow-amber-500/25 cursor-pointer"
                  >
                    {texts.choosePremium}
                  </button>
                </div>

                {/* VIP Card */}
                <div className="flex-1 border border-purple-500 rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10 p-6 flex flex-col hover:-translate-y-1 transition duration-300 relative">
                  <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-purple-500/30">
                    {texts.bestOffer}
                  </div>
                  <div className="text-center space-y-2 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                      <Crown className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-black text-white text-lg uppercase tracking-wider">VIP</h3>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-1.5 w-fit mx-auto text-xs font-black text-purple-400 uppercase tracking-widest">
                      {texts.vipPrice}
                    </div>
                  </div>

                  <div className="space-y-3.5 flex-1 mb-8">
                    {texts.vipBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Crown className="h-5 w-5 text-purple-500 shrink-0" />
                        <span className="text-slate-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => handleSelectPlan('vip')}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition shadow-lg shadow-purple-500/25 cursor-pointer"
                  >
                    {texts.chooseVip}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl mx-auto space-y-8 animate-fade-in py-4">
              <div className="text-center space-y-2">
                <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white">{texts.payInstructions}</h3>
                <p className="text-slate-400 text-sm">{texts.payDesc}</p>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-slate-400 text-sm">{texts.accountName}</span>
                  <strong className="text-white font-bold">{paymentInfo.name}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-slate-400 text-sm">{texts.ccpNum}</span>
                  <strong className="text-white font-bold tracking-widest">{paymentInfo.ccp}</strong>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-400 text-sm">{texts.ripNum}</span>
                  <strong className="text-white font-bold tracking-widest text-xs sm:text-base">{paymentInfo.rip}</strong>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-300 mb-2 text-center">
                  {texts.uploadTitle}
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-3xl p-8 text-center transition bg-slate-900/50 group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {!receiptFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                        <Upload className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{texts.uploadPlaceholder}</p>
                        <p className="text-slate-500 text-xs mt-1">{texts.uploadTip}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-emerald-400 font-bold">{texts.imageSelected}</p>
                        <p className="text-slate-400 text-xs mt-1">{receiptFile.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleSubmitReceipt}
                disabled={!receiptFile || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> {texts.btnSending}</>
                ) : (
                  texts.btnSend
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-white">{texts.successTitle}</h3>
              <p className="text-slate-400">
                {texts.successDesc}
              </p>
              <button 
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition cursor-pointer"
              >
                {texts.btnClose}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
