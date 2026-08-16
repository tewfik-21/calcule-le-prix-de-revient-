import React, { useState, useEffect, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import AdminPanel from './components/AdminPanel';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { 
  DevisModal, 
  QrModal, 
  LimitPopup, 
  PremiumModal,
  AuthModal,
  AddAdModal,
  AddTenderModal,
  LeasingModal,
  CompareModal,
  AlertModal,
  SparePartRequestModal,
  FiltersModal,
  MyAdsModal,
  VerificationModal
} from './components/modals';
import { ChatModal } from './components/modals/ChatModal';
import { AddJobModal } from './components/modals/AddJobModal';
import { AddAuctionModal } from './components/modals/AddAuctionModal';
import { AddStoreModal } from './components/modals/AddStoreModal';
import { SideMenu } from './components/SideMenu';
import { HowToAdvertiseView } from './views/StaticPages/HowToAdvertiseView';
import { TermsOfUseView } from './views/StaticPages/TermsOfUseView';
import { TermsOfSaleView } from './views/StaticPages/TermsOfSaleView';
import { ContactView } from './views/StaticPages/ContactView';
import { FeedView, StoresView, TendersView, JobsView, AuctionsView, AdminView, ChatView, OnboardingView } from './components/views';
import { 
  Filter,
  Search, 
  MapPin, 
  Plus, 
  Phone, 
  Menu, 
  Bell, 
  Compass, 
  X, 
  SlidersHorizontal,
  Bookmark,
  Building,
  Check,
  Calendar,
  Grid,
  Map,
  List,
  Globe,
  User,
  LogOut,
  Smartphone,
  ShieldCheck,
  Zap,
  Eye,
  MousePointer2,
  Store as StoreIcon,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  ArrowRightLeft,
  ClipboardList,
  Star,
  Clock,
  FileText,
  BadgeCheck,
  Calculator,
  Gavel,
  BellRing,
  Wrench,
  TrendingUp,
  BarChart3,
  Users,
  MousePointerClick,
  MessageCircle,
  Package,
  Heart,
  Share2,
  Flag
, Lock} from 'lucide-react';
import type { Listing, DealType, CategoryType, EquipmentType, Store, Tender, UserSession, AdBanner, JobOffer, Auction } from './types';
import { INITIAL_LISTINGS } from './mockData';
import { supabase } from './lib/supabaseClient';
import { fetchStores, fetchTenders, fetchJobOffers, fetchAuctions, fetchBanners, createOrGetConversation, deleteMyListing, updateMyListing } from './lib/supabaseQueries';
import { uploadFileToSupabase } from './lib/upload';
import { initPushNotifications } from './lib/pushNotifications';

// Algerian Wilayas List (58 Wilayas)
export const ALGERIAN_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
  'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
];

// Helper functions for categories
const getCategoryIconSymbol = (cat: CategoryType) => {
  switch (cat) {
    case 'mines_carrieres': return '⛏️';
    case 'ceramique_briqueterie': return '🧱';
    case 'btp': return '🏗️';
    case 'services_experts': return '🤝';
    case 'transport_logistique': return '🚛';
    case 'pieces_detachees': return '⚙️';
    default: return '📦';
  }
};

// Translations Dictionary
const translations = {
  fr: {
    app_title: 'Binadz',
    app_subtitle: 'Marché des Mines, Carrières et BTP',
    post_ad: 'Déposer une annonce',
    search_placeholder: 'Rechercher excavatrice, sable, tuiles, concassage...',
    all_categories: 'Toutes les rubriques',
    mines_carrieres: 'Mines & Carrières',
    ceramique_briqueterie: 'Céramique & Briqueterie',
    btp: 'BTP & Travaux Publics',
    services_experts: 'Services',
    transport_logistique: 'Transport & Logistique',
    pieces_detachees: 'Pièces de Rechange',
    outils: 'Outils & Équipements',
    piece_rechange: 'Pièces de Rechange (Equip.)',
    vehicule_transport: 'Véhicule & Transport',
    porte_char: 'Transport Porte-Char',
    depannage: 'Dépannage & Remorquage',
    hours: 'Heures',
    all: 'Tout',
    vente: 'Vente',
    jobs: 'Emploi BTP',
    location: 'Location',
    achat: 'Achat',
    filtres: 'Filtres',
    min_price: 'Prix minimum (DA)',
    max_price: 'Prix maximum (DA)',
    wilaya: 'Wilaya',
    commune: 'Commune',
    all_wilayas: 'Toutes les Wilayas',
    wilaya_placeholder: 'Sélectionner la Wilaya',
    commune_placeholder: 'Entrer la Commune (ex: Rouiba)',
    listings_found: 'Annonces trouvées',
    no_listings: 'Aucune offre trouvée',
    no_listings_desc: 'Essayez de modifier votre recherche ou vos filtres.',
    recent_offers: 'Offres Récentes',
    gps_map: 'Carte GPS',
    list_view: 'Liste',
    call: 'Appeler',
    whatsapp: 'WhatsApp',
    zoom_map: 'Localiser',
    specs: 'Spécifications techniques',
    description: 'Description générale',
    posted_on: 'Mise en ligne',
    price_on_demand: 'Sur Demande',
    ad_details: 'Détails de l\'offre',
    ad_title: 'Titre de l\'annonce',
    activity: 'Activité Principale',
    equipment_type: 'Type de Matériel / Produit',
    transaction: 'Type de transaction',
    price_da: 'Prix (DA)',
    company_name: 'Nom de l\'entreprise',
    phone: 'Téléphone mobile',
    whatsapp_number: 'Numéro WhatsApp',
    ad_description: 'Descriptif de l\'offre',
    specifications: 'Spécifications (séparées par des virgules)',
    location_on_map: 'Localiser sur la carte',
    cancel: 'Annuler',
    publish: 'Publier l\'annonce',
    all_equipment: 'Tous les types',
    login: 'Se Connecter',
    logout: 'Se Déconnecter',
    profile: 'Profil',
    guest: 'Visiteur (Invité)',
    guest_mode: 'Continuer en tant que Visiteur',
    connect_title: 'Accès au Marché',
    connect_subtitle: 'Connectez-vous pour ajouter des annonces et profiter des avantages',
    email_connect: 'Connexion par Email',
    phone_connect: 'Connexion par Téléphone',
    or: 'OU',
    premium_badge: 'PREMIUM',
    standard_badge: 'STANDARD',
    upgrade_premium: 'Passer au Premium',
    premium_modal_title: 'Merveilles du Premium',
    premium_benefit_1: 'Annonces Illimitées (Limite de 2 pour les gratuits)',
    premium_benefit_2: 'Mise en avant dorée sur la carte et la liste',
    premium_benefit_3: 'Badge PREMIUM affiché à côté de votre entreprise',
    premium_benefit_4: 'Affichage prioritaire dans les résultats de recherche',
    free_limit_title: 'Limite d\'annonces gratuites atteinte',
    free_limit_desc: 'Vous avez atteint la limite de 2 annonces gratuites. Passez au Premium pour publier en illimité et booster vos ventes.',
    highlight_ad: 'Mettre en avant cette annonce (Premium)',
    password: 'Mot de passe',
    phone_number: 'Numéro de téléphone',
    qr_btn: 'Accès Mobile (QR)',
    qr_title: 'Scanner pour mobile',
    qr_desc: 'Assurez-vous que votre téléphone est sur le même réseau Wi-Fi.',
    machine_production: 'Machine de Production',
    engin: 'Engin de Chantier / Carrière',
    vehicule_lourd_leger: 'Véhicule Léger / Lourd',
    matiere_premiere: 'Matériaux (Sable, briques...)',
    service: 'Prestation de Service',
    consulting: 'Consulting & Expertise',
    tenders_market: 'Appels d\'Offres',
    my_ads: 'Mes annonces',
    how_to_advertise: 'Comment annoncer ?',
    terms_of_use: 'Conditions d\'utilisation',
    terms_of_sale: 'Conditions de vente et paiement',
    contact: 'Contactez-nous'
  },
  en: {
    app_title: 'Binadz',
    app_subtitle: 'Quarry, Brick & Construction Market',
    post_ad: 'Post an Ad',
    search_placeholder: 'Search excavator, sand, tiles, crushing...',
    all_categories: 'All Categories',
    mines_carrieres: 'Mines & Quarries',
    ceramique_briqueterie: 'Ceramics & Brickworks',
    btp: 'Construction & Public Works',
    services_experts: 'Services',
    transport_logistique: 'Transport & Logistics',
    pieces_detachees: 'Spare Parts',
    outils: 'Tools & Equipment',
    piece_rechange: 'Spare Parts (Equip.)',
    vehicule_transport: 'Vehicles & Transport',
    porte_char: 'Lowboy / Porte-Char Transport',
    depannage: 'Towing & Breakdown',
    hours: 'Hours',
    all: 'All',
    vente: 'Sale',
    jobs: 'Jobs',
    location: 'Rent',
    achat: 'Buy',
    filtres: 'Filters',
    min_price: 'Minimum Price (DA)',
    max_price: 'Maximum Price (DA)',
    wilaya: 'Wilaya',
    commune: 'Commune / Town',
    all_wilayas: 'All Wilayas',
    wilaya_placeholder: 'Select Wilaya',
    commune_placeholder: 'Enter Commune (e.g. Rouiba)',
    listings_found: 'Ads found',
    no_listings: 'No ads found',
    no_listings_desc: 'Try modifying your search or filters.',
    recent_offers: 'Recent Offers',
    gps_map: 'GPS Map',
    list_view: 'List',
    call: 'Call',
    whatsapp: 'WhatsApp',
    zoom_map: 'Locate',
    specs: 'Technical specifications',
    description: 'General description',
    posted_on: 'Online since',
    price_on_demand: 'On Demand',
    ad_details: 'Offer Details',
    ad_title: 'Ad Title',
    activity: 'Main Activity',
    equipment_type: 'Equipment / Product Type',
    transaction: 'Transaction Type',
    price_da: 'Price (DA)',
    company_name: 'Company Name',
    phone: 'Mobile Phone',
    whatsapp_number: 'WhatsApp Number',
    ad_description: 'Offer Description',
    specifications: 'Key specs (separated by commas)',
    location_on_map: 'Locate on the map',
    cancel: 'Cancel',
    publish: 'Publish Ad',
    all_equipment: 'All Equipment Types',
    login: 'Log In',
    logout: 'Log Out',
    profile: 'Profile',
    guest: 'Guest',
    guest_mode: 'Continue as Guest',
    connect_title: 'Marketplace Access',
    connect_subtitle: 'Connect to post ads and unlock premium benefits',
    email_connect: 'Login with Email',
    phone_connect: 'Login with Phone',
    or: 'OR',
    premium_badge: 'PREMIUM',
    standard_badge: 'STANDARD',
    upgrade_premium: 'Upgrade to Premium',
    premium_modal_title: 'Unlock Premium Benefits',
    premium_benefit_1: 'Unlimited Ad Posts (Standard limit: 2)',
    premium_benefit_2: 'Golden highlight on lists and the GPS map',
    premium_benefit_3: 'Sleek PREMIUM badge displayed next to your company',
    premium_benefit_4: 'Top priority in search query results',
    free_limit_title: 'Free Ad Limit Reached',
    free_limit_desc: 'You have reached the limit of 2 free ads. Upgrade to Premium to publish unlimited ads and boost your business.',
    highlight_ad: 'Feature this listing (Premium)',
    password: 'Password',
    phone_number: 'Phone number',
    qr_btn: 'Mobile Access (QR)',
    qr_title: 'Scan for Mobile',
    qr_desc: 'Make sure your phone is on the same Wi-Fi network.',
    machine_production: 'Production Machine',
    engin: 'Construction Machine',
    vehicule_lourd_leger: 'Light / Heavy Vehicle',
    matiere_premiere: 'Raw Materials',
    service: 'Service / Expertise',
    consulting: 'Consulting',
    tenders_market: 'Tenders & Bids',
    my_ads: 'My ads',
    how_to_advertise: 'How to advertise ?',
    terms_of_use: 'Terms of use',
    terms_of_sale: 'Terms of sale',
    contact: 'Contact us'
  },
    ar: {
    app_title: 'بناء دي زاد',
    app_subtitle: 'سوق المناجم، المحاجر والأشغال العمومية',
    post_ad: 'نشر إعلان',
    search_placeholder: 'ابحث عن حفارة، رمل، قرميد، تكسير...',
    all_categories: 'جميع الفئات',
    mines_carrieres: 'المناجم والمحاجر',
    ceramique_briqueterie: 'السيراميك وصناعة الطوب',
    btp: 'البناء والأشغال العمومية',
    services_experts: 'الخدمات',
    transport_logistique: 'النقل واللوجستيك',
    pieces_detachees: 'قطع الغيار',
    outils: 'أدوات ومعدات',
    piece_rechange: 'قطع غيار (معدات)',
    vehicule_transport: 'سيارات ونقل',
    porte_char: 'نقل بالآليات الثقيلة',
    depannage: 'إنقاذ وقطر',
    hours: 'ساعات',
    all: 'الكل',
    vente: 'بيع',
    jobs: 'وظائف',
    location: 'كراء',
    achat: 'شراء',
    filtres: 'تصفية',
    min_price: 'السعر الأدنى (دج)',
    max_price: 'السعر الأقصى (دج)',
    wilaya: 'الولاية',
    commune: 'البلدية',
    all_wilayas: 'كل الولايات',
    wilaya_placeholder: 'اختر الولاية',
    commune_placeholder: 'أدخل البلدية (مثال: الرويبة)',
    listings_found: 'إعلانات وجدت',
    no_listings: 'لا توجد إعلانات',
    no_listings_desc: 'حاول تعديل بحثك أو عوامل التصفية.',
    recent_offers: 'العروض الأخيرة',
    gps_map: 'خريطة GPS',
    list_view: 'قائمة',
    call: 'اتصال',
    whatsapp: 'واتساب',
    zoom_map: 'تحديد الموقع',
    specs: 'المواصفات التقنية',
    description: 'الوصف العام',
    posted_on: 'تاريخ النشر',
    price_on_demand: 'حسب الطلب',
    ad_details: 'تفاصيل العرض',
    ad_title: 'عنوان الإعلان',
    activity: 'النشاط الرئيسي',
    equipment_type: 'نوع المعدات / المنتج',
    transaction: 'نوع المعاملة',
    price_da: 'السعر (دج)',
    company_name: 'اسم الشركة',
    phone: 'رقم الهاتف المحمول',
    whatsapp_number: 'رقم الواتساب',
    ad_description: 'وصف العرض',
    specifications: 'المواصفات (مفصولة بفواصل)',
    location_on_map: 'تحديد الموقع على الخريطة',
    cancel: 'إلغاء',
    publish: 'نشر الإعلان',
    all_equipment: 'جميع أنواع المعدات',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    guest: 'زائر',
    guest_mode: 'المتابعة كزائر',
    connect_title: 'الدخول إلى السوق',
    connect_subtitle: 'سجل الدخول لإضافة إعلانات والاستفادة من المزايا',
    email_connect: 'تسجيل الدخول بالبريد الإلكتروني',
    phone_connect: 'تسجيل الدخول برقم الهاتف',
    or: 'أو',
    premium_badge: 'بريميوم',
    standard_badge: 'عادي',
    upgrade_premium: 'الترقية إلى بريميوم',
    premium_modal_title: 'مزايا البريميوم',
    premium_benefit_1: 'إعلانات غير محدودة (الحد الأقصى للإعلانات المجانية: 2)',
    premium_benefit_2: 'إبراز ذهبي على القوائم وخريطة GPS',
    premium_benefit_3: 'شارة بريميوم أنيقة تُعرض بجوار شركتك',
    premium_benefit_4: 'أولوية الظهور في نتائج البحث',
    free_limit_title: 'تم الوصول إلى حد الإعلانات المجانية',
    free_limit_desc: 'لقد وصلت إلى حد إعلانين مجانيين. قم بالترقية إلى Premium لنشر إعلانات غير محدودة وتعزيز مبيعاتك.',
    highlight_ad: 'إبراز هذا الإعلان (Premium)',
    password: 'كلمة المرور',
    phone_number: 'رقم الهاتف',
    qr_btn: 'دخول عبر الهاتف (QR)',
    qr_title: 'مسح ضوئي للهاتف',
    qr_desc: 'تأكد من أن هاتفك متصل بنفس شبكة Wi-Fi.',
    machine_production: 'آلة إنتاج',
    engin: 'آلية أشغال عمومية / محجر',
    vehicule_lourd_leger: 'مركبة خفيفة / ثقيلة',
    matiere_premiere: 'مواد (رمل، طوب...)',
    service: 'تقديم خدمات',
    consulting: 'استشارات وخبرة',
    tenders_market: 'عروض مناقصات',
    my_ads: 'إعلاناتي',
    how_to_advertise: 'كيف تعلن ؟',
    terms_of_use: 'شروط الاستخدام',
    terms_of_sale: 'شروط البيع والدفع',
    contact: 'اتصل بنا'
  }
};


