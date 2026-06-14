# Smart Agri AI
### AI-Powered Farm Intelligence, Prediction & Advisory Platform

Smart Agri AI is a AI-Powered Farm Intelligence agriculture platform that combines **Machine Learning, Deep Learning, Real-Time Weather Analytics, AI Advisory Systems, and Conversational AI** to help farmers monitor farms, predict soil conditions, estimate nutrient levels, detect pests, optimize irrigation, and make data-driven agricultural decisions.

The platform enables farmers to register multiple lands, monitor each farm independently, receive AI-powered recommendations, and track crop health throughout the cultivation lifecycle.

🔗 Live Demo: https://smart-agri-ai-farm.netlify.app

---

# 🚀 Features

## 🔐 Authentication System

### Secure User Management
- User Registration
- User Login
- JWT Authentication
- Protected Dashboard Access
- Persistent Sessions
- MongoDB User Storage

---

## 🏡 Smart Farm Management

### Home Page

Farmers can:

- Create multiple lands/farms
- Configure crop information
- Select crop type
- Select crop variety
- Select soil type
- Enter acreage details
- Set planting date
- View all registered lands

Each land contains an independent dashboard for monitoring.

---

## 📊 Interactive Smart Dashboard

Each land has its own dedicated dashboard.

### Dashboard Monitors

- Soil Moisture
- Temperature
- Humidity
- Rainfall
- Sunlight
- Crop Age
- Crop Stage
- Predicted NPK Values
- Nutrient Status
- Pest Detection Status
- Irrigation Recommendation
- Crop Health Score
- Weather Insights

### Additional Features

- Live Weather Monitoring
- Farm Analytics
- Dynamic Health Indicators
- Real-Time Recommendation Cards
- Location-Based Farm Tracking
- Responsive Modern UI

---

## 🌦️ Real-Time Weather Integration

### Powered by Open-Meteo API

Live weather data is fetched automatically using farm coordinates.

### Weather Parameters

- Temperature
- Humidity
- Rainfall
- Sunlight Hours

### Weather Data Usage

Used throughout the system for:

- Soil Moisture Prediction
- NPK Prediction
- Irrigation Recommendation
- Health Score Calculation
- Advisory Generation

---

## 🌱 Soil Moisture Prediction

### Machine Learning Model

Model:
Random Forest Regressor

### Input Features

- Temperature
- Humidity
- Rainfall
- Sunlight
- Crop Type
- Crop Variety
- Crop Stage

### Output

- Predicted Soil Moisture %

### Benefits

✔ Smart Irrigation Planning

✔ Water Conservation

✔ Continuous Monitoring

✔ Weather-Aware Predictions

---

## 🧮 Nutrient Status Prediction (NPK)

### Machine Learning Model

Model:
Random Forest Regressor

The system predicts nutrient availability without requiring laboratory testing.

### Input Features

- Temperature
- Rainfall
- Humidity
- Crop Type
- Crop Variety
- Soil Type
- Predicted Soil Moisture

### Predicted Outputs

- Nitrogen (N)
- Phosphorus (P)
- Potassium (K)

### Nutrient Analysis

The platform automatically determines:

- Nutrient Balance
- Nutrient Deficiency
- Nutrient Excess
- Fertility Status

### Example

Output:

N = 74

P = 58

K = 92

Status:

Balanced Nutrient Condition

---

## 🌾 Crop Lifecycle & Stage Analysis

The system automatically calculates crop age and lifecycle stage.

### Inputs

- Crop Type
- Crop Variety
- Planting Date

### Outputs

- Crop Age
- Growth Stage
- Stage Progress

### Supported Stages

- Germination
- Seedling
- Vegetative
- Flowering
- Fruiting
- Harvest

### Variety-Based Tracking

Example:

Rice → Basmati

Rice → Ponni

Rice → IR64

Each variety has its own lifecycle.

---

## 🐛 Pest Detection System

### Deep Learning Model

Model:
EfficientNetB0

Farmers upload crop leaf images for pest analysis.

### Outputs

- Healthy Crop
- Pest Attack Detection
- Confidence Score

### Features

- Image-Based Detection
- Fast Prediction
- Deep Learning Inference
- Early Warning Alerts

---

## 💧 Smart Irrigation Management

### Intelligent Irrigation Engine

Recommendations are generated using:

- Soil Moisture
- Rainfall Forecast
- Crop Stage
- Weather Conditions

### Outputs

- Irrigation Required
- Irrigation Not Required
- Suggested Watering Amount
- Rain-Based Recommendations

---

## 🧮 Crop Health Score System

The platform generates a unified crop health score.

### Health Formula

| Component | Weight |
|------------|---------|
| Pest Status | 50% |
| Soil Moisture | 15% |
| Temperature | 10% |
| Humidity | 10% |
| NPK Balance | 15% |

---

### Health Categories

| Score | Status |
|---------|---------|
| 85-100 | Excellent |
| 70-84 | Good |
| 50-69 | Moderate |
| 30-49 | Risk |
| 0-29 | Critical |

---

## 📈 Historical Analytics & Trends

The system stores historical farm records and visualizes trends.

### Trend Analysis

- Soil Moisture History
- Weather Trends
- Crop Health Trends
- Irrigation History
- Nutrient Trends
- NPK Trends
- Rainfall Trends

