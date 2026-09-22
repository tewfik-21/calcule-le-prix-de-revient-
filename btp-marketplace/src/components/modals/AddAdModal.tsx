import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, ImagePlus, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { CategoryType, EquipmentType, DealType, Listing, UserSession } from '../../types';

const ALGERIAN_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
];

interface AddAdModalProps {
  user: UserSession | null;
  onClose: () => void;
  onSubmit: (ad: Listing) => void;
  t: any;
  lang: 'fr' | 'ar';
  editingListing?: any;
}

export const AddAdModal: React.FC<AddAdModalProps> = ({ user, onClose, onSubmit, t, lang, editingListing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [title, setTitle] = useState('');
  const [subcat, setSubcat] = useState('');
  const [category, setCategory] = useState<CategoryType>('mines_carrieres');

  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title || '');
      setCategory(editingListing.category || 'mines_carrieres');
      setSubcat(editingListing.subcategory || '');
      setBrand(editingListing.brand || '');
      setModel(editingListing.model || '');
      setYear(editingListing.year?.toString() || '');
      setHours(editingListing.hours?.toString() || '');
      setPrice(editingListing.price?.toString() || '');
      setDescription(editingListing.description || '');
      setLocation(editingListing.location || '');
      setWilaya(editingListing.wilaya || '');
      if (editingListing.images) {
        setImages(editingListing.images);
      }
      if (editingListing.contact_name) setContactName(editingListing.contact_name);
      if (editingListing.contact_phone) setContactPhone(editingListing.contact_phone);
      if (editingListing.contact_email) setContactEmail(editingListing.contact_email);
      setStoreId(editingListing.store_id || null);
    }
  }, [editingListing]);

  const [equipType, setEquipType] = useState<EquipmentType>('machine_production');
  const [dealType, setDealType] = useState<DealType>('location');
  const [price, setPrice] = useState<number | ''>('');
  const [company, setCompany] = useState('');
  const [commune, setCommune] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [desc, setDesc] = useState('');
  const [features, setFeatures] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [coords, setCoords] = useState<[number, number]>([36.7538, 3.0588]);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [hoursOfUse, setHoursOfUse] = useState<number | ''>('');
  const [maintenanceFile, setMaintenanceFile] = useState<File | null>(null);

  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<L.Map | null>(null);
  const modalMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (currentStep === 3 && modalMapContainerRef.current && !modalMapRef.current) {
      const initCoords: [number, number] = [36.7538, 3.0588];
      
      const map = L.map(modalMapContainerRef.current, {
        center: initCoords,
        zoom: 10,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      const marker = L.marker(initCoords, {
        draggable: true
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords([pos.lat, pos.lng]);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCoords([e.latlng.lat, e.latlng.lng]);
      });

      modalMapRef.current = map;
      modalMarkerRef.current = marker;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (currentStep !== 3 && modalMapRef.current) {
        modalMapRef.current.remove();
        modalMapRef.current = null;
        modalMarkerRef.current = null;
      }
    };
  }, [currentStep]);

  const validateStep = (step: number) => {
    if (step === 1) {
      return subcat.trim().length > 0;
    }
    if (step === 2) {
      return title.trim().length > 0;
    }
    if (step === 3) {
      return commune.trim().length > 0;
    }
    if (step === 4) {
      return phone.trim().length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePostAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const listingPremium = user?.isPremium ? isPremium : false;

    const newAd: Listing = {
      id: `ad-${Date.now()}`,
      title,
      description: desc,
      price: price === '' ? 0 : Number(price),
      dealType: category === 'services_experts' ? 'service' : dealType,
      category,
      equipmentType: category === 'services_experts' ? 'consulting' : equipType,
      subcategory: subcat || t(category === 'services_experts' ? 'consulting' : equipType),
      companyName: company,
      wilaya,
      commune,
      phone,
      whatsapp: whatsapp || phone.replace(/\s+/g, ''),
      coords,
      dateAdded: new Date().toLocaleDateString('fr-FR'),
      features: features ? features.split(',').map(f => f.trim()) : [],
      isPremium: listingPremium,
      images: images,
      imageFiles: imageFiles,
      hoursOfUse: hoursOfUse === '' ? undefined : Number(hoursOfUse),
      maintenanceFile: maintenanceFile || undefined
    };

    onSubmit(newAd);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div 
        className="relative bg-[#0a0d16] border border-white/5 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header & Progress */}
        <div className="px-6 py-4.5 border-b border-white/5 bg-slate-900/40 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-white text-base uppercase tracking-wider">{t('post_ad')}</h3>
              <p className="text-[10px] text-orange-450 font-bold uppercase tracking-widest font-mono">{t('app_subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-2 relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0 overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors duration-300 ${
                  step < currentStep ? 'bg-orange-500 border-orange-500 text-slate-900' :
                  step === currentStep ? 'bg-slate-900 border-orange-500 text-orange-500' :
                  'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {step < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStep >= 1 ? 'text-orange-400' : 'text-slate-600'}`}>{lang === 'fr' ? 'Catégorie' : 'التصنيف'}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStep >= 2 ? 'text-orange-400' : 'text-slate-600'}`}>{lang === 'fr' ? 'Détails' : 'التفاصيل'}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStep >= 3 ? 'text-orange-400' : 'text-slate-600'}`}>{lang === 'fr' ? 'Lieu' : 'المكان'}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStep >= 4 ? 'text-orange-400' : 'text-slate-600'}`}>{lang === 'fr' ? 'Contact' : 'التواصل'}</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
          
          {/* STEP 1: Category */}
          {currentStep === 1 && (
            <div className="space-y-4.5 animate-slide-in-right">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('activity')} *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="mines_carrieres">{t('mines_carrieres')}</option>
                  <option value="ceramique_briqueterie">{t('ceramique_briqueterie')}</option>
                  <option value="btp">{t('btp')}</option>
                  <option value="transport_logistique">{t('transport_logistique')}</option>
                  <option value="pieces_detachees">{t('pieces_detachees')}</option>
                  <option value="outils">{t('outils')}</option>
                  <option value="services_experts">{t('services_experts')}</option>
                </select>
              </div>

              {category !== 'services_experts' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('equipment_type')} *</label>
                  <select
                    value={equipType}
                    onChange={e => setEquipType(e.target.value as EquipmentType)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="machine_production">{t('machine_production') || "Machine"}</option>
                    <option value="engin">{t('engin') || "Engin"}</option>
                    <option value="vehicule_lourd_leger">{t('vehicule_lourd_leger') || "Véhicule (Lourd/Léger)"}</option>
                    <option value="matiere_premiere">{t('matiere_premiere') || "Matière Première"}</option>
                    <option value="piece_rechange">{t('piece_rechange')}</option>
                    <option value="vehicule_transport">{t('vehicule_transport')}</option>
                    <option value="porte_char">{t('porte_char') || "Transport Porte-Char"}</option>
                    <option value="depannage">{t('depannage') || "Dépannage & Remorquage"}</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Sous-rubrique / Spécificité *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Excavatrice de Carrière, Extrudeuse..."
                  value={subcat}
                  onChange={e => setSubcat(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none font-semibold"
                />
              </div>

              {category !== 'services_experts' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('transaction')} *</label>
                  <select
                    value={dealType}
                    onChange={e => setDealType(e.target.value as DealType)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="location">{t('location')} / Service</option>
                    <option value="vente">{t('vente')}</option>
                    <option value="achat">{t('achat')}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4.5 animate-slide-in-right">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('ad_title')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pelle CAT 349D pour extraction..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('price_da')} (Laisser vide si s/ demande)</label>
                <input
                  type="number"
                  placeholder="Ex: 25 000"
                  value={price}
                  onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('ad_description')}</label>
                <textarea
                  rows={3}
                  placeholder="Caractéristiques de l'appareil, disponibilité..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  {category === 'services_experts' 
                    ? 'Compétences & Services (Séparés par des virgules)'
                    : category === 'mines_carrieres' 
                      ? 'Détails Techniques ou Qté Minimum (Séparés par des virgules)'
                      : t('specifications')}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Poids 24 tonnes, Qté min 100t, Moteur Volvo"
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-medium"
                />
              </div>

              {(equipType === 'engin' || equipType === 'machine_production' || equipType === 'vehicule_lourd_leger' || equipType === 'porte_char') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('hours') || "Heures"} d'utilisation</label>
                    <input
                      type="number"
                      placeholder="Ex: 4500"
                      value={hoursOfUse}
                      onChange={e => setHoursOfUse(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Carnet d'Entretien</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setMaintenanceFile(e.target.files[0]);
                        }
                      }}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-2 py-1.5 text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-orange-500/20 file:text-orange-500 hover:file:bg-orange-500/30 transition-all cursor-pointer"
                    />
                    {maintenanceFile && <p className="text-[9px] text-emerald-500 mt-1 font-bold truncate">✓ {maintenanceFile.name}</p>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{lang === 'fr' ? 'Photos de l\'offre' : 'صور الإعلان'}</label>
                
                {images.length === 0 ? (
                  <label className="relative border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-2xl p-6 text-center transition bg-slate-900/30 group cursor-pointer flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition">
                      <ImagePlus className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs">
                        {lang === 'fr' ? 'Cliquez pour ajouter des photos' : 'اضغط هنا لإضافة صور للإعلان'}
                      </p>
                      <p className="text-slate-500 text-[9px] mt-1 font-mono">
                        {lang === 'fr' 
                          ? `Gratuit : Max 5 | Premium : Max 20 | VIP : Illimité` 
                          : `المجاني: 5 صور | بريميوم: 20 صورة | VIP: غير محدود`}
                      </p>
                    </div>
                    <input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={e => {
                      if (e.target.files) {
                        let maxImages = 10;
                        let limitText = lang === 'fr' ? '5 images (Hébergement Gratuit)' : '5 صور (الحساب المجاني)';
                        
                        if (user?.isVip) {
                          maxImages = Infinity;
                        } else if (user?.isPremium) {
                          maxImages = 20;
                          limitText = lang === 'fr' ? '20 images (Boutique Premium)' : '20 صورة (حساب بريميوم)';
                        }
                        
                        const newFiles = Array.from(e.target.files);
                        if (newFiles.length > maxImages) {
                          const errorMsg = lang === 'fr' 
                            ? `Désolé, la limite de téléchargement est de ${limitText}.` 
                            : `عذراً، الحد الأقصى لتحميل الصور هو ${limitText}.`;
                          alert(errorMsg);
                          
                          const filesToLoad = newFiles.slice(0, maxImages);
                          const urls = filesToLoad.map(f => URL.createObjectURL(f));
                          setImages(urls);
                          setImageFiles(filesToLoad);
                        } else {
                          const urls = newFiles.map(f => URL.createObjectURL(f));
                          setImages(urls);
                          setImageFiles(newFiles);
                        }
                      }
                    }} />
                  </label>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((src, i) => (
                      <div key={i} className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 relative">
                        <img src={src} className="h-full w-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {
                            setImages(prev => prev.filter((_, idx) => idx !== i));
                            setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                          }} 
                          className="absolute top-1 right-1 h-5 w-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition shadow-md z-30 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="relative h-16 w-16 rounded-xl border border-dashed border-slate-600 bg-slate-900/30 hover:bg-slate-900/60 transition flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-orange-500 overflow-hidden">
                      <ImagePlus className="h-5 w-5 z-10" />
                      <input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={e => {
                        if (e.target.files) {
                          let maxImages = 10;
                          let limitText = lang === 'fr' ? '10 images (Hébergement Gratuit)' : '10 صور (رفع مجاني)';
                          
                          if (user?.isVip) {
                            maxImages = Infinity;
                          } else if (user?.isPremium) {
                            maxImages = 20;
                            limitText = lang === 'fr' ? '20 images (Boutique Premium)' : '20 صورة (حساب بريميوم)';
                          }
                          
                          const newFiles = Array.from(e.target.files);
                          const currentCount = images.length;
                          
                          if (currentCount + newFiles.length > maxImages) {
                            const errorMsg = lang === 'fr' 
                              ? `Désolé, la limite de téléchargement est de ${limitText}.` 
                              : `عذراً، الحد الأقصى لتحميل الصور هو ${limitText}.`;
                            alert(errorMsg);
                            
                            const allowedCount = maxImages - currentCount;
                            if (allowedCount <= 0) return;
                            
                            const filesToLoad = newFiles.slice(0, allowedCount);
                            const urls = filesToLoad.map(f => URL.createObjectURL(f));
                            setImages(prev => [...prev, ...urls]);
                            setImageFiles(prev => [...prev, ...filesToLoad]);
                          } else {
                            const urls = newFiles.map(f => URL.createObjectURL(f));
                            setImages(prev => [...prev, ...urls]);
                            setImageFiles(prev => [...prev, ...newFiles]);
                          }
                        }
                      }} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4.5 animate-slide-in-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('wilaya')} *</label>
                  <select
                    value={wilaya}
                    onChange={e => setWilaya(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white focus:border-orange-500 focus:outline-none"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('commune')} *</label>
                  <input
                    type="text"
                    required
                    placeholder={t('commune_placeholder')}
                    value={commune}
                    onChange={e => setCommune(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('location_on_map')} *</label>
                <div className="h-[250px] w-full border border-white/5 rounded-2xl overflow-hidden shadow-inner relative">
                  <div ref={modalMapContainerRef} className="absolute inset-0" />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold px-1">
                  <span>{lang === 'fr' ? 'Déplacez le marqueur sur votre position' : 'حرك العلامة لموقعك'}</span>
                  <span>{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Contact */}
          {currentStep === 4 && (
            <div className="space-y-4.5 animate-slide-in-right">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('company_name')} {lang === 'fr' ? '(Optionnel)' : '(اختياري)'}</label>
                <input
                  type="text"
                  placeholder="Ex: Entreprise de Concassage Sétif"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('phone')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: +213 550 12 34 56"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{t('whatsapp_number')}</label>
                <input
                  type="text"
                  placeholder="Ex: 213550123456"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-555 focus:border-orange-500 focus:outline-none font-mono font-bold"
                />
              </div>

              {user?.isPremium && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mt-4">
                  <input
                    type="checkbox"
                    id="premium-toggle"
                    checked={isPremium}
                    onChange={e => setIsPremium(e.target.checked)}
                    className="rounded border-slate-700 text-orange-500 focus:ring-orange-500 h-5 w-5 bg-slate-950"
                  />
                  <div>
                    <label htmlFor="premium-toggle" className="text-[12px] font-black text-amber-400 uppercase tracking-wider select-none cursor-pointer block">
                      ✨ {t('highlight_ad')}
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Mettez votre annonce en valeur pour attirer plus de clients.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4.5 border-t border-white/5 flex justify-between items-center shrink-0 bg-slate-900/20">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : handlePrev}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-xl transition"
          >
            {currentStep > 1 ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                {lang === 'fr' ? 'Retour' : 'السابق'}
              </>
            ) : (
              t('cancel')
            )}
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition"
            >
              {lang === 'fr' ? 'Suivant' : 'التالي'}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePostAd}
              disabled={!validateStep(4)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 border border-white/10 transition duration-300"
            >
              {t('publish')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
