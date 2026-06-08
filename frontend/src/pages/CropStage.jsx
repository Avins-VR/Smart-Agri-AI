// src/pages/CropStage.jsx
import { useFarm } from "../context/FarmContext";
import { STAGE_ACTIONS } from "../utils/farmLogic";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { FaSeedling } from "react-icons/fa";
import MetricCard from "../components/MetricCard";
import Badge from "../components/Badge";
import SectionHead from "../components/SectionHead";
import AlertCard from "../components/AlertCard";
import { useState, useEffect } from "react";

const STAGE_COLORS = { Seedling:"#3a6633", Vegetative:"#4a8a42", Flowering:"#61ba6a", Fruiting:"#f5c842", Harvest:"#fa5d5d" };

export default function CropStage() {
  const { cropAgeInfo, cropInfo } = useFarm();

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
  const stages = ["Seedling","Vegetative","Flowering","Fruiting","Harvest"];
  const currentIdx = stages.indexOf(cropAgeInfo.cropStage);
  const totalDays = cropAgeInfo.totalDuration;

  // Build Gantt data
  const ganttData = stages.map((stage, i) => {
    const dur = cropAgeInfo.lifecycle[stage];
    const start = stages.slice(0,i).reduce((s,st) => s + cropAgeInfo.lifecycle[st], 0);
    return { stage, start, duration: dur, color: STAGE_COLORS[stage], isPast: i <= currentIdx };
  });

  const daysToHarvest = Math.max(0, Math.round((new Date(cropAgeInfo.estimatedHarvestDate) - new Date()) / 86400000));

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
        <FaSeedling style={{ display:"inline",marginRight:8 }} />Crop Stage Timeline
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
        ? "0.65rem"
        : "0.72rem",color:"#4a7a42",marginBottom:20,lineHeight:1.6,overflowWrap:"break-word" }}>
        {cropInfo.crop} ({cropInfo.variety}) · Planted: {cropInfo.plantingDate} · Age: {cropAgeInfo.cropAgeDays}d · Est. Harvest: {cropAgeInfo.estimatedHarvestDate}
      </p>

      {/* Gantt */}
      <div style={{ background:"rgba(14,31,12,0.5)",border:"1px solid #1e3d1a",borderRadius:12,padding:isMobile
        ? "10px"
        : "16px 12px",marginBottom:20,width:"100%",boxSizing:"border-box" }}>
        <ResponsiveContainer width="100%" height={isMobile ? 320 : 260}>
          <BarChart data={ganttData} layout="vertical" margin={{ top:4,right:16,left:60,bottom:4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3d1a" horizontal={false} />
            <XAxis type="number" domain={[0, totalDays]} tick={{ fill:"#4a7a42",fontSize:isMobile ? 8 : 10,fontFamily:"'Space Mono',monospace" }} label={{ value:"Days from Planting",fill:"#4a7a42",fontSize:9,fontFamily:"'Space Mono',monospace",position:"insideBottom",offset:-2 }} />
            <YAxis type="category" dataKey="stage" tick={{ fill:"#c8e8b2",fontSize:isMobile ? 9 : 11,fontFamily:"'Space Mono',monospace" }} />
            <Tooltip contentStyle={{ background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,fontFamily:"'Space Mono',monospace",fontSize:11 }} />
            <ReferenceLine x={cropAgeInfo.cropAgeDays} stroke="#fa5d5d" strokeDasharray="4 2" label={{ value:`Day ${cropAgeInfo.cropAgeDays}`,fill:"#fa5d5d",fontSize:isMobile ? 7 : 9,fontFamily:"'Space Mono',monospace" }} />
            <Bar dataKey="duration" minPointSize={5} label={{ position:"inside",fill:"#fff",fontSize:isMobile ? 8 : 10,fontFamily:"'Space Mono',monospace",formatter:v=>`${v}d` }}>
              {ganttData.map((entry, i) => (
                <Cell key={i} fill={entry.isPast ? entry.color : "#1e3d1a"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionHead>Current Stage Details</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(4,1fr)",gap:12,marginBottom:16 }}>
        <MetricCard label="Current Stage"    value={cropAgeInfo.cropStage}             badge={<Badge text={cropAgeInfo.cropStage} variant="blue" />} />
        <MetricCard label="Days in Stage"    value={`${cropAgeInfo.daysInCurrentStage}d`} />
        <MetricCard label="Days to Next"     value={`${cropAgeInfo.daysToNextStage}d`} />
        <MetricCard label="Next Stage"       value={cropAgeInfo.nextStage} />
      </div>

      <AlertCard variant="info">
        Advisory for <strong>{cropInfo.variety}</strong> at Day {cropAgeInfo.cropAgeDays}: {STAGE_ACTIONS[cropAgeInfo.cropStage] || "Monitor crop regularly."}
      </AlertCard>

      {/* Progress bar */}
      <div style={{ marginTop:16,fontFamily:"'Space Mono',monospace",fontSize:isMobile
        ? "0.65rem"
        : "0.72rem",color:"#4a7a42" }}>
        Stage Progress: <span style={{ color:"#61ba6a" }}>{cropAgeInfo.stageProgressPct.toFixed(0)}%</span> through {cropAgeInfo.cropStage}
      </div>
      <div style={{ background:"#1e3d1a",borderRadius:8,height:10,marginTop:6 }}>
        <div style={{ background:"#61ba6a",width:`${cropAgeInfo.stageProgressPct}%`,height:"100%",borderRadius:8,transition:"width 0.6s ease" }} />
      </div>

      <SectionHead>Season Summary</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:isMobile
        ? "1fr"
        : "repeat(3,1fr)",gap:12 }}>
        <MetricCard label="Total Season"     value={`${cropAgeInfo.totalDuration}d`}         badge={<Badge text="Full Cycle" variant="blue" />} />
        <MetricCard label="Est. Harvest"     value={cropAgeInfo.estimatedHarvestDate}        badge={<Badge text="Projected" variant="green" />} />
        <MetricCard label="Days to Harvest"  value={`${daysToHarvest}d`}                    badge={<Badge text="Remaining" variant="yellow" />} />
      </div>
    </div>
  );
}