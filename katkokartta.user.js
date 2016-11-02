// ==UserScript==
// @name        Kätkösivun kartta
// @namespace   fi.geokatkot
// @description Lisää MML-kartan Geocaching.com-kätkösivulle.
// @include     *.geocaching.com/geocache/*
// @require 	  https://www.geocaching.com/static/js/leaflet/0.7.2/leaflet.js
// @downloadURL https://github.com/geokatkot/katkokartta/raw/master/katkokartta.user.js
// @updateURL   https://github.com/geokatkot/katkokartta/raw/master/katkokartta.meta.js
// @version     1.0
// @grant       none
// ==/UserScript==

var country = document.getElementById('ctl00_ContentBody_Location').innerHTML;

if (country.indexOf('Finland') === -1 && country.indexOf('Aland Islands') === -1) {
    return;
}

document.getElementsByClassName("CDMapWidget")[0].style.display = 'none';

var mapDiv = document.createElement("div");
mapDiv.id = "geokatkotMap";
mapDiv.style.width = "670px";
mapDiv.style.height = "400px";
mapDiv.style.margin = "20px 0px 20px 0px";

var bottomSection = document.getElementById('ctl00_ContentBody_bottomSection');

bottomSection.insertBefore(mapDiv, bottomSection.firstChild);

var mapLarge = L.map('geokatkotMap', {
        center: [mapLatLng.lat, mapLatLng.lng],
        zoom: 14,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: false,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false
    })
    .addControl(new L.Control.Attribution())
    .addControl(new L.Control.Scale());

var kapsiMmlLayer = new L.TileLayer('http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18
});

var kapsiMmlTaustaLayer = new L.TileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18
});

var kapsiMmlOrtoLayer = new L.TileLayer('http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg', {
    attribution: 'Kartta: Maanmittauslaitos',
    maxZoom: 18
});

addInternalMapTileLayer(mapLarge, function(defaultOsmLayer) {

    var baseMaps = {
        "Peruskartta": kapsiMmlLayer,
        "Taustakartta": kapsiMmlTaustaLayer,
        "Ilmakuva": kapsiMmlOrtoLayer,
        "OpenStreetMap": defaultOsmLayer
    };

    var layersControl = new L.Control.Layers(baseMaps);

    mapLarge.addControl(layersControl);


    if (cmapAdditionalWaypoints != null && cmapAdditionalWaypoints.length > 0) {
        var mapBounds = L.latLngBounds([mapLatLng.lat, mapLatLng.lng], [mapLatLng.lat, mapLatLng.lng]);

        for (var index = 0; index < cmapAdditionalWaypoints.length; index++) {

            var waypoint = cmapAdditionalWaypoints[index];
            var waypointLocation = [waypoint.lat, waypoint.lng];

            L.marker(waypointLocation, {
                icon: L.icon({
                    iconUrl: '/images/wpttypes/pins/' + waypoint.type + '.png',
                    iconSize: [20, 23],
                    iconAnchor: [10, 23]
                }),
                title: waypoint.name,
                clickable: false
            }).addTo(mapLarge);

            mapBounds.extend(waypointLocation);
        }

        window.setTimeout(function() {
            mapLarge.fitBounds(mapBounds.pad(.5));
        }, 100);
    }


    L.marker([mapLatLng.lat, mapLatLng.lng], {
        icon: L.icon({
            iconUrl: '/images/wpttypes/pins/' + mapLatLng.type + '.png',
            iconSize: [20, 23],
            iconAnchor: [10, 23]
        }),
        clickable: false,
        title: mapLatLng.name
    }).addTo(mapLarge);

    mapLarge.removeLayer(defaultOsmLayer);
    mapLarge.addLayer(kapsiMmlLayer);
});
