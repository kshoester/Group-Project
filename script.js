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
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: 'ca',
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

/*--------------------------------------------------------------------
DATA
--------------------------------------------------------------------*/
map.on('load', () => {

    // tdsb schools
    map.addSource('tdsb-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/tdsb-locations.geojson' //update
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

    // pedestrian collisions at intersections
    map.addSource('pedcyc-collisions', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/motor-vehicle-collisions.geojson' //update
    });
    map.addLayer({
        'id': 'ped-inter-collisions',
        'type':'circle',
        'source': 'pedcyc-collisions',
        'paint': {
            'circle-radius': 2,
            'circle-color': 'red'
        },
        'filter': ['all',    
            ['==', ['get', 'IMPACTYPE'], 'Pedestrian Collisions'],
            ['==', ['get', 'LOCCOORD'], 'Intersection']], 
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
            ['==', ['get', 'SCH_NAME'], tdsbvalue] // returns polygon with PRENAME value that matches dropdown selection
        );
    }

});









/*--------------------------------------------------------------------
LEGEND
--------------------------------------------------------------------*/