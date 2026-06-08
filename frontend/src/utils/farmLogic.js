// src/utils/farmLogic.js
// ─── Exact port of every calculation in app.py ───────────────────────────────

export const CROP_VARIETIES = {
  Rice:      ["Basmati", "Ponni", "IR64", "Sona Masuri", "ADT-43"],
  Maize:     ["Sweet Corn", "Hybrid Maize", "Dent Corn", "Flint Corn"],
  Wheat:     ["Durum", "Emmer", "Bread Wheat"],
  Sugarcane: ["Co 86032", "Co 0238"],
  Cotton:    ["Bt Cotton", "Hybrid Cotton"],
  Tomato:    ["Cherry Tomato", "Roma Tomato", "Hybrid Tomato"],
  Paddy:     ["White Paddy", "Red Paddy"],
};

export const SOIL_TYPES = ["Clay","Sandy","Loamy","Silt","Peaty","Saline"];

export const VARIETY_LIFECYCLE = {
  "Basmati":       { Seedling:20, Vegetative:50, Flowering:30, Fruiting:35, Harvest:15 },
  "Ponni":         { Seedling:18, Vegetative:55, Flowering:25, Fruiting:32, Harvest:15 },
  "IR64":          { Seedling:15, Vegetative:40, Flowering:20, Fruiting:25, Harvest:10 },
  "Sona Masuri":   { Seedling:18, Vegetative:50, Flowering:25, Fruiting:30, Harvest:12 },
  "ADT-43":        { Seedling:15, Vegetative:38, Flowering:18, Fruiting:25, Harvest:10 },
  "Sweet Corn":    { Seedling:10, Vegetative:30, Flowering:15, Fruiting:20, Harvest:10 },
  "Hybrid Maize":  { Seedling:12, Vegetative:35, Flowering:18, Fruiting:25, Harvest:10 },
  "Dent Corn":     { Seedling:10, Vegetative:32, Flowering:15, Fruiting:22, Harvest:10 },
  "Flint Corn":    { Seedling:10, Vegetative:30, Flowering:15, Fruiting:20, Harvest:8  },
  "Durum":         { Seedling:12, Vegetative:35, Flowering:18, Fruiting:25, Harvest:10 },
  "Emmer":         { Seedling:15, Vegetative:40, Flowering:20, Fruiting:28, Harvest:12 },
  "Bread Wheat":   { Seedling:12, Vegetative:35, Flowering:18, Fruiting:25, Harvest:10 },
  "Co 86032":      { Seedling:25, Vegetative:120,Flowering:45, Fruiting:120,Harvest:30 },
  "Co 0238":       { Seedling:22, Vegetative:110,Flowering:40, Fruiting:110,Harvest:25 },
  "Bt Cotton":     { Seedling:18, Vegetative:50, Flowering:30, Fruiting:45, Harvest:20 },
  "Hybrid Cotton": { Seedling:20, Vegetative:55, Flowering:35, Fruiting:50, Harvest:20 },
  "Cherry Tomato": { Seedling:12, Vegetative:28, Flowering:18, Fruiting:30, Harvest:12 },
  "Roma Tomato":   { Seedling:14, Vegetative:30, Flowering:20, Fruiting:32, Harvest:14 },
  "Hybrid Tomato": { Seedling:15, Vegetative:35, Flowering:22, Fruiting:35, Harvest:15 },
  "White Paddy":   { Seedling:18, Vegetative:50, Flowering:25, Fruiting:30, Harvest:15 },
  "Red Paddy":     { Seedling:20, Vegetative:55, Flowering:30, Fruiting:35, Harvest:15 },
};

export const VARIETY_WATER_REQ = {
  "Basmati":6.0,"Ponni":7.5,"IR64":7.0,"Sona Masuri":6.5,"ADT-43":7.2,
  "Sweet Corn":5.5,"Hybrid Maize":5.0,"Dent Corn":4.8,"Flint Corn":4.5,
  "Durum":4.0,"Emmer":3.8,"Bread Wheat":4.2,
  "Co 86032":8.5,"Co 0238":8.0,
  "Bt Cotton":5.5,"Hybrid Cotton":5.0,
  "Cherry Tomato":4.5,"Roma Tomato":5.0,"Hybrid Tomato":5.5,
  "White Paddy":7.5,"Red Paddy":7.0,
};

