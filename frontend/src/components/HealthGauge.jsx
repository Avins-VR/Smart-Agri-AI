// src/components/HealthGauge.jsx
import { useFarm } from "../context/FarmContext";
import { getHealthStatus } from "../utils/farmLogic";
import { FaHeartbeat } from "react-icons/fa";
import SectionHead from "./SectionHead";

export default function HealthGauge() {
  const { liveData } = useFarm();
  const hs = getHealthStatus(liveData.health);
  const pct = liveData.health;
  const r = 70, cx = 90, cy = 90;
  const circumference = 2 * Math.PI * r;
  const stroke = circumference * (1 - pct / 100);

  const statusColor  = liveData.pest === "Detected" ? "#fa5d5d"
                     : hs.label === "Moderate"       ? "#f5c842" : "#61ba6a";
  const statusBg     = liveData.pest === "Detected" ? "#2b0909"
                     : hs.label === "Moderate"       ? "#2b2200" : "#0d2b0d";
  const statusBorder = liveData.pest === "Detected" ? "#6a1a1a"
                     : hs.label === "Moderate"       ? "#6a5200" : "#2a6a2a";
  const statusText   = liveData.pest === "Detected"    ? "Pest Attack Detected"
                     : hs.label === "Moderate"          ? "Moderate Risk"
                     : hs.label === "Critical" || hs.label === "Risk" ? `${hs.label} — Immediate Attention`
                     : `${hs.label} Crop Health`;

  return (
    <div>
      <SectionHead><FaHeartbeat style={{ display:"inline",marginRight:8 }} />Health Gauge</SectionHead>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",background:"rgba(14,31,12,0.5)",border:"1px solid #1e3d1a",borderRadius:14,padding:20 }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3d1a" strokeWidth="18" />
          {/* Progress */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#61ba6a" strokeWidth="18"
            strokeDasharray={circumference} strokeDashoffset={stroke}
            strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition:"stroke-dashoffset 0.6s ease" }} />
          {/* Value */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#61ba6a"
            style={{ fontSize:28,fontWeight:700,fontFamily:"'Space Mono',monospace" }}>
            {pct}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#4a7a42"
            style={{ fontSize:12,fontFamily:"'Space Mono',monospace" }}>
            /100
          </text>
        </svg>
        <div style={{ width:"100%",background:statusBg,border:`1px solid ${statusBorder}`,borderRadius:10,padding:"10px 16px",fontFamily:"'Space Mono',monospace",fontSize:"0.82rem",fontWeight:700,textAlign:"center",color:statusColor,marginTop:8 }}>
          {statusText}
        </div>
      </div>
    </div>
  );
}