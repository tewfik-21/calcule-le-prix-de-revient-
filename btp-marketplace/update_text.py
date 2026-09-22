import os

app_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Change "Mon Stock" to "Mes Annonces" for clarity
old_button_text = '<span className="hidden sm:inline">Mon Stock</span>'
new_button_text = '<span className="hidden sm:inline">{lang === \'ar\' ? \'إعلاناتي\' : \'Mes Annonces\'}</span>'
content = content.replace(old_button_text, new_button_text)

old_title_text = 'title="Gestion de Stock"'
new_title_text = 'title={lang === \'ar\' ? \'إعلاناتي / مخزوني\' : \'Mes Annonces / Mon Stock\'}'
content = content.replace(old_title_text, new_title_text)

# Change the big header in inventory view
old_header = '<h2 className="text-lg font-black text-white uppercase tracking-widest">Gestion de Stock</h2>'
new_header = '<h2 className="text-lg font-black text-white uppercase tracking-widest">{lang === \'ar\' ? \'إعلاناتي / إدارة المخزون\' : \'Mes Annonces / Gestion de Stock\'}</h2>'
content = content.replace(old_header, new_header)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated text for my ads!")
