import json
with open('/home/ersin/Masaüstü/PROJELERIM/uBlock-master/AAEBlocker/js/aae-unified-omnicore-512.json', 'r') as f:
    data = json.load(f)
    
if "aiConfig" in data:
    data = data["aiConfig"]

print("Keys:", data.keys())
for key in data.keys():
    if isinstance(data[key], list):
        print(f"{key} shape: {len(data[key])} x {len(data[key][0]) if len(data[key]) > 0 and isinstance(data[key][0], list) else 'scalar'}")
