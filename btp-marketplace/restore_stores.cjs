const fs = require('fs');

let stores = fs.readFileSync('src/components/views/StoresView.tsx', 'utf-8');

// Remove `stores: Store[];` from interface
stores = stores.replace('stores: Store[];\n', '');

// Restore the fetching logic and component signature
stores = stores.replace(/export const StoresView: React\.FC<StoresViewProps> = \(\{[\s\S]*?\}\) => \{/, 
`import { supabase } from '../../lib/supabaseClient';

export const StoresView: React.FC<StoresViewProps> = ({ mobileView, setActiveView, setSelectedStore, t, onAddStoreClick }) => {
  const [stores, setStores] = React.useState<Store[]>([]);
  React.useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'enterprise');

      if (!error && data) {
        const mappedStores = data.map((p: any) => ({
          id: p.id,
          name: p.company_name || 'Boutique',
          type: 'distributeur',
          categories: ['btp'] as any,
          wilaya: 'Alger',
          isVerified: p.is_verified,
          isPremium: false,
          description: "Distributeur officiel d'équipements et services.",
          rating: 5.0,
          joinedDate: new Date(p.created_at).getFullYear().toString(),
          bannerUrl: 'https://images.unsplash.com/photo-1541888081622-1d547f48039d?auto=format&fit=crop&q=80&w=1200',
          phone: p.phone || '',
          whatsapp: p.whatsapp || ''
        }));
        setStores(mappedStores);
      }
    };

    fetchStores();
  }, []);`);

fs.writeFileSync('src/components/views/StoresView.tsx', stores);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
const modalsJSX = `
      {showAddJobModal && (
        <AddJobModal user={user} onClose={() => setShowAddJobModal(false)} onSubmit={handlePostJob} t={t} lang={lang} />
      )}
      {showAddAuctionModal && (
        <AddAuctionModal user={user} onClose={() => setShowAddAuctionModal(false)} onSubmit={handlePostAuction} t={t} lang={lang} />
      )}
      {showAddStoreModal && (
        <AddStoreModal user={user} onClose={() => setShowAddStoreModal(false)} onSubmit={handlePostStore} t={t} lang={lang} />
      )}`;
if (!app.includes('<AddJobModal')) {
    const splitPoint = app.lastIndexOf('</div>\n    </div>\n  );\n};');
    if (splitPoint !== -1) {
        app = app.slice(0, splitPoint) + modalsJSX + '\n' + app.slice(splitPoint);
    }
}

// Fix unused handlers in App.tsx
if (app.includes('const handlePostJob')) {
  // If we really use them in modalsJSX, they won't be unused anymore.
  // Wait, if tsc complains they are unused, they must NOT be in the JSX.
  // That means my JSX insertion failed earlier. Let's make sure it succeeds!
}
fs.writeFileSync('src/App.tsx', app);

// AuctionsView.tsx button fix
let auctions = fs.readFileSync('src/components/views/AuctionsView.tsx', 'utf-8');
auctions = auctions.replace(/<button[^>]*>\s*<Plus[^>]*>\s*<span>\{t\('post_auction'\)\}/, '<button onClick={onAddAuctionClick} className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center gap-1.5">\n            <Plus className="h-3 w-3" />\n            <span>{t(\'post_auction\')}');
fs.writeFileSync('src/components/views/AuctionsView.tsx', auctions);
