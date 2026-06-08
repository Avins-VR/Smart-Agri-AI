// src/pages/DashboardHome.jsx
import { useState, useEffect } from "react";
import { useFarm } from "../context/FarmContext";
import {
  FaTint, FaTemperatureHigh, FaCloudRain, FaSun,
  FaSeedling, FaHeartbeat, FaBug, FaWater, FaBell,
  FaChartLine,
} from "react-icons/fa";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import MetricCard        from "../components/MetricCard";
import Badge, { moistureBadge, tempBadge, pestBadge, sunlightBadge, stageBadge } from "../components/Badge";
import SectionHead       from "../components/SectionHead";
import AlertCard         from "../components/AlertCard";
import LoadingSpinner    from "../components/LoadingSpinner";
import PestUpload        from "../components/PestUpload";
import ChatBot           from "../components/ChatBot";
import LocationMap       from "../components/LocationMap";
import HealthGauge       from "../components/HealthGauge";
import { getHealthStatus, generateTimeSeries } from "../utils/farmLogic";
import {fetch7DayTemp,fetch14DayWeather,mlApi} from "../services/api";

const GreenTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:11 }}>
      <p style={{ color:"#4a7a42",marginBottom:3 }}>{label}</p>
      <p style={{ color:"#c8e8b2",fontWeight:700 }}>{payload[0]?.value?.toFixed(1)}</p>
    </div>
  );
};

