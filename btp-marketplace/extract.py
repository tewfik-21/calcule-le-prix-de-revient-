import json

log_path = r'C:\Users\BEDRI KHAOULA\.gemini\antigravity\brain\73b09413-e760-49ad-beba-d14250095f0c\.system_generated\logs\transcript_full.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and 'App.tsx' in str(data) and 'const translations =' in str(data):
                content = data.get('content', '')
                if 'Marché' in content or 'السوق' in content:  # Looking for non-corrupted strings
                    print('FOUND NON-CORRUPTED TRANSLATIONS')
                    with open('extracted_app.tsx', 'w', encoding='utf-8') as out:
                        out.write(content)
                    print('Saved to extracted_app.tsx')
                    break
        except json.JSONDecodeError:
            pass
