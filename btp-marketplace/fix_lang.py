import os

modal_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\modals\AuthModal.tsx'

with open(modal_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences of lang === 'ar' with t('login') !== 'Se Connecter'
content = content.replace("lang === 'ar'", "t('login') !== 'Se Connecter'")

with open(modal_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed lang reference in AuthModal!")
