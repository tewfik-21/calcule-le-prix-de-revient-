import os
import re

admin_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(admin_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "fetchBannersAdmin, updateUserRoleAdmin, verifyStoreAdmin, deleteListingAdmin, deleteUserAdmin, insertBannerAdmin, deleteBannerAdmin",
    "fetchBannersAdmin, updateUserRoleAdmin, verifyStoreAdmin, deleteListingAdmin, deleteUserAdmin, deleteStoreAdmin, insertBannerAdmin, deleteBannerAdmin"
)

# 2. Add handleDeleteStore and handleDeleteUser functions
delete_functions = """
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
"""
content = content.replace("  const [uploadingBanner, setUploadingBanner] = useState(false);", delete_functions + "\n  const [uploadingBanner, setUploadingBanner] = useState(false);")

# 3. Add actions to Users table
# Find <th>Date</th> and add <th>Action</th>
content = content.replace(
    '<th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>',
    '<th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>\n                          <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>'
)

# Add delete button to Users table row
content = content.replace(
    """                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                          </tr>""",
    """                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Supprimer">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>"""
)

# 4. Add delete button to Stores table row
# We already have <th Action> in stores table.
# Replace the stores Action cell
old_store_action = """                            <td className="px-6 py-4 flex gap-4">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={s.is_verified} onChange={(e) => handleVerifyStore(s.id, e.target.checked, s.is_premium)} />
                                Vérifié
                              </label>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={s.is_premium} onChange={(e) => handleVerifyStore(s.id, s.is_verified, e.target.checked)} />
                                Premium
                              </label>
                            </td>"""

new_store_action = """                            <td className="px-6 py-4 flex items-center justify-between gap-4">
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
                            </td>"""
content = content.replace(old_store_action, new_store_action)

with open(admin_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Admin panel updated successfully!")
