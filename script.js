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

// let directions = new MapboxDirections({
//     accessToken: mapboxgl.accessToken,
//     unit: 'metric',
// });
// map.addControl(directions, 'top-right');

/*--------------------------------------------------------------------
GEOJSON POINT DATA
--------------------------------------------------------------------*/
let collisionsgeojson;
let TDSBSchoolsData;

fetch('https://raw.githubusercontent.com/kshoester/group-project/main/data/motor-vehicle-collisions.geojson') //update
    .then(response => response.json())
    .then(response => {
        console.log(response);
        collisionsgeojson = response;
    });

fetch('https://raw.githubusercontent.com/kshoester/Group-Project/main/data/tdsb-locations.geojson') //update
    .then(response => response.json())
    .then(response => {
        console.log(response);
        TDSBSchoolsData = response;
    });
/*--------------------------------------------------------------------
DATA VISUALIZATION
--------------------------------------------------------------------*/
map.on('load', () => {
    // neighbourhood crime rates --> 2019 bike thefts
    map.addSource('crime-rates-data', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/group-project/main/data/neighbourhood-crime-rates.geojson' // Update link if necessary
    });
    // map.addLayer({
    //     'id': 'crime-rates',
    //     'type': 'fill',
    //     'source': 'crime-rates-data',
    //     'paint': {
    //         'fill-color': [
    //             'interpolate',
    //             ['linear'],
    //             ['get', 'BIKETHEFT_2019'],
    //             0, '#FFF7EC',
    //             36, '#FEE1BA',
    //             72, '#FDC38D',
    //             108, '#FC8D59',
    //             144, '#E7533A',
    //             180, '#BF100A',
    //             216, '#7F0000'
    //         ],
    //         'fill-opacity': 0.5,
    //         'fill-outline-color': 'black'
    //     },
    // });

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

    // tdsb schools
    map.addSource('tdsb-data', {
        type: 'geojson',
        data: TDSBSchoolsData
    });
    map.addLayer({
        'id': 'tdsb-schools',
        'type': 'circle',
        'source': 'tdsb-data',
        'paint': {
            'circle-radius': [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 1,
                15, 10
            ],
            'circle-color': 'blue'
        },
    });

    // tdsb highlight layer
    map.addLayer({
        'id': 'tdsb-highlight',
        'type': 'circle',
        'source': 'tdsb-data',
        'paint': {
            'circle-radius': [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 1,
                15, 10
            ],
            'circle-color': '#FFFF00'
        },
        'filter': ['in', ['get', 'SCH_NAME'], '']
    });

    // pedestrian collisions (2019)
    map.addSource('pedcyc-collisions-data', {
        type: 'geojson',
        data: collisionsgeojson
    });
    map.addLayer({
        'id': 'ped-collisions',
        'type': 'circle',
        'source': 'pedcyc-collisions-data',
        'paint': {
            'circle-radius': [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 1,
                15, 10
            ],
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
            'circle-radius': [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 1,
                15, 10
            ],
            'circle-color': 'purple'
        },
        'filter': ['all',
            ['==', ['get', 'IMPACTYPE'], 'Cyclist Collisions'],
            ['==', ['get', 'YEAR'], 2019]],
    });

    // Ease of Active Transit Index (EoATI)
    map.addSource('EoATIndexData', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/kshoester/Group-Project/main/data/EoATIndex.geojson'
    });
    
    map.addLayer({
        'id': 'crime-rates',
        'type': 'fill',
        'source': 'EoATIndexData',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'BIKETHEFT_2019'],
                0, '#FFF7EC',
                36, '#FEE1BA',
                72, '#FDC38D',
                108, '#FC8D59',
                144, '#E7533A',
                180, '#BF100A',
                216, '#7F0000'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        },
    });

    document.getElementById('opacity-slider').addEventListener('input', function (e) {
        let layerOpacity = e.target.value;
        map.setPaintProperty('crime-rates', 'fill-opacity', parseFloat(layerOpacity));
    });
});


