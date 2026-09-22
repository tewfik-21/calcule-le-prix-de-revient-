import re

with open('src/components/modals/PremiumModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update Mock Payment Info
content = content.replace(
    'ccp: "12345678 99"',
    'ccp: "6300038 Clé 57"'
)
content = content.replace(
    'rip: "007 99999 0012345678 99"',
    'rip: "007 99999 0006300038 57"'
)
content = content.replace(
    'name: "BTP Market DZ"',
    'name: "MR ZAHI TOUFIK"'
)

with open('src/components/modals/PremiumModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
