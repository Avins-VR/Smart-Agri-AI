// src/pages/Irrigation.jsx
import { useState, useEffect } from "react";
import { useFarm } from "../context/FarmContext";
import { getMoistureLabel } from "../utils/farmLogic";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaWater } from "react-icons/fa";
import { fetch14DayRain,fetch14DayWeather, fetchIrrigationHistory} from "../services/api";
import SectionHead from "../components/SectionHead";

export default function Irrigation() {
  const { liveData, cropInfo } = useFarm();
  const [rainData, setRainData] = useState([]);
  useEffect(() => { fetch14DayRain().then(setRainData).catch(()=>{}); }, []);

  const [rows, setRows] = useState([]);
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

      const weatherHistory =
        await fetch14DayWeather();

      const result =
        await fetchIrrigationHistory({

          weather_history: weatherHistory,

          crop: cropInfo.crop,

          variety: cropInfo.variety,

          planting_date: cropInfo.plantingDate
        });

      if (!result.success) return;

      const formatted =
        result.history.map(day => ({

          date: day.date,

          Activated:
            day.status === "ON"
              ? "Yes"
              : "No",

          "Duration (min)":
            day.status === "ON"
              ? Math.round(day.daily_req_mm * 4)
              : 0,

          "Volume (L/acre)":
            day.daily_usage_L,

          Reason:
            day.reason
        }));

      setRows(formatted);
    }

    loadHistory();

  }, []);
  const barData = rows.filter(r => r["Duration (min)"] > 0);

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
        <FaWater style={{ display:"inline",marginRight:8 }} />Irrigation Log
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
  ? "0.65rem"
  : "0.72rem",color:"#4a7a42",marginBottom:20 }}>
        Automated drip & sprinkler events
      </p>
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
          <BarChart data={barData} margin={{ top:4,right:8,left:-20,bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" />
            <XAxis dataKey="date" tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 9,fontFamily:"'Space Mono',monospace" }} />
            <YAxis tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 9,fontFamily:"'Space Mono',monospace" }} />
            <Tooltip contentStyle={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,fontFamily:"'Space Mono',monospace",fontSize:11 }} />
            <Bar dataKey="Volume (L/acre)" fill="#5db8fa" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SectionHead>Event Log</SectionHead>
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
            ? "650px"
            : "100%",

          borderCollapse:"collapse",

          fontFamily:"'Space Mono',monospace",

          fontSize:isMobile
            ? 10
            : 11
        }}>
          <thead><tr style={{ borderBottom:"1px solid #1e3d1a" }}>
            {["Date","Activated","Duration (min)","Volume (L/acre)","Reason"].map(h=>(
              <th key={h} style={{ padding:isMobile
                ? "6px 8px"
                : "8px 10px",textAlign:"left",color:"#4a7a42",fontSize:"0.6rem",textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{rows.map((r,i)=>(
            <tr key={i} style={{ borderBottom:"1px solid rgba(30,61,26,0.3)",background:i%2===0?"transparent":"rgba(74,222,128,0.02)" }}>
              <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 10px",color:"#c8e8b2",    minWidth:isMobile
                ? "220px"
                : "auto" }}>{r.date}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 10px",color:r.Activated==="Yes"?"#61ba6a":"#fa5d5d",fontWeight:700}}>{r.Activated}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 10px",color:"#c8e8b2" ,    minWidth:isMobile
                ? "220px"
                : "auto"}}>{r["Duration (min)"]}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 10px",color:"#5db8fa",    minWidth:isMobile
                ? "220px"
                : "auto" }}>{r["Volume (L/acre)"]}</td>
                            <td style={{ padding:isMobile
                ? "6px 8px"
                : "7px 10px",color:"#4a7a42",    minWidth:isMobile
                ? "220px"
                : "auto" }}>{r.Reason}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}