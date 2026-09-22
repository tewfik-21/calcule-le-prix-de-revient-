import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Store, Tag, LayoutDashboard, ShieldCheck, Star, Trash2, Megaphone, Upload, CheckCircle, CreditCard, ExternalLink, XCircle } from 'lucide-react';
import { uploadFileToSupabase } from '../../lib/upload';
import { fetchPaymentRequests, approvePaymentRequest, rejectPaymentRequest } from '../../lib/supabaseQueries';

interface AdminViewProps {
  t: any;
  lang: 'fr' | 'ar';
}

export const AdminView: React.FC<AdminViewProps> = ({ t, lang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'stores' | 'banners' | 'payments'>('overview');
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Banner upload states
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerSponsor, setBannerSponsor] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerPosition, setBannerPosition] = useState('feed_inline');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Users
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profiles) setUsers(profiles);

      // Fetch Listings
      const { data: ads } = await supabase.from('listings').select('*').order('date_added', { ascending: false });
      if (ads) setListings(ads);

      // Fetch Stores
      const { data: shops } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
      if (shops) setStores(shops);

      // Fetch Banners
      const { data: adsBanners } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (adsBanners) setBanners(adsBanners);

      // Fetch Payments
      const paymentReqs = await fetchPaymentRequests();
      setPayments(paymentReqs);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleVerifyUser = async (id: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', id);
    fetchAdminData();
  };
  
  const handleUpgradeUser = async (id: string, field: 'is_premium' | 'is_vip', currentStatus: boolean) => {
    let updateData = {};
    if (field === 'is_premium') {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + (currentStatus ? -1 : 12)); // 1 year if true, expired if false
      updateData = { premium_until: currentStatus ? null : expirationDate.toISOString() };
    } else {
      updateData = { is_vip: !currentStatus };
    }
    await supabase.from('profiles').update(updateData).eq('id', id);
    fetchAdminData();
  };


  // Payment Actions
  const handleApprovePayment = async (id: string, userId: string, plan: 'premium' | 'vip', durationMonths: number) => {
    if(window.confirm('Confirmer et activer le plan ?')) {
      await approvePaymentRequest(id, userId, plan, durationMonths);
      fetchAdminData();
    }
  };

  const handleRejectPayment = async (id: string) => {
    if(window.confirm('Rejeter ce reçu ?')) {
      await rejectPaymentRequest(id);
      fetchAdminData();
    }
  };

  // Banner Actions
  const handleUploadBanner = async () => {
    if (!bannerFile || !bannerSponsor) return alert('Veuillez fournir une image et un nom de sponsor.');
    setUploadingBanner(true);
    try {
      const url = await uploadFileToSupabase(bannerFile, 'banners');
      if (url) {
        await supabase.from('banners').insert({
          sponsor_name: bannerSponsor,
          image_url: url,
          link_url: bannerLink || null,
          position: bannerPosition
        });
        alert('Bannière ajoutée avec succès!');
        setBannerFile(null);
        setBannerSponsor('');
        setBannerLink('');
        fetchAdminData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if(window.confirm('Voulez-vous vraiment supprimer cette bannière ?')) {
      await supabase.from('banners').delete().eq('id', id);
      fetchAdminData();
    }
  };

  const handleDeleteListing = async (id: string) => {
    if(window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) {
      await supabase.from('listings').delete().eq('id', id);
      fetchAdminData();
    }
  };

  const handleVerifyStore = async (id: string, currentStatus: boolean) => {
    await supabase.from('stores').update({ is_verified: !currentStatus }).eq('id', id);
    fetchAdminData();
  };


  if (loading) return <div className="p-8 text-center text-slate-400">Chargement des données...</div>;

  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-20">
      <div className="mb-6">
        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" /> Panneau d'Administration
        </h2>
        <p className="text-xs text-slate-400">Gérez votre plateforme, les utilisateurs et les publicités</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Aperçu' },
          { id: 'users', icon: Users, label: 'Utilisateurs' },
          { id: 'listings', icon: Tag, label: 'Annonces' },
          { id: 'stores', icon: Store, label: 'Boutiques' },
          { id: 'banners', icon: Megaphone, label: 'Publicités' },
          { id: 'payments', icon: CreditCard, label: 'Paiements' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Utilisateurs</h3>
            <p className="text-3xl font-black text-white">{users.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Annonces</h3>
            <p className="text-3xl font-black text-orange-400">{listings.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Boutiques</h3>
            <p className="text-3xl font-black text-blue-400">{stores.length}</p>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Publicités Actives</h3>
            <p className="text-3xl font-black text-emerald-400">{banners.length}</p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Rôle</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-3">
                      <p className="font-bold text-white">{u.full_name || u.company_name || 'Utilisateur Anonyme'}</p>
                      <p className="text-[10px] text-slate-500">{u.phone || u.whatsapp || u.id.substring(0,8)}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold">{u.role}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {u.is_verified && <CheckCircle className="h-4 w-4 text-blue-400" title="Vérifié" />}
                        {u.is_premium && <Star className="h-4 w-4 text-orange-400" title="Premium" />}
                        {u.is_vip && <Star className="h-4 w-4 text-purple-400" title="VIP" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleVerifyUser(u.id, u.is_verified)} className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition text-[10px] font-bold">
                          {u.is_verified ? 'Retirer Badge' : 'Vérifier'}
                        </button>
                        <button onClick={() => handleUpgradeUser(u.id, 'is_premium', u.is_premium)} className="px-2 py-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white rounded transition text-[10px] font-bold">
                          {u.is_premium ? '- Premium' : '+ Premium'}
                        </button>
                        <button onClick={() => handleUpgradeUser(u.id, 'is_vip', u.is_vip)} className="px-2 py-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white rounded transition text-[10px] font-bold">
                          {u.is_vip ? '- VIP' : '+ VIP'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Plan Demandé</th>
                <th className="p-3">Reçu</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {payments.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-3">
                    <p className="font-bold text-white">{p.profiles?.full_name || p.profiles?.company_name || 'Utilisateur Anonyme'}</p>
                    <p className="text-[10px] text-slate-500">{p.profiles?.phone || p.profiles?.whatsapp || p.user_id.substring(0,8)}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded w-fit text-[10px] font-bold uppercase tracking-widest ${
                        p.requested_plan === 'vip' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.requested_plan}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.duration_months === 14 ? 'Annuel (14 mois)' : 'Mensuel (1 mois)'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <a href={p.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                      Voir Reçu <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="p-3">
                    {p.status === 'pending' && <span className="text-orange-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> En attente</span>}
                    {p.status === 'approved' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approuvé</span>}
                    {p.status === 'rejected' && <span className="text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejeté</span>}
                  </td>
                  <td className="p-3">
                    {p.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprovePayment(p.id, p.user_id, p.requested_plan, p.duration_months)} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded transition text-[10px] font-bold">
                          Approuver
                        </button>
                        <button onClick={() => handleRejectPayment(p.id)} className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition text-[10px] font-bold">
                          Rejeter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Aucune demande de paiement trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-500" /> Ajouter une Publicité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Nom du Sponsor / Campagne</label>
                <input type="text" value={bannerSponsor} onChange={e => setBannerSponsor(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="Ex: Toyota Algérie" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Lien (URL)</label>
                <input type="text" value={bannerLink} onChange={e => setBannerLink(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Position</label>
                <select value={bannerPosition} onChange={e => setBannerPosition(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white">
                  <option value="feed_inline">Entre les annonces (Feed)</option>
                  <option value="hero">En haut de page (Hero)</option>
                  <option value="sidebar">Barre latérale (Sidebar)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Image (Bannière)</label>
                <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition cursor-pointer" />
              </div>
            </div>
            <button onClick={handleUploadBanner} disabled={uploadingBanner} className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-[10px] font-black uppercase py-3 rounded-xl transition">
              {uploadingBanner ? 'Publication...' : 'Publier la publicité'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b => (
              <div key={b.id} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden relative group">
                <img src={b.image_url} alt={b.sponsor_name} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-white text-sm">{b.sponsor_name}</h4>
                  <p className="text-[10px] text-slate-400 mb-2">Position: {b.position}</p>
                  {b.link_url && <a href={b.link_url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs hover:underline">Visiter le lien</a>}
                </div>
                <button onClick={() => handleDeleteBanner(b.id)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                <th className="p-3">Boutique</th>
                <th className="p-3">Propriétaire</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {stores.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-3 font-bold text-white">{s.name}</td>
                  <td className="p-3 text-slate-400">{s.owner_id.substring(0,8)}</td>
                  <td className="p-3">
                    {s.is_verified ? <span className="text-blue-400 font-bold flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Vérifié</span> : <span className="text-slate-500">En attente</span>}
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleVerifyStore(s.id, s.is_verified)} className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition text-[10px] font-bold">
                      {s.is_verified ? 'Révoquer' : 'Vérifier'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                <th className="p-3">Titre</th>
                <th className="p-3">Prix</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300">
              {listings.map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-3 font-bold text-white">{l.title}</td>
                  <td className="p-3 font-black text-orange-400">{l.price} DZD</td>
                  <td className="p-3">
                    <button onClick={() => handleDeleteListing(l.id)} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
