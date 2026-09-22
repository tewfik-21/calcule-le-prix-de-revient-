import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "mines_carrieres" in line:
        print(f"L{i}: {repr(line)}")
