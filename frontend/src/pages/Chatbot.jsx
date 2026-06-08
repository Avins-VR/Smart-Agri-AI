// src/pages/Chatbot.jsx
import { useFarm } from "../context/FarmContext";
import { FaComments } from "react-icons/fa";
import ChatBot from "../components/ChatBot";
import AlertCard from "../components/AlertCard";

export default function Chatbot() {
  const { cropInfo, liveData, cropAgeInfo } = useFarm();
  return (
    <div style={{ animation:"slideUp 0.4s ease" }}>
      <h1 style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:"1.5rem",color:"#61ba6a",marginBottom:4 }}>
        <FaComments style={{ display:"inline",marginRight:8 }} />Smart Agri AI Chatbot
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.72rem",color:"#4a7a42",marginBottom:16 }}>
        Powered by Mistral AI · {cropInfo.crop} ({cropInfo.variety}) · Day {cropInfo.cropAgeDays} · Stage: {liveData.cropStage}
      </p>
      <AlertCard variant="info" style={{ marginBottom:16 }}>
        Try asking: <strong>water status</strong> · <strong>fertilizer advice</strong> · <strong>weather today</strong> · <strong>pest situation</strong> · <strong>crop stage</strong><br />
        <span style={{ fontSize:"0.75rem",opacity:0.8 }}>Only agriculture-related questions will be answered.</span>
      </AlertCard>
      <ChatBot />
    </div>
  );
}