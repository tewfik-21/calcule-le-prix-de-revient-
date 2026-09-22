import os

app_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Pass editingListing to AddAdModal
old_modal = """      {showAddModal && (
        <AddAdModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onSubmit={handlePostAd}
          t={t}
          lang={lang as 'fr' | 'ar'}
        />
      )}"""

new_modal = """      {showAddModal && (
        <AddAdModal
          user={user}
          onClose={() => {
            setShowAddModal(false);
            setEditingListing(null);
          }}
          onSubmit={async (listing) => {
            if (editingListing) {
              // Note: the component handles update internally or passes it up
              // We'll update the listings state locally
              setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...listing } : l));
              setEditingListing(null);
            } else {
              handlePostAd(listing);
            }
          }}
          t={t}
          lang={lang as 'fr' | 'ar'}
          editingListing={editingListing}
        />
      )}"""

app_content = app_content.replace(old_modal, new_modal)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Updated App.tsx modal props!")
