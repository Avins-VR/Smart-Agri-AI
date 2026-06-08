// src/pages/SoilMoisture.jsx
import { useFarm } from "../context/FarmContext";
import { useEffect, useState } from "react";
import { fetch14DayWeather, mlApi } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaTint } from "react-icons/fa";
import SectionHead from "../components/SectionHead";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SoilMoisture() {
  const {
    liveData,
    cropInfo,
    cropAgeInfo
  } = useFarm();
  const [series, setSeries] = useState([]);
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
          await mlApi.soilMoistureHistory({

            weather_history: weatherHistory,

            crop: cropInfo.crop,

            variety: cropInfo.variety,

            planting_date: cropInfo.plantingDate

          });

        if (res.data.success) {

          setSeries(
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
      setLoading(false);

      } catch (err) {

        console.error("History Error:", err);
        setLoading(false);


      }
    }

    loadHistory();

  }, [
      cropInfo.crop,
      cropInfo.variety,
      cropInfo.plantingDate
    ]);
  const tableData = series.map(r => ({
    ...r, Status: r["Moisture %"] < 30 ? "Dry" : r["Moisture %"] <= 70 ? "Optimal" : "Wet"
  }));

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
        <FaTint style={{ display:"inline",marginRight:8 }} />Soil Moisture History
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
        ? "0.65rem"
        : "0.72rem",color:"#4a7a42",marginBottom:20 }}>
        14-day sensor log · RF model predictions
      </p>
      {loading ? (
        <LoadingSpinner text="Loading Soil Moisture history..." />
      ) : (
      <div
        style={{
          background:"rgba(14,31,12,0.5)",

          border:"1px solid #1e3d1a",

          borderRadius:12,

          padding:isMobile
            ? "10px"
            : "16px 12px",

          marginBottom:20,

          width:"100%",

          boxSizing:"border-box"
        }}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
          <LineChart data={series} margin={{ top:4,right:8,left:-20,bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" />
            <XAxis dataKey="date" tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 10,fontFamily:"'Space Mono',monospace" }} />
            <YAxis tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 10,fontFamily:"'Space Mono',monospace" }} />
            <Tooltip contentStyle={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,fontFamily:"'Space Mono',monospace",fontSize:11 }} labelStyle={{ color:"#4a7a42" }} itemStyle={{ color:"#c8e8b2" }} />
            <Line type="monotone" dataKey="Moisture %" stroke="#61ba6a" strokeWidth={2.5} dot={{ r:4,fill:"#61ba6a" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
      <SectionHead>Daily Log</SectionHead>
      <div
        style={{
          overflowX:"auto",

          width:"100%",

          WebkitOverflowScrolling:"touch"
        }}
      >
        <table style={{ width:"100%",minWidth:isMobile
          ? "420px"
          : "100%",borderCollapse:"collapse",fontFamily:"'Space Mono',monospace",fontSize:isMobile ? 10 : 12 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #1e3d1a" }}>
              {["Date","Moisture %","Status"].map(h=>(
                <th key={h} style={{ padding:isMobile
                  ? "6px 8px"
                  : "8px 12px",textAlign:"left",color:"#4a7a42",fontSize:"0.65rem",textTransform:"uppercase",letterSpacing:"0.08em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row,i)=>(
              <tr key={i} style={{ borderBottom:"1px solid rgba(30,61,26,0.4)",background:i%2===0?"transparent":"rgba(74,222,128,0.02)" }}>
                <td style={{ padding:isMobile
                  ? "6px 8px"
                  : "7px 12px",color:"#c8e8b2" }}>{row.date}</td>
                                <td style={{ padding:isMobile
                  ? "6px 8px"
                  : "7px 12px",color:"#61ba6a",fontWeight:700 }}>{row["Moisture %"].toFixed(1)}%</td>
                                <td style={{ padding:isMobile
                  ? "6px 8px"
                  : "7px 12px",color:row.Status==="Dry"?"#f5c842":row.Status==="Wet"?"#5db8fa":"#61ba6a" }}>{row.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}