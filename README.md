# Restaurant Roulette

A base React and Next.js app using the App Router and TypeScript.

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Map and Google Places setup

The homepage uses the OSM Bright basemap through Leaflet and the
Google Places API to find restaurant locations around Auckland. Create a
`.env.local` file with a browser-restricted Google API key:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Enable **Places API** for the key in Google Cloud and restrict it to the
application domains before deploying. OpenStreetMap data is © OpenStreetMap
contributors.

## Scripts

- `npm run dev` - start the development server
- `npm run lint` - run ESLint
- `npm run build` - create a production build
- `npm run start` - serve the production build