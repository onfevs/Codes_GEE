https://code.earthengine.google.com/977cd38182442eefa582b7a7b59ceecb


// Centrar el mapa en el área de Cajicá
Map.centerObject(samana, 12); // Nivel de zoom: 12
Map.setOptions('SATELLITE'); // Establecer el fondo del mapa como satélite

// Cargar la colección de edificios (ver nota sobre actualizaciones más abajo)
var edificiosCollection = ee.FeatureCollection("GOOGLE/Research/open-buildings/v3/polygons");

// Filtrar edificios dentro de la geometría de Cajicá
var edificios = edificiosCollection.filterBounds(samana);

// Agregar el Shapefile de Cajicá al mapa en color azul
Map.addLayer(samana, {color: '0000FF', width: 2}, 'Límites de Cajicá');

// Filtrar edificios por niveles de confianza
var t_065_070 = edificios.filter('confidence >= 0.65 && confidence < 0.7');
var t_070_075 = edificios.filter('confidence >= 0.7 && confidence < 0.75');
var t_gte_075 = edificios.filter('confidence >= 0.75');

// Agregar las capas de edificios al mapa
Map.addLayer(t_065_070, {color: 'FF0000'}, 'Edificios con poca confianza [0.65; 0.7)');
Map.addLayer(t_070_075, {color: 'FFFF00'}, 'Edificios con moderada confianza [0.7; 0.75)');
Map.addLayer(t_gte_075, {color: '00FF00'}, 'Edificios con alta confianza >= 0.75');

// Agregar columna con la categoría de confianza
var categorizada = edificios.map(function(feature) {
    var confianza = ee.Number(feature.get('confidence'));
    var categoria = ee.Algorithms.If(
        confianza.gte(0.75), 'alta',
        ee.Algorithms.If(
            confianza.gte(0.7).and(confianza.lt(0.75)), 'moderada',
            ee.Algorithms.If(
                confianza.gte(0.65).and(confianza.lt(0.7)), 'baja', 'desconocida'
            )
        )
    );
    return feature.set('categoria', categoria);
});

// Agregar columnas de latitud y longitud
var edificiosConCoordenadas = categorizada.map(function(feature) {
    var coords = feature.geometry().centroid().coordinates();
    var latitud = ee.Number(coords.get(1)).toFloat();
    var longitud = ee.Number(coords.get(0)).toFloat();
    return feature.set('latitud', latitud).set('longitud', longitud);
});

// Exportar los datos a GeoJSON
Export.table.toDrive({
    collection: edificiosConCoordenadas,
    description: 'edificios_samana',
    fileFormat: 'geojson'
});