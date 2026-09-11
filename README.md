# 🍵 BrewBalance AI: Tea, Coffee & Water Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ShanthiStream/BrewBalance)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/ShanthiStream/BrewBalance)

> **Intelligent real-time hydration and caffeine optimization engine powered by on-device Edge-ML.**

---

## 🌟 Overview

Modern knowledge workers and athletes frequently struggle with chronic afternoon dehydration and sleep disruption caused by unmanaged caffeine intake. **BrewBalance AI** continuously analyzes fluid intake, calculates active caffeine decay, respects personalized circadian cut-offs, and runs a lightweight on-device neural network to recommend whether to drink **Tea**, **Coffee**, or **Water**.

---

## ✨ Features

- **🧠 Real-Time Recommendation Engine**: Sub-5ms edge evaluation balancing physiological hydration needs and stimulant decay.
- **🛡️ Pre-ML Safety Guardrails**: Hard ceilings enforcing water transitions upon caffeine threshold reach or past evening cut-off hours (e.g., 4:00 PM).
- **⚡ Fast One-Tap Presets**: 1-tap logging for +250ml Water, +250ml Tea, and +250ml Coffee.
- **📊 AI Daily Intake Synthesis**: Live biometric vitality score (0-100), clinical daily headline, and 3-pillar metabolic breakdown.
- **📈 Rich Analytics Dashboard**: Time-series trajectory curves, separate cards for Water, Tea, and Coffee, and limit adherence scoring.
- **📱 Offline-First PWA**: Installable directly on iOS, Android, and Desktop with full offline caching via service worker.
- **🔒 Zero-Tracking Privacy**: Air-gapped local storage with complete data sovereignty (CSV & JSON exports).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS |
| **Design System** | Luxury Dark Glassmorphism, Google Fonts (`Outfit` & `Plus Jakarta Sans`) |
| **PWA & Offline** | Web App Manifest, Service Worker Cache |
| **Edge Intelligence** | Client-side Quantized MLP Inference Simulator |
| **Visual Assets** | Bespoke 3D renders generated via Gemini (`generate_image`) |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Build Production Bundle
```bash
npm run build
```

### 4. Run Core Verification Tests
```bash
node test_core.mjs
```

---

## 📄 License
Licensed under the [MIT License](LICENSE).
