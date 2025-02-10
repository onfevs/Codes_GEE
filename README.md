# **Visualización de Edificios en el Mundo con Google Earth Engine**

Este código utiliza la plataforma **Google Earth Engine** para visualizar edificios en cualquier parte del mundo. En este caso específico, vamos a enfocarnos en el municipio de **Cajicá**, Colombia. El proceso está dividido en varias secciones que detallan cómo cargar y filtrar datos de edificios, asignar categorías de confianza y exportar los datos a un formato útil.

**Código en Earth Engine:**

[Ver código en Google Earth Engine](https://code.earthengine.google.com/977cd38182442eefa582b7a7b59ceecb)

## **Descripción del Código**

### 1. **Centrar el Mapa y Establecer el Fondo**
Para comenzar, el mapa se centra en el área de Cajicá, utilizando la función `Map.centerObject`. El nivel de zoom está configurado en 12, pero este valor se puede ajustar según la zona de estudio. Además, el fondo del mapa se establece como imagen satelital usando `Map.setOptions`.

```javascript
// Centrar el mapa en el área de Cajicá
Map.centerObject(samana, 12); // Nivel de zoom: 12
Map.setOptions('SATELLITE'); // Establecer el fondo del mapa como satélite
```
### 2. Cargar la Colección de Edificios
Se carga la colección de edificios de Google Research, utilizando el ID GOOGLE/Research/open-buildings/v3/polygons, la cual proporciona datos sobre las ubicaciones de edificios a nivel global.
```
// Cargar la colección de edificios
var edificiosCollection = ee.FeatureCollection("GOOGLE/Research/open-buildings/v3/polygons");
```
### 3. Filtrar Edificios dentro de Cajicá
Luego, filtramos los edificios dentro de los límites geográficos del municipio de Cajicá usando la función filterBounds. Esto nos permite visualizar solo los edificios dentro de la zona de interés.
```
// Filtrar edificios dentro de la geometría de Cajicá
var edificios = edificiosCollection.filterBounds(samana);
```
### 4. Visualización de los Límites de Cajicá
El área de Cajicá se visualiza en el mapa con un borde azul para representar sus límites.
```
// Agregar el Shapefile de Cajicá al mapa en color azul
Map.addLayer(samana, {color: '0000FF', width: 2}, 'Límites de Cajicá');

```
### 5. Filtrar Edificios por Nivel de Confianza
El código filtra los edificios según su nivel de confianza, asignando diferentes colores a cada grupo de edificios:
```
Poca confianza: confidence >= 0.65 && confidence < 0.7 (Rojo)
Confianza moderada: confidence >= 0.7 && confidence < 0.75 (Amarillo)
Alta confianza: confidence >= 0.75 (Verde)

// Filtrar edificios por niveles de confianza
var t_065_070 = edificios.filter('confidence >= 0.65 && confidence < 0.7');
var t_070_075 = edificios.filter('confidence >= 0.7 && confidence < 0.75');
var t_gte_075 = edificios.filter('confidence >= 0.75');

// Agregar las capas de edificios al mapa
Map.addLayer(t_065_070, {color: 'FF0000'}, 'Edificios con poca confianza [0.65; 0.7)');
Map.addLayer(t_070_075, {color: 'FFFF00'}, 'Edificios con moderada confianza [0.7; 0.75)');
Map.addLayer(t_gte_075, {color: '00FF00'}, 'Edificios con alta confianza >= 0.75');

```
### 6. Agregar una Columna con la Categoría de Confianza
Se agrega una columna adicional llamada categoria, que clasifica los edificios según su nivel de confianza en "alta", "moderada" o "baja".
```
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

```
### 7. Agregar Columnas de Latitud y Longitud
Para cada edificio, se calcula su latitud y longitud a partir del centroide de su geometría, y estos valores se agregan como nuevas columnas.
```
// Agregar columnas de latitud y longitud
var edificiosConCoordenadas = categorizada.map(function(feature) {
    var coords = feature.geometry().centroid().coordinates();
    var latitud = ee.Number(coords.get(1)).toFloat();
    var longitud = ee.Number(coords.get(0)).toFloat();
    return feature.set('latitud', latitud).set('longitud', longitud);
});

```
### 8. Exportar los Datos a GeoJSON
Finalmente, los datos de los edificios, junto con sus coordenadas y categorías, se exportan a un archivo GeoJSON, lo que permite su uso en otras plataformas de SIG o análisis.
```
// Exportar los datos a GeoJSON
Export.table.toDrive({
    collection: edificiosConCoordenadas,
    description: 'edificios_samana',
    fileFormat: 'geojson'
});

```
### Notas Importantes

Este código utiliza la plataforma Google Earth Engine, por lo que es necesario tener acceso a ella y haber iniciado sesión con una cuenta de Google.
El código filtra edificios según el nivel de confianza de los datos proporcionados por Google Research, lo que puede variar dependiendo de la ubicación.
Los resultados se exportan a GeoJSON, lo que facilita la interoperabilidad con otras herramientas y plataformas.

### Autor
Jorge Vallejo (@OnfeVS)

