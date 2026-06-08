// src/pages/NutrientStatus.jsx
import { useFarm } from "../context/FarmContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaLeaf } from "react-icons/fa";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import SectionHead from "../components/SectionHead";
import AlertCard from "../components/AlertCard";
import { useState, useEffect } from "react";
import {fetch14DayWeather,mlApi} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NutrientStatus() {
  const {
    liveData,
    cropInfo
  } = useFarm();
  const [nSeries, setNSeries] = useState([]);
  const [pSeries, setPSeries] = useState([]);
  const [kSeries, setKSeries] = useState([]);
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
          await mlApi.npkHistory({

            weather_history:
              weatherHistory,

            crop:
              cropInfo.crop,

            variety:
              cropInfo.variety,

            soil_type:
              cropInfo.soil,

            planting_date:
              cropInfo.plantingDate

          });

        if (res.data.success) {

          setNSeries(
            res.data.history.map(r => ({
              date:
                new Date(r.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric"
                  }
                ),
              N: r.n
            }))
          );

          setPSeries(
            res.data.history.map(r => ({
              date:
                new Date(r.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric"
                  }
                ),
              P: r.p
            }))
          );

          setKSeries(
            res.data.history.map(r => ({
              date:
                new Date(r.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric"
                  }
                ),
              K: r.k
            }))
          );
        }
      setLoading(false);

      } catch (err) {

        console.error(
          "NPK History Error",
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
    cropInfo.plantingDate
  ]);

  const npkBadge = v => <Badge text={v>=60?"Optimal":v>=40?"Moderate":"Low"} variant={v>=60?"green":v>=40?"yellow":"red"} />;

  const defLog = [];
  nSeries.forEach(r => { if (r.N < 40) defLog.push({ Date:r.date, Nutrient:"Nitrogen",   Level:r.N.toFixed(1), Action:"Apply Urea" }); });
  pSeries.forEach(r => { if (r.P < 40) defLog.push({ Date:r.date, Nutrient:"Phosphorus", Level:r.P.toFixed(1), Action:"Apply DAP" }); });

  const ChartBlock = ({ data, dataKey, color, title }) => (
    <div
      style={{
        background:"rgba(14,31,12,0.5)",

        border:"1px solid #1e3d1a",

        borderRadius:12,

        padding:isMobile
          ? "10px"
          : "14px 12px",

        width:"100%",

        boxSizing:"border-box"
      }}
    >
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",color:"#61ba6a",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em" }}>{title}</p>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 220}>
        <LineChart data={data} margin={{ top:4,right:8,left:-20,bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" />
          <XAxis dataKey="date" tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 9,fontFamily:"'Space Mono',monospace" }} />
          <YAxis tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 9,fontFamily:"'Space Mono',monospace" }} />
          <Tooltip contentStyle={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,fontFamily:"'Space Mono',monospace",fontSize:11 }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r:3,fill:color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

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
        <FaLeaf style={{ display:"inline",marginRight:8 }} />Nutrient Status History
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
        ? "0.65rem"
        : "0.72rem",color:"#4a7a42",marginBottom:20 }}>NPK levels over 14 days · Deficiency alerts</p>

      {loading ? (
        <LoadingSpinner text="Loading NPK history..." />
      ) : (
        <>
          <div
            style={{
              display:"grid",

              gridTemplateColumns:isMobile
                ? "1fr"
                : "1fr 1fr",

              gap:16,

              marginBottom:16
            }}
          >
            <ChartBlock
              data={nSeries}
              dataKey="N"
              color="#61ba6a"
              title="Nitrogen Level"
            />

            <ChartBlock
              data={pSeries}
              dataKey="P"
              color="#5db8fa"
              title="Phosphorus Level"
            />
          </div>

          <ChartBlock
            data={kSeries}
            dataKey="K"
            color="#f5c842"
            title="Potassium Level"
          />
        </>
      )}

      <SectionHead>Today's ML Predicted NPK</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:isMobile
          ? "1fr"
          : "repeat(3,1fr)",gap:12,marginBottom:20 }}>
        <MetricCard icon={FaLeaf} label="Nitrogen (N)"   value={liveData.n} badge={npkBadge(liveData.n)} sub="ML Predicted · Today" />
        <MetricCard icon={FaLeaf} label="Phosphorus (P)" value={liveData.p} badge={npkBadge(liveData.p)} sub="ML Predicted · Today" />
        <MetricCard icon={FaLeaf} label="Potassium (K)"  value={liveData.k} badge={npkBadge(liveData.k)} sub="ML Predicted · Today" />
      </div>

      <SectionHead>Deficiency Log</SectionHead>
      {defLog.length ? (
        <div
          style={{
            overflowX:"auto",

            width:"100%",

            WebkitOverflowScrolling:"touch"
          }}
        >
        <table style={{
          width:"100%",

          minWidth:isMobile
            ? "500px"
            : "100%",

          borderCollapse:"collapse",

          fontFamily:"'Space Mono',monospace",

          fontSize:isMobile
            ? 10
            : 12
        }}>
          <thead><tr style={{ borderBottom:"1px solid #1e3d1a" }}>
            {["Date","Nutrient","Level","Action"].map(h=>(
              <th key={h} style={{ padding:isMobile
                ? "6px 8px"
                : "8px 12px",textAlign:"left",color:"#4a7a42",fontSize:"0.65rem",textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{defLog.map((r,i)=>(
            <tr key={i} style={{ borderBottom:"1px solid rgba(30,61,26,0.4)" }}>
              <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 12px",color:"#c8e8b2" }}>{r.Date}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 12px",color:"#f5c842" }}>{r.Nutrient}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 12px",color:"#fa5d5d" }}>{r.Level}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 12px",color:"#61ba6a" }}>{r.Action}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      ) : (
        <AlertCard variant="ok">No deficiencies detected in the past 14 days.</AlertCard>
      )}
    </div>
  );
}