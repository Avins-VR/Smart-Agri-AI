// src/pages/RainHistory.jsx
import { useState, useEffect } from "react";
import { useFarm } from "../context/FarmContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaCloudRain } from "react-icons/fa";
import { fetch14DayRain } from "../services/api";
import AlertCard from "../components/AlertCard";

export default function RainHistory() {
  const { liveData } = useFarm();
  const [data, setData] = useState([]);
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
  useEffect(() => { fetch14DayRain().then(setData).catch(()=>{}); }, []);

  return (
    <div style={{ animation:"slideUp 0.4s ease" }}>
      <h1 style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:isMobile
      ? "1.2rem"
      : "1.5rem",color:"#61ba6a",marginBottom:4 }}>
        <FaCloudRain style={{ display:"inline",marginRight:8 }} />Weather & Rain History
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
        ? "0.65rem"
        : "0.72rem",color:"#4a7a42",marginBottom:16 }}>
        14-day precipitation data
      </p>
      <AlertCard variant="info">
        <strong>Current Rain Status:</strong> {liveData.rain} &nbsp;|&nbsp;
        Temperature: {liveData.temp}°C &nbsp;|&nbsp;
        Humidity: {liveData.humidity}% &nbsp;|&nbsp;
        Sunlight: {liveData.sunlight}
      </AlertCard>
      <div style={{ background:"rgba(14,31,12,0.5)",border:"1px solid #1e3d1a",borderRadius:12,padding:isMobile
        ? "10px"
        : "16px 12px",margin:"16px 0" }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top:4,right:8,left:-20,bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" />
            <XAxis dataKey="date" tick={{ fill:"#4a7a42",fontSize:9,fontFamily:"'Space Mono',monospace" }} />
            <YAxis tick={{ fill:"#4a7a42",fontSize:9,fontFamily:"'Space Mono',monospace" }} />
            <Tooltip contentStyle={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,fontFamily:"'Space Mono',monospace",fontSize:11 }} />
            <Bar dataKey="Rain (mm)" fill="#5db8fa" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:"'Space Mono',monospace",fontSize:isMobile
          ? 10
          : 11 }}>
          <thead><tr style={{ borderBottom:"1px solid #1e3d1a" }}>
            {["Date","Rain (mm)","Event"].map(h=>(
              <th key={h} style={{ padding:"8px 10px",textAlign:"left",color:"#4a7a42",fontSize:"0.6rem",textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{data.map((r,i)=>(
            <tr key={i} style={{ borderBottom:"1px solid rgba(30,61,26,0.3)",background:i%2===0?"transparent":"rgba(74,222,128,0.02)" }}>
              <td style={{ padding:"7px 10px",color:"#c8e8b2" }}>{r.date}</td>
              <td style={{ padding:"7px 10px",color:r["Rain (mm)"]>0?"#5db8fa":"#4a7a42",fontWeight:r["Rain (mm)"]>0?700:400 }}>{r["Rain (mm)"]}</td>
              <td style={{ padding:"7px 10px",color:r.event==="Rain"?"#5db8fa":"#61ba6a" }}>{r.event}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}