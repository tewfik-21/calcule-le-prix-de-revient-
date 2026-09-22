import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
for i, line in enumerate(lines):
    if "01-" in line or "02-" in line or "03-" in line or "04-" in line:
        print(f"L{i}: {line.strip()}")
