// ==UserScript==
// @name        Geocaching.com karttasivun MML-kartat
// @namespace   fi.geokatkot
// @description Lisää MML-kartan Geocaching.com-karttasivulle.
// @include     *.geocaching.com/map/*
// @downloadURL https://github.com/geokatkot/katkokartta/raw/master/gccommml.user.js
// @updateURL   https://github.com/geokatkot/katkokartta/raw/master/gccommml.meta.js
// @version     1.0
// @grant       none
// ==/UserScript==

var mapLayers = [{
        id: 'mmlperus',
        name: 'MML Peruskartta',
        shortName: 'Perus',
        attribution: 'Kartta: Maanmittauslaitos',
        url: 'http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg',
        maxZoom: 18
    },
    {
        id: 'mmltausta',
        name: 'MML Taustakartta',
        shortName: 'Tausta',
        attribution: 'Kartta: Maanmittauslaitos',
        url: 'http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg',
        maxZoom: 18
    },
    {
        id: 'mmlorto',
        name: 'MML Ilmakuva',
        shortName: 'Ilma',
        attribution: 'Kartta: Maanmittauslaitos',
        url: 'http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg',
        maxZoom: 18
    }
];

function addLeafletLayers(leafletLayers) {
    mapLayers.forEach(function(layer) {
        var tileLayer = new L.TileLayer(layer.url, {
            id: layer.id,
            attribution: layer.attribution,
            maxZoom: layer.maxZoom
        });

        leafletLayers.addBaseLayer(tileLayer, layer.name);
    });

    $(".leaflet-control-layers").first().remove();
    leafletLayers.addTo(MapSettings.Map);
}

function addLeafletLayersWhenReady() {
    if (MapSettings.LeafletLayers === null) {
        window.setTimeout(addLeafletLayersWhenReady, 200);
        return;
    }

    addLeafletLayers(MapSettings.LeafletLayers);
}

function addGoogleLayers(map) {
    mapLayers.reverse().forEach(function(mapLayer) {
        var mapType = new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {

                var url = mapLayer.url;
                url = url.replace('{z}', zoom);
                url = url.replace('{x}', coord.x);
                url = url.replace('{y}', coord.y);

                return url;
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            alt: mapLayer.name,
            name: mapLayer.name,
            maxZoom: mapLayer.maxZoom,
            minZoom: 6
        });

        map.mapTypes.set(mapLayer.id, mapType);

        var container = document.createElement('div');
        container.style.marginTop = '10px';

        var mapTypeControl = document.createElement('div');
        mapTypeControl.className = "gm-style-mtc";
        mapTypeControl.style.backgroundColor = '#fff';
        mapTypeControl.style.boxShadow = '0px 1px 4px -1px rgba(0, 0, 0, 0.3)';
        mapTypeControl.style.cursor = 'pointer';
        mapTypeControl.style.padding = '8px';
        mapTypeControl.style.textAlign = 'center';

        container.appendChild(mapTypeControl);

        var mapTypeText = document.createElement('div');
        mapTypeText.style.color = 'rgb(25,25,25)';
        mapTypeText.style.fontFamily = 'Roboto,Arial,sans-serif';
        mapTypeText.style.fontSize = '11px';
        mapTypeText.style.paddingLeft = '5px';
        mapTypeText.style.paddingRight = '5px';
        mapTypeText.innerHTML = mapLayer.shortName;
        mapTypeControl.appendChild(mapTypeText);

        mapTypeControl.addEventListener('click', function() {
            map.setMapTypeId(mapLayer.id);
        });

        google.maps.event.addListener(map, 'maptypeid_changed', function() {
            mapTypeText.style.fontWeight = map.getMapTypeId() == mapLayer.id ? '500' : '100';
        });

        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(container);
    });
}

$(document).ready(function() {
    if (window.L) {
        addLeafletLayersWhenReady();
    } else if (window.google.maps) {
        addGoogleLayers(MapSettings.Map);
    }
});