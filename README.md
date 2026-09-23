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

## Google Maps setup

The homepage uses the Google Maps JavaScript API and Places API to display
restaurant locations around Auckland. Create a `.env.local` file with a
browser-restricted API key:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Enable **Maps JavaScript API** and **Places API** for the key in Google Cloud,
and restrict the key to the application domains before deploying.

## Scripts

- `npm run dev` - start the development server
- `npm run lint` - run ESLint
- `npm run build` - create a production build
- `npm run start` - serve the production build