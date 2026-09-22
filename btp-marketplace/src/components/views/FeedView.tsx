import React, { useState, useRef } from 'react';
import { Grid, ExternalLink, Zap, MapPin, Loader2, ArrowDown, Bookmark } from 'lucide-react';
import type { Listing, CategoryType } from '../../types';
import { MOCK_BANNERS } from '../../mockData';

interface FeedViewProps {
  mobileView: 'map' | 'list';
  filteredListings: Listing[];
  sortedListings: Listing[];
  t: any;
  setSelectedListing: (listing: Listing | null) => void;
  renderCardPattern: (category: CategoryType, id: string, isPremiumAd?: boolean) => React.ReactNode;
  compareList: Listing[];
  toggleCompare: (listing: Listing, e: React.MouseEvent) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  savedListings?: string[];
  toggleSaveListing?: (id: string, e: React.MouseEvent) => void;
  banners?: any[];
}

export const FeedView: React.FC<FeedViewProps> = ({
  mobileView,
  filteredListings,
  sortedListings,
  t,
  setSelectedListing,
  renderCardPattern,
  compareList,
  toggleCompare,
  isLoading = false,
  onRefresh,
  savedListings = [],
  toggleSaveListing,
  banners = []
}) => {
  const [pullY, setPullY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      scrollRef.current.dataset.startY = e.touches[0].clientY.toString();
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.dataset.startY) {
      const startY = parseFloat(scrollRef.current.dataset.startY);
      const y = e.touches[0].clientY;
      const pull = Math.max(0, y - startY);
      if (pull > 0 && scrollRef.current.scrollTop === 0) {
        setPullY(Math.min(pull * 0.4, 60)); // Max pull visual 60px
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (pullY > 40 && onRefresh) {
      onRefresh();
    }
    setPullY(0);
    if (scrollRef.current) delete scrollRef.current.dataset.startY;
  };

  return (
    <>
      {/* Header Title Feed */}
      <div className={`mb-3 flex items-center justify-between shrink-0 ${mobileView === 'list' ? 'block' : 'hidden lg:flex'}`}>
        <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          {t('recent_offers')} ({filteredListings.length})
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono bg-slate-900/50 px-2 py-0.5 rounded-md border border-white/5">
          LIVE FEED
        </span>
      </div>

      {/* Scrolling List */}
      <div 
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex-1 overflow-y-auto scrollbar-thin pb-20 pr-1 lg:pr-2 relative ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}
      >
        {/* Pull to Refresh Indicator */}
        <div 
          className="absolute left-0 w-full flex justify-center items-center overflow-hidden transition-all duration-200 z-10" 
          style={{ height: pullY > 0 ? pullY : 0, opacity: pullY / 60 }}
        >
          {pullY > 40 ? <ArrowDown className="h-5 w-5 text-orange-500 animate-bounce" /> : <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />}
        </div>
        <div style={{ transform: `translateY(${pullY}px)`, transition: pullY === 0 ? 'transform 0.3s ease-out' : 'none' }}>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl border border-white/5 p-4 flex gap-4 animate-pulse bg-slate-900/30">
                <div className="w-20 h-20 bg-slate-800 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="h-3 w-16 bg-slate-800 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-slate-700 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-slate-800 rounded" />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-3 w-20 bg-slate-800 rounded" />
                    <div className="h-6 w-16 bg-slate-800 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
            <Grid className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h5 className="text-sm font-black text-slate-355">{t('no_listings')}</h5>
            <p className="text-[10px] text-slate-500 mt-2 max-w-sm mx-auto">{t('no_listings_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedListings.map((item, index) => {
              const bannerIndex = Math.floor(index / 3);
              const displayBanners = banners && banners.length > 0 ? banners : MOCK_BANNERS;
              const showBanner = index > 0 && index % 3 === 0 && bannerIndex <= displayBanners.length;
              // Use a rotating banner based on the index
              const bannerList = displayBanners.filter(b => b.position === 'feed_inline');
              const banner = showBanner && bannerList && bannerList.length > 0 ? bannerList[bannerIndex % bannerList.length] : null;

              return (
                <React.Fragment key={item.id}>
                  {banner && (
                    <a href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-32 rounded-2xl overflow-hidden relative border border-white/10 group cursor-pointer shadow-lg mb-2">
                      <img src={banner.imageUrl} alt={banner.sponsorName} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-[8px] font-black text-white px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                        Sponsorisé
                      </div>
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <span className="font-black text-sm text-white drop-shadow-md">{banner.sponsorName}</span>
                        <span className="text-[10px] bg-orange-500 text-white font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-orange-500/20 group-hover:bg-orange-400 transition">
                          Visiter <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </a>
                  )}
                  
                  <div 
                    onClick={() => setSelectedListing(item)}
                    className={`rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:translate-x-1 ${
                      item.isPremium 
                        ? 'premium-glow-card' 
                        : 'glass-card border border-white/3 hover:border-orange-500/30'
                    }`}
                  >
                    <div className="p-4 flex gap-4">
                      {/* Mini Abstract visual icon left side */}
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/10 relative">
                        {item.images && item.images.length > 0 ? (
                          <>
                            <img src={item.images[0]} className="w-full h-full object-cover" />
                            {item.images.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur z-10 shadow-lg border border-white/10">
                                1/{item.images.length}
                              </div>
                            )}
                          </>
                        ) : (
                          renderCardPattern(item.category, item.id, item.isPremium)
                        )}
                        {item.isPremium && (
                           <div className="absolute top-0 right-0 bg-amber-500 text-white p-0.5 rounded-bl-lg">
                             <Zap className="h-3 w-3 fill-current" />
                           </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                              item.dealType === 'vente' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : item.dealType === 'location'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {t(item.dealType)}
                            </span>
                            {item.dealType === 'location' && item.withOperator !== undefined && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                                item.withOperator 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {item.withOperator ? '👨‍🔧 Avec Opérateur' : '❌ Sans Opérateur'}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider truncate">
                              {t(item.equipmentType)}
                            </span>
                          </div>
                          
                          {item.stockQuantity !== undefined && (
                            <div className="mb-1.5">
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
                            </div>
                          )}

                          <h4 className="font-black text-slate-100 text-sm group-hover:text-orange-400 transition duration-300 truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                            <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
                            <span>{item.commune}, {item.wilaya}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase font-mono truncate max-w-[120px]">{item.companyName}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => toggleSaveListing && toggleSaveListing(item.id, e)}
                              className={`p-1.5 rounded-lg transition ${
                                savedListings.includes(item.id)
                                  ? 'text-orange-500 bg-orange-500/10'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              title="Sauvegarder"
                            >
                              <Bookmark className={`h-4 w-4 ${savedListings.includes(item.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={(e) => toggleCompare(item, e)}
                              className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition ${
                                compareList.some(c => c.id === item.id) 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                              }`}
                            >
                              {compareList.some(c => c.id === item.id) ? 'Comparé' : '+ Comparer'}
                            </button>
                            <span className="font-black text-sm text-orange-400 font-mono">
                              {item.price > 0 ? `${item.price.toLocaleString('fr-FR')} DA` : t('price_on_demand')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </>
  );
};
