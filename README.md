# Point of Interest (PoI) Filters

This is a stateless web app that fetches a _geojson_ dataset of _PoIs_, shows them on a map (thanks to [MapBox](https://www.mapbox.com/)) and lets the user filter them by category.

![Screenshot](/screenshot.png)

## Setup

Within [application.js](application.js) you can setup some JS variables:

- `mapboxSettings` contains the _Access Token_ and the _Tile Layer ID_ to use the [MapBox](https://www.mapbox.com/) API.
- `viewSettings` contains the GPS coordinates for the initial center and the zoom level as well
- `datasetUrl` is the URL of the _geojson_ that contains all the _PoIs_
