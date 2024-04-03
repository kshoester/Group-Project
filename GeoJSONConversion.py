# IMPORTANT: The way that I set up this script means that you must do the following:
# 1. In the terminal, write 'pip install requests' or 'pip3 install requests' depending on your Python version. (Unless you have it installed)
# 2. The way the script is strucutred is that it will overwrite the file. It is saved in your LCOAL folder. GitHub Desktop should detect it.
#    Example: Mine is - "C:\Users\USERNAME\Documents\GitHub\Group-Project\stations.geojson"

import requests
import json

# Using the "station information" section within the JSON from this file: https://open.toronto.ca/dataset/bike-share-toronto/ 
url = 'https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information'
response = requests.get(url)
data = response.json()

# Convert to GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": []
}

for station in data['data']['stations']:
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [station['lon'], station['lat']]
        },
        "properties": station
    }
    geojson['features'].append(feature)

# Save / Print confirmation of GeoJSON
with open('stations.geojson', 'w') as f:
    json.dump(geojson, f, indent=2)
print("Saved as: 'stations.geojson'.")