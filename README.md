<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js"/>
  <img src="https://img.shields.io/badge/Open--Meteo-4A90D9?style=for-the-badge&logo=cloud&logoColor=white" alt="Open-Meteo"/>
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License"/>
</p>

# 🌾 CropSense — Crop Yield Prediction Portal

**CropSense** is an intelligent, web-based agricultural decision-support system that predicts crop yields using real-time weather data and a multi-factor scoring algorithm. It helps farmers and agricultural planners make informed decisions about crop selection, planting seasons, and resource management.

> Built with **Node.js**, **Express**, **Chart.js**, and the **Open-Meteo API** (no API keys required).

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo Screenshots](#-demo-screenshots)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Supported Crops](#-supported-crops)
- [Prediction Algorithm](#-prediction-algorithm)
- [Data Sources](#-data-sources)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌡️ **Real-Time Weather Dashboard** | Live weather data and 7-day forecasts for any location worldwide via Open-Meteo |
| 🧠 **Multi-Factor Yield Prediction** | Advanced scoring algorithm analyzing temperature, rainfall, humidity, season, soil, and cross-factor interactions |
| 📊 **Interactive Charts** | Visual breakdowns of factor scores, yield comparisons, and weather trends using Chart.js |
| 🔄 **Crop Comparison Tool** | Compare 2–6 crops side-by-side to find the most profitable option |
| 🏆 **Best-Fit Analyzer** | Automatically discovers which crop performs best for your specific location, soil, and season |
| 💰 **Revenue Estimator** | Projected income from MSP and market prices, minus cultivation costs |
| 💧 **Irrigation Calculator** | Water requirement estimations based on weather conditions and crop coefficient (Kc) |
| 🛡️ **Disease Risk Alerts** | Weather-triggered pest and disease risk predictions with preventive recommendations |
| 📜 **Prediction History** | Save, review, and compare past predictions (stored in browser localStorage) |
| 📥 **Export Reports** | Download results as PDF, CSV, or JSON |
| 📱 **Fully Responsive UI** | Modern glassmorphism design with animated gradients, works on desktop and mobile |
| 🌍 **GPS Location Support** | Use device geolocation to auto-detect your coordinates |

---

## 🖼️ Demo Screenshots

> Run the application locally to see the full interactive UI with animated gradients, glassmorphism cards, and smooth transitions.

---

## ⚙️ How It Works

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Frontend   │────▶│  Express Server  │────▶│   Open-Meteo API    │
│  (HTML/JS)   │◀────│   (Node.js)      │◀────│  (Weather + Geo)    │
└──────────────┘     └────────┬─────────┘     └─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Prediction Engine  │
                    │   (v3 Algorithm)   │
                    │                    │
                    │ • Gaussian Scoring │
                    │ • Cross-Factor     │
                    │   Interactions     │
                    │ • Climate Zone     │
                    │   Adjustment       │
                    │ • Soil Fertility   │
                    │   Modifiers        │
                    └────────────────────┘
```

1. **User inputs** location, crop, season, soil type, and farm area.
2. **Server fetches** real-time weather + 10 years of historical seasonal data from Open-Meteo.
3. **Prediction Engine** scores six factors using Gaussian curves and cross-factor interactions.
4. **Results** are displayed with yield estimates, revenue projections, charts, and recommendations.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Node.js + Express.js | REST API server, weather data proxy |
| **Frontend** | Vanilla HTML/CSS/JavaScript | Single-page application with glassmorphism UI |
| **Charts** | Chart.js 4.x | Interactive data visualization |
| **Icons** | Lucide Icons | Modern icon set |
| **Typography** | Google Fonts (Inter) | Clean, professional typography |
| **Weather API** | Open-Meteo | Real-time + historical weather data (free, no API key) |
| **Geocoding** | Open-Meteo Geocoding | City name to coordinates conversion |

---

## 📁 Project Structure

```
CropSense/
├── server.js                      # Express server & API routes
├── package.json                   # Dependencies & scripts
│
├── data/
│   ├── crops.js                   # Crop database (20 crops, agronomic params)
│   └── prices.js                  # Market prices & MSP data (INR)
│
├── services/
│   ├── predictionEngine.js        # v3 multi-factor prediction algorithm
│   └── weatherService.js          # Open-Meteo API integration
│
└── public/
    ├── index.html                 # Single-page frontend
    ├── css/
    │   └── styles.css             # Complete stylesheet (glassmorphism, animations)
    └── js/
        └── app.js                 # Frontend application logic
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cropsense.git
cd cropsense

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

### Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm run dev` | Start with auto-reload on file changes (`--watch` mode) |

> **Note:** No API keys are required. CropSense uses the [Open-Meteo](https://open-meteo.com/) free weather API.

---

## 📡 API Reference

All endpoints are served from `http://localhost:3000`.

### `GET /api/crops`
Returns the list of all 20 supported crops with their agronomic metadata.

### `GET /api/geocode?city=CityName`
Geocodes a city name to latitude/longitude coordinates.

| Parameter | Type | Description |
|---|---|---|
| `city` | `string` | City name (e.g., "New Delhi", "Mumbai") |

### `GET /api/weather?lat=XX&lon=YY`
Fetches current weather conditions and a 7-day forecast.

| Parameter | Type | Description |
|---|---|---|
| `lat` | `number` | Latitude |
| `lon` | `number` | Longitude |

### `GET /api/weather/historical?lat=XX&lon=YY&start=YYYY-MM-DD&end=YYYY-MM-DD`
Fetches historical weather data for a specified date range.

### `POST /api/predict`
Runs the yield prediction algorithm for a single crop.

**Request Body:**
```json
{
  "cropId": "wheat",
  "lat": 28.6139,
  "lon": 77.2090,
  "season": "Rabi",
  "soilType": "Alluvial",
  "area": 5
}
```

**Response:** Yield prediction with factor scores, confidence, revenue estimates, and recommendations.

### `POST /api/compare`
Compares yield predictions for multiple crops simultaneously.

**Request Body:**
```json
{
  "cropIds": ["wheat", "rice", "maize"],
  "lat": 28.6139,
  "lon": 77.2090,
  "season": "Rabi",
  "soilType": "Loamy",
  "area": 5
}
```

### `POST /api/best-crop`
Evaluates all 20 crops and ranks them by suitability for the given conditions.

**Request Body:**
```json
{
  "lat": 28.6139,
  "lon": 77.2090,
  "season": "Kharif",
  "soilType": "Alluvial",
  "area": 5
}
```

### `GET /api/prices`
Returns current MSP and market prices for all crops (INR per quintal).

---

## 🌿 Supported Crops

CropSense supports **20 crops** across all major Indian growing seasons:

| # | Crop | Season | Base Yield (t/ha) | Water Need (mm) |
|---|---|---|---|---|
| 1 | 🌾 Wheat | Rabi | 3.5 | 400–650 |
| 2 | 🍚 Rice (Paddy) | Kharif | 4.0 | 1000–2000 |
| 3 | 🌽 Maize (Corn) | Kharif, Rabi | 3.2 | 500–800 |
| 4 | 🎍 Sugarcane | Kharif, Zaid, Annual | 70.0 | 1500–2500 |
| 5 | ☁️ Cotton | Kharif | 1.8 | 700–1300 |
| 6 | 🫘 Soybean | Kharif | 2.0 | 450–700 |
| 7 | 🌿 Barley | Rabi | 2.8 | 350–550 |
| 8 | 🥔 Potato | Rabi | 22.0 | 500–700 |
| 9 | 🍅 Tomato | Rabi, Kharif | 25.0 | 400–600 |
| 10 | 🥜 Groundnut (Peanut) | Kharif | 1.8 | 500–700 |
| 11 | 🌼 Mustard | Rabi | 1.4 | 250–450 |
| 12 | 🫛 Chickpea (Gram) | Rabi | 1.1 | 300–500 |
| 13 | 🧅 Onion | Rabi, Kharif, Zaid | 18.0 | 350–550 |
| 14 | 🟤 Pearl Millet (Bajra) | Kharif, Zaid | 1.5 | 250–500 |
| 15 | 🟫 Finger Millet (Ragi) | Kharif | 1.8 | 350–600 |
| 16 | 🧶 Jute | Kharif | 2.5 | 1000–1500 |
| 17 | 🌻 Sunflower | Kharif, Rabi, Zaid | 1.2 | 400–650 |
| 18 | 🔴 Lentil (Masoor) | Rabi | 1.0 | 250–400 |
| 19 | 🍌 Banana | Kharif, Annual | 35.0 | 1200–2000 |
| 20 | 🥭 Mango | Annual, Perennial | 8.0 | 800–1500 |

### Supported Growing Seasons

| Season | Period | Description |
|---|---|---|
| **Kharif** | June – October | Monsoon season, warm and humid |
| **Rabi** | October – March | Winter season, cool and dry |
| **Zaid** | March – June | Short summer season |
| **Annual** | Year-round | Long-duration crops (e.g., sugarcane) |
| **Perennial** | Ongoing | Orchard/plantation crops (e.g., mango) |

### Supported Soil Types

Alluvial · Black · Red · Laterite · Sandy Loam · Loamy · Clay · Clay Loam · Sandy · Peaty

---

## 🧮 Prediction Algorithm

CropSense uses a **v3 multi-factor prediction engine** with the following components:

### Factor Weights

| Factor | Weight | Scoring Method |
|---|---|---|
| 🌡️ Temperature Suitability | 28% | Gaussian bell curve with critical thresholds |
| 🌧️ Rainfall / Water Adequacy | 28% | Asymmetric scoring (drought vs. waterlog tolerance) |
| 💧 Humidity Suitability | 14% | Gaussian curve with disease risk adjustment |
| 📅 Season Compatibility | 14% | Preferred vs. adjacent vs. off-season scoring |
| 🪨 Soil Compatibility | 10% | Soil fertility + drainage + crop compatibility |
| ⚡ Cross-Factor Interactions | 6% | Heat stress, disease risk, waterlogging synergies |

### Advanced Features

- **Gaussian Scoring Curves**: Bell-curve responses instead of linear degradation for more realistic modeling.
- **Asymmetric Rainfall Scoring**: Water deficit hurts drought-sensitive crops more; excess hurts waterlog-sensitive crops more.
- **Critical Temperature Thresholds**: Absolute temperature limits where crop yield approaches zero.
- **Cross-Factor Interactions**: Models real agronomic interactions (e.g., high temperature × low humidity = drought stress).
- **Climate Zone Awareness**: Latitude-based adjustments — tropical crops perform better near the equator, temperate crops at higher latitudes.
- **Soil Fertility & Drainage Modifiers**: Soil characteristics affect final yield calculation beyond simple compatibility.

### Formula

```
Final Yield = baseYield × compositeScore × climateModifier × soilFertilityModifier × area

Where:
  compositeScore = Σ(factorScore × weight) adjusted by interaction modifier
  confidence     = dataQualityConfidence + conditionConfidence  (clamped 35–95%)
```

---

## 📚 Data Sources

| Data | Source |
|---|---|
| Real-time & historical weather | [Open-Meteo API](https://open-meteo.com/) |
| Crop agronomic parameters | FAO, ICAR, Indian Agricultural Statistics |
| MSP (Minimum Support Price) | Government of India, 2024–25 |
| Market prices | AGMARKNET, NAFED |
| Soil properties | Standard agronomic references |

---

## ⚠️ Disclaimer

CropSense provides **estimated** yield predictions based on weather data and agronomic heuristics. It is designed as an educational and decision-support tool and should **not** be used as the sole basis for agricultural or financial decisions. Actual yields depend on many additional factors including seed quality, fertilization, pest management, irrigation practices, and local microclimates.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ for smarter farming 🌾
</p>
