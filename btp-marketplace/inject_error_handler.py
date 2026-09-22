with open('dist/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

handler = """<head><script>
window.onerror = function(msg, url, line, col, error) { 
    console.error('JS_CRASH_LOG: ' + msg + ' at ' + line + ':' + col + '\\n' + (error && error.stack)); 
}; 
window.addEventListener('unhandledrejection', function(event) { 
    console.error('JS_PROMISE_CRASH: ' + event.reason); 
});
</script>"""

html = html.replace('<head>', handler)

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
