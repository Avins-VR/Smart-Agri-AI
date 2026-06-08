// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ text = "Loading…" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, gap:12 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" style={{ width:28,height:28,animation:"spin 1s linear infinite" }}>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      <p style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.75rem", color:"#4a7a42" }}>{text}</p>
    </div>
  );
}