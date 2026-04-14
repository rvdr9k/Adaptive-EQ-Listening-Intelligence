# Adaptive EQ AI

Adaptive EQ AI is a cloud-backed audio app for upload, playback, saved history, and backend-connected EQ workflow UI.

## Highlights

- Clean multi-page experience: `Intro`, `Dashboard`, `Player`, `History`
- Real local audio playback (`mp3`, `wav`, `ogg`)
- Save tracks to Supabase Storage + metadata to Supabase Postgres
- Reopen saved tracks from History into Player
- FastAPI backend with live `/health` integration in the frontend

## Tech Stack

- React + TypeScript + Vite
- Custom CSS UI
- Supabase (Storage + Postgres)
- FastAPI

## Quick Start

### 1) Frontend

```bash
npm install
npm run dev
```

### 2) Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Health URL:

`http://127.0.0.1:8000/health`

## Environment

### Frontend `.env`

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_AUDIO_BUCKET=uploaded-audio
VITE_ANALYSIS_API_URL=http://127.0.0.1:8000
```

### Backend `backend/.env`

```bash
FRONTEND_ORIGINS=https://adaptive-eq-listening-intelligence.vercel.app,http://127.0.0.1:5173,http://localhost:5173
BACKEND_API_VERSION=0.1.0
```

## Supabase Setup

1. Create a Supabase project
2. Run SQL in `supabase/schema.sql`
3. Add frontend `.env` values
4. Run app and test upload -> save -> history reopen flow

## Build

```bash
npm run build
```
