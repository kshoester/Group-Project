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
let TDSBSchoolsData;
let bikeShareStations;

fetch('https://raw.githubusercontent.com/kshoester/Group-Project/Alex/stations.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response);
        bikeShareStations = response;
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
    //Ease of Active Transit Index
    map.addLayer({
        'id': 'EoATIndex',
        'type': 'fill',
        'source': {
            'type': 'vector',
            'url': 'mapbox://altaylor37.1d0tv2v1'
            },
        'source-layer': 'EoATIndex-b99mhm',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'Index'],
                0, '#CA0020',
                2957.08, '#F4A582',
                3589.27, '#F7F7F7',
                4303.43, '#92C5DE',
                5685.18, '#0571B0'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        } 
    });
    //Population Density
    map.addLayer({
        'id': 'PopDens',
        'type': 'fill',
        'source': {
            'type': 'vector',
            'url': 'mapbox://altaylor37.1d0tv2v1'
            },
        'source-layer': 'EoATIndex-b99mhm',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'PopDens'],
                0, '#CA0020',
                3349.58, '#F4A582',
                4682.60, '#F7F7F7',
                6811.60, '#92C5DE',
                9154.89, '#0571B0'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        },
        layout: {
            'visibility': 'none'
        }
    });
    //Collision Density
    map.addLayer({
        'id': 'CollDens',
        'type': 'fill',
        'source': {
            'type': 'vector',
            'url': 'mapbox://altaylor37.1d0tv2v1'
            },
        'source-layer': 'EoATIndex-b99mhm',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'CollDens'],
                0, '#CA0020',
                1.04, '#F4A582',
                3.18, '#F7F7F7',
                7.42, '#92C5DE',
                11.23, '#0571B0'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        },
        layout: {
            'visibility': 'none'
        }
    });
    //Sidewalk Density
    map.addLayer({
        'id': 'SideDens',
        'type': 'fill',
        'source': {
            'type': 'vector',
            'url': 'mapbox://altaylor37.1d0tv2v1'
            },
        'source-layer': 'EoATIndex-b99mhm',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'SideDens'],
                0, '#CA0020',
                12412.05, '#F4A582',
                15129.25, '#F7F7F7',
                18816.18, '#92C5DE',
                23994.48, '#0571B0'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        },
        layout: {
            'visibility': 'none'
        }
    });
    //Max Speed Limit
    map.addLayer({
        'id': 'MaxSpd',
        'type': 'fill',
        'source': {
            'type': 'vector',
            'url': 'mapbox://altaylor37.1d0tv2v1'
            },
        'source-layer': 'EoATIndex-b99mhm',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'MaxSpd'],
                0, '#CA0020',
                10, '#F4A582',
                40, '#F7F7F7',
                50, '#92C5DE',
                60, '#0571B0'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        },
        layout: {
            'visibility': 'none'
        }
    });
    //Bike Theft Rate 
    map.addLayer({
        'id': 'BikeTheft',
        'type': 'fill',
        'source': {
            'type': 'vector',
            'url': 'mapbox://altaylor37.1d0tv2v1'
            },
        'source-layer': 'EoATIndex-b99mhm',
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'BIKETHE50'],
                0, '#CA0020',
                13, '#F4A582',
                31, '#F7F7F7',
                61, '#92C5DE',
                108, '#0571B0'
            ],
            'fill-opacity': 0.5,
            'fill-outline-color': 'black'
        },
        layout: {
            'visibility': 'none'
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
            layout: {
                'visibility': 'none'
            }
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
                'circle-color': 'black'
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
                'circle-color': 'grey'
            },
            layout: {
                'visibility': 'none'
            }
        });

    document.getElementById('opacity-slider').addEventListener('input', function (e) {
        let layerOpacity = e.target.value;
        map.setPaintProperty('EoATIndex', 'fill-opacity', parseFloat(layerOpacity));
    });

    var layers = ['PopDens', 'CollDens', 'SideDens', 'MaxSpd', 'BikeTheft'];

    function changeLayer(visibleLayer) {//When the option gets selected in the dropdown menu, the layer is displayed.
    layers.forEach(function(layer) {
        var visibility = layer === visibleLayer ? 'visible' : 'none';
        map.setLayoutProperty(layer, 'visibility', visibility);
    });
    }
    //Change the state over time.
    document.getElementById('layerSelect').addEventListener('change', function(e) {
    changeLayer(e.target.value);
    });

    document.getElementById('deselectHoods').addEventListener('click', function () {
        map.setPaintProperty('EoATIndex', 'fill-color', [
            'interpolate',
            ['linear'],
            ['get', 'Index'],
            0, '#CA0020',
            2957.08, '#F4A582',
            3589.27, '#F7F7F7',
            4303.43, '#92C5DE',
            5685.18, '#0571B0'
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
});




/*--------------------------------------------------------------------
INTERACTIVITY EVENTS
--------------------------------------------------------------------*/
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

map.on('click', 'EoATIndex', function (e) {
    let selectedCT = e.features[0];
    let hoodID = e.features[0].properties._id1;

    map.setPaintProperty('EoATIndex', 'fill-color', [
        'match', ['get', '_id1'], hoodID, '#f00', '#fff'
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

    let popupContent = `<strong>Census Tract:</strong> ${selectedCT.properties.AREA_NA2}
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




/*--------------------------------------------------------------------
LAYER TOGGLES (CHECK BOXES)
--------------------------------------------------------------------*/
document.getElementById('bikeCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'bike-paths',
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

document.getElementById('indexCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'EoATIndex',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});