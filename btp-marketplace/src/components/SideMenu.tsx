import React from 'react';
import { X, LogOut, ChevronRight, Tags, User, Heart, Globe, ShieldCheck, Shield } from 'lucide-react';
import type { UserSession } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onLogout: () => void;
  onLogin: () => void;
  categories: any[];
  onCategorySelect: (catId: string) => void;
  onFavoritesSelect?: () => void;
  onVerificationSelect?: () => void;
  t: any;
  lang: string;
  setLang: (lang: 'fr' | 'en' | 'ar') => void;
  onStaticPageSelect?: (page: 'how_to_advertise' | 'terms_of_use' | 'terms_of_sale' | 'contact') => void;
  onAdminSelect?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onLogin,
  categories,
  onCategorySelect,
  onFavoritesSelect,
  onVerificationSelect,
  t,
  lang,
  setLang,
  onStaticPageSelect,
  onAdminSelect
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-white/10 z-[110] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              <User className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{user ? user.identity : t('login')}</p>
              {user && (
                <p className="text-[10px] text-orange-400 uppercase tracking-widest">{user.isPremium ? t('premium_badge') : t('standard_badge')}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          
          {/* Language Switcher (Mobile Menu) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-2 text-slate-400">
              <Globe className="h-4 w-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Langue / Language / اللغة</h3>
            </div>
            <div className="flex gap-2 px-2">
              {[
                { code: 'fr', label: 'FR' },
                { code: 'en', label: 'EN' },
                { code: 'ar', label: 'عربی' }
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code as any);
                    onClose();
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    lang === l.code
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites (Mobile) */}
          {onFavoritesSelect && (
            <>
              <button 
                onClick={() => {
                  onClose();
                  onFavoritesSelect?.();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-xl group"
              >
                <Heart className="h-5 w-5" />
                <span className="font-bold text-sm">{lang === 'ar' ? 'المفضلة' : 'Mes Favoris'}</span>
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onVerificationSelect?.();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition rounded-xl group"
              >
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-sm">{lang === 'ar' ? 'توثيق الحساب' : 'Centre de Vérification'}</span>
              </button>
            </>
          )}

          {/* Categories */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-2 text-slate-400">
              <Tags className="h-4 w-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Catégorie</h3>
            </div>
            <div className="space-y-1">
              {categories.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategorySelect(cat.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 text-slate-300 hover:text-white transition group text-left"
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-slate-500 text-xs w-4">{index + 1}-</span>
                    {t(cat.id)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>

          
          {/* Footer Links */}
          <div className="mt-8 border-t border-white/5 pt-6 pb-4 space-y-6 px-4">
            <button onClick={() => { onStaticPageSelect?.('how_to_advertise'); onClose(); }} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('how_to_advertise')}</button>
            <button onClick={() => { onStaticPageSelect?.('terms_of_use'); onClose(); }} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('terms_of_use')}</button>
            <button onClick={() => { onStaticPageSelect?.('terms_of_sale'); onClose(); }} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('terms_of_sale')}</button>
            <button onClick={() => { onStaticPageSelect?.('contact'); onClose(); }} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('contact')}</button>
          </div>

        </div>

        {/* Footer (Logout) */}
        <div className="p-4 border-t border-white/5">
          {user ? (
            <>
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    onAdminSelect?.();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold p-3 rounded-xl transition mb-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'لوحة تحكم المسؤول' : lang === 'fr' ? 'Panneau Admin' : 'Admin Panel'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold p-3 rounded-xl transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </button>
            </>
          ) : (
            <button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold p-3 rounded-xl transition"
            >
              <User className="h-4 w-4" />
              <span>Se connecter</span>
            </button>
          )}
        </div>
        
      </div>
    </>
  );
};
