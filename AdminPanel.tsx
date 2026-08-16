import React, { useState, useEffect } from 'react';
import { Users, Store, Package, Image as ImageIcon, LayoutDashboard, Shield, CheckCircle, XCircle, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { fetchAllUsersAdmin, fetchStores, fetchListings, fetchBannersAdmin, updateUserRoleAdmin, verifyStoreAdmin, deleteListingAdmin, deleteUserAdmin, deleteStoreAdmin, insertBannerAdmin, deleteBannerAdmin, fetchPaymentRequests, approvePaymentRequest, rejectPaymentRequest } from '../lib/supabaseQueries';

type AdminTab = 'dashboard' | 'users' | 'stores' | 'listings' | 'banners' | 'payments';

const AdminPanel: React.FC<{ onBack: () => void, lang: 'fr' | 'en' | 'ar' }> = ({ onBack, lang }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [newBanner, setNewBanner] = useState({ sponsor_name: '', image_url: '', link_url: '', position: 'feed_inline' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, s, l, b, p] = await Promise.all([
        fetchAllUsersAdmin(),
        fetchStores(),
        fetchListings(),
        fetchBannersAdmin(),
        fetchPaymentRequests()
      ]);
      setUsers(u || []);
      setStores(s || []);
      setListings(l || []);
      setBanners(b || []);
      setPayments(p || []);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyStore = async (id: string, isVerified: boolean, isPremium: boolean) => {
    if (confirm('Voulez-vous modifier le statut de ce magasin ?')) {
      await verifyStoreAdmin(id, isVerified, isPremium);
      loadData();
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      await deleteListingAdmin(id);
      loadData();
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    if (confirm(`Changer le rôle en ${newRole} ?`)) {
      await updateUserRoleAdmin(id, newRole);
      loadData();
    }
  };


  const handleDeleteUser = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await deleteUserAdmin(id);
      loadData();
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المتجر؟' : 'Êtes-vous sûr de vouloir supprimer ce magasin ?')) {
      await deleteStoreAdmin(id);
      loadData();
    }
  };

  const [storeCategoryFilter, setStoreCategoryFilter] = useState("all");

  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.sponsor_name) return;
    
    let imageUrl = newBanner.image_url;
    if (bannerFile) {
      setUploadingBanner(true);
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `banner_${Math.random()}.${fileExt}`;
      const filePath = `admin/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('stores').upload(filePath, bannerFile);
      
      if (!uploadError) {
        const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
      setUploadingBanner(false);
    }
    
    if (!imageUrl) return;
    
    await insertBannerAdmin(newBanner.sponsor_name, imageUrl, newBanner.link_url, newBanner.position);
    setNewBanner({ sponsor_name: '', image_url: '', link_url: '', position: 'feed_inline' });
    setBannerFile(null);
    loadData();
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Supprimer cette bannière ?')) {
      await deleteBannerAdmin(id);
      loadData();
    }
  };

  const t = {
    title: lang === 'ar' ? 'لوحة تحكم المسؤول' : lang === 'fr' ? 'Panneau d\'Administration' : 'Admin Panel',
    dashboard: lang === 'ar' ? 'نظرة عامة' : lang === 'fr' ? 'Tableau de bord' : 'Dashboard',
    users: lang === 'ar' ? 'المستخدمين' : lang === 'fr' ? 'Utilisateurs' : 'Users',
    stores: lang === 'ar' ? 'المتاجر' : lang === 'fr' ? 'Vitrines' : 'Stores',
    listings: lang === 'ar' ? 'الإعلانات' : lang === 'fr' ? 'Annonces' : 'Listings',
    banners: lang === 'ar' ? 'اللافتات' : lang === 'fr' ? 'Bannières' : 'Banners',
    payments: lang === 'ar' ? 'طلبات الدفع' : lang === 'fr' ? 'Paiements' : 'Payments',
    totalUsers: lang === 'ar' ? 'إجمالي المستخدمين' : lang === 'fr' ? 'Total Utilisateurs' : 'Total Users',
    totalStores: lang === 'ar' ? 'إجمالي المتاجر' : lang === 'fr' ? 'Total Vitrines' : 'Total Stores',
    totalListings: lang === 'ar' ? 'إجمالي الإعلانات' : lang === 'fr' ? 'Total Annonces' : 'Total Listings',
  };

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold">{t.title}</h1>
          </div>
          <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
            { id: 'users', label: t.users, icon: Users },
            { id: 'stores', label: t.stores, icon: Store },
            { id: 'listings', label: t.listings, icon: Package },
            { id: 'banners', label: t.banners, icon: ImageIcon },
            { id: 'payments', label: t.payments, icon: CreditCard },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            <span>{lang === 'ar' ? 'العودة' : 'Retour'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">{t.dashboard}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{t.totalUsers}</p>
                      <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <Store className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{t.totalStores}</p>
                      <p className="text-3xl font-bold text-gray-900">{stores.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <Package className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{t.totalListings}</p>
                      <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">{t.users}</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nom / Name</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Téléphone</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rôle</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{u.full_name || 'Anonyme'}</td>
                            <td className="px-6 py-4 text-gray-600">{u.phone}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={u.role} 
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                              >
                                <option value="buyer">Acheteur</option>
                                <option value="seller">Vendeur</option>
                                <option value="enterprise">Entreprise</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Supprimer">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Stores */}
            {activeTab === 'stores' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{t.stores}</h2>
                  <select
                    value={storeCategoryFilter}
                    onChange={(e) => setStoreCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes les activités</option>
                    <option value="mines_carrieres">Mines & Carrières</option>
                    <option value="pieces_detachees">Pièces Détachées</option>
                    <option value="services_btp">Services BTP</option>
                    <option value="locations_engins">Locations d'Engins</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Magasin</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Wilaya</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stores.filter(s => storeCategoryFilter === "all" || (s.categories && s.categories.includes(storeCategoryFilter))).map(s => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {s.logo_url ? <img src={s.logo_url} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-gray-200" />}
                                <span className="font-medium">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{s.wilaya}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {s.is_verified ? <CheckCircle className="text-green-500 w-5 h-5" title="Vérifié" /> : <XCircle className="text-gray-300 w-5 h-5" />}
                                {s.is_premium && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">PRO</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 flex items-center justify-between gap-4">
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input type="checkbox" checked={s.is_verified} onChange={(e) => handleVerifyStore(s.id, e.target.checked, s.is_premium)} />
                                  Vérifié
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input type="checkbox" checked={s.is_premium} onChange={(e) => handleVerifyStore(s.id, s.is_verified, e.target.checked)} />
                                  Premium
                                </label>
                              </div>
                              <button onClick={() => handleDeleteStore(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Supprimer">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Listings */}
            {activeTab === 'listings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">{t.listings}</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Titre</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Catégorie</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Prix</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {listings.map(l => (
                          <tr key={l.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{l.title}</td>
                            <td className="px-6 py-4 text-gray-600">{l.category}</td>
                            <td className="px-6 py-4 font-bold">{l.price}</td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleDeleteListing(l.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Banners */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">{t.banners}</h2>
                <form onSubmit={handleAddBanner} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                  <h3 className="font-semibold text-lg">Ajouter une bannière Sponsor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Sponsor</label>
                      <input required type="text" value={newBanner.sponsor_name} onChange={e => setNewBanner({...newBanner, sponsor_name: e.target.value})} className="w-full p-2 border rounded-lg text-gray-900 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                      <div className="flex gap-2">
                          <input type="file" accept="image/*" onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setBannerFile(e.target.files[0]);
                            }
                          }} className="w-full p-2 border rounded-lg text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                          {!bannerFile && <input type="url" placeholder="Ou coller URL..." value={newBanner.image_url} onChange={e => setNewBanner({...newBanner, image_url: e.target.value})} className="w-full p-2 border rounded-lg text-gray-900 bg-white" />}
                        </div>
                        {uploadingBanner && <p className="text-xs text-blue-500 mt-1">Téléchargement en cours...</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lien de redirection</label>
                      <input type="url" value={newBanner.link_url} onChange={e => setNewBanner({...newBanner, link_url: e.target.value})} className="w-full p-2 border rounded-lg text-gray-900 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <select value={newBanner.position} onChange={e => setNewBanner({...newBanner, position: e.target.value})} className="w-full p-2 border rounded-lg bg-white text-gray-900">
                        <option value="feed_inline">Dans le Feed</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="top">Haut de page</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">Ajouter</button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banners.map(b => (
                    <div key={b.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                      <img src={b.image_url} alt={b.sponsor_name} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <h4 className="font-bold mb-1">{b.sponsor_name}</h4>
                        <button onClick={() => handleDeleteBanner(b.id)} className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2">
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">{t.payments}</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID Utilisateur</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Plan Demandé</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Reçu</th>
                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.length === 0 && (
                          <tr><td colSpan={5} className="p-4 text-center text-gray-500">Aucune demande</td></tr>
                        )}
                        {payments.map(req => (
                          <tr key={req.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-xs text-gray-600">{req.user_id}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.requested_plan === 'vip' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {req.requested_plan}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <a href={req.receipt_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                                <ImageIcon className="w-4 h-4"/> Voir le reçu
                              </a>
                            </td>
                            <td className="px-6 py-4">
                              {req.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button onClick={async () => {
                                    if(confirm('Accepter ce paiement ?')) {
                                      await approvePaymentRequest(req.id, req.user_id, req.requested_plan);
                                      loadData();
                                    }
                                  }} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"><CheckCircle className="w-4 h-4"/></button>
                                  <button onClick={async () => {
                                    if(confirm('Refuser ce paiement ?')) {
                                      await rejectPaymentRequest(req.id);
                                      loadData();
                                    }
                                  }} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><XCircle className="w-4 h-4"/></button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPanel;
