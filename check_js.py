import json

# Check JSON parsing of data
with open('consecutivo_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f"consecutivo_data.json is valid with {len(data)} items")

with open('consecutivo_data.js', 'r', encoding='utf-8') as f:
    js = f.read()
print(f"consecutivo_data.js size: {len(js)} bytes")

with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()
print(f"app.js size: {len(app_js)} bytes")

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()
print(f"index.html size: {len(index_html)} bytes")
print("ficha-btn-consecutivo in index.html:", 'ficha-btn-consecutivo' in index_html)
print("admin-subpane-consecutivo in index.html:", 'admin-subpane-consecutivo' in index_html)
print("consecutivo_data.js in index.html:", 'consecutivo_data.js' in index_html)













