import React, { useState } from 'react';
import { User, Mail, Lock, Loader2, AlertCircle, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (identity: string, type: 'email' | 'phone' | 'oauth') => void;
  onGuestLogin: () => void;
  t: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onGuestLogin, t }) => {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isArabic = t('login') !== 'Se Connecter';

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('OAuth Error:', err);
      setErrorMsg(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetEmailSent(true);
    } catch (err: any) {
      setErrorMsg(err.message === 'User not found' ? 'Utilisateur non trouvé' : 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!authEmail || !authPassword) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        
        if (data.user) {
          // Setup profile
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: authEmail.split('@')[0], // default
            whatsapp: whatsapp,
          });
          onLogin(authEmail, 'email');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          onLogin(authEmail, 'email');
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setErrorMsg(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#0a0d16] border border-white/5 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
            <User className="h-6 w-6 text-orange-500" />
          </div>
          <h3 className="font-black text-white text-base uppercase tracking-wider">{t('connect_title')}</h3>
          <p className="text-[11px] text-slate-450 leading-normal max-w-xs mx-auto">{t('connect_subtitle')}</p>
        </div>

        {/* Login form */}
        {isResettingPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h3 className="text-white font-bold text-center mb-2">
              {isArabic ? 'استعادة كلمة المرور' : 'Réinitialiser le mot de passe'}
            </h3>
            
            {resetEmailSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-400 text-sm font-semibold mb-2">
                  {isArabic ? 'تم إرسال الرابط إلى بريدك الإلكتروني.' : 'Lien envoyé à votre adresse e-mail.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="text-white text-xs hover:underline"
                >
                  {isArabic ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-xs text-center">
                  {isArabic 
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.' 
                    : 'Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
                </p>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="exemple@email.com"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
                
                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-semibold text-rose-400">{errorMsg}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !authEmail}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    isArabic ? 'إرسال الرابط' : 'Envoyer le lien'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(false)}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold transition mt-2"
                >
                  {isArabic ? 'العودة' : 'Retour'}
                </button>
              </>
            )}
          </form>
        ) : (
          <>
            {/* Google OAuth Button */}
            <div className="w-full animate-fade-in">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-3 transition shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isArabic ? 'المتابعة باستخدام Google' : 'Continuer avec Google'}
              </button>
            </div>

            {/* OR Divider */}
            <div className="flex items-center justify-between gap-3 text-slate-500 font-black text-[9px] uppercase tracking-widest my-1">
              <div className="h-px bg-white/5 flex-1" />
              <span>{t('or')} Email</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl text-center flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="contact@entreprise.dz"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{isArabic ? 'كلمة المرور' : 'Mot de passe'} *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                    />
                  </div>
                  {!isSignUp && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsResettingPassword(true)}
                        className="text-[10px] text-orange-500 hover:text-orange-400 font-bold"
                      >
                        {isArabic ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                      </button>
                    </div>
                  )}
                </div>
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Numéro WhatsApp *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required={isSignUp}
                        placeholder="+213..."
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-orange-500/15 border border-white/10 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSignUp ? (isArabic ? "إنشاء حساب" : "Créer un compte") : t('login')}
              </button>
              
              <div className="text-center mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-bold"
                >
                  {isSignUp ? (isArabic ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Déjà un compte ? Connectez-vous") : (isArabic ? "ليس لديك حساب؟ إنشاء حساب" : "Pas encore de compte ? Créer un compte")}
                </button>
              </div>
            </form>
          </>
        )}

        <div className="flex items-center justify-between gap-3 text-slate-600 font-black text-[9px] uppercase tracking-widest my-1">
          <div className="h-px bg-white/5 flex-1" />
          <span>{t('or')}</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        {/* Guest entrance trigger */}
        <button
          onClick={onGuestLogin}
          className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <User className="h-4 w-4 text-orange-500" />
          <span>{t('guest_mode')}</span>
        </button>

        {/* VIP / Premium Subscription Promo */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-500">
            <Crown className="h-4.5 w-4.5 shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-wider">
              {isArabic ? 'عضوية بريميوم و VIP مميزة' : 'Abonnements Premium & VIP'}
            </h4>
          </div>
          <p className="text-[9px] text-slate-450 leading-relaxed">
            {isArabic 
              ? 'اشترك لترقية حسابك ونشر إعلانات غير محدودة وإبراز عروضك في أعلى نتائج البحث للحصول على مبيعات أسرع.' 
              : 'Abonnez-vous pour publier des annonces illimitées, obtenir un badge pro et booster la visibilité de vos offres.'}
          </p>
        </div>

      </div>
    </div>
  );
};
