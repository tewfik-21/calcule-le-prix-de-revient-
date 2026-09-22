import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\mockData.ts'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    import re
    cat_matches = re.findall(r"name: '[^']+'", content)
    for m in cat_matches:
        if "01-" in m or "02-" in m:
            print(f"Found category in mockData.ts: {m}")
