(function() {

  var filters = null;
  var checkboxes = [];
  var map = null;
  var geojsonData = {};
  var featureLayer = null;
  var resultsContainer = null;

  var mapboxSettings = {
    accessToken: "pk.eyJ1Ijoib2xpc3RpayIsImEiOiJjaW03a2lvd2MwMDBsdzhtNTZzeG9pYzFsIn0.EnuMVTEKyFfJN6XZhtLmIA",
    tileLayerId: "olistik.00d43ij6" // or "mapbox.streets"
  };

  var viewSettings = {
    // center of Desio
    latitude: 45.61820986655421,
    longitude: 9.207572937011719,
    zoomLevel: 15
  };

  function capitalize(string) {
    if (string.length > 0) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
      return "";
    }
  }

  function isPresent(string) {
    return string !== undefined && string !== null && string.length > 0;
  }

  function fetchDataset(datasetUrl, callback) {
    fetch(datasetUrl).then(function(response) {
      return response.json();
    }).then(function(json) {
      callback(json);
    });
  }

  function createCustomTooltips() {
    var layers = featureLayer.getLayers();
    for (var i = 0; i < layers.length; ++i) {
      var layer = layers[i];
      var marker = layer;
      var feature = marker.feature;

      var content = "";
      content += "<strong>" + feature.properties.title + "</strong><br />";

      if (isPresent(feature.properties.address)) {
        content += "Indirizzo: " + feature.properties.address + "<br />";
      }
      if (isPresent(feature.properties.url)) {
        content += "URL: " + "<a href=\"" + feature.properties.url + "\">" + feature.properties.url + "</a><br />";
      }
      if (isPresent(feature.properties["e-mail"])) {
        content += "e-mail: " + "<a href=\"mailto:" + feature.properties["e-mail"] + "\">" + feature.properties["e-mail"] + "</a><br />";
      }
      if (isPresent(feature.properties.telephone)) {
        content += "Tel. " + "<a href=\"call:" + feature.properties.telephone + "\">" + feature.properties.telephone + "</a><br />";
      }

      marker.bindPopup(content, {
        closeButton: false,
        minWidth: 320
      });
    }
  }

  function update() {
    var enabled = {};
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        enabled[checkboxes[i].id] = true;
      }
    }
    featureLayer.setFilter(function(feature) {
      return (feature.properties.category in enabled);
    });
    createCustomTooltips();
    if (Object.keys(enabled).length > 0) {
      map.fitBounds(featureLayer.getBounds(), {
        padding: [20, 20]
      });
    } else {
      map.setView({
        lat: viewSettings.latitude,
        lon: viewSettings.longitude
      }, viewSettings.zoomLevel);
    }
    updateList();
  }

  function buildHTMLFeature(feature) {
    var node = document.createElement("li");
    var content = "";
    content += "<strong>" + feature.properties.title + "</strong><br />";

    if (isPresent(feature.properties.address)) {
      content += "Indirizzo: " + feature.properties.address + "<br />";
    }
    if (isPresent(feature.properties.url)) {
      content += "URL: " + "<a href=\"" + feature.properties.url + "\">Web site</a><br />";
    }
    if (isPresent(feature.properties["e-mail"])) {
      content += "e-mail: " + "<a href=\"mailto:" + feature.properties["e-mail"] + "\">E-mail</a><br />";
    }
    if (isPresent(feature.properties.telephone)) {
      content += "Tel. " + "<a href=\"call:" + feature.properties.telephone + "\">" + feature.properties.telephone + "</a><br />";
    }
    node.innerHTML = content;
    return node;
  }

  function updateList() {
    var enabled = {};
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        enabled[checkboxes[i].id] = true;
      }
    }

    var visibleFeatures = [];
    for (var index = 0; index < geojsonData.features.length; ++index) {
      var feature = geojsonData.features[index];
      if (feature.properties.category in enabled) {
        visibleFeatures.push(feature);
      }
    }

    resultsContainer.innerHTML = "";
    for (var index = 0; index < visibleFeatures.length; ++index) {
      var feature = visibleFeatures[index];
      var htmlContent = buildHTMLFeature(feature);
      resultsContainer.appendChild(htmlContent);
    }
  }

  function createFilters() {
    var typesObj = {}, types = [];
    var features = featureLayer.getGeoJSON().features;

    for (var i = 0; i < features.length; i++) {
      var feature = features[i];
      typesObj[feature.properties.category] = true;
    }

    for (var k in typesObj) {
      types.push(k);
    }

    // Create a filter interface.
    for (var i = 0; i < types.length; i++) {
      // Create an an input checkbox and label inside.
      var item = filters.appendChild(document.createElement("div"));
      var checkbox = item.appendChild(document.createElement("input"));
      var label = item.appendChild(document.createElement("label"));
      checkbox.type = "checkbox";
      checkbox.id = types[i];
      checkbox.checked = true;
      // create a label to the right of the checkbox with explanatory text
      label.innerHTML = capitalize(types[i]);
      label.setAttribute("for", types[i]);
      // Whenever a person clicks on this checkbox, call the update().
      checkbox.addEventListener("change", update);
      checkboxes.push(checkbox);
    }
  }

  function initMap() {
    L.mapbox.accessToken = mapboxSettings.accessToken;

    var mapElement = document.querySelector("[data-map]");

    map = L.mapbox.map(mapElement);
    var tileLayer = L.mapbox.tileLayer(mapboxSettings.tileLayerId);
    tileLayer.addTo(map);
    map.setView([
      viewSettings.latitude,
      viewSettings.longitude
    ], viewSettings.zoomLevel);

    featureLayer = L.mapbox.featureLayer();
    featureLayer.addTo(map);

    var datasetUrl = "https://raw.githubusercontent.com/olistik/poi-filters/gh-pages/dataset.geojson";
    fetchDataset(datasetUrl, function(json) {
      geojsonData = json;
      featureLayer.setGeoJSON(geojsonData);
      map.fitBounds(featureLayer.getBounds(), {
        padding: [20, 20]
      });
      createCustomTooltips();
      createFilters();
      updateList();
    });

    // callback fired when a marker gets clicked
    featureLayer.on("click", function(e) {
      // centers on marker
      map.panTo(e.layer.getLatLng());
    });

  }

  document.addEventListener("DOMContentLoaded", function(event) {
    filters = document.querySelector(".categories-picker");
    resultsContainer = document.querySelector(".results");
    initMap();
  });

})();
