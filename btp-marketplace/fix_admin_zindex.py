import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the outer div class to be fixed over everything
old_class = 'className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden"'
new_class = 'className="fixed inset-0 z-[9999] flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden"'

content = content.replace(old_class, new_class)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed AdminPanel z-index!")
