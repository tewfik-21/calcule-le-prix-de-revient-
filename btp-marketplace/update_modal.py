import os

modal_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\modals\AddAdModal.tsx'

with open(modal_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update props interface
old_props = """  t: any;
  lang: 'fr' | 'ar';
}"""

new_props = """  t: any;
  lang: 'fr' | 'ar';
  editingListing?: any;
}"""
content = content.replace(old_props, new_props)

# 2. Update component signature
old_sig = "export const AddAdModal: React.FC<AddAdModalProps> = ({ user, onClose, onSubmit, t, lang }) => {"
new_sig = "export const AddAdModal: React.FC<AddAdModalProps> = ({ user, onClose, onSubmit, t, lang, editingListing }) => {"
content = content.replace(old_sig, new_sig)

# 3. Add useEffect to populate data
effect = """
  useEffect(() => {
    if (editingListing) {
      setTitle(editingListing.title || '');
      setCategory(editingListing.category || 'mines_carrieres');
      setSubcat(editingListing.subcategory || '');
      setBrand(editingListing.brand || '');
      setModel(editingListing.model || '');
      setYear(editingListing.year?.toString() || '');
      setHours(editingListing.hours?.toString() || '');
      setPrice(editingListing.price?.toString() || '');
      setDescription(editingListing.description || '');
      setLocation(editingListing.location || '');
      setWilaya(editingListing.wilaya || '');
      if (editingListing.images) {
        setImages(editingListing.images);
      }
      if (editingListing.contact_name) setContactName(editingListing.contact_name);
      if (editingListing.contact_phone) setContactPhone(editingListing.contact_phone);
      if (editingListing.contact_email) setContactEmail(editingListing.contact_email);
      setStoreId(editingListing.store_id || null);
    }
  }, [editingListing]);
"""

# Insert effect after some state definitions
old_state = "const [category, setCategory] = useState<CategoryType>('mines_carrieres');"
new_state = old_state + "\n" + effect
content = content.replace(old_state, new_state)

with open(modal_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AddAdModal.tsx!")
