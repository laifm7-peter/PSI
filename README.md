# Singapore Air Quality & Haze Monitor (PSI & PM2.5)

A responsive real-time web application to monitor Singapore's air quality, 1-hour PM2.5 levels, 24-hour PSI, and criteria pollutants with an interactive map, geolocation tracking, official NEA health advisories, API health diagnostics, and dynamic atmospheric haze effects.

## Features

- **Live Singapore NEA Open Data Integration**:
  - `https://api-open.data.gov.sg/v2/real-time/api/psi`
  - `https://api-open.data.gov.sg/v2/real-time/api/pm25`
- **Interactive SVG Map**: Color-coded geographic regions (North, South, East, West, Central) and offshore islands with animated telemetry pins and radar pulses.
- **Geolocation & Town Search**: Auto-detects user GPS location and calculates distance to nearest NEA sensor station; includes fast lookup for 30+ Singapore neighborhoods.
- **Official Health Advisories**: Endorsed guidelines for healthy individuals, elderly, children, pregnant women, and chronic heart/lung conditions.
- **API Health Diagnostic Service**: `/api/health.js` monitors upstream endpoint status, response latency, and data schema integrity.
- **Atmospheric Weather & Haze Engine**: Renders dynamic drifting particulate PM2.5 motes, skyline silhouette fading, ambient lighting shifts, and interactive haze level simulation.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Particle Physics
- **Backend / Server**: Express 4, Vite 8, Node.js 22

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build & Run

```bash
npm run build
npm start
```

### API Health Monitor

Query the health endpoint:

```bash
curl http://localhost:3000/api/health.js
```
