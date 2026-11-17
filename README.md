# Skitouren-Suche

Pilot-Schulprojekt mit fiktiven Beispieldaten. Statische Website, live via GitHub Pages.

- `index.html` – Startseite mit interaktiver Tourenkarte (Leaflet)
- `suche.html` – Tourensuche mit Filtern
- `assets/tours.js` – Tourendaten (neue Tour = neuer Eintrag mit `lat`/`lon`)

## Powder-Hänge
Touren mit `pow` in `assets/tours.js` haben einen per Analyse gefundenen Hang, `assets/hangs.js` enthält alle gefundenen Hänge für den Powder-Explorer.
Kriterien:
- Hangneigung 34–45°, Neigungsstreuung höchstens ±3°
- Höhendifferenz mindestens 200 Hm in der Falllinie
- planare Hangform (keine Querneigung, weder Mulde noch Rücken)
- Hangbreite mindestens 40 m: an jedem Punkt der Falllinie wird ein Querprofil von 40 m geprüft
- Untergrund: Rasen, Zwergsträucher oder Geröll (Geröll höchstens 50 %); Fels, Gletscher, Wald und Gebüsch schliessen den Abschnitt aus

Grundlagen: Höhenmodell swisstopo (30-m-Raster), Lebensraumkarte Schweiz (BAFU/WSL) für den Untergrund.

## Interaktive Funktionen
- Startseite: Karte mit Touren-Ansicht und Powder-Explorer (Regler für Hangneigung und Höhendifferenz, Kompassrose für die Exposition), Zufallstour
- Suche: Karte passt sich den Filtern an, Hangprofil in den Details, Merkliste (nur lokal im Browser), Filter stehen in der Adresse und lassen sich als Link teilen

## Couloirs
`couloirs.html` zeigt recherchierte Couloirs in Graubünden und im Alpstein (Daten in `assets/couloirs.js`, mit Quellenlink pro Eintrag). Marker sitzen auf dem Gipfel (Koordinaten swisstopo). Alle Angaben sind Richtwerte.
