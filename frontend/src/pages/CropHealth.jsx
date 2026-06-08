// src/pages/CropHealth.jsx
import { useFarm } from "../context/FarmContext";
import {getHealthStatus } from "../utils/farmLogic";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaHeartbeat } from "react-icons/fa";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import SectionHead from "../components/SectionHead";
import HealthGauge from "../components/HealthGauge";
import { useState, useEffect } from "react";
import {fetch14DayWeather,mlApi} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CropHealth() {
  const { liveData, cropAgeInfo, cropInfo, pestPrediction } = useFarm();
  const hs = getHealthStatus(liveData.health);
  const [hSeries, setHSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

    useEffect(() => {

      async function loadHistory() {
        setLoading(true);
        try {

          const weatherHistory =
            await fetch14DayWeather();

          const res =
            await mlApi.healthHistory({

              weather_history:
                weatherHistory,

              crop:
                cropInfo.crop,

              variety:
                cropInfo.variety,

              soil_type:
                cropInfo.soil,

              planting_date:
                cropInfo.plantingDate,

              pest_prediction:
                pestPrediction

            });

          if (res.data.success) {

            setHSeries(
              res.data.history.map(r => ({
                date:
                  new Date(r.date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric"
                    }
                  ),
                "Health Score":
                  r.health
              }))
            );
          setLoading(false);
          }

        } catch (err) {

          console.error(
            "Health History Error",
            err
          );
          setLoading(false);
        }
      }

      loadHistory();

    }, [
      cropInfo.crop,
      cropInfo.variety,
      cropInfo.soil,
      cropInfo.plantingDate,
      pestPrediction
    ]);
  const avg =
    hSeries.length
      ? hSeries.reduce(
          (s, r) => s + r["Health Score"],
          0
        ) / hSeries.length
      : 0;

  const mn =
    hSeries.length
      ? Math.min(
          ...hSeries.map(
            r => r["Health Score"]
          )
        )
      : 0;

  const mx =
    hSeries.length
      ? Math.max(
          ...hSeries.map(
            r => r["Health Score"]
          )
        )
      : 0;

  const scoreColor = s => s >= 80 ? "#61ba6a" : s >= 60 ? "#f5c842" : "#fa5d5d";

  const breakdownItems = [
    { label:"Classification (50%)", score: pestPrediction==="Healthy" ? 100 : 25, val: pestPrediction },
    { label:"Soil Moisture (15%)",  score: liveData.moistureNumeric>=40&&liveData.moistureNumeric<=70?100:liveData.moistureNumeric>=30?70:40, val:`${liveData.moistureNumeric}%` },
    { label:"Temperature (10%)",    score: liveData.temp>=25&&liveData.temp<=32?100:liveData.temp>=20?70:40, val:`${liveData.temp}°C` },
    { label:"Humidity (10%)",       score: liveData.humidity>=50&&liveData.humidity<=75?100:liveData.humidity>=40?70:40, val:`${liveData.humidity}%` },
    { label:"NPK Balance (15%)",    score: (() => { const a=(liveData.n+liveData.p+liveData.k)/3; return a>=55&&a<=75?100:a>=40?70:40; })(), val:`avg ${((liveData.n+liveData.p+liveData.k)/3).toFixed(1)}` },
  ];

  return (
    <div
      style={{
        animation:"slideUp 0.4s ease",

        width:"100%",

        maxWidth:"100%",

        overflowX:"hidden"
      }}
    >
      <h1 style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:isMobile
    ? "1.2rem"
    : "1.5rem",color:"#61ba6a",marginBottom:4 }}>
        <FaHeartbeat style={{ display:"inline",marginRight:8 }} />Crop Health Score
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
  ? "0.65rem"
  : "0.72rem",color:"#4a7a42",marginBottom:20,lineHeight:1.6,overflowWrap:"break-word" }}>
        {cropInfo.crop} ({cropInfo.variety}) · Day {cropAgeInfo.cropAgeDays} · Stage: {cropAgeInfo.cropStage} · Score: {liveData.health}/100 · {hs.label}
      </p>

      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "1.2fr 1fr",gap:24,marginBottom:24 }}>
        <HealthGauge />
        <div>
          <SectionHead>Score Breakdown</SectionHead>
          {breakdownItems.map(({ label, score, val }) => (
            <div key={label} style={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:10,padding:isMobile
              ? "8px"
              : "8px 12px",marginBottom:6,display:"flex",

                justifyContent:"space-between",

                alignItems:isMobile
                  ? "flex-start"
                  : "center",

                flexDirection:isMobile
                  ? "column"
                  : "row",

                gap:isMobile
                  ? 4
                  : 0,fontFamily:"'Space Mono',monospace",fontSize:isMobile
                ? "0.62rem"
                : "0.7rem" }}>
              <span style={{ color:"#a0c890" }}>{label}</span>
              <span style={{ color:scoreColor(score),fontWeight:700,textAlign:"right",wordBreak:"break-word" }}>{score}/100 <span style={{ color:"#4a7a42",fontSize:"0.62rem" }}>({val})</span></span>
            </div>
          ))}
        </div>
      </div>

      <SectionHead>14-Day Health Trend</SectionHead>
      {loading ? (
        <LoadingSpinner text="Loading Health History..." />
      ) : (
      <div style={{
        background:"rgba(14,31,12,0.5)",

        border:"1px solid #1e3d1a",

        borderRadius:12,

        padding:isMobile
          ? "10px"
          : "16px 12px",

        marginBottom:20,

        width:"100%",

        boxSizing:"border-box"
      }}>
        <ResponsiveContainer width="100%" height={isMobile ? 230 : 260}>
          <LineChart data={hSeries} margin={{ top:4,right:8,left:-20,bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" />
            <XAxis dataKey="date" tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 9,fontFamily:"'Space Mono',monospace" }} />
            <YAxis tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 9,fontFamily:"'Space Mono',monospace" }} />
            <Tooltip contentStyle={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,fontFamily:"'Space Mono',monospace",fontSize:11 }} />
            <Line type="monotone" dataKey="Health Score" stroke="#fa5d5d" strokeWidth={2.5} dot={{ r:4,fill:"#fa5d5d" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(3,1fr)",gap:12 }}>
        <MetricCard label="Average Score" value={avg.toFixed(1)} badge={<Badge text="Avg" variant="blue" />} />
        <MetricCard label="Lowest Score"  value={mn.toFixed(1)} badge={<Badge text="Min" variant="red" />} />
        <MetricCard label="Peak Score"    value={mx.toFixed(1)} badge={<Badge text="Max" variant="green" />} />
      </div>
    </div>
  );
}