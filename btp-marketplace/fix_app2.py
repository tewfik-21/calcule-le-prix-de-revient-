import os
import sys
import re

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# I will just replace the icons in the Filter category list using a regex replacement.
# Look for `{ value: 'mines_carrieres', label: `01- ${t('mines_carrieres')}`, icon: <span>...</span> }`
# and replace the `<span>...</span>` part entirely with the correct emoji.

replacements = {
    "mines_carrieres": "⛏️",
    "ceramique_briqueterie": "🧱",
    "btp": "🏗️",
    "outillage": "🛠️",
    "pieces": "⚙️",
    "electricite": "⚡",
    "plomberie": "🛁",
    "peinture": "🎨",
    "transport": "🚚"
}

for key, emoji in replacements.items():
    # Replace the span contents for each category
    pattern = r"(value:\s*'" + key + r"',\s*label:\s*`[0-9]{2}-\s*\$\{t\('" + key + r"'\)\}`,\s*icon:\s*<span>)[^<]+(</span>)"
    content = re.sub(pattern, r"\g<1>" + emoji + r"\g<2>", content)
    
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Emojis fixed.")
