import requests, json

base = 'https://cloudcarbon-amrita.azurewebsites.net'
print("=== Testing Live Azure Endpoints ===")

# Test 1: Health
r = requests.get(f'{base}/health', timeout=20)
print(f'[1] /health: {r.status_code}')
if r.status_code == 200:
    d = r.json()
    print(f'    version: {d.get("version")}')
    print(f'    events_logged: {d.get("events_logged")}')
    print(f'    integrations: {d.get("integrations")}')
else:
    print(f'    BODY: {r.text[:300]}')

# Test 2: Real satellite status
r2 = requests.get(f'{base}/api/satellite/status', timeout=25)
print(f'[2] /api/satellite/status: {r2.status_code}')
if r2.status_code == 200:
    d2 = r2.json()
    meta = d2.get('satellite_metadata', {})
    print(f'    source: {meta.get("source")}')
    print(f'    acquisition_date: {meta.get("acquisition_date")}')
    print(f'    api_status: {meta.get("api_status")}')
else:
    print(f'    BODY: {r2.text[:300]}')

# Test 3: Real activity feed from DB
r3 = requests.get(f'{base}/api/dashboard/activities', timeout=25)
print(f'[3] /api/dashboard/activities: {r3.status_code}')
if r3.status_code == 200:
    d3 = r3.json()
    events = d3.get('activities', [])
    print(f'    total_in_db: {d3.get("total_events_in_db")}')
    print(f'    data_source: {d3.get("data_source")}')
    if events:
        print(f'    latest event: {events[0]["message"][:70]}')
else:
    print(f'    BODY: {r3.text[:300]}')

print("=== Done ===")