/*--------------------------------------------------------------------
INTERACTIVITY EVENTS
--------------------------------------------------------------------*/
// dropdown selection of schools
// let tdsbvalue;

// document.getElementById("tdsbfieldset").addEventListener('change',(e) => {   
//     tdsbvalue = document.getElementById('school').value;

//     console.log(tdsbvalue); 

//     if (tdsbvalue == 'All') {
//         map.setFilter(
//             'tdsb-schools',
//             ['has', '_id'] 
//         );
//     } else {
//         map.setFilter(
//             'tdsb-schools',
//             ['==', ['get', 'SCH_NAME'], tdsbvalue] 
//         );
//     }

// });

// dropdown selection of schools by municipality
let munivalue;

document.getElementById("munifieldset").addEventListener('change', (e) => {
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
LAYER TOGGLES
--------------------------------------------------------------------*/
document.getElementById('deselectHoods').addEventListener('click', function () {
    map.setPaintProperty('crime-rates', 'fill-color', [
        'interpolate',
        ['linear'],
        ['get', 'BIKETHEFT_2019'],
        0, '#FFF7EC',
        36, '#FEE1BA',
        72, '#FDC38D',
        108, '#FC8D59',
        144, '#E7533A',
        180, '#BF100A',
        216, '#7F0000'
    ], 'fill-opacity', 1, 'fill-outline-color', 'black');
    map.setFilter('tdsb-highlight', ['==', ['get', 'SCH_NAME'], '']);

    let popups = document.getElementsByClassName('mapboxgl-popup');
    if (popups.length) {
        for (let i = popups.length - 1; i >= 0; i--) {
            popups[i].remove();
        }
    }
    console.clear();
});



/*--------------------------------------------------------------------
GIS ANALYSIS - Ease of Active Transportation Index
    INPUT:  
    OUTPUT: 
    GOAL:   
--------------------------------------------------------------------*/



/*--------------------------------------------------------------------
GIS ANALYSIS - Schools Inside of a given Census Tract
    INPUT:  User clicks on a census tract (ex: where the target school
            is located).
    OUTPUT: User is generated a list of all the schools in said census
            tract.
    GOAL:   Show which schools are affected by a given census tract of
            the 'Ease of Active Transportation Index'. The 'Nearest
            Bikeshare Station' will allow the user to input their 
            address to recognize easily where either A) their school
            is or B) where their home is or C) where landmarks or 
            reference points are.
    LIMITS: Census tract boundaries are, to some extent, arbitrary and
            do not take into account the ways of life or just being on
            the edge of a tract. Additionally, see the limits to the 
            'Ease of Active Transit Index'.
--------------------------------------------------------------------*/

map.on('click', 'crime-rates', function (e) {
    let selectedCT = e.features[0];
    let hoodID = e.features[0].properties._id;

    map.setPaintProperty('crime-rates', 'fill-color', [
        'match', ['get', '_id'], hoodID, '#f00', '#fff'
    ]);

    let schoolsInCT = [];
    TDSBSchoolsData.features.forEach(school => {
        if (turf.booleanPointInPolygon(turf.point(school.geometry.coordinates[0]), selectedCT)) {
            schoolsInCT.push(school.properties.SCH_NAME || school.properties.PLACE_NAME);
        }
    });
    console.log("Schools within the selected census tract:", schoolsInCT.join(", "));

    if (schoolsInCT.length > 0) {
        let filter = ['match', ['get', 'SCH_NAME'], schoolsInCT, true, false];
        map.setFilter('tdsb-highlight', filter);
    } else {
        map.setFilter('tdsb-highlight', ['==', ['get', 'SCH_NAME'], '']);
    }

    let popupContent = `<strong>Census Tract:</strong> ${selectedCT.properties.AREA_NAME}
        <br><strong>Bike Thefts (2019):</strong> ${selectedCT.properties.BIKETHEFT_2019}
        <br><strong>Schools:</strong> ${schoolsInCT.join(', ')}`;
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map);
});


/*--------------------------------------------------------------------
GIS ANALYSIS - Nearest Bikeshare Station
    INPUT:  User inputs desired address (ex: home or school)
    OUTPUT: User receives the nearest Toronto bikeshare station to 
            the specified location. 
    GOAL:   Increased awareness and usage of bikeshare program.
    LIMITS: There are many areas in the city without any convinient
            bikeshare coverage, notably North York, Etobicoke, and 
            Scarborough.
--------------------------------------------------------------------*/

//Geocoder for user to input address. 
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//NOTE: From here to comment ***** will be placed in the above sections for fetching / adding layers. It is here for programming ease.
//Fetch bike share stations GeoJSON from GitHub folder. Converted from JSON (See Python script).
let bikeShareStations;
fetch('https://raw.githubusercontent.com/kshoester/Group-Project/Alex/stations.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response);
        bikeShareStations = response;
    });