### Benefits

- Better Decision Making
- Farm Performance Tracking
- Crop Lifecycle Monitoring

---

## 🧠 AI Advisory System

Smart recommendations are generated automatically using:

- Weather Data
- Soil Moisture
- NPK Values
- Nutrient Status
- Crop Stage
- Pest Detection
- Health Score
- Irrigation Conditions

### Example Recommendations

Low Soil Moisture

→ Irrigation Recommended

Low Nitrogen

→ Nitrogen Fertilizer Suggested

Pest Attack Detected

→ Apply Appropriate Treatment

Poor Health Score

→ Corrective Action Recommended

---

## 💬 Agriculture AI Chatbot

### Powered by Mistral API

Farmers can interact with an intelligent agricultural assistant.

### Capabilities

- Crop Guidance
- Pest Support
- Irrigation Advice
- Fertilizer Recommendations
- Weather Queries
- Farm Management Assistance

### Benefits

- 24/7 Support
- Instant Responses
- Context-Aware Assistance

---

# 🏗️ System Architecture

```text
User Sign Up / Login
            │
            ▼
      Home Page
(Create & Manage Lands)
            │
            ▼
 Select Farm Dashboard
            │
            ▼
 Real-Time Weather
    (Open-Meteo API)
            │
            ▼
      ML Models
(Random Forest Models)
 ├─ Soil Moisture Prediction
 └─ NPK Prediction
            │
            ▼
      DL Models
   (EfficientNetB0)
     Pest Detection
            │
            ▼
 Health Score Engine
            │
            ▼
 Irrigation Engine
            │
            ▼
 AI Advisory System
            │
            ▼
 Mistral AI Chatbot
```

---

# 🛠️ Tech Stack

| Category | Technologies |
|-----------|-------------|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Flask |
| Database | MongoDB |
| Authentication | JWT |
| Machine Learning | Scikit-Learn (Random Forest) |
| Deep Learning | PyTorch (EfficientNetB0) |
| APIs | Open-Meteo API, Mistral API |
| Maps | React Leaflet |
| Charts | Recharts |
| Data Processing | Pandas, NumPy |
| Model Serialization | Pickle |
| Deployment | Render / Netlify|

---

# 📂 Project Structure

```bash
smart-agri-ai/
│
├── backend/
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── land.py
│   │   └── user.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── advisory.py
│   │   ├── auth.py
│   │   ├── chatbot.py
│   │   ├── dashboard.py
│   │   ├── lands.py
│   │   ├── ml.py
│   │   └── weather.py
│   │
│   ├── services/
│   │   ├── advisory_service.py
│   │   ├── chatbot_service.py
│   │   ├── crop_stage_service.py
│   │   ├── health_service.py
│   │   ├── irrigation_service.py
│   │   ├── npk_service.py
│   │   ├── pest_service.py
│   │   ├── soil_moisture_service.py
│   │   ├── weather_service.py
│   │   └── constants.py
│   │
│   ├── uploads/
│   │
│   ├── app.py
│   ├── config.py
│   ├── db.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── AdvisoryCard.jsx
│   │   │   ├── AlertCard.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── ChatBot.jsx
│   │   │   ├── HealthGauge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── LocationMap.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── PestUpload.jsx
│   │   │   └── SectionHeader.jsx
│   │   │
│   │   ├── context/
│   │   │   └── FarmContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── CropHealth.jsx
│   │   │   ├── NutrientStatus.jsx
│   │   │   ├── Irrigation.jsx
│   │   │   ├── RainHistory.jsx
│   │   │   ├── SoilMoisture.jsx
│   │   │   ├── Advisory.jsx
│   │   │   └── Chatbot.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── utils/
│   │   │   └── farmLogic.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── datasets/
│   │
│   ├── npk/
│   │   └── NPK_dataset.csv
│   │
│   ├── soil_moisture/
│   │   └── soil_moisture_dataset.csv
│   │
│   └── pest/
│       ├── train/
│       ├── valid/
│       ├── test/
│       └── data.yaml
│
├── ml_models/
│   │
│   ├── npk/
│   │   └── npk_random_forest_model.pkl
│   │
│   ├── soil_moisture/
│   │   ├── soil_moisture_model.pkl
│   │   └── encoders.pkl
│   │
│   └── pest/
│       └── best_model.pth
│
├── README.md
├── requirements.txt
└── .gitignore
```

---

## 🎯 Use Cases

- Smart Irrigation Management
- Nutrient Prediction
- NPK Monitoring
- Pest Detection
- Crop Health Monitoring
- Precision Agriculture
- AI Farming Assistant
- Farm Analytics
- Agricultural Decision Support System

---

## 👨‍💻 Author

**Avins V R**

AI & Data Science Student

AI/ML Developer 

GitHub:
https://github.com/Avins-VR

---

## 📄 License

### Proprietary License – All Rights Reserved

This project is proprietary and protected by copyright.

✔ Viewing is permitted for educational and evaluation purposes.

❌ Copying is not permitted.

❌ Modification is not permitted.

❌ Redistribution is not permitted.

❌ Commercial use is not permitted.

Written permission from the copyright holder is required for any use beyond viewing and evaluation.

© 2026 Smart Agri AI — All Rights Reserved.