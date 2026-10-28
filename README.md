# Vehicle Inspection Dashboard - Client (Frontend)

React + TypeScript + Vite + Tailwind CSS frontend for the Vehicle Inspection & Maintenance Dashboard.

## Features
- Interactive Fleet Dashboard with KPIs, Charts (Recharts), and Filterable/Searchable Data Table
- Modal view for individual vehicle inspection details
- Automatic caching and manual refresh triggers

## Setup & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Create `.env` file if connecting to an external backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   *(If running locally with default backend on port 5000, Vite dev proxy handles `/api` automatically).*

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deploying to Vercel

1. Push this folder to a new GitHub repository (e.g. `assigment-01-client`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your client repository.
4. Framework Preset: **Vite** (auto-detected).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The URL of your deployed backend server (e.g., `https://your-api.onrender.com`).
8. Click **Deploy**.
