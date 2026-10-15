import re
import os
import json

def clean_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Eliminar cualquier campo "password": "..." o \"password\":\"...\"
    new_content = re.sub(r'\\\"password\\\":\\\"[^\\]*\\\",?', '', content)
    new_content = re.sub(r'\"password\":\s*\"[^\"]*\",?', '', new_content)
    # Limpiar posibles comas colgantes antes de }
    new_content = re.sub(r',(\s*\\\"\}|\s*\})', r'\1', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Limpio: {filepath}")
    else:
        print(f"Sin cambios: {filepath}")

clean_file("backup_data.js")
clean_file("www/backup_data.js")
