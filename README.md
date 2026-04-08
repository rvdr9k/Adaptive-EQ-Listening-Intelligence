# Adaptive EQ AI

Adaptive EQ AI is a simple intelligent audio system that aims to automatically adjust equalization based on the song, listening patterns, and user preferences for a more personalized sound experience.

## Overview

Adaptive EQ AI is designed to move beyond static presets by analyzing audio and shaping EQ output dynamically. The long-term goal is to combine audio understanding, user behavior, and AI-generated insights into one adaptive listening system.

## Features

- EQ dashboard for visual tuning insights
- Audio player with a modern music-app style interface
- History and insights page for past songs and tuning patterns
- Mock adaptive EQ recommendations in the current frontend
- Modular structure for future backend and AI integration

## How It Works

1. Audio Input  
   A song or audio stream is provided to the system.

2. Feature Extraction  
   Audio features such as spectrum, energy, tempo, and tonal balance are analyzed.

3. EQ Decision Layer  
   A rule-based or ML-based system determines the best EQ adjustments.

4. Personalization Layer  
   User history, habits, and repeated preferences influence recommendations.

5. Output  
   The system applies EQ settings and presents enhanced playback with insights.

## Tech Direction

- Frontend: React + TypeScript + Vite
- Styling: Custom CSS
- Backend:
- Audio processing:
- AI / ML:

## How to run

1. Install dependencies
2. Run the frontend locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase Setup

This app now supports saving uploaded audio files to Supabase Storage and showing them in the History page.

1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql`
3. Create a `.env` file from `.env.example`
4. Fill in:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_AUDIO_BUCKET=uploaded-audio
```

After that, uploaded files can be saved from the player and reopened from history.

## Goal

The goal is to build an adaptive EQ system that improves audio automatically while learning from music content and listener behavior over time.