//Bike share stations layer. Larger as you zoom into the map (vice versa).
map.on('load', function () {
    map.addSource('bikeShareStationsData', {
        type: 'geojson',
        data: bikeShareStations
    });
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
//*****

//Popup variables to default at null.
let nearestStationMarker = null;
let nearestStationPopup = null;

//Use the Turf.js nearest point function in conjunction with the MapBox geocoder.
geocoder.on('result', function (ev) {
    let queryResult = ev.result.geometry;
    let nearestBikeStation = turf.nearestPoint(queryResult, bikeShareStations);
    let stationName = nearestBikeStation.properties.name;
    let stationCapacity = nearestBikeStation.properties.capacity;

    //Remove the markers / popups when the user changes the geocode address.
    if (nearestStationMarker) nearestStationMarker.remove();
    if (nearestStationPopup) nearestStationPopup.remove();

    //Variables for popup. In depth comments further down.
    nearestStationMarker = new mapboxgl.Marker()
        .setLngLat(nearestBikeStation.geometry.coordinates)
        .addTo(map);
    nearestStationPopup = new mapboxgl.Popup({
        closeButton: false
    })
        .setHTML('<h4>Nearest bikeshare station: </h4><p>' + stationName + '</p>' + '<h4>Bikeshare station capacity: </h4><p>' + stationCapacity + '</p>')

    //Zoom map to nearest bike station on address input
    map.flyTo({
        center: nearestBikeStation.geometry.coordinates,
        zoom: 14
    });
});

//Popup window for the nearest bike station. Made it so that if the user clicks within a 40m range the popup will appear.
//Easier to use, especially when zoomed out or on a trackpad. Popup closes when A) a new address is inputed or B) user clicks anywhere else on the map.
map.on('click', function (e) {
    if (!nearestStationMarker) return;
    let clickPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);//Where user clicked
    let stationPoint = turf.point(nearestStationMarker.getLngLat().toArray());//Where the nearest station is Lat/Lon
    let stationClickRegion = turf.distance(clickPoint, stationPoint, { units: 'meters' });//Clickable region for station

    //40m range. Can be adjusted easily for larger / smaller ranges. 
    if (stationClickRegion <= 40) {
        if (!nearestStationPopup.isOpen()) {
            nearestStationPopup.setLngLat(nearestStationMarker.getLngLat()).addTo(map);
        }
    } else {
        // If the click is outside the 40m range, remove the marker and popup
        if (nearestStationMarker) nearestStationMarker.remove();
        if (nearestStationPopup) nearestStationPopup.remove();

        // After removing, set them to null to indicate they're not currently displayed
        nearestStationMarker = null;
        nearestStationPopup = null;
    }
});

document.getElementById('bikeCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'bike-paths',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

document.getElementById('pedCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'ped-collisions',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

document.getElementById('cycCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'cyc-collisions',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

document.getElementById('shareCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'bikeShareStations',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

document.getElementById('indexCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'crime-rates',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

document.getElementById('schoolCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'tdsb-schools',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

document.getElementById('schoolCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'tdsb-highlight',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});
