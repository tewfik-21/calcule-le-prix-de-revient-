import re

# 1. Update App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Add handleRenewAd
renew_logic = """
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
"""
if 'handleRenewAd' not in app:
    app = app.replace("const handleDeleteAd = async", renew_logic + "\n  const handleDeleteAd = async")

app = app.replace(
"""        <MyAdsModal
          onClose={() => setShowMyAdsModal(false)}
          user={user}
          listings={listings}
          onDeleteAd={handleDeleteAd}
          lang={lang}
        />""",
"""        <MyAdsModal
          onClose={() => setShowMyAdsModal(false)}
          user={user}
          listings={listings}
          onDeleteAd={handleDeleteAd}
          onRenewAd={handleRenewAd}
          lang={lang}
        />"""
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)


# 2. Update MyAdsModal.tsx
with open('src/components/modals/MyAdsModal.tsx', 'r', encoding='utf-8') as f:
    myads = f.read()

myads = myads.replace("onDeleteAd: (id: string) => void;", "onDeleteAd: (id: string) => void;\n  onRenewAd: (id: string) => void;")
myads = myads.replace("onDeleteAd, lang }) => {", "onDeleteAd, onRenewAd, lang }) => {")

myads = myads.replace(
    "import { X, Trash2, Package } from 'lucide-react';",
    "import { X, Trash2, Package, RefreshCw } from 'lucide-react';"
)

myads = myads.replace("const myAds = listings.filter(l => l.sellerId === user?.id);", """
  const myAds = listings.filter(l => l.sellerId === user?.id);
  const isExpired = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    return diff > 30 * 24 * 60 * 60 * 1000;
  };
""")

card_replacement = """                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 line-clamp-1">{ad.title}</h4>
                    <span className="font-bold text-amber-600 shrink-0 ml-2">
                      {ad.price.toLocaleString()} DZD
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        isExpired(ad.dateAdded) 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isExpired(ad.dateAdded) ? (lang === 'ar' ? 'منتهي الصلاحية' : 'Expiré') : (lang === 'ar' ? 'نشط' : 'Actif')}
                      </span>
                      <span className="text-slate-500">{ad.dateAdded}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {isExpired(ad.dateAdded) && (
                        <button 
                          onClick={() => onRenewAd(ad.id)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Renouveler"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteAd(ad.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>"""

# Remove the old card content inside the map
import re
myads = re.sub(
    r'<div className="flex justify-between items-start mb-2">.*?<button\s*onClick=\{\(\) => onDeleteAd\(ad.id\)\}\s*className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"\s*>\s*<Trash2 className="h-4 w-4" />\s*</button>\s*</div>\s*</div>',
    card_replacement,
    myads,
    flags=re.DOTALL
)

with open('src/components/modals/MyAdsModal.tsx', 'w', encoding='utf-8') as f:
    f.write(myads)


# 3. Update FeedView.tsx
with open('src/components/views/FeedView.tsx', 'r', encoding='utf-8') as f:
    feed = f.read()

# Filter out expired ads
feed = feed.replace(
    "let filteredListings = listings;",
    """let filteredListings = listings.filter(l => {
    const diff = Date.now() - new Date(l.dateAdded).getTime();
    return diff <= 30 * 24 * 60 * 60 * 1000;
  });"""
)

with open('src/components/views/FeedView.tsx', 'w', encoding='utf-8') as f:
    f.write(feed)

print("Renew functionality added successfully.")
