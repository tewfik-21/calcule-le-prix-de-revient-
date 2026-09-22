import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace setActiveView('admin') with setShowAdmin(true)
content = content.replace("setActiveView('admin');", "setShowAdmin(true);")

# Also, if we check activeView === 'admin' for styling, it might be better to check showAdmin
content = content.replace("activeView === 'admin'", "showAdmin")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed routing for Admin Panel!")