// ── compute_health_score — exact same weights as app.py ──────────────────────
export function computeHealthScore(pestPrediction, moistureNumeric, temp, humidity, n, p, k) {
  const classificationScore = pestPrediction === "Healthy" ? 100 : 25;

  let moistureScore;
  if (moistureNumeric >= 40 && moistureNumeric <= 70) moistureScore = 100;
  else if ((moistureNumeric >= 30 && moistureNumeric < 40) || (moistureNumeric >= 71 && moistureNumeric <= 80)) moistureScore = 70;
  else moistureScore = 40;

  let tempScore;
  if (temp >= 25 && temp <= 32) tempScore = 100;
  else if ((temp >= 20 && temp < 25) || (temp >= 33 && temp <= 36)) tempScore = 70;
  else tempScore = 40;

  let humidityScore;
  if (humidity >= 50 && humidity <= 75) humidityScore = 100;
  else if ((humidity >= 40 && humidity < 50) || (humidity >= 76 && humidity <= 85)) humidityScore = 70;
  else humidityScore = 40;

  const avgNpk = (n + p + k) / 3;
  let npkScore;
  if (avgNpk >= 55 && avgNpk <= 75) npkScore = 100;
  else if ((avgNpk >= 40 && avgNpk < 55) || (avgNpk >= 76 && avgNpk <= 85)) npkScore = 70;
  else npkScore = 40;

  return Math.round(
    classificationScore * 0.50 +
    moistureScore       * 0.15 +
    tempScore           * 0.10 +
    humidityScore       * 0.10 +
    npkScore            * 0.15
  );
}

// ── get_health_status ─────────────────────────────────────────────────────────
export function getHealthStatus(score) {
  if (score >= 85) return { label: "Excellent", color: "#61ba6a", badge: "green" };
  if (score >= 70) return { label: "Good",      color: "#61ba6a", badge: "green" };
  if (score >= 50) return { label: "Moderate",  color: "#f5c842", badge: "yellow" };
  if (score >= 30) return { label: "Risk",       color: "#f5c842", badge: "yellow" };
  return              { label: "Critical",  color: "#fa5d5d", badge: "red" };
}

