// src/services/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL;
const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const MISTRAL_URL  = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_KEY  = "9jh2jbbzvPbUtJT73tuQIxcEAOPdBuKr";

const authHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("agri_token") ||
    sessionStorage.getItem("agri_token") || ""
  }`,
});

// ── Land CRUD ─────────────────────────────────────────────────────────────────
export const landsApi = {
  getAll:  ()          => axios.get (`${BASE}/lands`,       { headers: authHeaders() }),
  getOne:  (id)        => axios.get (`${BASE}/lands/${id}`, { headers: authHeaders() }),
  create:  (payload)   => axios.post(`${BASE}/lands`,       payload, { headers: authHeaders() }),
  update:  (id, data)  => axios.put (`${BASE}/lands/${id}`, data,    { headers: authHeaders() }),
  remove:  (id)        => axios.delete(`${BASE}/lands/${id}`,        { headers: authHeaders() }),
};

// ── Weather — exact same Open-Meteo URL as app.py ─────────────────────────────
export async function fetchWeather() {
  const url =
    `${WEATHER_BASE}?latitude=13.08&longitude=80.27` +
    `&hourly=temperature_2m,relativehumidity_2m,precipitation,shortwave_radiation` +
    `&timezone=Asia/Kolkata`;
  const res  = await axios.get(url, { timeout: 15000 });
  const hourly = res.data.hourly;
  const idx    = hourly.temperature_2m.length - 1;
  return {
    temp:     Math.round(parseFloat(hourly.temperature_2m[idx])    * 10) / 10,
    humidity: parseInt (hourly.relativehumidity_2m[idx]),
    rain:     hourly.precipitation[idx] > 0 ? "Yes" : "No",
    sunlight: hourly.shortwave_radiation[idx] < 200 ? "Low"
            : hourly.shortwave_radiation[idx] <= 600 ? "Moderate" : "High",
  };
}

// ── 7-day temperature ─────────────────────────────────────────────────────────
export async function fetch7DayTemp() {
  const today = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
  const url   =
    `${WEATHER_BASE}?latitude=13.08&longitude=80.27` +
    `&daily=temperature_2m_max&start_date=${start}&end_date=${today}&timezone=auto`;
  const res  = await axios.get(url, { timeout: 15000 });
  return res.data.daily.time.map((d, i) => ({
    date: new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric" }),
    "Temp °C": res.data.daily.temperature_2m_max[i],
  }));
}

// ── 14-day rain ───────────────────────────────────────────────────────────────
export async function fetch14DayRain() {
  const today = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0];
  const url   =
    `${WEATHER_BASE}?latitude=13.08&longitude=80.27` +
    `&daily=precipitation_sum&start_date=${start}&end_date=${today}&timezone=auto`;
  const res = await axios.get(url, { timeout: 15000 });
  return res.data.daily.time.map((d, i) => {
    const mm = res.data.daily.precipitation_sum[i] ?? 0;
    return {
      date:       new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      "Rain (mm)": Math.round(mm * 10) / 10,
      event:      mm > 0 ? "Rain" : "Clear",
    };
  });
}

export async function fetchIrrigationHistory(payload) {

  const res = await fetch(
    `${BASE}/ml/irrigation-history`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  return await res.json();
}

export async function fetch14DayWeather() {

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const start = new Date();

  start.setDate(yesterday.getDate() - 13);

  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=13.0827` +
    `&longitude=80.2707` +
    `&start_date=${start.toISOString().split("T")[0]}` +
    `&end_date=${yesterday.toISOString().split("T")[0]}` +
    `&daily=temperature_2m_max,precipitation_sum,relative_humidity_2m_mean,sunshine_duration` +
    `&timezone=auto`;

  const res = await axios.get(url);

  return res.data.daily.time.map((date, i) => ({

    date,

    temp:
      res.data.daily.temperature_2m_max[i],

    humidity:
      res.data.daily.relative_humidity_2m_mean[i],

    rain:
      res.data.daily.precipitation_sum[i] > 0
        ? "Yes"
        : "No",

    sunlight:
      res.data.daily.sunshine_duration[i] > 25000
        ? "High"
        : res.data.daily.sunshine_duration[i] > 12000
        ? "Moderate"
        : "Low"

  }));
}

