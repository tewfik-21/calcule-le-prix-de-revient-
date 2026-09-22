import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="w-full p-2 border rounded-lg bg-white"',
    'className="w-full p-2 border rounded-lg bg-white text-gray-900"'
)

content = content.replace(
    'className="border rounded px-2 py-1 bg-white"',
    'className="border rounded px-2 py-1 bg-white text-gray-900"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated select text color!")
