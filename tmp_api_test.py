import requests, json

# Confirm the CLMS NDVI collection returns real usable data
col = 'clms_ndvi_global_300m_10daily_v3_cog'
url = f'https://catalogue.dataspace.copernicus.eu/stac/collections/{col}/items?limit=1'
r = requests.get(url, timeout=10)
data = r.json()
f = data['features'][0]
props = f.get('properties', {})
print('All properties:')
print(json.dumps(props, indent=2))
print('\nAssets:')
for k, v in f.get('assets', {}).items():
    print(f'  {k}: {v.get("href","?")}')
print('\nGeometry:', json.dumps(f.get('geometry',{}))[:200])
print('\nID:', f.get('id'))
print('\nDatetime range:', props.get('datetime'), '->', props.get('end_datetime'))