// ── Flask ML proxy (soil moisture + pest) ────────────────────────────────────
export const mlApi = {
  soilMoisture: (payload) =>
    axios.post(`${BASE}/ml/soil-moisture`, payload, { headers: authHeaders() }),
  soilMoistureHistory: (payload) =>
    axios.post(
      `${BASE}/ml/soil-moisture-history`,
      payload,
      { headers: authHeaders() }
    ),
  npkPredict: (payload) =>
    axios.post(
      `${BASE}/ml/npk-predict`,
      payload,
      { headers: authHeaders() }
    ),
  npkHistory: (payload) =>
    axios.post(
      `${BASE}/ml/npk-history`,
      payload,
      { headers: authHeaders() }
    ),
  pestPredict: (formData) =>
    axios.post(`${BASE}/ml/pest-predict`, formData, {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    }),

  healthHistory: (payload) =>
    axios.post(
      `${BASE}/ml/health-history`,
      payload,
      { headers: authHeaders() }
    ),
};

// ── Mistral AI ────────────────────────────────────────────────────────────────
export async function callMistral(messages) {
  const res = await axios.post(
    MISTRAL_URL,
    { model: "mistral-small", temperature: 0.3, max_tokens: 250, messages },
    { headers: { Authorization: `Bearer ${MISTRAL_KEY}`, "Content-Type": "application/json" } }
  );
  return res.data.choices[0].message.content;
}

export async function checkAgricultureTopic(question) {
  try {
    const result = await callMistral([
      {
        role: "user",
        content: `
You are a strict topic classifier.

Reply with EXACTLY one word:
YES
or
NO

A question is AGRICULTURE RELATED if it involves:

- Crops
- Farming
- Farmers
- Soil
- Fertilizers
- NPK
- Irrigation
- Water management
- Moisture
- Weather impact on crops
- Plant diseases
- Pest control
- Harvesting
- Yield
- Greenhouse farming
- Hydroponics
- Organic farming
- Livestock
- Dairy farming
- Poultry farming
- Agricultural machinery
- Any crop name

Examples:

Rice cultivation → YES
Sugarcane irrigation → YES
Wheat moisture requirement → YES
Tomato disease control → YES
Best fertilizer for cotton → YES
Goat farming → YES
Poultry feed management → YES

Python programming → NO
Java coding → NO
Movie recommendation → NO
IPL score → NO
Mobile phones → NO

Question:
${question}

Reply ONLY YES or NO.
`
      }
    ]);

    return result.trim().toUpperCase().startsWith("YES");
  } catch {
    return true;
  }
}

export function buildFarmContext(liveData, cropInfo) {
  return `You are Smart Agri AI, an expert agriculture assistant integrated into a real-time smart farm monitoring system.

Current live farm sensor data:
- Crop Category: ${cropInfo.crop} | Variety: ${cropInfo.variety} | Farm size: ${cropInfo.acres} acres | Location: Tamil Nadu, India
- Planting Date: ${cropInfo.plantingDate} | Crop Age: ${cropInfo.cropAgeDays} days | Crop Stage: ${liveData.cropStage}
- Estimated Harvest: ${cropInfo.estimatedHarvestDate} | Total Duration: ${cropInfo.totalDuration} days
- Soil Moisture: ${liveData.moistureLabel} (${liveData.moistureNumeric}%)
- Temperature: ${liveData.temp}°C | Humidity: ${liveData.humidity}%
- Rain: ${liveData.rain} | Sunlight: ${liveData.sunlight}
- Pest Detection: ${liveData.pest} | Crop Health Score: ${liveData.health}/100
- Nitrogen (N): ${liveData.n}% | Phosphorus (P): ${liveData.p}% | Potassium (K): ${liveData.k}%
- Irrigation Status: ${cropInfo.irrStatus} | Daily Water Req: ${cropInfo.dailyReqMm} mm/day

Use this farm data ONLY when the user's question is related to their current farm.

IMPORTANT RULES:

1. Answer ANY agriculture-related question.

2. If the user asks about another crop
(Rice, Wheat, Sugarcane, Cotton, Tomato, Paddy, etc.),
answer specifically for that crop.

3. Do NOT force answers to be about ${cropInfo.crop}.

4. Use current farm sensor data ONLY when relevant.

5. Reject only non-agriculture questions.

6. Agriculture includes:
   - Crops
   - Farming
   - Soil
   - Fertilizers
   - Irrigation
   - Plant Diseases
   - Pest Control
   - Weather Impact on Farming
   - Greenhouse Farming
   - Hydroponics
   - Organic Farming
   - Agricultural Machinery
   - Livestock
   - Dairy Farming
   - Poultry Farming

Use bullet points when needed.
Give practical farmer-friendly advice.`;
}