export default function DashboardHome() {
  const { liveData, cropInfo, cropAgeInfo, irrRec, weatherLoading } = useFarm();
  const [sevenDayTemp, setSevenDayTemp] = useState([]);
  const [moistureSeries, setMoistureSeries] = useState([]);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);
  const healthSeries   = generateTimeSeries(7, liveData.health, 8, "Health");

  useEffect(() => {
    fetch7DayTemp().then(setSevenDayTemp).catch(() => setSevenDayTemp(generateTimeSeries(7, liveData.temp, 3, "Temp °C")));
  }, []);
  useEffect(() => {

    async function loadMoistureHistory() {

      try {

        const weatherHistory =
          await fetch14DayWeather();

        const last7Days =
          weatherHistory.slice(-7);

        const res =
          await mlApi.soilMoistureHistory({

            weather_history: last7Days,

            crop: cropInfo.crop,

            variety: cropInfo.variety,

            planting_date: cropInfo.plantingDate

          });

        if (res.data.success) {

          setMoistureSeries(

            res.data.history.map(day => ({
              date: new Date(day.date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric"
                }
              ),

              "Moisture %": day.moisture

            }))

          );
        }

      } catch (err) {

        console.error(
          "Dashboard Moisture History Error",
          err
        );

      }
    }

    loadMoistureHistory();

  }, [
    cropInfo.crop,
    cropInfo.variety,
    cropInfo.plantingDate
  ]);

  if (weatherLoading) return <LoadingSpinner text="Syncing live farm data…" />;

  const hs = getHealthStatus(liveData.health);

  // Smart alerts (exact same logic as app.py)
  const alerts = [];
  if (liveData.moistureLabel === "Dry")    alerts.push(["warn",   "Soil is DRY — Activate irrigation immediately."]);
  if (liveData.moistureLabel === "Wet")    alerts.push(["info",   "Soil is WET — Pause irrigation to prevent waterlogging."]);
  if (liveData.rain === "Yes")             alerts.push(["info",   "Rain today — Irrigation not required."]);
  if (liveData.temp > 34)                  alerts.push(["danger", "High temperature alert! Deploy shade nets above crop canopy."]);
  if (liveData.pest === "Detected")        alerts.push(["danger", "Pest/Disease detected — Apply targeted pesticide immediately."]);
  if (liveData.n < 40)                     alerts.push(["warn",   "Nitrogen deficiency — Apply urea fertilizer @ 25 kg/acre."]);
  if (liveData.p < 40)                     alerts.push(["warn",   "Phosphorus low — Apply DAP (Di-Ammonium Phosphate)."]);
  if (liveData.health < 65)               alerts.push(["warn",   "Crop health declining — Schedule field inspection."]);
  if (irrRec.urgency === "Critical")       alerts.push(["danger", `CRITICAL: Irrigation needed immediately for ${cropInfo.variety}!`]);
  else if (irrRec.urgency === "High")      alerts.push(["warn",   `Irrigation required for ${cropInfo.variety} · ${irrRec.reason}`]);
  if (cropAgeInfo.daysToNextStage <= 5 && cropAgeInfo.nextStage !== "—")
    alerts.push(["info", `Crop entering ${cropAgeInfo.nextStage} stage in ${cropAgeInfo.daysToNextStage} days — prepare accordingly.`]);
  if (!alerts.length)                      alerts.push(["ok",     "All systems nominal. Farm conditions are optimal."]);

  // Irrigation summary (same logic as app.py dashboard section)
  const irrActivated = irrRec.status === "ON";
  const irrDuration  = irrActivated ? Math.max(20, Math.min(90, 20 + (50 - liveData.moistureNumeric))) : 0;
  const irrVolume    = Math.round(irrDuration * 2.3 * 10) / 10;

  return (
    <div
      style={{
        animation:"slideUp 0.4s ease",
        width:"100%",
        maxWidth:"100%",
        overflowX:"hidden"
      }}
    >
      {/* Hero */}
      <div
        style={{
          marginBottom:24,
          paddingTop:isMobile ? "10px" : 0
        }}
      >
        <h1 style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:"1.8rem",color:"#61ba6a",letterSpacing:"-0.01em",margin:"0 0 4px" }}>
          Farm Overview
        </h1>
        <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.72rem",color:"#3a6633",letterSpacing:"0.05em" }}>
          LIVE · {cropInfo.crop} · {cropInfo.variety} · {cropInfo.acres} acres · Age: {cropAgeInfo.cropAgeDays}d · Stage: {cropAgeInfo.cropStage}
        </p>
      </div>

      {/* Row 1: core metrics */}
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:12 }}>
        <MetricCard icon={FaTint}            label="Soil Moisture"  value={`${liveData.moistureNumeric}%`} badge={moistureBadge(liveData.moistureLabel)} />
        <MetricCard icon={FaTemperatureHigh} label="Temperature"    value={`${liveData.temp}°C`}           badge={tempBadge(liveData.temp)} />
        <MetricCard icon={FaCloudRain}       label="Rain Today"     value={liveData.rain}                  badge={<Badge text={liveData.rain === "Yes" ? "Rain" : "Clear"} variant={liveData.rain === "Yes" ? "blue" : "green"} />} />
        <MetricCard icon={FaSun}             label="Sunlight"       value={liveData.sunlight}              badge={sunlightBadge(liveData.sunlight)} />
      </div>

      {/* Row 2: farm status */}
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24 }}>
        <MetricCard icon={FaSeedling}  label="Crop Stage"      value={liveData.cropStage}       badge={stageBadge(liveData.cropStage)} />
        <MetricCard icon={FaHeartbeat} label="Health Score"    value={`${liveData.health}/100`} badge={<Badge text={hs.label} variant={hs.badge} />} />
        <MetricCard icon={FaBug}       label="Pest Detection"  value={liveData.pest}            badge={pestBadge(liveData.pest)} />
        <MetricCard icon={FaTint}      label="Humidity"        value={`${liveData.humidity}%`}  badge={<Badge text={liveData.humidity > 70 ? "High" : "Normal"} variant={liveData.humidity > 70 ? "blue" : "green"} />} />
      </div>

      {/* Location + Health Gauge */}
      <div
        style={{
          display:"grid",
          gridTemplateColumns:isMobile
            ? "1fr"
            : "1.6fr 1fr",

          gap:20,
          marginBottom:24
        }}
      >
        <LocationMap />
        <HealthGauge />
      </div>

      {/* Pest upload */}
      <SectionHead><FaBug style={{ display:"inline",marginRight:8 }} />Pest Image Classification</SectionHead>
      <AlertCard variant="info">
        Upload a crop leaf / field image to classify <strong>Healthy</strong> vs <strong>Pest Attack</strong> using EfficientNetB0. The result updates the Pest card and Health Score automatically.
      </AlertCard>
      <div style={{ marginTop:12 }}>
        <PestUpload />
      </div>

      {/* Irrigation summary */}
      <SectionHead><FaWater style={{ display:"inline",marginRight:8 }} />Irrigation Management</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(3,1fr)",gap:12,marginBottom:24 }}>
        <MetricCard icon={FaWater} label="Irrigation Needed" value={irrActivated ? "Yes" : "No"} badge={<Badge text={irrActivated ? "Active" : "Inactive"} variant={irrActivated ? "green" : "blue"} />} />
        <MetricCard icon={FaTint}  label="Volume (L/acre)"   value={irrVolume}                   badge={<Badge text="Today" variant="blue" />} />
        <MetricCard icon={null}    label="Duration (min)"    value={`${irrDuration} min`}        badge={<Badge text="Today" variant="blue" />} />
      </div>

      {/* Smart Alerts */}
      <SectionHead><FaBell style={{ display:"inline",marginRight:8 }} />Smart Alerts</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "1fr 1fr",gap:"0 16px",marginBottom:24 }}>
        {alerts.map(([v, msg], i) => <AlertCard key={i} variant={v}>{msg}</AlertCard>)}
      </div>

      {/* Recent Trends */}
      <SectionHead><FaChartLine style={{ display:"inline",marginRight:8 }} />Recent Trends (7-Day)</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(3,1fr)",gap:16,marginBottom:24 }}>
        {[
          { data: moistureSeries, key:"Moisture %", color:"#61ba6a", title:"Soil Moisture %" },
          { data: sevenDayTemp,   key:"Temp °C",    color:"#f5c842", title:"Temperature °C" },
          { data: healthSeries,   key:"Health",     color:"#fa5d5d", title:"Crop Health Score" },
        ].map(({ data, key, color, title }) => (
          <div key={key} style={{ background:"rgba(14,31,12,0.5)",border:"1px solid #1e3d1a",borderRadius:12,padding:"14px 12px" }}>
            <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",color:"#61ba6a",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em" }}>{title}</p>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 180}>
              <LineChart data={data} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" />
                <XAxis dataKey="date" tick={{ fill:"#4a7a42",fontSize:9,fontFamily:"'Space Mono',monospace" }} />
                <YAxis tick={{ fill:"#4a7a42",fontSize:9,fontFamily:"'Space Mono',monospace" }} />
                <Tooltip content={<GreenTooltip />} />
                <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r:3,fill:color }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* AI Chat */}
      <SectionHead>AI Farm Assistant</SectionHead>
      <ChatBot mini />
    </div>
  );
}