const getAdBanner = (category: string) => {
  switch (category) {
    case 'mines_carrieres':
      return {
        img: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=600",
        title: "Équipements Miniers",
        desc: "Solutions complètes pour l'extraction et le concassage."
      };
    case 'ceramique_briqueterie':
      return {
        img: "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=600",
        title: "Technologie de Cuisson",
        desc: "Fours haute performance pour la briqueterie et la ceramique rouge."
      };
    case 'btp':
      return {
        img: "https://images.unsplash.com/photo-1541888081695-17189c190100?auto=format&fit=crop&q=80&w=600",
        title: "Équipements Caterpillar",
        desc: "Puissance et économie d'énergie pour tous vos terrassements."
      };
    default:
      return {
        img: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=600",
        title: "Espace Publicitaire",
        desc: "Votre marque ici. Touchez des milliers de professionnels."
      };
  }
};



const compressImage = async (file: File) => {
  if (!file.type.startsWith('image/')) return file;
  const options = {
    maxSizeMB: 0.5, // 500KB Max
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp'
  };
  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob back to File
    const ext = compressedBlob.type.split('/')[1] || 'webp';
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.' + ext;
    return new File([compressedBlob], newFileName, { type: compressedBlob.type });
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
};

export default function App() {

  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [, setLoadingListings] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Language state
  const [lang, setLang] = useState<'fr' | 'en' | 'ar'>('fr');

  // Banners state
  const [banners, setBanners] = useState<AdBanner[]>([]);

  // User session state
  const [user, setUser] = useState<UserSession | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Onboarding state
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('hasSeenOnboarding') === 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  // Initialize Auth State from Supabase and fetch Listings
  useEffect(() => {
    // 1. Auth Setup
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUser({
          id: session.user.id,
          identity: session.user.email || 'Utilisateur',
          type: 'email',
          isPremium: profile?.is_premium || false,
          isVip: profile?.is_vip || false,
          isVerified: profile?.is_verified || false,
          whatsapp: profile?.whatsapp || '',
          isAdmin: profile?.role === 'admin',
          adsPostedCount: 0
        });
        initPushNotifications(user?.id || "guest");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
      if (session?.user) {
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        console.log("Auth Debug - User ID:", session.user.id);
        console.log("Auth Debug - Profile Fetched:", profile);
        if (error) console.error("Auth Debug - Fetch Error:", error);
        
        setUser({
          id: session.user.id,
          identity: session.user.email || 'Utilisateur',
          type: 'email',
          isPremium: profile?.is_premium || false,
          isVip: profile?.is_vip || false,
          isVerified: profile?.is_verified || false,
          whatsapp: profile?.whatsapp || '',
          isAdmin: profile?.role === 'admin',
          adsPostedCount: 0
        });
        initPushNotifications(user?.id || "guest");
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });


    // 1.5 Fetch Banners
    const fetchBanners = async () => {
      try {
        const { data: bannersData, error: bannersError } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!bannersError && bannersData) {
          const mappedBanners = bannersData.map((b) => ({
            id: b.id,
            sponsorName: b.sponsor_name,
            imageUrl: b.image_url,
            linkUrl: b.link_url || '#',
            position: b.position
          }));
          setBanners(mappedBanners);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    // 2. Fetch Listings
    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles (
              company_name,
              phone,
              whatsapp,
              is_verified
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const mappedListings = data.map((item: any) => ({
            id: item.id,
            sellerId: item.seller_id,
            title: item.title,
            description: item.description,
            price: Number(item.price),
            dealType: 'vente' as DealType,
            category: item.category,
            equipmentType: item.equipment_type,
            subcategory: '',
            companyName: item.profiles?.company_name || 'Utilisateur Anonyme',
            wilaya: item.wilaya,
            commune: item.commune,
            phone: item.profiles?.phone || '',
            whatsapp: item.profiles?.whatsapp || '',
            coords: [item.latitude || 36.7525, item.longitude || 3.0420] as [number, number],
            dateAdded: new Date(item.created_at).toISOString().split('T')[0],
            images: item.images || ['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=800'],
            isVerified: item.profiles?.is_verified || false,
            isPremium: item.is_premium || false,
          isVip: item.is_vip || false,
            storeId: 'store-1',
            status: item.status || 'active',
            maintenanceLogUrl: item.maintenance_log_url,
            hoursOfUse: item.hours_of_use,
            isFavorite: false
          }));
          setListings(mappedListings);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoadingListings(false);
      }
    };

    
    const loadAdditionalData = async () => {
      const [fetchedStores, fetchedTenders, fetchedJobs, fetchedAuctions, fetchedBanners] = await Promise.all([
        fetchStores(),
        fetchTenders(),
        fetchJobOffers(),
        fetchAuctions(),
        fetchBanners()
      ]);
      setStores(fetchedStores);
      setTenders(fetchedTenders);
      setJobs(fetchedJobs);
      setAuctions(fetchedAuctions);
      setBanners(fetchedBanners);

      // Fetch unread messages
      if (user) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id)
          .in('conversation_id', (
            await supabase.from('conversations').select('id').or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          ).data?.map(c => c.id) || []);
        
        setUnreadMessages(count || 0);
      }

    };
    loadAdditionalData();

    fetchBanners();
    fetchListings();

    return () => subscription.unsubscribe();
  }, []);

  const t = useCallback((key: keyof typeof translations['fr']) => {
    return translations[lang][key] || translations['fr'][key] || key;
  }, [lang]);

  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [activeDealType, setActiveDealType] = useState<DealType | 'all'>('all');
  const [activeEquipType, setActiveEquipType] = useState<EquipmentType | 'all'>('all');
  const [filterWilaya, setFilterWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<'all' | 'new' | 'used' | 'refurbished'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');

  const [activeView, setActiveView] = useState<'feed' | 'stores' | 'store_detail' | 'store_pricing' | 'inventory' | 'tenders' | 'jobs' | 'auctions' | 'favorites' | 'chat' | 'admin' | 'how_to_advertise' | 'terms_of_use' | 'terms_of_sale' | 'contact'>('feed');
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [storeInventory, setStoreInventory] = useState<Listing[]>([]);
  // @ts-ignore
  const [stores, setStores] = useState<Store[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  // @ts-ignore
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('list');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showMyAdsModal, setShowMyAdsModal] = useState(false);
  const [showAddTenderModal, setShowAddTenderModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddAuctionModal, setShowAddAuctionModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('btp_notifications_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  
  const toggleNotifications = () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem('btp_notifications_enabled', String(newVal));
  };
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showLeasingModal, setShowLeasingModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSparePartModal, setShowSparePartModal] = useState(false);
  
  // Premium Native Feel State
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleRefresh = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Haptics.impact({ style: ImpactStyle.Light });
    }, 1200);
  };

  // Compare State
  const [compareList, setCompareList] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('btp_saved_listings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const toggleSaveListing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await Haptics.impact({ style: ImpactStyle.Light });
    setSavedListings(prev => {
      const newList = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('btp_saved_listings', JSON.stringify(newList));
      return newList;
    });
  };

  const handleShare = async (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    await Haptics.impact({ style: ImpactStyle.Light });
    try {
      await Share.share({
        title: listing.title,
        text: `Découvrez cette annonce sur Binadz : ${listing.title} à ${listing.price.toLocaleString()} DA`,
        url: window.location.href, // If we had routing, we'd append ?id=listing.id
        dialogTitle: 'Partager l\'annonce',
      });
    } catch (err) {
      console.log('Share error or canceled', err);
    }
  };

  const handleReport = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`L'annonce "${listing.title}" a été signalée aux modérateurs pour vérification. Merci.`);
  };
  // Map references
  const mainMapContainerRef = useRef<HTMLDivElement>(null);
  const mainMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<any>(null);

  // User GPS Tracking State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusLayerRef = useRef<L.Circle | null>(null);

  
  const handleRenewAd = async (id: string) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from('listings').update({ created_at: now }).eq('id', id);
      if (error) throw error;
      setListings(prev => prev.map(l => l.id === id ? { ...l, dateAdded: now.split('T')[0] } : l));
      alert('Annonce renouvelée avec succès !');
    } catch (err) {
      console.error('Error renewing ad:', err);
      alert('Erreur lors du renouvellement.');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const { error } = await supabase.from('listings').delete().eq('id', adId);
      if (error) throw error;
      setListings(prev => prev.filter(l => l.id !== adId));
      if (user) {
        setUser(prev => prev ? ({ ...prev, adsPostedCount: Math.max(0, prev.adsPostedCount - 1) }) : null);
      }
    } catch (err: any) {
      console.error("Error deleting ad:", err);
      alert("Erreur lors de la suppression de l'annonce.");
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation([lat, lng]);
      setLocationLoading(false);
      
      if (mainMapRef.current) {
        mainMapRef.current.flyTo([lat, lng], 12, { duration: 1.5 });
      }
    }, (err) => {
      console.error(err);
      alert("Impossible de récupérer votre position. Veuillez l'autoriser dans vos paramètres.");
      setLocationLoading(false);
    }, { enableHighAccuracy: true });
  };

  // Distance calculator using Haversine formula
  const getDistanceStr = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; 
    if (d < 1) return `À ${Math.round(d * 1000)} m`;
    return `À ${d.toFixed(1)} km`;
  };

  // Init main map
  useEffect(() => {
    if (mainMapContainerRef.current && !mainMapRef.current) {
      const map = L.map(mainMapContainerRef.current, {
        center: [36.4, 3.8],
        zoom: 7,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mainMapRef.current = map;
      // @ts-ignore
      markersLayerRef.current = L.markerClusterGroup({ 
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
      }).addTo(map);
    }

    return () => {
      if (mainMapRef.current) {
        mainMapRef.current.remove();
        mainMapRef.current = null;
      }
    };
  }, []);

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesDeal = activeDealType === 'all' || item.dealType === activeDealType;
    const matchesEquip = activeEquipType === 'all' || item.equipmentType === activeEquipType;
    const matchesWilaya = filterWilaya === 'all' || item.wilaya === filterWilaya;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMinPrice = minPrice === '' || item.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || item.price <= maxPrice;
    const matchesBrand = filterBrand === 'all' || (item.brand && item.brand.toLowerCase() === filterBrand.toLowerCase());
    const matchesCondition = filterCondition === 'all' || item.condition === filterCondition;

    return matchesCat && matchesDeal && matchesEquip && matchesWilaya && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBrand && matchesCondition;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    // 1. Premium always shows up first (unless sorting strictly overrides this, but let's keep premium on top)
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    
    // 2. Sort by user choice
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    } else if (sortBy === 'price_desc') {
      return b.price - a.price;
    } else if (sortBy === 'newest') {
      // Assuming dateAdded is DD/MM/YYYY or YYYY-MM-DD
      return new Date(b.dateAdded.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")).getTime() - new Date(a.dateAdded.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")).getTime();
    } else if (sortBy === 'popular') {
      const aViews = a.auditDetails?.views || 0;
      const bViews = b.auditDetails?.views || 0;
      return bViews - aViews;
    }
    
    return 0;
  });

  // Custom marker icon builder (Premium pins glow gold!)
  const createCustomIcon = (category: CategoryType, isPremiumAd?: boolean) => {
    let colorClass = 'marker-pin-mines';
    let iconSymbol = '⛏️';
    
    if (isPremiumAd) {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin" style="background: radial-gradient(circle, #f59e0b 0%, #d97706 100%); box-shadow: 0 0 16px rgba(245, 158, 11, 0.95); border: 2.5px solid #fff;"><span style="transform: rotate(45deg); display: block; font-size: 14px; margin-top: -2px;">⭐</span></div>`,
        iconSize: [32, 44],
        iconAnchor: [16, 44]
      });
    }

    if (category === 'ceramique_briqueterie') {
      colorClass = 'marker-pin-ceramique';
      iconSymbol = '🧱';
    } else if (category === 'btp') {
      colorClass = 'marker-pin-btp';
      iconSymbol = '🏗️';
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="marker-pin ${colorClass}"><span style="transform: rotate(45deg); display: block; font-size: 14px; margin-top: -2px;">${iconSymbol}</span></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
  };

  // Populate map markers
  useEffect(() => {
    if (mainMapRef.current && markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // Render User Marker if available
      if (userLocation) {
        if (!userMarkerRef.current) {
          const userIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="relative flex items-center justify-center w-6 h-6">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg"></span>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          userMarkerRef.current = L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 }).addTo(mainMapRef.current);
          userMarkerRef.current.bindPopup(`<div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 11px; padding: 4px;">📍 Vous êtes ici</div>`);
          
          radiusLayerRef.current = L.circle(userLocation, {
            radius: 50000, // 50km search radius visual aid
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.05,
            weight: 1,
            dashArray: '5, 5'
          }).addTo(mainMapRef.current);
        } else {
          userMarkerRef.current.setLatLng(userLocation);
          if (radiusLayerRef.current) radiusLayerRef.current.setLatLng(userLocation);
        }
      }

      sortedListings.forEach(item => {
        const markerIcon = createCustomIcon(item.category, item.isPremium);
        const marker = L.marker(item.coords, { icon: markerIcon });
        
        const distStr = userLocation ? `<div style="font-size: 10px; font-weight: 900; color: #10b981; background: #10b98120; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">🧭 ${getDistanceStr(userLocation[0], userLocation[1], item.coords[0], item.coords[1])}</div>` : '';

        const popupContent = `
          <div style={{ fontFamily: 'Outfit, sans-serif', width: '220px', padding: '4px', textAlign: lang === 'ar' ? 'right' : 'left' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
              <span style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: ${
                item.category === 'mines_carrieres' ? '#f97316' : item.category === 'ceramique_briqueterie' ? '#0ea5e9' : '#10b981'
              }; letter-spacing: 0.1em;">
                ${t(item.category)}
              </span>
              ${item.isPremium ? `<span style="font-size: 8px; font-weight: 900; background: linear-gradient(to right, #f59e0b, #d97706); color: #fff; padding: 1px 4px; border-radius: 4px;">${t('premium_badge')}</span>` : ''}
            </div>
            <div style="font-weight: 800; font-size: 12px; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${item.title}
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-bottom: 4px;">
              📍  ${item.commune}, ${item.wilaya}
            </div>
            ${distStr}
            <div style="font-size: 11px; font-weight: 800; color: #f97316; margin-bottom: 8px; font-family: monospace;">
              ${item.price > 0 ? `${item.price.toLocaleString('fr-FR')} DA` : t('price_on_demand')}
            </div>
                </div>
              ) : (
                <button 
              id="pop-btn-${item.id}"
              style="width: 100%; border: 1px solid rgba(249,115,22,0.4); background: ${item.isPremium ? 'linear-gradient(to right, rgba(245,158,11,0.2), rgba(217,119,6,0.2))' : 'rgba(249,115,22,0.1)'}; color: #f97316; font-weight: 800; font-size: 10px; padding: 6px 10px; border-radius: 8px; cursor: pointer; transition: 0.2s;"
            >
              ${t('ad_details')}
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('popupopen', () => {
          const btn = document.getElementById(`pop-btn-${item.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedListing(item);
              marker.closePopup();
            };
          }
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [sortedListings, lang, userLocation, t]);

  // Handle map resize when toggling views
  useEffect(() => {
    if (mainMapRef.current) {
      setTimeout(() => {
        mainMapRef.current?.invalidateSize();
      }, 100);
    }
  }, [mobileView, activeView]);

  // Focus location on main map
  const handleFocusListingLocation = (item: Listing) => {
    if (mainMapRef.current) {
      setMobileView('map');
      mainMapRef.current.setView(item.coords, 12, {
        animate: true,
        duration: 1.5
      });
    }
  };

  // Handling Post Ad click
    const handleAddStoreClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!user.isPremium && !user.isVip) {
      alert(lang === 'ar' ? 'إنشاء المتاجر مخصص حصرياً للمشتركين في Premium. يرجى ترقية حسابك!' : 'La création de boutiques est exclusive aux abonnés Premium. Veuillez mettre à niveau votre compte!');
      setShowPremiumModal(true);
      return;
    }
    const userStores = stores.filter(s => s.ownerId === user.id).length;
    const maxStores = user.isVip ? 3 : 1;
    if (userStores >= maxStores) {
      alert(lang === 'ar' ? `لقد وصلت إلى الحد الأقصى وهو ${maxStores} متاجر.` : `Vous avez atteint la limite de ${maxStores} boutiques.`);
      return;
    }
    setShowAddStoreModal(true);
  };

  const handleAddTenderClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const userTenders = tenders.filter(t => t.authorId === user.id).length;
    const maxTenders = user.isVip ? 20 : user.isPremium ? 5 : 1;
    if (userTenders >= maxTenders) {
      alert(lang === 'ar' ? `لقد وصلت إلى الحد الأقصى وهو ${maxTenders} طلبات عروض. ${!user.isPremium ? 'قم بالترقية إلى Premium!' : ''}` : `Vous avez atteint la limite de ${maxTenders} appels d'offres. ${!user.isPremium ? 'Passez au Premium!' : ''}`);
      if (!user.isPremium) setShowPremiumModal(true);
      return;
    }
    setShowAddTenderModal(true);
  };

  const handleAddAuctionClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const userAuctions = auctions.filter(a => a.sellerId === user.id).length;
    const maxAuctions = user.isVip ? 20 : user.isPremium ? 5 : 1;
    if (userAuctions >= maxAuctions) {
      alert(lang === 'ar' ? `لقد وصلت إلى الحد الأقصى وهو ${maxAuctions} مزادات. ${!user.isPremium ? 'قم بالترقية إلى Premium!' : ''}` : `Vous avez atteint la limite de ${maxAuctions} enchères. ${!user.isPremium ? 'Passez au Premium!' : ''}`);
      if (!user.isPremium) setShowPremiumModal(true);
      return;
    }
    setShowAddAuctionModal(true);
  };

  const handleAddJobClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // We don't check limits here because inside AddJobModal they choose between Offer and Request.
    // Instead, we will pass a custom prop to AddJobModal or we can check here by counting both and letting AddJobModal handle the specific error.
    // But actually, we can just check if they reached both limits. It's better to let AddJobModal open, but we will modify AddJobModal later if needed.
    // For now, let's just open it.
    setShowAddJobModal(true);
  };

  // Handling Post Ad click
  const handlePostAdButtonClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      const userActiveAds = listings.filter(l => l.sellerId === user.id).length;
      const maxAds = user.isVip ? 500 : user.isPremium ? 50 : 2;
      
      if (userActiveAds >= maxAds) {
        alert(lang === 'ar' 
          ? `Ù„Ù‚Ø¯ ÙˆØµÙ„Øª Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ (${maxAds} Ø¥عÙ„Ø§Ù†Ø§Øª Ù†Ø´Ø·Ø©). ${!user.isPremium ? 'ÙŠØ±Ø¬Ù‰ ØªØ±Ù‚ÙŠØ© Ø­Ø³Ø§Ø¨Ùƒ!' : ''}` 
          : `Vous avez atteint la limite de ${maxAds} annonces actives. ${!user.isPremium ? 'Veuillez passer au Premium!' : ''}`);
        if (!user.isPremium) setShowPremiumModal(true);
      } else {
        setShowAddModal(true);
      }
    }
  };

  const handlePostAd = async (newAd: Listing) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Vous devez être connecté pour publier.");

      // Upload Images
      const uploadedImageUrls: string[] = [];
      if (newAd.imageFiles && newAd.imageFiles.length > 0) {
        for (const file of newAd.imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user?.id || "guest"}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(filePath, await compressImage(file));
            
          if (!uploadError) {
            const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
            uploadedImageUrls.push(data.publicUrl);
          } else {
            console.error("Error uploading image:", uploadError);
          }
        }
      }

      const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : (newAd.images || []);

      let maintenanceLogFinalUrl = newAd.maintenanceLogUrl || null;
      if (newAd.maintenanceFile) {
        const fileExt = newAd.maintenanceFile.name.split('.').pop();
        const fileName = `doc_${Math.random()}.${fileExt}`;
        const filePath = `${user?.id || "guest" || 'guest'}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, newAd.maintenanceFile);
        
        if (!uploadError) {
          const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
          maintenanceLogFinalUrl = data.publicUrl;
        } else {
          console.error("Error uploading document:", uploadError);
        }
      }

      const { data, error } = await supabase.from('listings').insert({
        seller_id: user?.id || "guest" || "guest",
        title: newAd.title,
        description: newAd.description,
        category: newAd.category,
        equipment_type: newAd.equipmentType,
        price: newAd.price,
        currency: 'DA',
        images: finalImages,
        wilaya: newAd.wilaya,
        commune: newAd.commune,
        latitude: newAd.coords[0],
        longitude: newAd.coords[1],
        status: 'active',
        maintenance_log_url: maintenanceLogFinalUrl,
        hours_of_use: newAd.hoursOfUse || null
      }).select();

      if (error) throw error;

      // Optimistic UI update
      if (data && data[0]) {
         newAd.id = data[0].id;
         newAd.images = finalImages;
      }
      
      setListings(prev => [newAd, ...prev]);
      if (user) {
        setUser(prev => prev ? ({ ...prev, adsPostedCount: prev.adsPostedCount + 1 }) : null);
      }
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Error posting ad:", err);
      alert(err.message || "Erreur lors de la publication.");
    }
  };

  

  
  const handlePostTender = async (newTender: Tender) => {
    try {
      const { data, error } = await supabase.from('tenders').insert({
        title: newTender.title,
        company_name: newTender.companyName,
        description: newTender.description,
        wilaya: newTender.wilaya,
        deadline: newTender.deadline,
        budget: newTender.budget,
        category: newTender.category,
        is_premium_only: newTender.isPremiumOnly
      }).select();
      if (error) throw error;
      if (data && data[0]) {
        newTender.id = data[0].id;
      }
      setTenders(prev => [newTender, ...prev]);
      setShowAddTenderModal(false);
    } catch (err: any) {
      console.error('Error posting tender:', err);
      alert('Erreur lors de la publication.');
    }
  };

  const handlePostJob = async (newJob: JobOffer, cvFile?: File) => {
    try {
      let finalCvUrl = newJob.cvUrl || null;
      if (cvFile && user) {
        const url = await uploadFileToSupabase(cvFile, 'cvs', user.id);
        if (url) finalCvUrl = url;
      }

      if (newJob.type === 'offer') {
        const userOffers = jobs.filter(j => j.authorId === user?.id && j.type === 'offer').length;
        const maxOffers = user?.isVip ? 20 : user?.isPremium ? 5 : 1;
        if (userOffers >= maxOffers) {
      alert(lang === 'ar' ? `لقد وصلت إلى الحد الأقصى وهو ${maxOffers} عروض عمل.` : `Vous avez atteint la limite de ${maxOffers} offres d'emploi.`);
           if (!user?.isPremium) setShowPremiumModal(true);
           return;
        }
      } else {
        const userRequests = jobs.filter(j => j.authorId === user?.id && j.type === 'request').length;
        if (userRequests >= 1) {
      alert(lang === 'ar' ? 'لقد قمت مسبقاً بنشر طلب عمل.' : 'Vous avez déjà publié une demande d\'emploi.');
           return;
        }
      }
      
      const { data, error } = await supabase.from('job_offers').insert({
        title: newJob.title,
        type: newJob.type,
        company_name: newJob.companyName || null,
        candidate_name: newJob.candidateName || null,
        description: newJob.description,
        wilaya: newJob.wilaya,
        profession: newJob.profession,
        experience: newJob.experience,
        cv_url: finalCvUrl
      }).select();
      if (error) throw error;
      if (data && data[0]) {
        newJob.id = data[0].id;
        if (finalCvUrl) newJob.cvUrl = finalCvUrl;
      }
      // @ts-ignore
      setJobs(prev => [newJob, ...prev]);
      setShowAddJobModal(false);
    } catch (err: any) {
      console.error('Error posting job:', err);
      alert('Erreur lors de la publication.');
    }
  };

  const handlePostAuction = async (newAuction: Auction, imageFiles: File[]) => {
    try {
      // 1. Upload Images
      const finalImages: string[] = [];
      if (user) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `auction_${Math.random()}.${fileExt}`;
          const filePath = `${user?.id || "guest"}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('auctions').upload(filePath, await compressImage(file));
          if (!uploadError) {
            const { data } = supabase.storage.from('auctions').getPublicUrl(filePath);
            finalImages.push(data.publicUrl);
          }
        }
      }
      
      const { data, error } = await supabase.from('auctions').insert({
        title: newAuction.title,
        company_name: newAuction.companyName,
        description: newAuction.description,
        wilaya: newAuction.wilaya,
        commune: newAuction.commune,
        starting_price: newAuction.startingPrice,
        current_bid: newAuction.startingPrice,
        end_date: newAuction.endDate,
        category: newAuction.category,
        images: finalImages,
        is_verified: newAuction.isVerified
      }).select();
      if (error) throw error;
      if (data && data[0]) {
        newAuction.id = data[0].id;
        newAuction.images = finalImages;
      }
      setAuctions(prev => [newAuction, ...prev]);
      setShowAddAuctionModal(false);
    } catch (err: any) {
      console.error('Error posting auction:', err);
      alert('Erreur lors de la publication.');
    }
  };

  const handlePostStore = async (newStore: Store, logoFile?: File, bannerFile?: File) => {
    try {
      let logoUrl = '';
      let bannerUrl = '';
      if (user) {
        if (logoFile) {
          const { error: err1 } = await supabase.storage.from('stores').upload(`${user?.id || "guest"}/logo_${logoFile.name}`, await compressImage(logoFile));
          if (!err1) {
            const { data } = supabase.storage.from('stores').getPublicUrl(`${user?.id || "guest"}/logo_${logoFile.name}`);
            logoUrl = data.publicUrl;
          }
        }
        if (bannerFile) {
          const { error: err2 } = await supabase.storage.from('stores').upload(`${user?.id || "guest"}/banner_${bannerFile.name}`, await compressImage(bannerFile));
          if (!err2) {
            const { data } = supabase.storage.from('stores').getPublicUrl(`${user?.id || "guest"}/banner_${bannerFile.name}`);
            bannerUrl = data.publicUrl;
          }
        }
      }
            const { data, error } = await supabase.from('stores').insert({
        owner_id: user?.id || "guest",
        name: newStore.name,
        description: newStore.description,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        wilaya: newStore.wilaya,
        phone: newStore.phone,
        is_premium: newStore.isPremium,
        is_verified: newStore.isVerified,
        is_vip: user?.isVip || false,
        categories: newStore.categories,
        payment_methods: newStore.paymentMethods
      }).select();

      if (error) throw error;
      if (data && data[0]) {
        newStore.id = data[0].id;
        newStore.logoUrl = logoUrl;
        newStore.bannerUrl = bannerUrl;
      }
      // @ts-ignore
      setStores(prev => [newStore, ...prev]);
      setShowAddStoreModal(false);
    } catch (err: any) {
      console.error('Error creating store:', err);
      alert('Erreur lors de la création de la vitrine.');
    }
  };


  const handleLogin = (identity: string, type: 'email' | 'phone') => {
    // Supabase's onAuthStateChange will handle setting the user state.
    setShowAuthModal(false);
    setTimeout(() => {
      setShowAddModal(true);
    }, 300);
  };

  const handleLoginAsGuest = () => {
    setUser({
      id: 'guest',
      identity: 'Visiteur',
      type: 'guest',
      isPremium: false,
          isVip: false,
      isVerified: false,
      adsPostedCount: 0
    });
    setShowAuthModal(false);
    setTimeout(() => {
      setShowAddModal(true);
    }, 300);
  };

  
  const handleDeleteMyListing = async (listingId: string) => {
    if (!user) return;
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await deleteMyListing(listingId, user.id);
        setListings(prev => prev.filter(l => l.id !== listingId));
        alert(lang === 'ar' ? 'تم الحذف بنجاح' : 'Annonce supprimée avec succès');
      } catch (error) {
        alert(lang === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Erreur lors de la suppression');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Handle Upgrade to Premium simulation
  const handleUpgradeToPremium = () => {
    if (user) {
      setUser(prev => prev ? ({ ...prev, isPremium: true }) : null);
      setShowPremiumModal(false);
      setShowLimitPopup(false);
    } else {
      setShowPremiumModal(false);
      setShowAuthModal(true);
    }
  };

  // Handle Compare
  const toggleCompare = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList(prev => {
      const isAlreadyAdded = prev.some(item => item.id === listing.id);
      if (isAlreadyAdded) {
        return prev.filter(item => item.id !== listing.id);
      } else {
        if (prev.length >= 3) {
          alert("Vous ne pouvez comparer que 3 équipements à la fois.");
          return prev;
        }
        return [...prev, listing];
      }
    });
  };

  // Beautiful abstract SVGs corresponding to industrial categories
  const renderCardPattern = (category: CategoryType, id: string, isPremiumAd?: boolean) => {
    if (category === 'mines_carrieres') {
      return (
        <div className={`h-36 w-full bg-gradient-to-br ${isPremiumAd ? 'from-amber-900/60 via-amber-950/90 to-black' : 'from-amber-950/40 via-zinc-900/90 to-black'} relative overflow-hidden flex items-center justify-center border-b border-slate-900 group-hover:scale-102 transition-transform duration-500`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1),transparent_70%)]" />
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,20 Q 50,40 100,20 T 200,40 T 300,10 T 400,30 T 500,20" fill="none" stroke="#f97316" strokeWidth="1.5" />
            <path d="M 0,50 Q 70,20 150,60 T 300,30 T 450,70" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <path d="M 0,90 Q 40,110 120,80 T 280,100 T 400,80 T 500,110" fill="none" stroke="#d97706" strokeWidth="1.5" />
          </svg>
          <span className="text-4xl filter drop-shadow-[0_10px_15px_rgba(249,115,22,0.4)] transform group-hover:rotate-12 transition-transform duration-300">⛏️</span>
          <div className="absolute bottom-3 left-3 bg-black/75 px-2 py-0.5 border border-white/5 rounded-md text-[8px] font-black uppercase text-amber-400 tracking-wider">
            {t('mines_carrieres')}
          </div>
        </div>
      );
    }
    if (category === 'ceramique_briqueterie') {
      return (
        <div className={`h-36 w-full bg-gradient-to-br ${isPremiumAd ? 'from-amber-900/40 via-sky-950/80 to-black' : 'from-sky-950/40 via-zinc-900/90 to-black'} relative overflow-hidden flex items-center justify-center border-b border-slate-900 group-hover:scale-102 transition-transform duration-500`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.1),transparent_70%)]" />
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id={`tile-pat-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none" />
                <path d="M 0,0 L 20,0 L 20,20 L 0,20 Z" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
                <path d="M 0,0 L 20,20" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#tile-pat-${id})`} />
          </svg>
          <span className="text-4xl filter drop-shadow-[0_10px_15px_rgba(14,165,233,0.4)] transform group-hover:scale-110 transition-transform duration-300">🧱</span>
          <div className="absolute bottom-3 left-3 bg-black/75 px-2 py-0.5 border border-white/5 rounded-md text-[8px] font-black uppercase text-sky-400 tracking-wider">
            {t('ceramique_briqueterie')}
          </div>
        </div>
      );
    }
    // BTP category
    return (
      <div className={`h-36 w-full bg-gradient-to-br ${isPremiumAd ? 'from-amber-900/40 via-emerald-950/80 to-black' : 'from-emerald-950/40 via-zinc-900/90 to-black'} relative overflow-hidden flex items-center justify-center border-b border-slate-900 group-hover:scale-102 transition-transform duration-500`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10,10 L 490,10 M 10,40 L 490,40 M 10,70 L 490,70 M 10,100 L 490,100" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3,3" />
          <path d="M 50,0 L 50,150 M 150,0 L 150,150 M 250,0 L 250,150 M 350,0 L 350,150" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3,3" />
          <path d="M 200,40 L 230,20 L 260,40 L 230,60 Z M 200,40 L 200,70 L 230,90 L 230,60 Z M 230,60 L 230,90 L 260,70 L 260,40 Z" fill="none" stroke="#34d399" strokeWidth="1" />
        </svg>
        <span className="text-4xl filter drop-shadow-[0_10px_15px_rgba(16,185,129,0.4)] transform group-hover:-translate-y-1.5 transition-transform duration-300">ÃƒÂ°Ã…Â¸Ã‚ ââ‚¬â€ÃƒÂ¯Ã‚Â¸Ã‚ </span>
        <div className="absolute bottom-3 left-3 bg-black/75 px-2 py-0.5 border border-white/5 rounded-md text-[8px] font-black uppercase text-emerald-400 tracking-wider">
          {t('btp')}
        </div>
      </div>
    );
  };

  // Dynamic brands based on active equip type
  const getDynamicBrands = () => {
    if (activeEquipType === 'engin' || activeEquipType === 'machine_production' || activeCategory === 'mines_carrieres' || activeCategory === 'btp') {
      return ['Caterpillar', 'Komatsu', 'Volvo', 'JCB', 'Hyundai', 'Doosan', 'Liebherr', 'Sandvik'];
    }
    if (activeEquipType === 'vehicule_lourd_leger' || activeEquipType === 'vehicule_transport' || activeCategory === 'transport_logistique') {
      return ['Renault Trucks', 'Mercedes-Benz', 'Isuzu', 'Scania', 'MAN', 'SNVI', 'Iveco'];
    }
    if (activeEquipType === 'piece_rechange' || activeCategory === 'pieces_detachees') {
      return ['Bosch', 'Rexroth', 'Kawasaki', 'Cummins', 'Perkins', 'SKF', 'Caterpillar', 'Komatsu'];
    }
    if (activeEquipType === 'matiere_premiere' || activeEquipType === 'service' || activeEquipType === 'consulting' || activeCategory === 'services_experts') {
      return []; // No brands make sense here
    }
    
    // For 'all' or others
    return ['Caterpillar', 'Komatsu', 'Volvo', 'JCB', 'Hyundai', 'Doosan', 'Renault Trucks', 'Mercedes-Benz', 'Isuzu', 'Scania', 'Bosch'];
  };

  const currentBrands = getDynamicBrands();

  return (
    <div 
      className="min-h-screen bg-[#0f172a] bg-grid-mesh flex flex-col selection:bg-orange-500 selection:text-white relative overflow-hidden" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Splash Screen */}
      {isInitialLoading && (
        <div className="fixed inset-0 z-[500] bg-[#0f172a] flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-2 border-amber-500/30 rounded-xl rotate-45 scale-[2.5]" />
            <div className="absolute inset-0 border border-orange-500/10 rounded-xl rotate-[15deg] scale-[3]" />
            <div className="h-40 w-40 rounded-3xl shadow-2xl shadow-orange-500/20 flex flex-col items-center justify-center animate-pulse relative overflow-hidden bg-white border-2 border-white/10">
               <img src="/logo.jpg" alt="Binadz Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 mb-2 mt-4">
            <h1 className="font-black text-white text-2xl tracking-widest uppercase">Binadz</h1>
          </div>
          <h2 className="font-black text-orange-500 text-lg uppercase tracking-widest flex items-center gap-1">
            Market DZ
            <svg className="h-5 w-5 fill-current rotate-45" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">Mine Bâtiment Travaux Publics</p>

          <div className="absolute bottom-10 flex flex-col items-center">
            <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-1/2 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Background glowing gradients */}
              {/* Onboarding View */}
        {!isInitialLoading && !hasSeenOnboarding && (
          <OnboardingView 
            onComplete={handleOnboardingComplete}
            t={t}
          />
        )}

        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

      {/* Modals */}

      {/* 1. Header */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 py-3 flex flex-col gap-3">
        
        {/* Top Row: Logo, Title, Hamburger */}
        <div className="flex items-center justify-between w-full">
          {/* Logo and Titles */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg shadow-orange-500/10 bg-white p-1">
              <img src="/logo.jpg" alt="Binadz Logo" className="w-full h-full object-cover scale-[1.35]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-white text-sm md:text-lg leading-none tracking-wide uppercase">{t('app_title')}</h1>
                <span className="px-1.5 py-0.5 rounded-sm bg-orange-500/10 text-orange-400 text-[8px] font-black border border-orange-500/20 uppercase tracking-widest hidden sm:inline-block">PRO</span>
              </div>
              <p className="text-[10px] text-orange-455 font-extrabold tracking-wider mt-1 hidden sm:block">{t('app_subtitle')}</p>
            </div>
          </div>

          {/* Global Controls: User Profile, Language & Ad Button (Desktop) */}
          <div className="hidden lg:flex items-center flex-wrap justify-center gap-3 md:gap-4">
            
            {user?.isAdmin && (
              <button
                onClick={() => setShowAdmin(true)}
                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-black text-[9px] uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                title="Admin Panel"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            
            {/* Language Switcher */}
            <div className="flex gap-1 bg-slate-900/60 p-1 border border-white/5 rounded-xl">
              <Globe className="h-3.5 w-3.5 text-slate-400 my-auto mx-1.5 shrink-0" />
              {[
                { code: 'fr', label: 'FR' },
                { code: 'en', label: 'EN' },
                { code: 'ar', label: 'عربي' }
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                    lang === l.code
                      ? 'bg-orange-500 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Notifications Bell Desktop */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-xl text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer relative"
              >
                <Bell className="h-4 w-4 text-orange-500" />
                  {notificationsEnabled && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border border-slate-950 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    </span>
                  )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                  <div className="p-3 border-b border-white/5 bg-slate-800/50 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Notifications</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleNotifications(); }}
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md transition ${notificationsEnabled ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30" : "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"}`}
                          >
                            {notificationsEnabled ? 'Désactiver' : 'Activer'}
                          </button>
                          <span className="text-[9px] text-orange-500 cursor-pointer font-black uppercase tracking-wider" onClick={() => setShowNotifications(false)}>Tout lu</span>
                        </div>
                      </div>
                    </div>
                    {notificationsEnabled ? (
                      <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-white/5 hover:bg-slate-800/50 transition cursor-pointer flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-500/20 flex flex-shrink-0 items-center justify-center">
                        <Bell className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">Nouvelle demande de devis</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Il y a 5 min</p>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-slate-800/50 transition cursor-pointer flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex flex-shrink-0 items-center justify-center">
                        <BadgeCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">Votre compte a été vérifié</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Il y a 2 heures</p>
                      </div>
                    </div>
                    </div> ) : (
                      <div className="p-6 text-center text-slate-500 text-xs font-bold">Les notifications sont désactivées.</div>
                    )}
                  </div>
                )}
              </div>

            {/* User profile / Login indicator */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-slate-300">
                    <User className="h-3.5 w-3.5 text-orange-500" />
                    <span className="max-w-[80px] truncate">{user?.identity || "guest"}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                      user?.isPremium 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {user?.isPremium ? t('premium_badge') : t('standard_badge')}
                    </span>
                  </div>
                  
                  {/* Upgrade standard user to Premium button */}
                  {!user?.isPremium && (
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <Zap className="h-3 w-3 fill-current" />
                      <span className="hidden sm:inline">{t('upgrade_premium')}</span>
                    </button>
                  )}

                  {/* Seller Dashboard Button */}
                  <button
                    onClick={() => setActiveView('inventory')}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                    title={lang === 'ar' ? 'إعلاناتي / مخزوني' : 'Mes Annonces / Mon Stock'}
                  >
                    <Grid className="h-3 w-3" />
                    <span className="hidden sm:inline">{lang === 'ar' ? 'إعلاناتي' : 'Mes Annonces'}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition"
                    title={t('logout')}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
              <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition"
                >
                  <User className="h-3.5 w-3.5 text-orange-500" />
                  <span>{t('login')}</span>
                </button>
              )}
            </div>

            <button
              onClick={handlePostAdButtonClick}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider px-4.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 flex items-center gap-1.5 transition-all duration-350 hover:shadow-orange-500/25 hover:scale-102 cursor-pointer border border-white/10"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>{t('post_ad')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {/* Language Selector Mobile */}
            <div className="flex bg-slate-900/50 p-0.5 rounded-lg border border-white/5 mx-1">
              {[
                { code: 'fr', label: 'FR' },
                { code: 'ar', label: 'ع' }
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as any)}
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all duration-300 ${
                    lang === l.code
                      ? 'bg-orange-500 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Notifications Bell Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer relative"
              >
                <Bell className="h-5 w-5 text-orange-500" />
                  {notificationsEnabled && (
                    <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 bg-rose-500 rounded-full border border-slate-950 flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    </span>
                  )}
              </button>
            </div>
            
            {user?.isAdmin && (
              <button
                onClick={() => setShowAdmin(true)}
                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-black p-2 rounded-xl flex items-center justify-center transition"
                title="Admin Panel"
              >
                <ShieldCheck className="h-5 w-5" />
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button 
              onClick={() => setIsSideMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Second Row (Mobile Only): User info & Grid/List view toggle */}
        <div className="flex items-center justify-between w-full lg:hidden bg-slate-900/30 p-2 rounded-xl border border-white/5">
           <div className="flex items-center gap-2 text-[11px] text-slate-300 font-bold px-2 py-1">
             <User className="h-4 w-4 text-slate-400" />
             <span>{user ? user?.identity || "guest" : t('login')}</span>
           </div>
           
           {/* Grid/List Toggle for mobile map/feed */}
           {activeView === 'feed' && (
             <div className="flex gap-1 bg-slate-900/80 border border-white/5 p-1 rounded-xl">
               <button
                 onClick={() => setMobileView('list')}
                 className={`p-1.5 rounded-lg transition ${mobileView === 'list' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
               >
                 <Grid className="h-4 w-4" />
               </button>
               <button
                 onClick={() => setMobileView('map')}
                 className={`p-1.5 rounded-lg transition ${mobileView === 'map' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
               >
                 <Map className="h-4 w-4" />
               </button>
             </div>
           )}
        </div>
      </header>

      {/* 2. Main 3-Column Layout Wrapper */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-8 py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 relative z-20 h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden pb-24 lg:pb-0">
        
        {/* ======================================= */}
        {/* LEFT SIDEBAR (Filters & Categories)     */}
        {/* ======================================= */}
        <div className="lg:col-span-3 space-y-6 hidden lg:flex flex-col h-full overflow-y-auto pr-2 scrollbar-thin pb-10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-orange-500" />
            {t('filtres')}
          </h3>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-2 bg-slate-900/40 p-2 border border-white/5 rounded-2xl mb-4">
            <button
              onClick={() => setActiveView('feed')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === 'feed'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Marché Public</span>
            </button>
            <button
              onClick={() => setActiveView('stores')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === 'stores' || activeView === 'store_detail'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <StoreIcon className="h-4 w-4" />
              <span>Vitrines & Boutiques</span>
            </button>
            <button
              onClick={() => setActiveView('tenders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === 'tenders'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <Building className="h-4 w-4" />
              <span>Appels d'Offres</span>
            </button>
            <button
              onClick={() => setActiveView('jobs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === 'jobs'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Emploi BTP</span>
            </button>
            <button
              onClick={() => setActiveView('favorites')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === 'favorites'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${activeView === 'favorites' ? 'fill-current' : ''}`} />
              <span>Mes Favoris</span>
            </button>
            
            
            {/* Chat View Nav */}
            {user && (
              <button 
                onClick={() => {
                  setActiveView('chat');
                  setSelectedListing(null);
                }}
                className={`flex justify-between items-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  activeView === 'chat' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4" />
                  <span>{t('messages' as any) || 'Messages'}</span>
                </div>
                {unreadMessages > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </button>
            )}

            {/* Auctions View Nav */}
            <button 
              onClick={() => {
                setActiveView('auctions');
                setSelectedListing(null);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === 'auctions' 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <Gavel className="h-4 w-4" />
              <span>Enchères B2B</span>
            </button>
            {/* Admin View Nav */}
            {user?.isAdmin && (
              <button 
                onClick={() => {
                  setShowAdmin(true);
                  setSelectedListing(null);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  showAdmin 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-emerald-500/70 hover:bg-slate-900/80 hover:text-emerald-400'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Panneau Admin</span>
              </button>
            )}
          </div>

          {/* Categories (Vertical) */}
          <div className="flex flex-col gap-2">
            {[
              { value: 'all', label: t('all_categories'), icon: <Grid className="h-4 w-4" /> },
              { value: 'mines_carrieres', label: `01- ${t('mines_carrieres')}`, icon: <span>⛏️</span> },
              { value: 'ceramique_briqueterie', label: `02- ${t('ceramique_briqueterie')}`, icon: <span>🧱</span> },
              { value: 'btp', label: `03- ${t('btp')}`, icon: <span>🏗️</span> },
              { value: 'services_experts', label: `04- ${t('services_experts')}`, icon: <span>💼</span> },
              { value: 'transport_logistique', label: `05- ${t('transport_logistique')}`, icon: <span>🚛</span> },
              { value: 'pieces_detachees', label: `06- ${t('pieces_detachees')}`, icon: <span>⚙️</span> },
              { value: 'outils', label: `07- ${t('outils')}`, icon: <span>🛠️</span> },
              { value: 'porte_char', label: `08- ${t('porte_char')}`, icon: <span>🚛</span> },
              { value: 'jobs', label: `09- ${t('jobs')}`, icon: <span>👷</span> }
            ].map(cat => (
              <button
                key={cat.value}
                onClick={() => {
                  if (cat.value === 'jobs') {
                    setActiveView('jobs');
                  } else if (cat.value === 'porte_char') {
                    setActiveCategory('transport_logistique');
                    setActiveEquipType('porte_char');
                    setActiveView('feed');
                  } else {
                    setActiveCategory(cat.value as any);
                    setActiveEquipType('all');
                    setFilterBrand('all');
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-350 cursor-pointer ${
                  ((activeCategory as string) === cat.value && cat.value !== 'porte_char' && activeView !== 'jobs') || 
                  (cat.value === 'jobs' && activeView === 'jobs') || 
                  (cat.value === 'porte_char' && activeCategory === 'transport_logistique' && activeEquipType === 'porte_char')
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/5'
                    : 'border-white/5 bg-slate-900/20 text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                {cat.icon}
                <span className="text-[10px] leading-tight text-left">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Footer Links (Desktop Sidebar) */}
          <div className="mt-8 border-t border-white/5 pt-6 pb-4 space-y-6 px-4">
            <button onClick={() => setActiveView('how_to_advertise')} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('how_to_advertise')}</button>
            <button onClick={() => setActiveView('terms_of_use')} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('terms_of_use')}</button>
            <button onClick={() => setActiveView('terms_of_sale')} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('terms_of_sale')}</button>
            <button onClick={() => setActiveView('contact')} className="block text-left w-full text-[13px] font-semibold text-slate-300 hover:text-white transition-colors">{t('contact')}</button>
          </div>

          {/* Deal Type */}
          <div className="flex flex-col gap-1 bg-slate-900/30 p-1.5 border border-white/5 rounded-xl">
            {[
              { value: 'all', label: t('all') },
              { value: 'vente', label: t('vente') },
              { value: 'location', label: t('location') },
              { value: 'achat', label: t('achat') },
              { value: 'service', label: t('service') }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setActiveDealType(type.value as any)}
                className={`w-full text-left px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                  activeDealType === type.value
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4 bg-slate-900/30 p-4 border border-white/5 rounded-2xl">
            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Catégorie :</label>
              <select
                value={activeCategory}
                onChange={e => {
                  if (e.target.value === 'all') {
                    setActiveCategory('all');
                  } else {
                    setActiveCategory(e.target.value as any);
                    setActiveEquipType('all');
                    setFilterBrand('all');
                  }
                }}
                className="bg-slate-900/80 border border-white/5 w-full px-3 py-2 text-[10px] font-bold text-white focus:outline-none rounded-xl focus:border-orange-500"
              >
                <option value="all">{t('all')}</option>
                <option value="mines_carrieres">{t('mines_carrieres')}</option>
                <option value="ceramique_briqueterie">{t('ceramique_briqueterie')}</option>
                <option value="btp">{t('btp')}</option>
                <option value="transport_logistique">{t('transport_logistique')}</option>
                <option value="pieces_detachees">{t('pieces_detachees')}</option>
                <option value="outils">{t('outils')}</option>
                <option value="services_experts">{t('services_experts')}</option>
              </select>
            </div>

            {/* Equipment Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type d'équipement :</label>
              <select
                value={activeEquipType}
                onChange={e => {
                  setActiveEquipType(e.target.value as any);
                  setFilterBrand('all');
                }}
                className="bg-slate-900/80 border border-white/5 w-full px-3 py-2 text-[10px] font-bold text-white focus:outline-none rounded-xl focus:border-orange-500"
              >
                <option value="all">{t('all_equipment')}</option>
                <option value="machine_production">{t('machine_production')}</option>
                <option value="engin">{t('engin')}</option>
                <option value="vehicule_lourd_leger">{t('vehicule_lourd_leger')}</option>
                <option value="matiere_premiere">{t('matiere_premiere')}</option>
                <option value="service">{t('service')}</option>
                <option value="porte_char">{t('porte_char')}</option>
                <option value="depannage">{t('depannage')}</option>
              </select>
            </div>

            {/* Brand Filter */}
            {currentBrands.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Marque / Brand :</label>
                <select
                  value={filterBrand}
                  onChange={e => setFilterBrand(e.target.value)}
                  className="bg-slate-900/80 border border-white/5 w-full px-3 py-2 text-[10px] font-bold text-white focus:outline-none rounded-xl focus:border-orange-500"
                >
                  <option value="all">Toutes les marques</option>
                  {currentBrands.map(b => (
                    <option key={b} value={b.toLowerCase()}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Condition Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">État / Condition :</label>
              <select
                value={filterCondition}
                onChange={e => setFilterCondition(e.target.value as any)}
                className="bg-slate-900/80 border border-white/5 w-full px-3 py-2 text-[10px] font-bold text-white focus:outline-none rounded-xl focus:border-orange-500"
              >
                <option value="all">Tous les états</option>
                <option value="new">Neuf</option>
                <option value="used">Occasion</option>
                <option value="refurbished">Rénové (Refurbished)</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trier par :</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-900/80 border border-white/5 w-full px-3 py-2 text-[10px] font-bold text-white focus:outline-none rounded-xl focus:border-orange-500"
              >
                <option value="newest">Plus récent</option>
                <option value="price_asc">Prix: Croissant</option>
                <option value="price_desc">Prix: Décroissant</option>
                <option value="popular">Plus populaire</option>
              </select>
            </div>


            {/* Wilaya Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('wilaya')} :</label>
              <select
                value={filterWilaya}
                onChange={e => setFilterWilaya(e.target.value)}
                className="bg-slate-900/80 border border-white/5 w-full px-3 py-2 text-[10px] font-bold text-white focus:outline-none rounded-xl focus:border-orange-500"
              >
                <option value="all">{t('all_wilayas')}</option>
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Price Filters */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('min_price')}</label>
              <input
                type="number"
                placeholder="Ex: 5 000"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold font-mono text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('max_price')}</label>
              <input
                type="number"
                placeholder="Ex: 10 000 000"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold font-mono text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* CENTER FEED (Search & Listings)         */}
        {/* ======================================= */}
        <div className={`col-span-1 flex flex-col h-full min-h-0 ${mobileView === 'map' ? 'hidden' : 'lg:col-span-6'}`}>
          
          {/* Main search text */}
          <div className="flex gap-2 mb-5 shrink-0 z-30">
            <div className="relative flex-1">
              <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400`} />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full bg-slate-900/60 border border-white/10 rounded-2xl ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 text-xs text-white placeholder-slate-450 focus:outline-none focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/50 transition font-semibold shadow-lg shadow-black/20`}
              />
              <button 
                onClick={() => setShowAlertModal(true)}
                className={`absolute ${lang === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition flex items-center gap-1.5`}
                title="Créer une Alerte"
              >
                <BellRing className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Créer Alerte</span>
              </button>
            </div>
            <button
              onClick={() => setShowFiltersModal(true)}
              className="lg:hidden shrink-0 aspect-square rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500/50 transition-all shadow-lg shadow-black/20"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Special Banner for Spare Parts */}
          {activeCategory === 'pieces_detachees' && activeView === 'feed' && (
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-900/10 border border-orange-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <Wrench className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Demande de Pièce Express</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Laissez les fournisseurs vous envoyer leurs devis.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSparePartModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition whitespace-nowrap shadow-lg shadow-orange-500/20"
              >
                Lancer une recherche
              </button>
            </div>
          )}

          {/* View Switch Tabs */}
          <div className="flex border border-white/5 bg-slate-950/30 p-1 mb-4 rounded-xl shrink-0">
            <button
              onClick={() => setMobileView('list')}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded-lg transition ${
                mobileView === 'list' ? 'bg-orange-500 text-white' : 'text-slate-500'
              }`}
            >
              <List className="h-4 w-4" />
              <span>{t('list_view')} ({filteredListings.length})</span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded-lg transition ${
                mobileView === 'map' ? 'bg-orange-500 text-white' : 'text-slate-500'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>{t('gps_map')}</span>
            </button>
          </div>

          {/* Main Content Router */}
          {(activeView === 'feed' || activeView === 'favorites') && (
            <FeedView
              mobileView={mobileView}
              filteredListings={activeView === 'favorites' ? listings.filter(l => savedListings.includes(l.id)) : filteredListings}
              sortedListings={sortedListings}
              t={t}
              setSelectedListing={setSelectedListing}
              renderCardPattern={renderCardPattern}
              compareList={compareList}
              toggleCompare={toggleCompare}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              savedListings={savedListings}
              toggleSaveListing={toggleSaveListing}
            />
          )}

          {/* Stores Directory View */}
          {activeView === 'stores' && (
            <StoresView
              mobileView={mobileView}
              setActiveView={setActiveView}
              setSelectedStore={setSelectedStore}
              t={t}
              onAddStoreClick={handleAddStoreClick}
            />
          )}

          {/* Single Store View */}
          {activeView === 'store_detail' && selectedStore && (
            <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden lg:flex'}`}>
              <button 
                onClick={() => setActiveView('stores')}
                className="mb-4 text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 hover:text-orange-500 transition w-fit"
              >
                â† Retour aux vitrines
              </button>
              
              <div className="glass-card rounded-3xl border border-orange-500/20 overflow-hidden shrink-0 mb-6 relative">
                <button 
                  onClick={() => setShowMyAdsModal(true)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition group"
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-orange-400 transition">{t('my_ads')}</div>
                  </div>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative border-b border-white/5 overflow-hidden">
                  {selectedStore.isPremium && selectedStore.bannerUrl ? (
                    <img src={selectedStore.bannerUrl} alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
                  ) : (
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>
                <div className="px-6 pb-6 pt-3 relative">
                  <div className={`absolute -top-12 left-6 h-20 w-20 rounded-2xl flex items-center justify-center shadow-xl border-4 border-slate-950 ${selectedStore.isPremium ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                    <Building className="h-8 w-8" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-4 sm:mt-2 ml-0 sm:ml-28 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-black text-white">{selectedStore.name}</h2>
                        {selectedStore.isPremium && (
                          <ShieldCheck className="h-5 w-5 text-amber-500" aria-label="Partenaire Officiel" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-orange-500"/> {selectedStore.wilaya}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-500"/> Depuis {selectedStore.joinedDate.split('-')[0]}</span>
                        {selectedStore.rating && (
                          <span className="flex items-center gap-1 text-amber-400">★ {selectedStore.rating}/5</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => window.open(`https://wa.me/${selectedStore.phone.replace(/[^0-9]/g, '')}`, '_blank')} className="flex-1 sm:flex-none bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase px-4 py-2 rounded-xl transition flex items-center justify-center gap-2">
                        <Smartphone className="h-4 w-4" /> WhatsApp
                      </button>
                      <button onClick={() => window.open(`tel:${selectedStore.phone}`)} className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                        <Phone className="h-4 w-4" /> Appeler
                      </button>
                    </div>
                  </div>
                  
                  <p className="mt-6 text-sm text-slate-300 leading-relaxed max-w-2xl">{selectedStore.description}</p>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                    {selectedStore.categories && (
                      <div>
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Spécialités de la boutique</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStore.categories.map(cat => (
                            <span key={cat} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase px-2 py-1 rounded">
                              {t(cat)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedStore.paymentMethods && (
                      <div>
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Méthodes de paiement acceptées</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStore.paymentMethods.map(method => (
                            <span key={method} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2 py-1 rounded flex items-center gap-1">
                              <Check className="h-3 w-3" /> {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3 shrink-0">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                Produits & Engins du vendeur
              </h3>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin pb-20 pr-2">
                <div className="grid grid-cols-1 gap-4">
                  {listings.filter(l => l.storeId === selectedStore.id).length === 0 ? (
                    <div className="p-10 text-center border border-dashed border-white/5 rounded-2xl">
                      <p className="text-xs text-slate-500">Aucune offre disponible pour le moment.</p>
                    </div>
                  ) : (
                    listings.filter(l => l.storeId === selectedStore.id).map(item => (
                      <div key={item.id} onClick={() => setSelectedListing(item)} className="glass-card p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-orange-500/30 transition flex gap-4">
                        <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                          <Grid className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-2 items-center mb-1">
                            <span className="text-[8px] font-black text-orange-400 uppercase bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">{item.equipmentType}</span>
                            {item.stockQuantity !== undefined && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                                item.stockQuantity > 5 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : item.stockQuantity > 0 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${item.stockQuantity > 5 ? 'bg-emerald-500' : item.stockQuantity > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                {item.stockQuantity > 5 ? (item.showExactQuantity ? `En Stock: ${item.stockQuantity}` : 'En Stock') : item.stockQuantity > 0 ? (item.showExactQuantity ? `Stock Faible: ${item.stockQuantity}` : 'Stock Faible') : 'Rupture de Stock'}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-sm text-slate-200">{item.title}</h4>
                          <span className="font-black text-sm text-white mt-1 block">{item.price} DA</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Store Pricing / Creation View */}
          {activeView === 'store_pricing' && (
            <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden lg:flex'} overflow-y-auto pr-2 scrollbar-thin pb-20`}>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setActiveView('stores')} className="text-slate-400 hover:text-white transition p-2 bg-slate-900/50 rounded-lg hover:bg-slate-800 border border-white/5">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Créer votre Vitrine</h2>
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 mb-4 border border-orange-500/20 shadow-lg shadow-orange-500/10">
                  <StoreIcon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Développez votre activité</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Choisissez le pack qui correspond à vos besoins et commencez à vendre directement aux professionnels du BTP et des Mines.</p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Pack Starter */}
                <div className="glass-card rounded-3xl border border-white/5 p-6 flex flex-col hover:border-white/20 transition duration-300">
                  <h4 className="text-lg font-black text-white mb-1 uppercase tracking-widest">Starter</h4>
                  <p className="text-[10px] text-slate-400 mb-4">Pour bien démarrer</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">4 000</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase ml-1">DA / 3 Mois</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-6">
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> Vitrine Officielle</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> 50 Annonces Incluses</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> Lien standard (Sous-domaine)</li>
                  </ul>
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-xs py-3 rounded-xl transition uppercase tracking-widest border border-white/5">Sélectionner</button>
                </div>

                {/* Pack Premium */}
                <div className="glass-card rounded-3xl border border-orange-500 p-6 flex flex-col relative transform lg:-translate-y-4 shadow-2xl shadow-orange-500/10">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/20 whitespace-nowrap">
                    <Zap className="h-3 w-3 fill-current" /> Plus Populaire
                  </div>
                  <h4 className="text-lg font-black text-orange-400 mb-1 uppercase tracking-widest">Premium</h4>
                  <p className="text-[10px] text-orange-500/60 mb-4">Visibilité maximale</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">7 000</span>
                    <span className="text-[10px] font-black text-orange-500/60 uppercase ml-1">DA / 6 Mois</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-6">
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-orange-500 shrink-0"/> Badge Premium Distinctif</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-orange-500 shrink-0"/> Annonces Illimitées</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-orange-500 shrink-0"/> 5 Annonces en Vedette par mois</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-orange-500 shrink-0"/> Assistance téléphonique 7/7</li>
                  </ul>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-xl transition shadow-lg shadow-orange-500/20 uppercase tracking-widest">Sélectionner</button>
                </div>

                {/* Pack Pro / Corporate */}
                <div className="glass-card rounded-3xl border border-emerald-500/30 p-6 flex flex-col hover:border-emerald-500/50 transition duration-300">
                  <h4 className="text-lg font-black text-emerald-400 mb-1 uppercase tracking-widest">Corporate</h4>
                  <p className="text-[10px] text-emerald-500/60 mb-4">Pour les grandes entreprises</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">12 000</span>
                    <span className="text-[10px] font-black text-emerald-500/60 uppercase ml-1">DA / 12 Mois</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-6">
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> Tout du Pack Premium</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> Nom de Domaine (.com ou .dz)</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> Couleurs personnalisables</li>
                    <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300"><Check className="h-4 w-4 text-emerald-500 shrink-0"/> Statistiques & Tableau de bord</li>
                  </ul>
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-black text-xs py-3 rounded-xl transition uppercase tracking-widest border border-emerald-500/20">Sélectionner</button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="glass-card rounded-3xl border border-white/5 p-8 mt-2 flex flex-col items-center">
                <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-6">Moyens de Paiement Acceptés</h4>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <div className="flex flex-col items-center justify-center px-6 py-4 border border-white/5 rounded-2xl bg-slate-900/50 hover:bg-slate-800 transition cursor-default">
                    <CreditCard className="h-8 w-8 text-yellow-500 mb-2" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Edahabia</span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-6 py-4 border border-white/5 rounded-2xl bg-slate-900/50 hover:bg-slate-800 transition cursor-default">
                    <CreditCard className="h-8 w-8 text-emerald-500 mb-2" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Carte CIB</span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-6 py-4 border border-white/5 rounded-2xl bg-slate-900/50 hover:bg-slate-800 transition cursor-default">
                    <ArrowRightLeft className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Virement CCP / Banque</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-6 text-center max-w-md mx-auto leading-relaxed">
                  L'activation de votre boutique s'effectue dès réception de votre paiement. Vous recevrez vos identifiants d'accès par email ainsi que les instructions de personnalisation de votre nom de domaine.
                </p>
              </div>
            </div>
          )}

          {/* Inventory Management View */}
          {activeView === 'inventory' && (
            <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'block' : 'hidden lg:flex'} overflow-y-auto pr-2 scrollbar-thin pb-20`}>
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Grid className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">{lang === 'ar' ? 'إعلاناتي / إدارة المخزون' : 'Mes Annonces / Gestion de Stock'}</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Mon Espace Vendeur</p>
                  </div>
                </div>
              </div>

              {/* Seller Analytics Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card rounded-2xl border border-white/5 p-4 flex flex-col hover:border-white/20 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vues Totales</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">12.5K</span>
                    <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +15%
                    </span>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-white/5 p-4 flex flex-col hover:border-white/20 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacts / Leads</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">342</span>
                    <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +8%
                    </span>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-white/5 p-4 flex flex-col hover:border-white/20 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annonces Actives</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">{storeInventory.length}</span>
                    <span className="text-[10px] font-bold text-slate-500 mb-1">/ Illimité</span>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border border-white/5 p-4 flex flex-col hover:border-white/20 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <MousePointerClick className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux de Conversion</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">2.7%</span>
                    <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +0.5%
                    </span>
                  </div>
                </div>
              </div>

              {/* Premium Upsell Banner (Visible if non-premium, but for demo we show it styled) */}
              {!user?.isPremium && (
                <div className="mb-8 bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-orange-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Passez au Pack Premium</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Débloquez les annonces illimitées, le badge "Vérifié" et l'accès complet aux statistiques.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('store_pricing')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition whitespace-nowrap shadow-lg shadow-orange-500/20"
                  >
                    Voir les Packs
                  </button>
                </div>
              )}

              <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-4 w-12">Statut</th>
                        <th className="p-4">Produit / Engin</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4 text-center">Quantité</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {storeInventory.map(item => {
                        const qty = item.stockQuantity || 0;
                        let statusColor = 'text-slate-500 bg-slate-500/10 border-slate-500/20';
                        let statusDot = 'bg-slate-500';
                        let statusText = 'N/A';
                        
                        if (item.stockQuantity !== undefined) {
                          if (qty > 5) {
                            statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                            statusDot = 'bg-emerald-500';
                            statusText = 'En Stock';
                          } else if (qty > 0 && qty <= 5) {
                            statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                            statusDot = 'bg-amber-500';
                            statusText = 'Stock Faible';
                          } else {
                            statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                            statusDot = 'bg-rose-500';
                            statusText = 'Rupture';
                          }
                        }

                        return (
                          <React.Fragment key={item.id}>
                          <tr className="hover:bg-white/[0.02] transition">
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase px-2 py-1 rounded border ${statusColor}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`}></span>
                                {statusText}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-bold text-white mb-0.5">{item.title}</p>
                              <p className="text-[9px] text-slate-500 font-black uppercase">{t(item.category)}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] text-slate-400 font-mono">{item.sku || '---'}</span>
                            </td>
                            <td className="p-4 text-center">
                              {item.stockQuantity !== undefined ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="inline-flex items-center gap-3 bg-slate-900/50 rounded-lg p-1 border border-white/5">
                                    <button 
                                      onClick={() => setStoreInventory(prev => prev.map(l => l.id === item.id ? {...l, stockQuantity: Math.max(0, (l.stockQuantity || 0) - 1)} : l))}
                                      className="h-6 w-6 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 flex items-center justify-center transition"
                                    >
                                      -
                                    </button>
                                    
                                    {user?.isPremium ? (
                                      <input 
                                        type="number" 
                                        value={qty} 
                                        onChange={(e) => setStoreInventory(prev => prev.map(l => l.id === item.id ? {...l, stockQuantity: parseInt(e.target.value) || 0} : l))}
                                        className="w-12 h-6 bg-transparent text-sm font-black text-white text-center focus:outline-none focus:ring-1 focus:ring-orange-500 rounded hide-arrows"
                                      />
                                    ) : (
                                      <span className="text-sm font-black text-white w-6 text-center">{qty}</span>
                                    )}

                                    <button 
                                      onClick={() => setStoreInventory(prev => prev.map(l => l.id === item.id ? {...l, stockQuantity: (l.stockQuantity || 0) + 1} : l))}
                                      className="h-6 w-6 rounded bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 flex items-center justify-center transition"
                                    >
                                      +
                                    </button>
                                  </div>
                                  
                                  {user?.isPremium && (
                                    <label className="flex items-center gap-1.5 cursor-pointer text-[9px] text-slate-400 hover:text-white transition">
                                      <input 
                                        type="checkbox" 
                                        checked={!!item.showExactQuantity}
                                        onChange={(e) => setStoreInventory(prev => prev.map(l => l.id === item.id ? {...l, showExactQuantity: e.target.checked} : l))}
                                        className="h-3 w-3 rounded bg-slate-900 border-white/10 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-950"
                                      />
                                      Afficher Qté Publique
                                    </label>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-600 italic">Non géré</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button className="text-[10px] text-slate-400 hover:text-white uppercase font-black tracking-widest transition">
                                Modifier
                              </button>
                            </td>
                          </tr>
                          
                          {/* Premium Audit Details Expandable Row */}
                          {user?.isPremium && item.auditDetails && (
                            <tr key={`${item.id}-audit`} className="bg-slate-900/20 border-b border-white/5">
                              <td colSpan={5} className="p-4">
                                <div className="flex items-center justify-between bg-slate-950/50 rounded-xl p-3 border border-white/5">
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                        <Eye className="h-4 w-4 text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase">Vues</p>
                                        <p className="text-xs font-black text-slate-200">{item.auditDetails.views}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                        <MousePointer2 className="h-4 w-4 text-amber-400" />
                                      </div>
                                      <div>
                                        <p className="text-[8px] text-slate-500 font-bold uppercase">Clics</p>
                                        <p className="text-xs font-black text-slate-200">{item.auditDetails.clicks}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-mono">
                                    Mise à jour: {item.auditDetails.lastUpdated}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  {storeInventory.length === 0 && (
                    <div className="p-10 text-center">
                      <p className="text-xs text-slate-500">Aucun produit dans votre inventaire.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tenders View */}
          {activeView === 'tenders' && (
            <TendersView
              mobileView={mobileView}
              tenders={tenders}
              t={t}
              user={user}
              handlePostTenderButtonClick={handleAddTenderClick}
              setShowPremiumModal={setShowPremiumModal}
            />
          )}

          {/* Auctions View */}
          {activeView === 'auctions' && (
            <AuctionsView auctions={auctions} t={t} onAddAuctionClick={handleAddAuctionClick} />
          )}

          {/* Jobs View */}
          {activeView === 'jobs' && (
            <JobsView mobileView={mobileView} jobs={jobs} onAddJobClick={handleAddJobClick} />
          )}
        </div>

        {/* ======================================= */}
        {/* RIGHT SIDEBAR (Map & Premium Widgets)   */}
        {/* ======================================= */}
        <div className={`col-span-1 space-y-6 flex flex-col h-full ${mobileView === 'map' ? 'block lg:col-span-9' : 'hidden lg:flex lg:col-span-3'}`}>
          
          {/* Map Container */}
          <div className={`w-full shrink-0 rounded-2xl overflow-hidden border border-white/10 relative shadow-lg bg-slate-900/50 ${mobileView === 'map' ? 'h-[75vh] lg:h-full flex-1' : 'h-[60vh] lg:h-[350px]'}`}>
            <div ref={mainMapContainerRef} className="w-full h-full" />
            
            <div className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} z-20 bg-slate-950/85 backdrop-blur-xl px-3 py-1.5 border border-white/5 rounded-lg shadow-2xl flex items-center gap-2.5 text-[9px] font-black text-slate-200 uppercase tracking-widest`}>
              <Compass className="h-3 w-3 text-orange-500 animate-spin-slow" />
              <span>{t('gps_map')}</span>
            </div>
            
            {/* Mobile Exit Map Button */}
            <button 
              onClick={() => setMobileView('list')}
              className={`lg:hidden absolute bottom-6 ${lang === 'ar' ? 'right-4' : 'left-4'} z-[400] bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 border border-white/10 rounded-full shadow-2xl transition flex items-center gap-2`}
            >
              <X className="h-5 w-5" />
              <span className="font-bold text-xs uppercase tracking-widest">{lang === 'ar' ? 'إغلاق' : 'Fermer'}</span>
            </button>

            {/* Locate Me Button */}
            <button 
              onClick={handleLocateMe}
              disabled={locationLoading}
              className={`absolute bottom-6 ${lang === 'ar' ? 'left-4' : 'right-4'} z-[400] bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg shadow-orange-500/30 transition flex items-center justify-center ${locationLoading ? 'opacity-70 animate-pulse' : 'hover:scale-110'}`}
              title="Ma Position (GPS)"
            >
              <Compass className={`h-5 w-5 ${locationLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Advertising Space */}
          {banners && banners.length > 0 && (
            <div className="hidden lg:block relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer h-40 shrink-0">
              <a href={banners[0].linkUrl} target="_blank" rel="noopener noreferrer">
                <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-wider border border-white/10">
                  {lang === 'ar' ? 'إعلان' : 'Publicité'}
                </div>
                <img 
                  src={banners[0].imageUrl} 
                  alt="Publicité" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-white font-black text-xs drop-shadow-md uppercase tracking-wider">{banners[0].sponsorName}</h4>
                </div>
              </a>
            </div>
          )}

          {/* Premium Spotlight Widget */}
          <div className="hidden lg:block bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 flex-1">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="h-4 w-4 fill-current" />
              Premium Partners
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Augmentez la visibilité de vos annonces et multipliez vos ventes en passant au statut Premium.
            </p>
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition"
            >
              Découvrir les offres
            </button>
          </div>

        </div>

      </div>

      {/* 5. Detail slideover Panel */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop with strong blur */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedListing(null)}
          />

          {/* Details Drawer */}
          <div className="relative w-full max-w-lg bg-[#0a0d16] border-l border-white/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-fade-in shadow-2xl h-full z-50">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                      selectedListing.dealType === 'vente' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : selectedListing.dealType === 'location'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {t(selectedListing.dealType)}
                    </span>
                    {selectedListing.dealType === 'location' && selectedListing.withOperator !== undefined && (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                        selectedListing.withOperator 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {selectedListing.withOperator ? 'ðŸ‘¨â€ðŸ”§ Avec Opérateur' : 'âŒ Sans Opérateur'}
                      </span>
                    )}
                    {selectedListing.isPremium && (
                      <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] font-black border border-amber-400/20 uppercase tracking-widest flex items-center gap-0.5">
                        <Zap className="h-2 w-2 fill-current" />
                        <span>{t('premium_badge')}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 pt-0.5">
                    <span>{getCategoryIconSymbol(selectedListing.category)}</span>
                    <span className="text-slate-355">{t(selectedListing.category)}</span>
                    <span>â€¢</span>
                    <span className="text-orange-400">{t(selectedListing.equipmentType)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedListing(null)}
                  className="p-2 hover:bg-slate-900 rounded-xl transition border border-white/5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cover visual overlay inside the drawer */}
              <div className="rounded-2xl overflow-hidden border border-white/5 relative bg-slate-900/30">
                {selectedListing.images && selectedListing.images.length > 0 ? (
                  <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                    {selectedListing.images.map((img, idx) => (
                      <img key={idx} src={img} className="w-full h-48 md:h-64 object-cover snap-center shrink-0" />
                    ))}
                  </div>
                ) : (
                  renderCardPattern(selectedListing.category, selectedListing.id, selectedListing.isPremium)
                )}
              </div>

              {/* Title & Price details */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-base md:text-xl font-black text-white leading-snug flex-1">
                    {selectedListing.title}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleReport(selectedListing, e)}
                      className="p-2 shrink-0 rounded-xl transition bg-slate-900/50 text-slate-400 hover:text-rose-500 hover:bg-slate-800"
                      title="Signaler l'annonce"
                    >
                      <Flag className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={(e) => handleShare(selectedListing, e)}
                      className="p-2 shrink-0 rounded-xl transition bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={(e) => toggleSaveListing(selectedListing.id, e)}
                      className={`p-2 shrink-0 rounded-xl transition ${
                        savedListings.includes(selectedListing.id)
                          ? 'bg-orange-500/20 text-orange-500' 
                          : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${savedListings.includes(selectedListing.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="text-xl font-black text-orange-450 font-mono">
                  {selectedListing.price > 0 ? `${selectedListing.price.toLocaleString('fr-FR')} DA` : t('price_on_demand')}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-wider font-mono">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>{t('posted_on')}: {selectedListing.dateAdded}</span>
                  {selectedListing.sku && (
                    <span className="ml-3 px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-white/10">Ref: {selectedListing.sku}</span>
                  )}
                </div>
              </div>


              {/* Evaluation & Inspection Badges */}
              {(selectedListing.expertRating || selectedListing.inspectionBadge) && (
                <div className="flex flex-wrap items-center gap-3">
                  {selectedListing.inspectionBadge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Inspection Vérifiée</span>
                    </div>
                  )}
                  {selectedListing.expertRating && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">{selectedListing.expertRating} / 5</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Évaluation Expert</span>
                    </div>
                  )}
                </div>
              )}

              {/* Location details */}
              <div className="space-y-2 bg-slate-900/50 p-4 border border-white/3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200">
                <MapPin className="h-4.5 w-4.5 text-orange-500 shrink-0 animate-bounce" />
                <span>{t('wilaya')} : {selectedListing.wilaya} | {t('commune')} : {selectedListing.commune}</span>
              </div>

              {/* Maintenance & Hours */}
              {(selectedListing.hoursOfUse || selectedListing.maintenanceLogUrl) && (
                <div className="flex gap-2">
                  {selectedListing.hoursOfUse && (
                    <div className="flex-1 bg-slate-900/50 p-4 border border-white/3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200">
                      <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                      <span>{selectedListing.hoursOfUse} {t('hours')}</span>
                    </div>
                  )}
                  {selectedListing.maintenanceLogUrl && (
                    <a href={selectedListing.maintenanceLogUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-900/50 hover:bg-slate-800 p-4 border border-white/3 hover:border-orange-500/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 transition cursor-pointer">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span>Carnet d'Entretien</span>
                    </a>
                  )}
                </div>
              )}

              {/* Description body */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest font-mono">{t('description')}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-4 border border-white/3 rounded-2xl whitespace-pre-line">
                  {selectedListing.description}
                </p>
              </div>

              {/* Technical features specs */}
              {selectedListing.features && selectedListing.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest font-mono">{t('specs')}</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedListing.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-900/40 border border-white/3 rounded-xl">
                        <Check className="h-4 w-4 text-orange-500 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Detailed Audit/Specs Table */}
              {selectedListing.premiumSpecsTable && selectedListing.premiumSpecsTable.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono">Fiche Technique Détaillée</h4>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-slate-900/40">
                    <table className="w-full text-left text-sm">
                      <tbody className="divide-y divide-white/5">
                        {selectedListing.premiumSpecsTable.map((spec, idx) => (
                          <tr key={idx} className="hover:bg-amber-500/5 transition">
                            <td className="p-3 w-1/3 bg-black/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{spec.label}</td>
                            <td className="p-3 text-[11px] font-black text-slate-200">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Advertiser details */}
              <div className="space-y-3 bg-slate-900/30 p-4 border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-500/10 rounded-xl">
                      <Building className="h-4.5 w-4.5 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider">{selectedListing.companyName}</h5>
                        <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">{selectedListing.commune}, {selectedListing.wilaya}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleFocusListingLocation(selectedListing);
                      setSelectedListing(null);
                    }}
                    className="p-2.5 bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-orange-500/25 rounded-xl transition cursor-pointer"
                    title={t('zoom_map')}
                  >
                    <Compass className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Contact controls */}
            <div className="pt-5 border-t border-white/5 mt-6">
              {(selectedListing.equipmentType === 'engin' || selectedListing.equipmentType === 'machine_production' || selectedListing.equipmentType === 'vehicule_lourd_leger' || selectedListing.equipmentType === 'porte_char') && selectedListing.price > 0 && (
                <button
                  onClick={() => setShowLeasingModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition text-center shadow-lg shadow-blue-500/20 border border-blue-400/20 mb-2"
                >
                  <Calculator className="h-5 w-5" />
                  <span>Simuler un Leasing</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowDevisModal(true);
                }}
                className="col-span-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition text-center shadow-lg shadow-orange-500/20 border border-orange-400/20 mb-2"
              >
                <ClipboardList className="h-5 w-5" />
                <span>Demander un Devis</span>
              </button>
              <button
                onClick={handleContactSeller}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition text-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20 mb-3"
              >
                <MessageCircle className="h-5 w-5" />
                Chat en direct
              </button>
              
              <div className="grid grid-cols-1 gap-3">
                {!user ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 transition text-center"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-orange-500" />
                      <span>{lang === 'ar' ? 'إظهار الرقم' : 'Afficher le numéro'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium normal-case">{lang === 'ar' ? 'سجل دخولك لرؤية بيانات البائع' : 'Connectez-vous pour voir les coordonnées du vendeur'}</span>
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
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5.5 Devis Modal */}
      {showDevisModal && selectedListing && (
        <DevisModal
          selectedListing={selectedListing}
          onClose={() => setShowDevisModal(false)}
        />
      )}

      

      {/* 5.6 Leasing Modal */}
      <LeasingModal
        isOpen={showLeasingModal}
        onClose={() => setShowLeasingModal(false)}
        listing={selectedListing}
        t={t}
      />

      {/* 5.7 Compare Modal */}
      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        compareList={compareList}
        removeFromCompare={(id) => setCompareList(prev => prev.filter(item => item.id !== id))}
        t={t}
      />

      {/* 5.8 Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        t={t}
      />

      {/* 5.9 Spare Part Request Modal */}
      <SparePartRequestModal
        isOpen={showSparePartModal}
        onClose={() => setShowSparePartModal(false)}
      />

      {activeView === 'how_to_advertise' && <HowToAdvertiseView onBack={() => setActiveView('feed')} lang={lang as 'fr' | 'en' | 'ar'} />}
      {activeView === 'terms_of_use' && <TermsOfUseView onBack={() => setActiveView('feed')} lang={lang as 'fr' | 'en' | 'ar'} />}
      {activeView === 'terms_of_sale' && <TermsOfSaleView onBack={() => setActiveView('feed')} lang={lang as 'fr' | 'en' | 'ar'} />}
      {activeView === 'contact' && <ContactView onBack={() => setActiveView('feed')} lang={lang as 'fr' | 'en' | 'ar'} />}

      {/* Floating Compare Bar */}
      {compareList.length > 0 && activeView === 'feed' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 border border-orange-500/30 shadow-2xl shadow-orange-500/20 rounded-full px-4 py-2 flex items-center gap-4">
          <div className="flex -space-x-2">
            {compareList.map((item, i) => (
              <div key={item.id} className="h-8 w-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-orange-400 z-10 relative">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="text-xs font-bold text-white whitespace-nowrap">
            {compareList.length} / 3 <span className="hidden sm:inline">sélectionnés</span>
          </div>
          <button
            onClick={() => setShowCompareModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full transition ml-2"
          >
            Comparer
          </button>
          <button
            onClick={() => setCompareList([])}
            className="p-2 text-slate-400 hover:text-red-400 transition ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 6. Form Submission Modal */}
      {showAddModal && (
        <AddAdModal
          user={user}
          onClose={() => {
            setShowAddModal(false);
            setEditingListing(null);
          }}
          onSubmit={async (listing) => {
            if (editingListing) {
              try {
                if (user) {
                  const { id, created_at, views, likes, ...updates } = listing as any;
                  await updateMyListing(editingListing.id, user.id, updates);
                  setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...updates } : l));
                  alert(lang === 'ar' ? 'تم تحديث الإعلان بنجاح' : 'Annonce mise à jour avec succès');
                }
              } catch (error) {
                console.error('Error updating listing', error);
                alert(lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Erreur lors de la mise à jour');
              }
              setShowAddModal(false);
              setEditingListing(null);
            } else {
              handlePostAd(listing);
            }
          }}
          t={t}
          lang={lang as 'fr' | 'ar'}
          editingListing={editingListing}
        />
      )}

      {/* 6.5 Form Submission Modal for Tenders */}
      {showMyAdsModal && (
        <MyAdsModal
          onClose={() => setShowMyAdsModal(false)}
          user={user}
          listings={listings}
          onDeleteAd={handleDeleteAd}
          onRenewAd={handleRenewAd}
          lang={lang}
        />
      )}

      {showAddTenderModal && (
        <AddTenderModal
          onClose={() => setShowAddTenderModal(false)}
          onSubmit={handlePostTender}
          t={t}
          lang={lang as 'fr' | 'ar'}
        />
      )}

      {/* 6.5 Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filterWilaya={filterWilaya}
        setFilterWilaya={setFilterWilaya}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        filterCondition={filterCondition}
        setFilterCondition={setFilterCondition}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        t={t}
      />

      {/* 7. Connexion / Auth Modal */}
      
      {showVerificationModal && (
        <VerificationModal
          onClose={() => setShowVerificationModal(false)}
          user={user}
          lang={lang}
          onUpgrade={() => setShowPremiumModal(true)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onGuestLogin={handleLoginAsGuest}
          t={t}
        />
      )}

      {/* 8. Premium Upgrade details Modal */}
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} user={user} t={t} lang={lang} />
      )}

      {/* 9. Free Limit block Popup */}
      {showLimitPopup && (
        <LimitPopup
          onClose={() => setShowLimitPopup(false)}
          onUpgrade={handleUpgradeToPremium}
          t={t}
        />
      )}

      {/* 10. QR Mobile Connection Modal */}
      {showQrModal && (
        <QrModal
          onClose={() => setShowQrModal(false)}
          t={t}
        />
      )}
      {/* 11. Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-slate-950/70 backdrop-blur-2xl border-t border-white/10 z-50 flex lg:hidden items-center justify-around px-2 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={async () => { await Haptics.impact({ style: ImpactStyle.Light }); setActiveView('feed'); }}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 active:scale-90 ${activeView === 'feed' ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-400'}`}
        >
          <Grid className="h-5 w-5" />
          <span className="text-[10px] font-bold">Marché</span>
        </button>
        <button
          onClick={async () => { await Haptics.impact({ style: ImpactStyle.Light }); setActiveView('stores'); }}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 active:scale-90 ${activeView === 'stores' || activeView === 'store_detail' ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-400'}`}
        >
          <StoreIcon className="h-5 w-5" />
          <span className="text-[10px] font-bold">Boutiques</span>
        </button>
        <button
          onClick={async () => { await Haptics.impact({ style: ImpactStyle.Medium }); handlePostAdButtonClick(); }}
          className="flex flex-col items-center justify-center -mt-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-full w-14 h-14 shadow-[0_10px_25px_rgba(249,115,22,0.5)] border-4 border-slate-950 transition-transform active:scale-90"
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          onClick={async () => { await Haptics.impact({ style: ImpactStyle.Light }); setActiveView('tenders'); }}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 active:scale-90 ${activeView === 'tenders' ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-400'}`}
        >
          <Building className="h-5 w-5" />
          <span className="text-[10px] font-bold">Appels</span>
        </button>
        <button
          onClick={async () => { 
            await Haptics.impact({ style: ImpactStyle.Light });
            setActiveView('auctions');
            setSelectedListing(null);
          }}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 active:scale-90 ${activeView === 'auctions' ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'text-slate-400'}`}
        >
          <Gavel className="h-5 w-5" />
          <span className="text-[10px] font-bold">Enchères</span>
        </button>
      </nav>

      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
        user={user} 
        lang={lang}
        setLang={setLang}
        onStaticPageSelect={setActiveView}
        onLogout={handleLogout} 
        onLogin={() => setShowAuthModal(true)} 
        categories={[
          {id: 'mines_carrieres'}, 
          {id: 'ceramique_briqueterie'}, 
          {id: 'btp'}, 
          {id: 'services_experts'}, 
          {id: 'transport_logistique'}, 
          {id: 'pieces_detachees'},
          {id: 'outils'},
          {id: 'porte_char'},
          {id: 'jobs'}
        ]} 
        onCategorySelect={(catId) => { 
          if (catId === 'jobs') {
            setActiveView('jobs');
          } else if (catId === 'porte_char') {
            setActiveCategory('transport_logistique');
            setActiveEquipType('porte_char');
            setActiveView('feed');
          } else {
            setActiveCategory(catId as any); 
            setActiveEquipType('all'); 
            setFilterBrand('all'); 
            setActiveView('feed');
          }
        }} 
        t={t} 
      />

      {showAdmin && (
        <AdminPanel
          onBack={() => {
            setShowAdmin(false);
            setActiveView('feed');
          }}
          lang={lang}
        />
      )}

      {showAddJobModal && (
        <AddJobModal user={user} onClose={() => setShowAddJobModal(false)} onSubmit={handlePostJob} t={t} lang={lang as any} />
      )}
      {showAddAuctionModal && (
        <AddAuctionModal user={user} onClose={() => setShowAddAuctionModal(false)} onSubmit={handlePostAuction} t={t} lang={lang as any} />
      )}
      {showAddStoreModal && (
        <AddStoreModal user={user} onClose={() => setShowAddStoreModal(false)} onSubmit={handlePostStore} t={t} lang={lang as any} />
      )}
    </div>
  );
}







