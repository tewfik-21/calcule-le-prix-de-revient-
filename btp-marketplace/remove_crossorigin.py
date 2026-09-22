with open('dist/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace(' crossorigin', '')

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