// ── calculate_crop_age_and_stage ──────────────────────────────────────────────
export function calculateCropAgeAndStage(plantingDateStr, variety) {
  const stages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"];
  const lifecycle = VARIETY_LIFECYCLE[variety];
  if (!lifecycle) throw new Error(`Lifecycle not defined for variety: ${variety}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const planted = new Date(plantingDateStr);
  planted.setHours(0, 0, 0, 0);
  const cropAgeDays = Math.max(0, Math.floor((today - planted) / 86400000));

  const totalDuration = stages.reduce((s, st) => s + lifecycle[st], 0);
  const estimatedHarvestDate = new Date(planted);
  estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + totalDuration);

  let elapsed = 0;
  let currentStage = "Harvest";
  let daysInCurrentStage = 0;
  let daysToNextStage = 0;
  let nextStage = "—";

  for (let i = 0; i < stages.length; i++) {
    const stageDur = lifecycle[stages[i]];
    if (cropAgeDays < elapsed + stageDur) {
      currentStage = stages[i];
      daysInCurrentStage = cropAgeDays - elapsed;
      daysToNextStage = stageDur - daysInCurrentStage;
      nextStage = stages[i + 1] || "—";
      break;
    }
    elapsed += stageDur;
  }

  const stageDur = lifecycle[currentStage] || 1;
  const stageProgressPct = Math.min(100, (daysInCurrentStage / stageDur) * 100);

  return {
    cropAgeDays,
    cropStage: currentStage,
    daysInCurrentStage,
    daysToNextStage,
    nextStage,
    totalDuration,
    estimatedHarvestDate: estimatedHarvestDate.toISOString().split("T")[0],
    stageProgressPct,
    lifecycle,
  };
}

// ── calculate_irrigation_need — exact same formula ────────────────────────────
export function calculateIrrigationNeed(moistureNumeric, rain, temp, humidity, variety, cropStage) {
  const baseReq = VARIETY_WATER_REQ[variety] ?? 5.5;
  const stageMult = { Seedling:0.6, Vegetative:1.0, Flowering:1.2, Fruiting:1.1, Harvest:0.4 }[cropStage] ?? 1.0;
  const tempAdj = 1.0 + Math.max(0, (temp - 28) * 0.03);
  const humAdj  = 1.0 - Math.max(0, (humidity - 60) * 0.005);
  const dailyReqMm = Math.round(baseReq * stageMult * tempAdj * humAdj * 10) / 10;

  let status, reason, urgency;
  if (rain === "Yes") {
    status="OFF"; reason="Rain provides sufficient water today"; urgency="Low";
  } else if (moistureNumeric < 30) {
    status="ON";  reason="Critical: Soil is very dry — irrigate immediately"; urgency="Critical";
  } else if (moistureNumeric < 45) {
    status="ON";  reason="Soil moisture below threshold — irrigation needed"; urgency="High";
  } else if (moistureNumeric < 60) {
    status="ON";  reason="Scheduled irrigation to maintain optimal moisture"; urgency="Medium";
  } else {
    status="OFF"; reason="Soil moisture is sufficient — skip irrigation"; urgency="Low";
  }

  let efficiency;
  if (moistureNumeric >= 40 && moistureNumeric <= 70)
    efficiency = Math.min(100, 75 + (100 - temp) * 0.5);
  else if (moistureNumeric < 40)
    efficiency = Math.max(40, moistureNumeric * 1.2);
  else
    efficiency = Math.max(50, 100 - (moistureNumeric - 70) * 2);
  efficiency = Math.round(efficiency * 10) / 10;

  let nextTiming;
  if (status === "OFF")
    nextTiming = rain === "No" ? "Tomorrow morning 6:00 AM" : "Day after tomorrow";
  else if (urgency === "Critical")
    nextTiming = "Immediately";
  else
    nextTiming = "Today evening 5:00 PM";

  const dailyUsageL = Math.round(dailyReqMm * 4046 / 1000);

  return { status, reason, urgency, dailyReqMm, dailyUsageL, efficiency, nextTiming };
}

// ── generate_time_series (mirrors Streamlit helper) ──────────────────────────
export function generateTimeSeries(days = 14, base = 50, noise = 15, label = "Value") {
  const result = [];
  for (let i = days; i > 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const val = Math.max(0, Math.min(100,
      base + noise * Math.sin(i / 2) + (Math.random() - 0.5) * noise
    ));
    result.push({ date: d.toLocaleDateString("en-US", { month:"short", day:"numeric" }), [label]: Math.round(val * 10) / 10 });
  }
  return result;
}

// ── Moisture label ────────────────────────────────────────────────────────────
export function getMoistureLabel(val) {
  if (val < 30)  return "Dry";
  if (val <= 70) return "Optimal";
  return "Wet";
}

// ── NPK seed (deterministic per session, matching app.py logic) ───────────────
let _npkSeed = null;
export function getSessionNpk() {
  if (_npkSeed === null) _npkSeed = Math.floor(Math.random() * 10000);
  // Simple seeded PRNG (same distribution as app.py rng.integers)
  const rng = (seed, lo, hi) => lo + ((seed * 1664525 + 1013904223) & 0x7fffffff) % (hi - lo);
  return {
    n: rng(_npkSeed,       20, 90),
    p: rng(_npkSeed + 1,   30, 85),
    k: rng(_npkSeed + 2,   25, 80),
  };
}

// ── Stage advisory text (from app.py) ────────────────────────────────────────
export const STAGE_ACTIONS = {
  Seedling:   "Maintain soil moisture. Avoid waterlogging. Protect from birds.",
  Vegetative: "Apply nitrogen-rich fertilizer. Monitor leaf growth. Weed control.",
  Flowering:  "Reduce nitrogen. Add phosphorus. Watch for pests. Avoid water stress.",
  Fruiting:   "Increase potassium. Ensure consistent watering. Check fruit load.",
  Harvest:    "Crop is ready! Schedule harvest team. Reduce irrigation.",
};