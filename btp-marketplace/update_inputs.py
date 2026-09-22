import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'className="w-full p-2 border rounded-lg"',
    'className="w-full p-2 border rounded-lg text-gray-900 bg-white"'
)
content = content.replace(
    'className="w-full p-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"',
    'className="w-full p-2 border rounded-lg text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated inputs text color!")
