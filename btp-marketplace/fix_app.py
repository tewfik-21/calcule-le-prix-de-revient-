import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Arabic switcher
content = content.replace("Ø¹Ø±Ø¨ÙŠ", "عربي")
content = content.replace("Ø¹", "ع")

# Fix Categories in App.tsx
# Ã‚Â¸BÅ£Â¸ 01- MINES & CARRIÃˆRES -> 🏗️ 01- MINES & CARRIÈRES
content = content.replace("Ã‚Â¸BÅ£Â¸ 01- MINES & CARRIÃˆRES", "⛏️ 01- MINES & CARRIÈRES")
content = content.replace("Ã‚Â¸BÅ£Â¸", "⛏️")
content = content.replace("MINES & CARRIÃˆRES", "MINES & CARRIÈRES")
content = content.replace("mines_carriÃ¨res", "mines_carrieres")
content = content.replace("mines_carri\u00e8res", "mines_carrieres")

# ÐŸÂ§Â± 02- CÃ‰RAMIQUE & BRIQUETERIE -> 🧱 02- CÉRAMIQUE & BRIQUETERIE
content = content.replace("ÐŸÂ§Â± 02- CÃ‰RAMIQUE & BRIQUETERIE", "🧱 02- CÉRAMIQUE & BRIQUETERIE")
content = content.replace("ÐŸÂ§Â±", "🧱")
content = content.replace("CÃ‰RAMIQUE", "CÉRAMIQUE")
content = content.replace("cÃ©ramique", "ceramique")
content = content.replace("c\u00e9ramique", "ceramique")

# Ã°Å¸Ââ€”Ã¯Â¸Â 03- BTP & TRAVAUX PUBLICS -> 🏗️ 03- BTP & TRAVAUX PUBLICS
content = content.replace("Ã°Å¸Ââ€”Ã¯Â¸Â 03- BTP & TRAVAUX PUBLICS", "🏗️ 03- BTP & TRAVAUX PUBLICS")
content = content.replace("Ã°Å¸Ââ€”Ã¯Â¸Â", "🏗️")

# Ã°Å¸Â›Â 04- OUTILLAGES & EQUIPEMENTS -> 🛠️ 04- OUTILLAGES & EQUIPEMENTS
content = content.replace("Ã°Å¸Â›Â 04- OUTILLAGES & EQUIPEMENTS", "🛠️ 04- OUTILLAGES & EQUIPEMENTS")
content = content.replace("Ã°Å¸Â›Â", "🛠️")

# âš™ï¸ 05- PIÃˆCES & ACCESSOIRES -> ⚙️ 05- PIÈCES & ACCESSOIRES
content = content.replace("âš™ï¸ 05- PIÃˆCES & ACCESSOIRES", "⚙️ 05- PIÈCES & ACCESSOIRES")
content = content.replace("âš™ï¸", "⚙️")
content = content.replace("PIÃˆCES", "PIÈCES")

# Ã¢Å¡Â¡ 06- ELECTRICITÃ‰ & ECLAIRAGE -> ⚡ 06- ELECTRICITÉ & ECLAIRAGE
content = content.replace("Ã¢Å¡Â¡ 06- ELECTRICITÃ‰ & ECLAIRAGE", "⚡ 06- ELECTRICITÉ & ECLAIRAGE")
content = content.replace("Ã¢Å¡Â¡", "⚡")
content = content.replace("ELECTRICITÃ‰", "ELECTRICITÉ")

# Ã°Å¸â€ºÂ 07- PLOMBERIE & SANITAIRE -> 🛁 07- PLOMBERIE & SANITAIRE
content = content.replace("Ã°Å¸â€ºÂ 07- PLOMBERIE & SANITAIRE", "🛁 07- PLOMBERIE & SANITAIRE")
content = content.replace("Ã°Å¸â€ºÂ", "🛁")

# Ã°Å¸Å½Â¨ 08- PEINTURE & DÃ‰CORATION -> 🎨 08- PEINTURE & DÉCORATION
content = content.replace("Ã°Å¸Å½Â¨ 08- PEINTURE & DÃ‰CORATION", "🎨 08- PEINTURE & DÉCORATION")
content = content.replace("Ã°Å¸Å½Â¨", "🎨")
content = content.replace("DÃ‰CORATION", "DÉCORATION")

# Ã°Å¸Å¡Å¡ 09- TRANSPORT & LOGISTIQUE -> 🚚 09- TRANSPORT & LOGISTIQUE
content = content.replace("Ã°Å¸Å¡Å¡ 09- TRANSPORT & LOGISTIQUE", "🚚 09- TRANSPORT & LOGISTIQUE")
content = content.replace("Ã°Å¸Å¡Å¡", "🚚")

# â˜…
content = content.replace("â˜…", "★")
content = content.replace(">??", "⛏️")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Encoding issues fixed.")

