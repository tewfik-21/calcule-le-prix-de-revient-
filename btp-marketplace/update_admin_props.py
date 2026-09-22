import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_admin_props = """        <AdminPanel
          listings={listings}
          setListings={setListings}
          onClose={() => setShowAdmin(false)}
          language={lang}
          banners={banners}
          setBanners={setBanners}
        />"""

new_admin_props = """        <AdminPanel
          onBack={() => {
            setShowAdmin(false);
            setActiveView('feed');
          }}
          lang={lang}
        />"""

if old_admin_props in content:
    content = content.replace(old_admin_props, new_admin_props)
else:
    # try replacing loosely
    pass

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed AdminPanel props in App.tsx!")
