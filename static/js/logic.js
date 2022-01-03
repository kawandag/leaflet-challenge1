//--------Building Maps-----------------//



//create the tile layers for the background of the map (use leaflet provider demo)

var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

var USGS_USImageryTopo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

// making a basemap
let basemap = {
    Satellite: defaultMap,
    GrayScale: CartoDB_Positron,
    Topology: USGS_USImageryTopo,
    Terrain: Stamen_Terrain
    
};

//map object
//an object allows you to map a key to a value of any type.
var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [defaultMap, CartoDB_Positron, USGS_USImageryTopo, Stamen_Terrain] //toggle and map style
});


// adding default to myMap
defaultMap.addTo(myMap);  //Adds a new Handler to the given map with the given name.




//-----------------Mapping Data---------------------------//
//get data
//plot all of the earthquakes from your data set based on their longitude and latitude.
//data markers should reflect the magnitude of the earthquake by their size and and depth of the earthquake by color. 
//Earthquakes with higher magnitudes should appear larger and earthquakes with greater depth should appear darker in color.


//-----Data Set 1------------//
//variable for earthquakes
let earthquakes = new L.layerGroup();

//get data and add layer group
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    function(quakeData){

    console.log(quakeData);
    //grab lat and long


        //function to choose color of data point --use rgb color picker
        function colorWheel(depth){
            if (depth > 90)
                return "red";
            else if(depth >  70)
                return "#eb6b34";
            else if (depth > 50)
                return "#eb9234";
            else if(depth > 30)
                return "#ebb134";
            else if(depth > 10)
                return "#cceb34";
            else
                return "#40eb34";
        }

        //radius size
        function radiusSize(mag){
            if (mag == 0) 
                return 1; //this includes mags size of 0 and plots on map
            else 
                return mag * 2.5; 
        }
        // sytles for data points
        function pointStyle(feature)
        {
            return {
                opacity: 1, 
                fillOpacity: 1, 
                fillColor: colorWheel(feature.geometry.coordinates[2]), //index 2 is where depth is shown
                color: "black",
                radius: radiusSize(feature.properties.mag), //need the magnitude
                weight: 0.5
                
            }
        }

        //GeoJson data--map it
        L.geoJson(quakeData, {
            //add marker to map (circle)
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            style: pointStyle, //calls the point style function
            //popups
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><b>
                                Depth: <b>${feature.geometry.coordinates[2]}</b><b>
                                Location: <b>${feature.properties.place}</b>`);
            }



        }).addTo(earthquakes);
    }
   
);

//---------Data Set 2---------------//
//variable for tectonic plates
let tectonicplates = new L.layerGroup();


// call api to get info
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
    //console.log(plateData);

    //take plate data and call it using geoJson
    //L.geoJson parse GeoJSON data and display it on the map
    L.geoJson(plateData, {
        color: "blue",
        weight: 2

    }).addTo(tectonicplates);
});

earthquakes.addTo(myMap);

tectonicplates.addTo(myMap);

//overlays
let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
};
// add Layer control
L.control //a base class for implementing map controls.
    .layers(basemap, overlays)
    .addTo(myMap);

//add legend
var legend = L.control({position: 'bottomright'});

//properties for legend
legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");

    //setup intervals/divide it up (like 'slicing')
    var dataRange =[-10, 10, 30, 50, 70, 90];
    //set the colors
    let colors = ["#40eb34", "#cceb34", "#ebb134", "#eb9234", "#eb6b34", "red"];

    //To add field and colour in legend on map, a for loop has written
    for (var i = 0; i < dataRange.length; i++)
    {
        div.innerHTML += "<i style='background: "
            + colors[i] 
            + "'></i> " 
            + dataRange[i] 
            + (dataRange[i + 1] ? '-&nbsp;</i>&nbsp;&nbsp;' + dataRange[i + 1] + "km<br>" : "+");
    }
        return div;
        
};
legend.addTo(myMap);


