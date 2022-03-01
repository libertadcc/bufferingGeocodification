require([
    "esri/map",
    "esri/graphic",

    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/ready",
    "dojo/parser",
    "dojo/on",
    "dojo/dom",

    "dojo/_base/Color",
    "dojo/_base/array",

    "esri/geometry/Circle",
    "esri/tasks/locator"],
    function (Map, Graphic,
        SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol,
        ready, parser, on, dom,
        Color, array,
        Circle, Locator) {

        ready(function () {

            var mapMain = new Map("divMap", {
                basemap: "streets-navigation-vector",
                center: [-3.671157, 40.382675],
                zoom: 10
            });

            on(dom.byId('locate'), 'click', searchLocation);

            function searchLocation() {
                mapMain.graphics.clear();
                taskLocator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
                var objAddress = {
                    "SingleLine": dom.byId('place').value
                };

                var params = {
                    address: objAddress,
                    outFields: ["Loc_name"]
                };

                taskLocator.addressToLocations(params);

                taskLocator.on("address-to-locations-complete", showResults);
            };

            function showResults(candidates) {
                var symbolMarker = new SimpleMarkerSymbol();
                symbolMarker.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
                symbolMarker.setColor(new Color([255, 0, 0, 0.75]));


                array.every(candidates.addresses, function (candidate) {
                    if (candidate.score > 80) {
                        geometryLocation = candidate.location;

                        var graphicResult = new Graphic(geometryLocation, symbolMarker);
                        mapMain.graphics.add(graphicResult);

                        createBuffer(geometryLocation);
                        return false;
                    }
                });

                if (geometryLocation !== undefined) {
                    mapMain.centerAndZoom(geometryLocation, 15);
                }
            };

            function createBuffer(geometryLocation) {
                // Simbología del circulo gris - Linea externa
                var lineCircle = new SimpleLineSymbol();
                lineCircle.setWidth(2.75);
                lineCircle.setStyle(SimpleLineSymbol.STYLE_DASHDOTDOT);
                lineCircle.setColor(new Color([26, 26, 26, 1]));
                // Simbología del circulo gris 
                var circleSymbol = new SimpleFillSymbol();
                circleSymbol.setOutline(lineCircle);

                const distance = dom.byId('distance').value;
                circlebuffer = new Circle({
                    // Option 1
                    // center: {
                    //     x: geometryLocation.x,
                    //     y: geometryLocation.y,
                    //     spatialReference: geometryLocation.spatialReference
                    // },
                    // Option 2
                    center: geometryLocation,
                    
                    geodesic: true, // geodesic: false - Sino sale ovalado
                    radius: distance,
                    radiusUnit: "esriMeters"
                });

                var graphicBuffer = new Graphic(circlebuffer, circleSymbol);

                mapMain.graphics.add(graphicBuffer);

            };

        });
    });
