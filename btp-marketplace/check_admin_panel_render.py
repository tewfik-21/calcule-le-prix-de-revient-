import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Print the first few lines of the component rendering
start_index = content.find('return (')
if start_index != -1:
    print(content[start_index:start_index+500])
else:
    print("No return statement found")
