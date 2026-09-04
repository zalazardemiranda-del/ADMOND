import re
import os

def minify_js(source_code):
    # Remove single line comments
    code = re.sub(r'(?<!:)\/\/#.*?(?=\n|$)', '', source_code)
    code = re.sub(r'(?<!:)\/\/\s.*?(?=\n|$)', '', code)
    # Remove multi line comments
    code = re.sub(r'\/\*[\s\S]*?\*\/', '', code)
    # Remove extra whitespaces & newlines
    lines = [line.strip() for line in code.splitlines() if line.strip()]
    return "\n".join(lines)

def process_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    minified = minify_js(content)
    output_path = file_path.replace('.js', '.min.js')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(minified)
    
    orig_size = len(content.encode('utf-8'))
    min_size = len(minified.encode('utf-8'))
    print(f"OK: {os.path.basename(file_path)}: {orig_size} bytes -> {min_size} bytes ({output_path})")

if __name__ == "__main__":
    print("[Rodipack] Comprimiendo y protegiendo codigo JavaScript...")
    process_file("app.js")
    process_file("supabase_config.js")
