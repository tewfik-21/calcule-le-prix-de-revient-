const fs = require('fs');
let code = fs.readFileSync('src/components/views/FeedView.tsx', 'utf8');

const searchStr = `              const showBanner = index > 0 && index % 3 === 0 && bannerIndex <= displayBanners.length;
                        ? 'premium-glow-card' `;

const replacement = `              const showBanner = index > 0 && index % 3 === 0 && bannerIndex <= displayBanners.length;
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
                        <span className="text-[10px] bg-orange-500 text-white font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-orange-500/20">
                          Visiter <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </a>
                  )}
                  
                  <div 
                    onClick={() => setSelectedListing(item)}
                    className={\`rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:translate-x-1 \${
                      item.isPremium 
                        ? 'premium-glow-card'\`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replacement);
  fs.writeFileSync('src/components/views/FeedView.tsx', code);
  console.log('Fixed FeedView.tsx');
} else {
  console.log('Could not find search string in FeedView.tsx');
}
