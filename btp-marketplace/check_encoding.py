import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the weird language switcher strings
import re
# Find the language array or switcher
matches = re.findall(r"\{ code: 'ar', label: '[^']+' \}", content)
for m in matches:
    print(f"Found in App.tsx: {m}")
    
# Find categories
cat_matches = re.findall(r"name: '[^']+'", content)
for m in cat_matches:
    if "01-" in m or "02-" in m:
        print(f"Found category in App.tsx: {m}")

