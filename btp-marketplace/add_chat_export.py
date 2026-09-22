import re

with open('src/components/views/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if 'ChatView' not in content:
    content += "export { ChatView } from './ChatView';\n"

with open('src/components/views/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)
