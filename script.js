/*--------------------------------------------------------------------
INITIALIZE MAP
--------------------------------------------------------------------*/
mapboxgl.accessToken = 'pk.eyJ1Ijoia3Nob2VzdGVyIiwiYSI6ImNsdG9jOXN3djBoMnYyaW1zYnRuZ3VkYzYifQ.Z976OphNTmOc_8gG7O6khQ';

const map = new mapboxgl.Map({ 
    container: 'map',
    style: 'mapbox://styles/kshoester/cltsd7k7400ct01qs61u02utn', // monochrome style with toronto CTs
    center: [-79.39, 43.66], 
    zoom: 12,
});

/*--------------------------------------------------------------------
MAP CONTROLS
--------------------------------------------------------------------*/
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
map.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: 'ca',
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

/*--------------------------------------------------------------------
GEOJSON POINT DATA
--------------------------------------------------------------------*/
let collisionsgeojson;

fetch('https://raw.githubusercontent.com/kshoester/group-project/main/data/motor-vehicle-collisions.geojson') //update
    .then(response => response.json())
    .then(response => {
        console.log(response);
        collisionsgeojson = response;
    });

/*--------------------------------------------------------------------
DATA VISUALIZATION
--------------------------------------------------------------------*/
map.on('load', () => {

    // bounding box for all collisions
    let collisionsbboxgeojson;

        let collisionsbbox = turf.envelope(collisionsgeojson);

        collisionsbboxgeojson = {
            'type': 'FeatureCollection',
            'features': [collisionsbbox]
        };

    map.addSource('collis-bbox', {
        type: 'geojson',
        data: collisionsbboxgeojson
    });
    map.addLayer({
        'id': 'collis-bbox-layer',
        'type': 'fill',
        'source': 'collis-bbox',
        'paint': {
            'fill-color': 'red',
            'fill-opacity': 0, //for now
            'fill-outline-color': 'black'
        }
    });

    // neighbourhood crime rates
    map.addSource('crime-rates-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/neighbourhood-crime-rates.geojson' //update link
    });
    map.addLayer({
        'id': 'crime-rates',
        'type': 'fill',
        'source': 'crime-rates-data',
        'paint': {
            'fill-color': 'yellow',
            'fill-opacity': 0.1,
            'fill-outline-color': 'black'
        }
    });

    // bike paths
    map.addSource('cycling-network-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/cycling-network.geojson' //update link
    });
    map.addLayer({
        'id': 'bike-paths',
        'type': 'line',
        'source': 'cycling-network-data',
        'paint': {
            'line-color': 'green',
            'line-width': 1
        },
    });

    // pedestrian network
   /* map.addSource('ped-network-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/pedestrian-network.geojson' //update link
    });
    map.addLayer({
        'id': 'ped-network',
        'type': 'line',
        'source': 'ped-network-data',
        'paint': {
            'line-color': 'yellow',
            'line-width': 1 
        },
    }); */

    // tdsb schools
    map.addSource('tdsb-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/tdsb-locations.geojson' //update link
    });
    map.addLayer({
        'id': 'tdsb-schools',
        'type': 'circle',
        'source': 'tdsb-data',
        'paint': {
            'circle-radius': 3,
            'circle-color': 'blue'
        },
    });

    // pedestrian collisions (2019)
    map.addSource('pedcyc-collisions-data', {
        type: 'geojson',
        data: collisionsgeojson
    });
    map.addLayer({
        'id': 'ped-collisions',
        'type':'circle',
        'source': 'pedcyc-collisions-data',
        'paint': {
            'circle-radius': 3,
            'circle-color': 'red'
        },
        'filter': ['all',    
            ['==', ['get', 'IMPACTYPE'], 'Pedestrian Collisions'],
            ['==', ['get', 'YEAR'], 2019]], 
    }); 

    // cyclist collisions (2019)
    map.addLayer({
        'id': 'cyc-collisions',
        'type': 'circle',
        'source': 'pedcyc-collisions-data',
        'paint': {
            'circle-radius': 3,
            'circle-color': 'purple'
        },
        'filter': ['all',
            ['==', ['get', 'IMPACTYPE'], 'Cyclist Collisions'],
            ['==', ['get', 'YEAR'], 2019]],
    });

});


/*--------------------------------------------------------------------
INTERACTIVITY EVENTS
--------------------------------------------------------------------*/
// dropdown selection of schools
let tdsbvalue;

document.getElementById("tdsbfieldset").addEventListener('change',(e) => {   
    tdsbvalue = document.getElementById('school').value;

    console.log(tdsbvalue); 

    if (tdsbvalue == 'All') {
        map.setFilter(
            'tdsb-schools',
            ['has', '_id'] 
        );
    } else {
        map.setFilter(
            'tdsb-schools',
            ['==', ['get', 'SCH_NAME'], tdsbvalue] 
        );
    }

});

// dropdown selection of schools by municipality
let munivalue;

document.getElementById("munifieldset").addEventListener('change',(e) => {   
    munivalue = document.getElementById('muni').value;

    console.log(munivalue); 

    if (munivalue == 'All') {
        map.setFilter(
            'tdsb-schools',
            ['has', '_id'] 
        );
    } else {
        map.setFilter(
            'tdsb-schools',
            ['==', ['get', 'MUNICIPALITY'], munivalue] 
        );
    }

});



// return to full extent
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.3832, 43.6532],
        zoom: 12,
        essential: true
    });
});







/*--------------------------------------------------------------------
LEGEND
--------------------------------------------------------------------*/




































































/*--------------------------------------------------------------------
GIS ANALYSIS - Ease of Active Transportation Index
--------------------------------------------------------------------*/



/*--------------------------------------------------------------------
GIS ANALYSIS - Schools Inside of a given Census Tract
--------------------------------------------------------------------*/



/*--------------------------------------------------------------------
GIS ANALYSIS - Nearest Bikeshare Station
--------------------------------------------------------------------*/

let bikeShareStations;
fetch('https://raw.githubusercontent.com/kshoester/Group-Project/Alex/stations.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response);
        bikeShareStations = response;
    });

map.on('load', function() {
    map.addSource('bikeShareStationsData', {
        type: 'geojson',
        data: bikeShareStations
    })
    map.addLayer({
        id: 'bikeShareStations',
        type: 'circle',
        source: 'bikeShareStationsData',
        paint: {
            'circle-radius': [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 1,
                15, 10
            ],
            'circle-color': 'black'
        }
    });
});