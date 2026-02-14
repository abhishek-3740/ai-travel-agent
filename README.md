# 🌍 AI Travel Agent

**A Next-Gen Intelligent Trip Planner**

[![Live Demo](https://img.shields.io/badge/Live_Site-Visit_Now-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-travel-agent-snowy.vercel.app)
![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-Full%20Stack-blue)
![License](https://img.shields.io/badge/License-MIT-green)

The **AI Travel Agent** is a full-stack web application that leverages Generative AI (Llama 3) to create personalized, day-by-day travel itineraries. Unlike standard planners, it features a "Live Survival Guide" map with real-time user tracking, radar visuals, and professional PDF exports.

---

## ✨ Key Features

### 🧠 **AI-Powered Planning**
- **Smart Itineraries:** Generates detailed 7-day (or custom duration) plans including hidden gems, budget estimates, and pacing (Relaxed/Fast) using **Llama 3 (via Groq)**.
- **Visual Discovery:** Automatically fetches scenic images for every location via a secure backend proxy to protect API keys.

### 🗺️ **Interactive "Survival" Map**
- **Live User Radar:** Custom "Sci-Fi Radar" marker shows your real-time location using browser geolocation.
- **Smart Guidance:** automatically plots activities on a dark-mode interactive map.
- **Powered By:** Leaflet & OpenStreetMap.

### 📄 **Utilities**
- **PDF Export:** Download your entire trip as a professional, formatted PDF guide for offline use.
- **Robust Validation:** Auto-corrects user inputs (e.g., budget terminology) to prevent AI errors.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **Animations:** Framer Motion
- **Maps:** React Leaflet

### **Backend**
- **Framework:** Python FastAPI
- **AI Model:** Llama 3-70b (via Groq Cloud)
- **Validation:** Pydantic
- **Orchestration:** LangChain

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### **1. Prerequisites**
- Node.js (v18+)
- Python (v3.9+)
- A free API Key from [Groq Cloud](https://console.groq.com/)

### **2. Clone the Repository**
```bash
git clone [https://github.com/YOUR_USERNAME/ai-travel-agent.git](https://github.com/YOUR_USERNAME/ai-travel-agent.git)
cd ai-travel-agent
```
### Deployment
- Frontend
```bash
https://ai-travel-agent-snowy.vercel.app
```
- Backend
```bash
https://najbfubajbefjj2jj4-travel-trip-backend.hf.space/
```
