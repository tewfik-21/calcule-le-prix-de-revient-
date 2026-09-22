import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

target = """              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${selectedListing.phone}`}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition text-center"
                >
                  <Phone className="h-4 w-4 text-orange-500" />
                  <span>{t('call')}</span>
                </a>
                <a
                  href={`https://wa.me/${selectedListing.whatsapp}?text=Bonjour,%20je%20suis%20intéressé%20par%20votre%20annonce%20:%20${encodeURIComponent(selectedListing.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition text-center shadow-lg shadow-emerald-500/10 border border-emerald-400/20"
                >
                  <span>{t('whatsapp')}</span>
                </a>
              </div>"""

replacement = """              <div className="grid grid-cols-1 gap-3">
                {!user ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 transition text-center"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-orange-500" />
                      <span>{lang === 'ar' ? 'عرض رقم الهاتف' : 'Afficher le numéro'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium normal-case">{lang === 'ar' ? 'قم بتسجيل الدخول لرؤية تفاصيل الاتصال بالبائع' : 'Connectez-vous pour voir les coordonnées du vendeur'}</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${selectedListing.phone}`}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Phone className="h-4 w-4 text-orange-500" />
                      <span>{t('call')}</span>
                    </a>
                    <a
                      href={`https://wa.me/${selectedListing.whatsapp}?text=Bonjour,%20je%20suis%20intéressé%20par%20votre%20annonce%20:%20${encodeURIComponent(selectedListing.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition text-center shadow-lg shadow-emerald-500/10 border border-emerald-400/20"
                    >
                      <span>{t('whatsapp')}</span>
                    </a>
                  </div>
                )}
              </div>"""

app = app.replace(target, replacement)

# ensure Lock is imported from lucide-react
if "Lock" not in app.split('lucide-react')[0]:
    app = app.replace("import { Search, MapPin, Grid, Plus, Menu, ArrowRight, Activity, ShieldCheck, Star, ChevronDown, Check, Globe, LayoutDashboard, FileText, Settings, Key, Building2, Store, Users, Zap, X, Filter, LogOut, ChevronRight, User, Phone, Mail, FileEdit, Trash2, Shield, Heart, Clock, TrendingUp, Package, ExternalLink, Briefcase, Calculator, Building, Compass, ClipboardList, MessageCircle } from 'lucide-react';", 
                      "import { Search, MapPin, Grid, Plus, Menu, ArrowRight, Activity, ShieldCheck, Star, ChevronDown, Check, Globe, LayoutDashboard, FileText, Settings, Key, Building2, Store, Users, Zap, X, Filter, LogOut, ChevronRight, User, Phone, Mail, FileEdit, Trash2, Shield, Heart, Clock, TrendingUp, Package, ExternalLink, Briefcase, Calculator, Building, Compass, ClipboardList, MessageCircle, Lock } from 'lucide-react';")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("Lock logic added successfully.")
