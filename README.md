# Skitouren-Suche

Pilot-Schulprojekt mit fiktiven Beispieldaten. Statische Website, live via GitHub Pages.

- `index.html` – Startseite mit interaktiver Tourenkarte (Leaflet)
- `suche.html` – Tourensuche mit Filtern
- `assets/tours.js` – Tourendaten (neue Tour = neuer Eintrag mit `lat`/`lon`)

## Powder-Hänge
Touren mit `pow` in `assets/tours.js` haben einen per Geländeanalyse gefundenen Hang:
34–45° steil, mindestens 200 Hm am Stück, gleichmässig und quer zum Hang eben.
Grundlage ist das Höhenmodell von swisstopo (30-m-Raster).
