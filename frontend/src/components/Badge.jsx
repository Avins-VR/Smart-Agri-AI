// src/components/Badge.jsx
const BADGE_STYLES = {
  green:  { bg:"#0d2b0d", color:"#61ba6a", border:"#2a6a2a" },
  yellow: { bg:"#2b2200", color:"#f5c842", border:"#6a5200" },
  red:    { bg:"#2b0909", color:"#fa5d5d", border:"#6a1a1a" },
  blue:   { bg:"#091a2b", color:"#5db8fa", border:"#1a4a6a" },
};

export default function Badge({ text, variant = "green" }) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES.green;
  return (
    <span style={{
      display:"inline-block", background:s.bg, color:s.color,
      border:`1px solid ${s.border}`, borderRadius:20,
      padding:"0.2rem 0.55rem", fontSize:"0.65rem",
      fontFamily:"'Space Mono',monospace", fontWeight:700,
      letterSpacing:"0.08em", textTransform:"uppercase",
    }}>
      {text}
    </span>
  );
}

export function moistureBadge(val) {
  return <Badge text={val} variant={{ Dry:"yellow", Optimal:"green", Wet:"blue" }[val] || "green"} />;
}
export function pestBadge(val) {
  return <Badge text={val} variant={val === "Detected" ? "red" : "green"} />;
}
export function sunlightBadge(val) {
  return <Badge text={val} variant={{ Low:"blue", Moderate:"yellow", High:"green" }[val] || "green"} />;
}
export function tempBadge(temp) {
  return <Badge text={temp < 28 ? "Cool" : temp < 33 ? "Normal" : "High"}
               variant={temp < 28 ? "blue" : temp < 33 ? "green" : "red"} />;
}
export function stageBadge(val) { return <Badge text={val} variant="blue" />; }