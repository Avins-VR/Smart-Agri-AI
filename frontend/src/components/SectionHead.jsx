// src/components/SectionHead.jsx
export default function SectionHead({ children }) {
  return (
    <h3 style={{
      fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"1.05rem",
      color:"#61ba6a", letterSpacing:"0.05em", textTransform:"uppercase",
      borderBottom:"1px solid #1e3d1a", paddingBottom:"0.4rem",
      margin:"1.2rem 0 0.8rem",
    }}>
      {children}
    </h3>
  );
}