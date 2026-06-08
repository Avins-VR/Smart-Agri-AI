// src/context/FarmContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { mlApi } from "../services/api";
import { landsApi, fetchWeather, fetch14DayRain } from "../services/api";
import {
  CROP_VARIETIES, calculateCropAgeAndStage,
  calculateIrrigationNeed, computeHealthScore,
  getMoistureLabel
} from "../utils/farmLogic";

const FarmContext = createContext(null);
export const useFarm = () => useContext(FarmContext);

export function FarmProvider({ children }) {
  const { landId } = useParams();

  // ── Land config ─────────────────────────────────────────────────────────────
  const [land, setLand] = useState(() => {
    try { return JSON.parse(localStorage.getItem("selectedLand") || "null"); } catch { return null; }
  });

  const [crop,         setCrop]         = useState(land?.crop         || "Rice");
  const [variety,      setVariety]      = useState(land?.variety       || null);
  const [soil,         setSoil]         = useState(land?.soil          || "Loamy");
  const [acres,        setAcres]        = useState(land?.acres         || 31);
  const [plantingDate, setPlantingDate] = useState(land?.plantingDate  || (() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0];
  })());

  // Derived variety list
  const varietyOptions = CROP_VARIETIES[crop] || ["Default"];
  const selectedVariety = variety || varietyOptions[0];

  // ── Pest state ───────────────────────────────────────────────────────────────
  const [pestPrediction, setPestPrediction] = useState("Healthy");

  const [pestConfidence, setPestConfidence] = useState(0);

  const [pestImageUploaded, setPestImageUploaded] = useState(false);

  // ── Advisory cache ────────────────────────────────────────────────────────────
  const [advisoryCache,    setAdvisoryCache]    = useState(null);
  const [advisoryCacheKey, setAdvisoryCacheKey] = useState(null);
  const [advisoryGeneratedAt, setAdvisoryGeneratedAt] = useState(null);

  // ── Chat state ────────────────────────────────────────────────────────────────
  const [chatHistory,     setChatHistory]     = useState([]);
  const [mistralMessages, setMistralMessages] = useState([]);

  // ── Weather + moisture ────────────────────────────────────────────────────────
  const [weather,         setWeather]         = useState(null);
  const [moistureNumeric, setMoistureNumeric] = useState(45);
  const [weatherLoading,  setWeatherLoading]  = useState(true);
  const [weatherError,    setWeatherError]    = useState(null);

  // ── NPK (seeded per session) ──────────────────────────────────────────────────
  const [nLevel, setNLevel] = useState(0);
  const [pLevel, setPLevel] = useState(0);
  const [kLevel, setKLevel] = useState(0);
    // ── Crop age / stage ──────────────────────────────────────────────────────────
  const cropAgeInfo = (() => {
    try { return calculateCropAgeAndStage(plantingDate, selectedVariety); }
    catch { return calculateCropAgeAndStage(plantingDate, varietyOptions[0]); }
  })();
  useEffect(() => {
    async function predictMoisture() {
      if (!weather) return;

      try {
        console.log("Calling moisture API...");

        const res = await mlApi.soilMoisture({
          temp: weather.temp,
          humidity: weather.humidity,
          rain: weather.rain,
          sunlight: weather.sunlight,
          crop: crop,
          stage: cropAgeInfo.cropStage,
        });

        console.log("Moisture API Response:", res.data);

        if (res.data.success) {
          console.log("Setting moisture:", res.data.moisture);
          setMoistureNumeric(res.data.moisture);
        }
      } catch (err) {
        console.error("Moisture prediction failed:", err);
        console.error(err.response?.data);
      }
    }

    predictMoisture();
  }, [weather, crop, cropAgeInfo.cropStage]);

  useEffect(() => {
    async function predictNPK() {

      if (!weather || moistureNumeric <= 0) return;

      try {

        const res = await mlApi.npkPredict({

          temperature: weather.temp,

          humidity: weather.humidity,

          rainfall:
            weather.rain === "Yes"
              ? 10
              : 0,

          crop: crop,

          soil_type: soil,

          variety: selectedVariety,

          soil_moisture: moistureNumeric

        });

        if (res.data.success) {

          setNLevel(res.data.n);
          setPLevel(res.data.p);
          setKLevel(res.data.k);

        }

      } catch (err) {

        console.error(
          "NPK Prediction Failed",
          err
        );

      }
    }

    predictNPK();

  }, [
    weather,
    moistureNumeric,
    crop,
    soil,
    selectedVariety
  ]);
  // ── Fetch land from API if not in localStorage ─────────────────────────────
  useEffect(() => {
    if (!land && landId) {
      landsApi.getOne(landId).then(res => {
        const l = res.data.land;
        setLand(l);
        setCrop(l.crop || "Rice");
        setSoil(l.soil || "Loamy");
        setAcres(l.acres || 31);
        setPlantingDate(l.plantingDate || plantingDate);
        localStorage.setItem("selectedLand", JSON.stringify(l));
      }).catch(console.error);
    }
  }, [landId]);

  // ── Fetch weather ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setWeatherLoading(true);
    fetchWeather()
      .then(w => { setWeather(w); setWeatherLoading(false); })
      .catch(e => { setWeatherError(e.message); setWeatherLoading(false); });
  }, []);



  // ── Derived live data (mirrors get_live_data) ─────────────────────────────────
  const moistureLabel = getMoistureLabel(moistureNumeric);
  const pestDisplay   = pestPrediction === "Healthy" ? "Not Detected" : "Detected";
  const health        = weather
    ? computeHealthScore(pestPrediction, moistureNumeric, weather.temp, weather.humidity, nLevel, pLevel, kLevel)
    : 75;

  const irrRec = weather
    ? calculateIrrigationNeed(moistureNumeric, weather.rain, weather.temp, weather.humidity, selectedVariety, cropAgeInfo.cropStage)
    : { status:"OFF", reason:"Loading…", urgency:"Low", dailyReqMm:0, dailyUsageL:0, efficiency:0, nextTiming:"—" };

  const liveData = {
    moistureLabel, moistureNumeric,
    temp:     weather?.temp     ?? 28,
    humidity: weather?.humidity ?? 60,
    rain:     weather?.rain     ?? "No",
    sunlight: weather?.sunlight ?? "Moderate",
    cropStage: cropAgeInfo.cropStage,
    pest:     pestDisplay,
    pestPrediction,
    health,
    n: nLevel, p: pLevel, k: kLevel,
    weather,
  };

  const cropInfo = {
    crop, variety: selectedVariety, acres, soil,
    plantingDate, cropAgeDays: cropAgeInfo.cropAgeDays,
    estimatedHarvestDate: cropAgeInfo.estimatedHarvestDate,
    totalDuration: cropAgeInfo.totalDuration,
    irrStatus:    irrRec.status,
    dailyReqMm:   irrRec.dailyReqMm,
  };

  // ── When crop changes, reset variety ─────────────────────────────────────────
  const handleCropChange = useCallback((c) => {
    setCrop(c);
    setVariety(CROP_VARIETIES[c]?.[0] || null);
  }, []);

  const value = {
    // land config
    land, crop, variety: selectedVariety, varietyOptions, soil, acres, plantingDate,
    setCrop: handleCropChange, setVariety, setSoil, setAcres, setPlantingDate,

    // live data
    liveData, cropInfo, cropAgeInfo, irrRec,
    weatherLoading, weatherError,

    // pest
    pestPrediction, setPestPrediction,
    pestConfidence, setPestConfidence,
    pestImageUploaded, setPestImageUploaded,

    // advisory
    advisoryCache, setAdvisoryCache,
    advisoryCacheKey, setAdvisoryCacheKey,
    advisoryGeneratedAt, setAdvisoryGeneratedAt,

    // chat
    chatHistory, setChatHistory,
    mistralMessages, setMistralMessages,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}