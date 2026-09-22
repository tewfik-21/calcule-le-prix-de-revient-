export type DealType = 'vente' | 'achat' | 'location' | 'service';
export type CategoryType = 'mines_carrieres' | 'ceramique_briqueterie' | 'btp' | 'services_experts' | 'transport_logistique' | 'pieces_detachees' | 'outils';
export type EquipmentType = 'machine_production' | 'engin' | 'vehicule_lourd_leger' | 'matiere_premiere' | 'service' | 'consulting' | 'piece_rechange' | 'vehicule_transport' | 'porte_char' | 'depannage';

export interface Store {
  id: string;
  owner_id?: string;
  name: string;
  description: string;
  cvUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  wilaya: string;
  phone: string;
  isPremium?: boolean;
  isVip?: boolean;
  isVerified?: boolean; // Verified Seller Badge
  rating?: number;
  joinedDate: string;
  categories?: CategoryType[];
  paymentMethods?: string[];
}

export interface Listing {
  id: string;
  sellerId?: string;
  title: string;
  description: string;
  cvUrl?: string;
  price: number;
  dealType: DealType;
  category: CategoryType;
  equipmentType: EquipmentType;
  subcategory: string;
  companyName: string;
  wilaya: string;
  commune: string;
  phone: string;
  whatsapp: string;
  coords: [number, number]; // [lat, lng]
  dateAdded: string;
  imageUrl?: string;
  features?: string[];
  isPremium?: boolean; // Premium sponsored listing highlight
  isVip?: boolean; // VIP enterprise highlight
  storeId?: string; // Links listing to a Store
  images?: string[];
  imageFiles?: File[];
  stockQuantity?: number; // Added for inventory management
  showExactQuantity?: boolean; // Whether to show exact stock number to buyers (Premium feature)
  sku?: string; // Optional product code/SKU
  brand?: string; // Brand of the equipment
  year?: number; // Manufacturing year
  condition?: 'new' | 'used' | 'refurbished'; // Condition of the equipment
  hoursOfUse?: number; // Number of hours used (for heavy machinery)
  maintenanceLogUrl?: string; // Link to maintenance log PDF
  maintenanceFile?: File; // The uploaded file object
  
  
  // Premium Features
  auditDetails?: {
    views: number;
    clicks: number;
    lastUpdated: string;
  };
  expertRating?: number; // 0 to 5 stars
  inspectionBadge?: boolean; // Verified Inspection by an Expert
  premiumSpecsTable?: { label: string; value: string }[]; // Optional detailed specifications table
  withOperator?: boolean; // For rentals: with or without operator
}

export interface Tender {
  id: string;
  authorId?: string;
  title: string;
  companyName: string;
  description: string;
  cvUrl?: string;
  wilaya: string;
  deadline: string;
  budget?: string;
  category: CategoryType;
  dateAdded: string;
  isPremiumOnly: boolean;
}

export interface JobOffer {
  id: string;
  authorId?: string;
  title: string;
  type: 'offer' | 'request';
  companyName?: string;
  candidateName?: string;
  description: string;
  cvUrl?: string;
  wilaya: string;
  profession: string;
  experience: string;
  dateAdded: string;
}

export interface SearchFilters {
  searchQuery: string;
  dealType: DealType | 'all';
  category: CategoryType | 'all';
  equipmentType: EquipmentType | 'all';
  wilaya: string;
  minPrice: number | '';
  maxPrice: number | '';
  brand: string;
  condition: 'all' | 'new' | 'used' | 'refurbished';
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

export interface AdBanner {
  id: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'feed_inline' | 'sidebar' | 'hero';
}

export interface UserSession {
  id: string;
  identity: string;
  type: 'email' | 'phone' | 'guest';
  isPremium: boolean;
  isVip: boolean;
  isVerified: boolean; // Verified user badge
  premiumUntil?: string; // Expiration date for premium/vip
  whatsapp?: string;
  adsPostedCount: number;
  isAdmin?: boolean;
}

export interface Auction {
  id: string;
  sellerId?: string;
  title: string;
  companyName: string;
  description: string;
  cvUrl?: string;
  wilaya: string;
  commune: string;
  startingPrice: number;
  currentBid: number;
  endDate: string;
  category: CategoryType;
  images: string[];
  imageFiles?: File[];
  isVerified: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  requestedPlan: 'premium' | 'vip';
  durationMonths: number;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  // Extra fields for Admin view joining with profiles
  userName?: string;
  userPhone?: string;
  userWhatsapp?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id?: string;
  created_at: string;
  updated_at: string;
  // Extra fields populated by join
  other_user?: {
    id: string;
    full_name: string;
    company_name: string;
    avatar_url?: string;
  };
  listing?: {
    title: string;
  };
  last_message?: Message;
  unread_count?: number;
}
