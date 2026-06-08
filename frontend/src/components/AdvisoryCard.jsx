// src/components/AdvisoryCard.jsx
import { FaTint, FaLeaf, FaBug, FaSeedling, FaClipboardList, FaChartLine, FaInfoCircle } from "react-icons/fa";

const ICON_MAP = {
  irrigation: FaTint, fertilizer: FaLeaf, pest: FaBug,
  soil: FaSeedling, weekly: FaClipboardList, yield: FaChartLine,
};

export default function AdvisoryCard({ icon, title, body, meta }) {
  const Icon = ICON_MAP[icon] || FaInfoCircle;
  return (
    <div style={{
      background:"linear-gradient(135deg,#0e1f0c 0%,#0b1a09 100%)",
      border:"1px solid #1e3d1a",borderRadius:14,padding:"1.1rem 1.3rem",
      transition:"border-color 0.25s, transform 0.2s",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(97,186,106,0.27)"; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e3d1a"; e.currentTarget.style.transform=""; }}
    >
      <Icon size={20} color="#61ba6a" style={{ marginBottom:6 }} />
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",color:"#4a7a42",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8 }}>
        {title}
      </p>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.82rem",color:"#c8e8b2",lineHeight:1.75,whiteSpace:"pre-wrap" }}>
        {body}
      </p>
      {meta && (
        <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"#3a6633",marginTop:10,borderTop:"1px solid #1e3d1a",paddingTop:6 }}>
          {meta}
        </p>
      )}
    </div>
  );
}