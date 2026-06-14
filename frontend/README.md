# Smart Agri AI - Frontend

## Overview

Smart Agri AI is an AI-Powered Farm Intelligence agriculture management platform designed to help farmers make data-driven decisions through machine learning, weather intelligence, and real-time farm monitoring.

This repository contains the frontend application built using React and Vite, providing an interactive dashboard for monitoring crop health, soil moisture, nutrient status, irrigation recommendations, pest detection, and AI-powered farming assistance.

---

## 🚀 Key Features

### 📊 Smart Dashboard
- Real-time farm monitoring
- Live weather insights
- Crop health tracking
- Smart farm alerts
- Historical trend visualization

### 💧 Soil Moisture Monitoring
- AI-based soil moisture prediction
- Moisture status visualization
- Historical moisture analysis
- Irrigation support

### 🌿 Nutrient Status Analysis
- NPK estimation using Machine Learning
- Nutrient health indicators
- Fertilizer recommendations
- Soil nutrient monitoring

### 🌱 Crop Stage Tracking
- Automatic crop growth stage identification
- Crop age calculation
- Stage-based recommendations

### ❤️ Crop Health Assessment
- Health score generation
- Growth performance monitoring
- AI-powered crop evaluation

### 🐛 Pest Detection
- Crop image upload
- EfficientNet-B0 based pest classification
- Healthy vs Pest Attack detection
- Automatic health score updates

### 🚿 Irrigation Management
- Smart irrigation recommendations
- Water volume estimation
- Irrigation duration prediction
- Urgency-based irrigation alerts

### 🌦 Rain History Analysis
- Weather monitoring
- Rainfall history visualization
- Climate-aware farming support

### 🤖 AI Advisory System
- Crop-specific recommendations
- Weather-aware suggestions
- Farm management guidance

### 💬 AI Farm Assistant
- Agriculture-focused chatbot
- Farming guidance
- Crop management support
- Instant AI-powered assistance

---

## 🛠 Technology Stack

### Frontend
- React.js
- Vite
- React Router DOM
- React Icons
- Recharts
- Axios
- CSS3

### Backend Communication
- REST APIs
- Flask Backend Integration

### AI/ML Integration
- Soil Moisture Prediction
- NPK Prediction
- Pest Detection
- Smart Advisory Engine

---

## 📂 Project Structure

```text
src/
│
├── assets/
│
├── components/
│   ├── AdvisoryCard.jsx
│   ├── AlertCard.jsx
│   ├── Badge.jsx
│   ├── ChatBot.jsx
│   ├── HealthGauge.jsx
│   ├── LoadingSpinner.jsx
│   ├── LocationMap.jsx
│   ├── MetricCard.jsx
│   ├── PestUpload.jsx
│   └── SectionHeader.jsx
│
├── context/
│   └── FarmContext.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── DashboardHome.jsx
│   ├── SoilMoisture.jsx
│   ├── NutrientStatus.jsx
│   ├── CropHealth.jsx
│   ├── Irrigation.jsx
│   ├── RainHistory.jsx
│   ├── Advisory.jsx
│   ├── Chatbot.jsx
│   ├── Login.jsx
│   └── Signup.jsx
│
├── services/
│   └── api.js
│
├── utils/
│   └── farmLogic.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/Smart-Agri-AI.git
```

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env.development` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Create a `.env.production` file:

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

Application runs at:

```text
http://localhost:5173
```

---

## 🏗 Production Build

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 📈 AI Modules Integrated

| Module | Model |
|----------|----------|
| Soil Moisture Prediction | Random Forest |
| NPK Prediction | Random Forest |
| Pest Detection | EfficientNet-B0 |
| Crop Health Evaluation | AI-Based Scoring |
| Advisory System | Rule-Based Intelligence |

---

## 📱 Main Dashboard Modules

- Dashboard Overview
- Soil Moisture Monitoring
- Nutrient Status Analysis
- Crop Stage Tracking
- Crop Health Assessment
- Irrigation Management
- Rain History
- AI Advisory
- AI Chatbot

---

## 🌟 Highlights

- Real-Time Farm Monitoring
- Responsive User Interface
- AI-Powered Insights
- Smart Irrigation Recommendations
- Weather-Based Decision Support
- Machine Learning Integration
- Interactive Data Visualizations
- Multi-Land Management Support
- Crop Health Analytics
- Pest Detection Using Deep Learning

---

## 👨‍💻 Author

### Avins R

AI & Data Science Student  
AI/ML Developer
---

## 📄 License

This project is developed for research, and agricultural innovation purposes.

© 2026 Smart Agri AI. All Rights Reserved.