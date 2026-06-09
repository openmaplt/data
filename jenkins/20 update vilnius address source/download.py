import json
import requests

base_url = "https://atviras.vplanas.lt/arcgis/rest/services/mapA4/Adresai_gatves/MapServer/1/query"

session = requests.Session()

# 1. Get total count
count_params = {"where": "1=1", "returnCountOnly": "true", "f": "json"}
count_response = session.get(base_url, params=count_params)
total_count = count_response.json()["count"]
print(f"Total records to fetch: {total_count}")

# 2. Define the exact fields we want to request
requested_fields = ["OBJECTID", "GYV_PAV", "PAV", "NAMO_NR", "NAMO_R", "KORPUSO_NR"]

params = {
    "where": "1=1",
    "outFields": ",".join(requested_fields),
    "f": "geojson",
    "returnGeometry": "true",
    "resultRecordCount": 1000,
}

total_saved = 0

# 3. Open the file once and append each feature line-by-line
with open("vilnius_addr.ndjson", "w", encoding="utf-8") as f:
    for offset in range(0, total_count, 1000):
        print(f"Fetching and saving offset {offset}...")
        params["resultOffset"] = offset

        response = session.get(base_url, params=params)
        data = response.json()

        if "features" in data:
            for feature in data["features"]:
                # Clean and lowercase properties
                props = feature.get("properties", {})
                feature["properties"] = {
                    field.lower(): props.get(field) for field in requested_fields
                }

                # Write the feature as a single line, followed by a newline character
                f.write(json.dumps(feature, ensure_ascii=False) + "\n")
                total_saved += 1

print(f"Successfully saved {total_saved} features line-by-line to 'vilnius_addr_cleaned.ndjson'")
