import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\AdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabaseClient';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed import!")
