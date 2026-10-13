import os
import glob
import re
import json

files = glob.glob(r'C:\Users\maria\AppData\Local\BraveSoftware\Brave-Browser\User Data\Default\Local Storage\leveldb\*.ldb') + \
        glob.glob(r'C:\Users\maria\AppData\Local\BraveSoftware\Brave-Browser\User Data\Default\Local Storage\leveldb\*.log')

extracted = {}

for f in files:
    try:
        with open(f, 'rb') as fp:
            data = fp.read()
            # Find occurrences of rp_ keys
            for m in re.finditer(rb'rp_[a-zA-Z0-9_]+', data):
                k = m.group(0).decode('ascii')
                start = m.start()
                
                # Check utf-16le or utf-8/latin1 following the key
                # Chromium LevelDB format:
                # Key: _https://admond.rodilaw.com\x00\x01rp_key
                # Value: \x01 followed by UTF-16LE, OR \x00 followed by latin1/utf-8
                
                # Let's search around start for valid json
                for offset in range(len(k), min(len(k) + 60, len(data) - start)):
                    # Check UTF-8 [ or {
                    if data[start + offset:start + offset + 1] in (b'[', b'{'):
                        val_start = start + offset
                        for end in range(val_start + 5, min(val_start + 1000000, len(data))):
                            if data[end:end+1] in (b']', b'}'):
                                cand = data[val_start:end+1]
                                try:
                                    parsed = json.loads(cand.decode('utf-8'))
                                    if k not in extracted or len(cand) > len(extracted[k]['raw']):
                                        extracted[k] = {'file': os.path.basename(f), 'parsed': parsed, 'raw': cand}
                                except:
                                    pass
                    # Check UTF-16LE [ or {
                    elif data[start + offset:start + offset + 2] in (b'[\x00', b'{\x00'):
                        val_start = start + offset
                        for end in range(val_start + 10, min(val_start + 2000000, len(data)), 2):
                            if data[end:end+2] in (b']\x00', b'}\x00'):
                                cand = data[val_start:end+2]
                                try:
                                    parsed = json.loads(cand.decode('utf-16le'))
                                    if k not in extracted or len(cand) > len(extracted[k]['raw']):
                                        extracted[k] = {'file': os.path.basename(f), 'parsed': parsed, 'raw': cand}
                                except:
                                    pass
    except Exception as e:
        print(f"Error reading {f}: {e}")

print(f"Total extracted keys: {len(extracted)}")
for k, v in extracted.items():
    print(f"Key: {k} | File: {v['file']} | Type: {type(v['parsed']).__name__} | Size: {len(v['raw'])} bytes")

# Save extracted backup to json
out_path = r'C:\Users\maria\OneDrive\Documentos\CENTRAL\backup_recovered.json'
with open(out_path, 'w', encoding='utf-8') as out:
    json.dump({k: v['parsed'] for k, v in extracted.items()}, out, indent=2, ensure_ascii=False)
print(f"Saved recovered backup to {out_path}")
