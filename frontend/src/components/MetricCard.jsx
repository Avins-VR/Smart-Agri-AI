// src/components/MetricCard.jsx
export default function MetricCard({ icon: Icon, label, value, badge, sub }) {
  return (
    <div style={{
      background:"linear-gradient(135deg,#0e1f0c 0%,#111a0f 100%)",
      border:"1px solid #1e3d1a",
      borderRadius:14,

      padding:"1.1rem 1.2rem",

      position:"relative",

      overflow:"hidden",

      minHeight:"120px",

      width:"100%",

      maxWidth:"100%",

      boxSizing:"border-box",

      transition:"border-color 0.25s, transform 0.2s",

      cursor:"default",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor="#61ba6a44"; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor="#1e3d1a";   e.currentTarget.style.transform=""; }}
    >
      <div style={{ position:"absolute",top:0,right:0,width:80,height:80,borderRadius:"0 14px 0 80px",background:"rgba(93,250,110,0.04)" }} />
      {Icon && <div style={{ color:"#61ba6a", marginBottom:"0.3rem", fontSize:"1.4rem" }}><Icon size={22} /></div>}
      <p style={{ fontSize:"clamp(0.62rem,2vw,0.72rem)",color:"#4a7a42",fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.25rem" }}>
        {label}
      </p>
      <p
        style={{
          fontSize:"clamp(1.2rem,4vw,1.55rem)",

          fontWeight:700,

          color:"#c8e8b2",

          lineHeight:1.1,

          marginBottom:"0.3rem",

          overflowWrap:"break-word",

          wordBreak:"break-word"
        }}
      >
        {value}
      </p>
      {badge}
      {sub && <p style={{ fontSize:"clamp(0.6rem,1.8vw,0.65rem)",color:"#3a6633",fontFamily:"'Space Mono',monospace",marginTop:"0.3rem",overflowWrap:"break-word"}}>{sub}</p>}
    </div>
  );
}