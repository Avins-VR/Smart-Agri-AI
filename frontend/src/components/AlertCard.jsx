// src/components/AlertCard.jsx
const VARIANTS = {
  warn:   { border:"#f5c842", color:"#f5c842", bg:"#1a1500" },
  info:   { border:"#5db8fa", color:"#5db8fa", bg:"#091525" },
  danger: { border:"#fa5d5d", color:"#fa5d5d", bg:"#1a0909" },
  ok:     { border:"#61ba6a", color:"#61ba6a", bg:"#091509" },
};

export default function AlertCard({ variant="info", children }) {
  const s = VARIANTS[variant] || VARIANTS.info;
  return (
    <div style={{
      background:s.bg, borderLeft:`3px solid ${s.border}`, borderRadius:"0 10px 10px 0",
      padding:"0.6rem 0.9rem", marginBottom:"0.5rem", fontSize:"0.85rem",
      fontFamily:"'Space Mono',monospace", lineHeight:1.5, color:s.color,
    }}>
      {children}
    </div>
  );
}