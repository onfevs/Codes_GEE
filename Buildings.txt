https://code.earthengine.google.com/9544c60036270bf7bc190397d61bb9bc

// Filtrar la colección de edificios por la geometría
var edificios = table.filterBounds(geometry);

// Filtrar los edificios por la confianza que tienen
var t_065_070 = edificios.filter('confidence >= 0.65 && confidence < 0.7');
var t_070_075 = edificios.filter('confidence >= 0.7 && confidence < 0.75');
var t_gte_075 = edificios.filter('confidence >= 0.75');

// Agregar las colecciones filtradas al mapa
Map.addLayer(t_065_070, {color: 'FF0000'}, 'Edificios con poca confianza [0.65; 0.7)');
Map.addLayer(t_070_075, {color: 'FFFF00'}, 'Edificios con moderada confianza [0.7; 0.75)');
Map.addLayer(t_gte_075, {color: '00FF00'}, 'Edificios con alta confianza >= 0.75');

// Agregar una columna con la categoría de confianza
var categorizada = edificios.map(function(feature) {
  var confianza = ee.Number(feature.get('confidence')); // Obtener el valor de confianza como un número de Earth Engine

  // Verificar las condiciones para asignar categorías usando ee.Algorithms.If()
  var categoria = ee.Algorithms.If(confianza.gte(0.75), 'alta',
                 ee.Algorithms.If(confianza.gte(0.7).and(confianza.lt(0.75)), 'moderada',
                 ee.Algorithms.If(confianza.gte(0.65).and(confianza.lt(0.7)), 'baja', 'desconocida')));

  return feature.set('categoria', categoria); // Agregar la columna con el valor de la categoría
});

// Agregar columnas de latitud y longitud
var edificiosConCoordenadas = categorizada.map(function(feature) {
  var coords = feature.geometry().centroid().coordinates(); // Obtener las coordenadas del centroide del polígono
  var latitud = ee.Number(coords.get(1)).toFloat(); // Obtener la latitud (segunda coordenada)
  var longitud = ee.Number(coords.get(0)).toFloat(); // Obtener la longitud (primera coordenada)
  return feature.set('latitud', latitud).set('longitud', longitud);
});


// Exportar la colección de edificios en formato GeoJSON
Export.table.toDrive({
  collection: edificiosConCoordenadas, // La colección de edificios con coordenadas
  description: 'edificios', // El nombre que le quieres dar al archivo
  fileFormat: 'geojson' // El formato del archivo
});

// Centrar el mapa en la geometría creada
Map.centerObject(geometry);
Map.setOptions('SATELLITE');