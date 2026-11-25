# SpotGo Landing Page

Static landing page for SpotGo, a parking solution with two mobile apps:

- **SpotGo Driver** — find permitted parking zones, check availability, manage vehicles and reservations, and pay from the app.
- **SpotGo Parking Admin** — configure zones and spaces, monitor occupancy and alerts, and register guest parking sessions.

Live site: [yachiqo-upc.github.io/spotgo-landing](https://yachiqo-upc.github.io/spotgo-landing/)

## Features

- English (`en_US`, default) and Latin American Spanish (`es_419`); the selected language is saved in the browser's local storage.
- Screen viewer to enlarge and browse the SpotGo Driver and Parking Admin screenshots.
- Product and team videos played in the page.
- Terms and Conditions (English and Spanish) and Privacy Policy pages.
- Responsive layout, keyboard navigation and reduced-motion support.

## Run locally

Serve the project root over HTTP so the page can load its translation files:

```bash
python -m http.server 5500
```

Open [http://localhost:5500](http://localhost:5500).

## Project structure

```
index.html          Landing page
styles.css          Shared styles (landing and legal pages)
main.js             Language switching, navigation, dialogs, screen viewer and video playback
i18n/               en_US.json and es_419.json translations
assets/             Images, font and videos
terms/              Terms and Conditions
privacy-policy/     Privacy Policy
```

HTML, CSS and vanilla JavaScript; no build step or package manager. Deployed with GitHub Pages; all paths are relative, so the site also works under the `/spotgo-landing/` project path.

## Team

Yachiqo — Adrian Ruiz Mideyros, Nestor Alonso Rojas Tello, Cesar Jair Contreras Rojas, Briguite Eryka Carhuaz Centeno and Sofia Alessandra Cotrina Siclla.

## Credits

- Terms and Conditions generated with the [TermsFeed Terms and Conditions Generator](https://www.termsfeed.com/terms-conditions-generator/).
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) typeface (SIL Open Font License 1.1).
- Google Play icon from [SVG Repo](https://www.svgrepo.com/).

## License

[MIT](LICENSE) © 2026 Yachiqo