export function buildAdvisoryPrompt(liveData, cropInfo, pestConfidence) {
  return `You are Smart Agri AI Advisor.

Analyze the realtime farm intelligence data and generate a short professional agriculture advisory.

REALTIME FARM DATA:
CROP:
- Crop: ${cropInfo.crop} | Variety: ${cropInfo.variety} | Farm Size: ${cropInfo.acres} acres
- Crop Age: ${cropInfo.cropAgeDays} days | Crop Stage: ${liveData.cropStage} | Est. Harvest: ${cropInfo.estimatedHarvestDate}

WEATHER:
- Temperature: ${liveData.temp}°C | Humidity: ${liveData.humidity}% | Rain: ${liveData.rain} | Sunlight: ${liveData.sunlight}

SOIL & HEALTH:
- Soil Moisture: ${liveData.moistureNumeric}% (${liveData.moistureLabel}) | Health Score: ${liveData.health}/100

PEST ANALYSIS:
- Pest Detection: ${liveData.pest} | Pest Model Result: ${liveData.pestPrediction} | Confidence: ${pestConfidence}%

NPK ANALYSIS:
- N: ${liveData.n}% | P: ${liveData.p}% | K: ${liveData.k}%

IRRIGATION:
- Status: ${cropInfo.irrStatus} | Daily Req: ${cropInfo.dailyReqMm} mm/day

Generate EXACTLY these sections:
[IRRIGATION] 2-line irrigation advice.
[FERTILIZER] 2-line fertilizer recommendation.
[PEST & DISEASE] 2-line pest recommendation.
[SOIL HEALTH] 2-line soil analysis.
[WEEKLY ACTION] 2-line weekly action plan.
[YIELD INSIGHT] 2-line yield improvement suggestion.

RULES: Under 2 lines each. No bullet points. Farmer-friendly. Actionable.`;
}

export function parseAdvisorySections(rawText) {
  const meta = {
    "IRRIGATION":    { icon: "irrigation",  display: "Irrigation Advisory" },
    "FERTILIZER":    { icon: "fertilizer",  display: "Fertilizer Recommendation" },
    "PEST & DISEASE":{ icon: "pest",        display: "Pest & Disease Management" },
    "SOIL HEALTH":   { icon: "soil",        display: "Soil Health Analysis" },
    "WEEKLY ACTION": { icon: "weekly",      display: "Weekly Action Plan" },
    "YIELD INSIGHT": { icon: "yield",       display: "Yield Optimization Insight" },
  };
  const sections = [];
  let currentKey = null;
  let lines = [];
  for (const line of rawText.split("\n")) {
    const stripped = line.trim();
    if (stripped.startsWith("[") && stripped.endsWith("]")) {
      if (currentKey && lines.length) {
        const m = meta[currentKey] || { icon: "info", display: currentKey };
        sections.push({ icon: m.icon, title: m.display, body: lines.join("\n").trim() });
      }
      currentKey = stripped.slice(1, -1).trim();
      lines = [];
    } else if (currentKey && stripped) {
      lines.push(stripped);
    }
  }
  if (currentKey && lines.length) {
    const m = meta[currentKey] || { icon: "info", display: currentKey };
    sections.push({ icon: m.icon, title: m.display, body: lines.join("\n").trim() });
  }
  return sections;
}