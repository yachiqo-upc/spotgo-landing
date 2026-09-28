# SpotGo Landing

Marketing landing page for SpotGo, a smart parking platform for drivers and Parking Admins.

This project is a static website built with HTML, CSS, and vanilla JavaScript. It includes responsive sections, an FAQ accordion, a mobile menu, and runtime language switching (English and Spanish) using JSON translation files.

## Features

- Responsive landing page design for desktop, tablet, and mobile.
- Sticky navigation with mobile burger menu.
- Bilingual interface (EN/ES) with language preference saved in localStorage.
- Section-based content for drivers and Parking Admins.
- Pricing, testimonials, FAQ, CTA, and footer sections.
- Font Awesome icons and Google Fonts integration.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- JSON-based i18n files

## Project Structure

```text
spotgo-landing/
|-- index.html
|-- styles.css
|-- main.js
|-- README.md
|-- assets/
|   `-- images/
`-- i18n/
	|-- en.json
	`-- es.json
```

## Getting Started

Because the page fetches translation files from i18n/*.json, run it with a local HTTP server (not file://).

### Option 1: VS Code Live Server

1. Install the Live Server extension in VS Code.
2. Right-click index.html and select Open with Live Server.

### Option 2: Python HTTP server

Run from the project root:

```bash
python -m http.server 5500
```

Then open http://localhost:5500 in your browser.

## Language System (i18n)

Language toggle buttons use the class .lang-toggle. When clicked:

1. The app loads i18n/en.json or i18n/es.json using fetch.
2. Text and HTML are updated by CSS selector mappings.
3. The selected language is stored in localStorage under spotgo-language.
4. On page reload, the last selected language is restored.

Main i18n logic lives in main.js:

- loadLanguageFile
- getTranslation
- applyLanguage

## Main UI Sections

- Navbar
- Hero
- Trusted brands bar
- For Drivers
- For Parking Admins
- How it works
- Stats
- Pricing
- Testimonials
- FAQ
- CTA
- Footer

## Customization Guide

### Update text content

- Edit default content in index.html.
- Edit translated content in i18n/en.json and i18n/es.json.

### Add a new translation key

1. Add the target selector and value in both JSON files.
2. Use the correct section in JSON:
   - text for plain textContent updates.
   - html for innerHTML updates.
   - listText/listHtml for repeated elements.
3. Ensure the selector matches an element in index.html.

### Replace images

- Put new assets in assets/images/.
- Update image paths in index.html.

## Deployment

This is a static site and can be deployed to:

- GitHub Pages
- Netlify
- Vercel (static)
- Any static hosting provider

Important: keep the i18n directory published together with index.html so translation fetch requests work.

## Notes

- No package manager or build step is required.
- All behavior is client-side.
- If translations fail to load, the app falls back to English/default values.

## License

Use the license required by your course/team. If needed, add a LICENSE file and reference it here.
