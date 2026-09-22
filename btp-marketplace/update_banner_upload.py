import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add supabase import
if "import { supabase }" not in content:
    content = content.replace(
        "import { fetchAllUsersAdmin",
        "import { supabase } from '../lib/supabase';\nimport { fetchAllUsersAdmin"
    )

# 2. Add banner file state
if "bannerFile" not in content:
    content = content.replace(
        "const [newBanner, setNewBanner] = useState",
        "const [bannerFile, setBannerFile] = useState<File | null>(null);\n  const [newBanner, setNewBanner] = useState"
    )

# 3. Update handleAddBanner
old_add_banner = """
    const handleAddBanner = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBanner.sponsor_name || !newBanner.image_url) return;
      await insertBannerAdmin(newBanner.sponsor_name, newBanner.image_url, newBanner.link_url, newBanner.position);
      setNewBanner({ sponsor_name: '', image_url: '', link_url: '', position: 'feed_inline' });
      loadData();
    };
"""

new_add_banner = """
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
"""
content = content.replace(old_add_banner.strip(), new_add_banner.strip())

# 4. Update the input field
old_input = """<input required type="url" value={newBanner.image_url} onChange={e => setNewBanner({...newBanner, image_url: e.target.value})} className="w-full p-2 border rounded-lg" />"""

new_input = """<div className="flex gap-2">
                          <input type="file" accept="image/*" onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setBannerFile(e.target.files[0]);
                            }
                          }} className="w-full p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                          {!bannerFile && <input type="url" placeholder="Ou coller URL..." value={newBanner.image_url} onChange={e => setNewBanner({...newBanner, image_url: e.target.value})} className="w-full p-2 border rounded-lg" />}
                        </div>
                        {uploadingBanner && <p className="text-xs text-blue-500 mt-1">Téléchargement en cours...</p>}"""
content = content.replace(old_input.strip(), new_input.strip())

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated banner upload logic!")
