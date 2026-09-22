import os
import sys

# Change standard output encoding
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
    
import re
# Find all occurrences of 01- to 09- and print them
matches = re.findall(r"label:\s*`?[^,]+`?,", content)
for m in matches:
    if "0" in m or "1" in m:
        print(repr(m))
        
matches2 = re.findall(r"\{ code: 'ar', label: '[^']+' \}", content)
for m in matches2:
    print(repr(m))

