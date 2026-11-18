# Borderland Trails — Clubs Round Dual Endpoint Architecture

A streamlined, cyber-styled dual-endpoint application for the NISB Borderland Trails Clubs Round.

## System Overview

The site structure has been restructured to focus exclusively on **two core challenge endpoints**:

### 1. Endpoint 01: Technical Puzzle Arena (`/#endpoint1`)
- **Team Authentication**: Prompts each team to enter their team name before beginning.
- **Randomized Challenge Assignment**: Pulls from the complete pool of **20 technical puzzles** (derived from the official Operating Manual). On login, exactly **2 randomized questions** are assigned per team session.
- **Backend Verification**: Solutions are verified server-side against the exact logic specified in the technical manual, with instant validation feedback.
- **Operating Manual Integration**:
  - Direct download of `Borderland_Trails_NISB_Final.pdf` inside the endpoint and hub.
  - Dedicated QR code for opening and downloading the official NISB PDF manual on mobile devices.

### 2. Endpoint 02: Digital Memory Grid Arena (`/#endpoint2`)
- **Team Authentication**: Prompts for team name to synchronize floor coordinates and state.
- **Mobile Playable Matrix**:
  - Fully responsive, smooth-scrolling 20 × 20 floor grid optimized for touch screens (`touch-action: pan-x pan-y`).
  - Zoom controls (100% Fit, Zoom In, Zoom Out, Auto-Focus Player).
  - Touch-friendly on-screen Directional D-Pad (▲, ▼, ◄, ►) for thumb navigation on smartphone screens.
- **Checkpoint System**:
  - Tactical checkpoints along the route: `START` (0), `CP 1` (Step 7), `CP 2` (Step 15), `CP 3` (Step 23), and `EXIT` (Step 29).
  - Reaching a checkpoint automatically saves team progress.
- **Trap Fallback & Checkpoint Recalibration**:
  - Stepping on a trap tile falls back to the **last reached checkpoint** (never resets from scratch if a checkpoint has been secured).
  - Triggers the **Neural Sequence Recalibration Mini Memory Game**: A Simon-style 4-tone audio-visual memory game that must be completed to re-energize the checkpoint and resume walking.

### 3. Portal Hub (`/#/`)
- Gateway page featuring dual high-tech cards for Endpoint 1 and Endpoint 2.
- Dynamic, offline-generated QR codes rendered via SVG for both endpoints.
- Event host LAN IP configurator: instantly adapts QR codes to your local network address for event scanning.

## How to Run Locally

1. Install Node.js 20+.
2. Run `npm start` or `node server.mjs`.
3. Open `http://localhost:4173` in your browser.
4. For mobile testing over Wi-Fi, enter your computer's local IP address in the Event Host Address field to update all QR codes.
