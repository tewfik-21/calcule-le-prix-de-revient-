import os

app_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Make sure updateMyListing is imported
if "updateMyListing" not in app_content:
    app_content = app_content.replace(
        "deleteMyListing } from './lib/supabaseQueries';",
        "deleteMyListing, updateMyListing } from './lib/supabaseQueries';"
    )

old_submit = """          onSubmit={async (listing) => {
            if (editingListing) {
              // Note: the component handles update internally or passes it up
              // We'll update the listings state locally
              setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...listing } : l));
              setEditingListing(null);
            } else {
              handlePostAd(listing);
            }
          }}"""

new_submit = """          onSubmit={async (listing) => {
            if (editingListing) {
              try {
                if (user) {
                  const { id, created_at, views, likes, ...updates } = listing as any;
                  await updateMyListing(editingListing.id, user.id, updates);
                  setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...updates } : l));
                  alert(lang === 'ar' ? 'تم تحديث الإعلان بنجاح' : 'Annonce mise à jour avec succès');
                }
              } catch (error) {
                console.error('Error updating listing', error);
                alert(lang === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Erreur lors de la mise à jour');
              }
              setShowAddModal(false);
              setEditingListing(null);
            } else {
              handlePostAd(listing);
            }
          }}"""

app_content = app_content.replace(old_submit, new_submit)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Fixed App.tsx onSubmit for editing!")
