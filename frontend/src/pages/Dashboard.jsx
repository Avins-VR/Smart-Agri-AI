// src/pages/Dashboard.jsx
import { Outlet, NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFarm } from "../context/FarmContext";
import {
  FaSeedling, FaTint, FaLeaf, FaHeartbeat, FaWater,
  FaCloudRain, FaRobot, FaComments, FaChartLine,
  FaSignOutAlt, FaCog, FaSun, FaMoon,
} from "react-icons/fa";
import { CROP_VARIETIES, SOIL_TYPES } from "../utils/farmLogic";

const SproutIcon = ({
  size = 20,
  color = "#4ade80"
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    style={{
      width: size,
      height: size
    }}
  >
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 1 1.3 4.5c-1-.1-1.9-.4-2.6-.9" />
  </svg>
);

const NAV_ITEMS = [
  { to: "",           icon: FaChartLine, label: "Dashboard"      },
  { to: "moisture",   icon: FaTint,      label: "Soil Moisture"  },
  { to: "nutrients",  icon: FaLeaf,      label: "Nutrient Status"},
  { to: "crop-stage", icon: FaSeedling,  label: "Crop Stage"     },
  { to: "health",     icon: FaHeartbeat, label: "Crop Health"    },
  { to: "irrigation", icon: FaWater,     label: "Irrigation"     },
  { to: "rain",       icon: FaCloudRain, label: "Rain History"   },
  { to: "advisory",   icon: FaRobot,     label: "AI Advisory"    },
  { to: "chatbot",    icon: FaComments,  label: "AI Chatbot"     },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { landId } = useParams();
  const {
    land, crop, variety, varietyOptions, soil, acres, plantingDate, cropAgeInfo,
    setCrop, setVariety, setSoil, setAcres, setPlantingDate,
    liveData, cropInfo,
  } = useFarm();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const lastSync = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" });

  const handleLogout = () => {
    localStorage.removeItem("agri_token"); localStorage.removeItem("agri_user");
    sessionStorage.removeItem("agri_token"); sessionStorage.removeItem("agri_user");
    navigate("/");
  };

  return (
    <div
      style={{
        display:"flex",

        minHeight:"100vh",

        alignItems:"stretch",

        background:"#080c10",

        fontFamily:"'DM Sans',sans-serif",

        overflowX:"hidden",

        position:"relative"
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: isMobile
            ? (sidebarOpen ? "280px" : "0px")
            : (sidebarOpen ? 360 : 95),

          background:"#0b1109",
          borderRight:"1px solid #1e3d1a",

          display:"flex",
          flexDirection:"column",

          transition:"all 0.3s ease",

          flexShrink:0,

          position:isMobile ? "fixed" : "relative",

          left:0,

          zIndex:1000,

          height:isMobile ? "100vh" : "auto",

          minHeight:"100vh",

          overflowY:"auto",

          WebkitOverflowScrolling:"touch",

          transform:isMobile
            ? (sidebarOpen
                ? "translateX(0)"
                : "translateX(-100%)")
            : "none"
        }}
      >
        {/* Logo */}
        <div style={{ padding:"20px 16px 12px", borderBottom:"1px solid #1e3d1a" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div
              style={{
                width:36,
                height:36,
                borderRadius:10,
                background:"rgba(22,163,74,0.2)",
                border:"1px solid rgba(74,222,128,0.25)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                flexShrink:0
              }}
            >
              <SproutIcon size={20} color="#4ade80" />
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ margin:0,fontSize:13,fontWeight:700,background:"linear-gradient(135deg,#f0fdf4,#86efac)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
                  Smart Agri AI
                </p>
                <p style={{ margin:0,fontSize:9.5,color:"rgba(74,222,128,0.4)",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace" }}>
                  AI-Powered Farm Intelligence
                </p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"rgba(74,222,128,0.4)",padding:4,display:"flex",flexShrink:0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width:16,height:16 }}>
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Meta */}
        {sidebarOpen && (
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1e3d1a" }}>
            <div style={{ background:"#101f0e",border:"1px solid #1e3d1a",borderRadius:8,padding:"0.5rem 0.75rem",fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#3a6633",lineHeight:1.8 }}>
              <div>Location: <span style={{ color:"#61ba6a" }}>{land?.location || "Tamil Nadu, IN"}</span></div>
              <div>Synced: <span style={{ color:"#61ba6a" }}>{lastSync}</span></div>
            </div>
          </div>
        )}

        {/* Farm Config */}
        {sidebarOpen && (
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1e3d1a" }}>
            <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.62rem",color:"#3a6633",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8 }}>
              Farm Configuration
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {/* Crop */}
              <div>
                <label style={{ fontSize:11,color:"rgba(74,222,128,0.5)",display:"block",marginBottom:3,fontFamily:"'Space Mono',monospace" }}>Crop</label>
                <select value={crop} onChange={e => setCrop(e.target.value)}
                  style={{ width:"100%",background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:6,color:"#c8e8b2",fontSize:12,padding:"6px 8px",outline:"none",fontFamily:"'Space Mono',monospace" }}>
                  {Object.keys(CROP_VARIETIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Variety */}
              <div>
                <label style={{ fontSize:11,color:"rgba(74,222,128,0.5)",display:"block",marginBottom:3,fontFamily:"'Space Mono',monospace" }}>Variety</label>
                <select value={variety} onChange={e => setVariety(e.target.value)}
                  style={{ width:"100%",background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:6,color:"#c8e8b2",fontSize:12,padding:"6px 8px",outline:"none",fontFamily:"'Space Mono',monospace" }}>
                  {varietyOptions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {/* Soil */}
              <div>
                <label style={{ fontSize:11,color:"rgba(74,222,128,0.5)",display:"block",marginBottom:3,fontFamily:"'Space Mono',monospace" }}>Soil</label>
                <select value={soil} onChange={e => setSoil(e.target.value)}
                  style={{ width:"100%",background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:6,color:"#c8e8b2",fontSize:12,padding:"6px 8px",outline:"none",fontFamily:"'Space Mono',monospace" }}>
                  {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Acres */}
              <div>
                <label style={{ fontSize:11,color:"rgba(74,222,128,0.5)",display:"block",marginBottom:3,fontFamily:"'Space Mono',monospace" }}>
                  Acres: <span style={{ color:"#61ba6a" }}>{acres}</span>
                </label>
                <input type="range" min={1} max={100} value={acres} onChange={e => setAcres(Number(e.target.value))}
                  style={{ width:"100%",accentColor:"#4ade80" }} />
              </div>
              {/* Planting Date */}
              <div>
                <label style={{ fontSize:11,color:"rgba(74,222,128,0.5)",display:"block",marginBottom:3,fontFamily:"'Space Mono',monospace" }}>Planting Date</label>
                <input type="date" value={plantingDate} max={new Date().toISOString().split("T")[0]}
                  onChange={e => setPlantingDate(e.target.value)}
                  style={{ width:"100%",background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:6,color:"#c8e8b2",fontSize:11,padding:"6px 8px",outline:"none",colorScheme:"dark" }} />
              </div>
            </div>
            {/* Farm summary */}
            <div style={{ marginTop:10,background:"linear-gradient(90deg,#0d2b0d,#091a09)",border:"1px solid #2a6a2a",borderRadius:8,padding:"0.5rem 0.75rem",fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#61ba6a",lineHeight:1.8 }}>
              <div style={{ fontSize:"0.58rem",color:"#3a6633",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2 }}>Active Monitoring</div>
              <div style={{ fontWeight:700 }}>{crop} · {variety}</div>
              <div>{acres} acres · {soil} · Age: {cropAgeInfo.cropAgeDays}d · {cropAgeInfo.cropStage}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 8px" }}>
          {!sidebarOpen && <div style={{ height:8 }} />}
          {sidebarOpen && (
            <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"#3a6633",textTransform:"uppercase",letterSpacing:"0.12em",padding:"0 8px",marginBottom:8 }}>
              Navigation
            </p>
          )}
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const path = `/dashboard/${landId}${to ? `/${to}` : ""}`;
            return (
              <NavLink key={to} to={path} end={to === ""}onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                style={({ isActive }) => ({
                  display:"flex", alignItems:"center", gap:10,
                  padding: sidebarOpen ? "9px 12px" : "9px",
                  borderRadius:8, marginBottom:17, textDecoration:"none",
                  background: isActive ? "rgba(74,222,128,0.1)" : "none",
                  color:      isActive ? "#4ade80" : "rgba(74,222,128,0.5)",
                  border:     isActive ? "1px solid rgba(74,222,128,0.2)" : "1px solid transparent",
                  transition:"all 0.15s",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                })}
                onMouseEnter={e => { if (!e.currentTarget.style.background.includes("0.1")) e.currentTarget.style.background="rgba(74,222,128,0.05)"; }}
                onMouseLeave={e => { if (!e.currentTarget.style.background.includes("0.1")) e.currentTarget.style.background="none"; }}
              >
                <Icon size={14} style={{ flexShrink:0 }} />
                {sidebarOpen && <span style={{ fontSize:13,fontWeight:500 }}>{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: logout + back to home */}
        <div style={{ padding:"8px 8px 16px", borderTop:"1px solid #1e3d1a" }}>
          <button onClick={() => navigate("/home")}
            style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:sidebarOpen?"9px 12px":"9px",borderRadius:8,background:"none",border:"1px solid transparent",color:"rgba(74,222,128,0.4)",cursor:"pointer",fontSize:13,marginBottom:4,justifyContent:sidebarOpen?"flex-start":"center",transition:"all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(74,222,128,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background="none"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width:14,height:14,flexShrink:0 }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {sidebarOpen && "Back to Lands"}
          </button>
          <button onClick={handleLogout}
            style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:sidebarOpen?"9px 12px":"9px",borderRadius:8,background:"none",border:"1px solid transparent",color:"rgba(239,68,68,0.5)",cursor:"pointer",fontSize:13,justifyContent:sidebarOpen?"flex-start":"center",transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.08)"; e.currentTarget.style.color="#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="rgba(239,68,68,0.5)"; }}>
            <FaSignOutAlt size={14} style={{ flexShrink:0 }} />
            {sidebarOpen && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position:"fixed",
            top:15,
            left:15,
            zIndex:1100,
            width:"42px",
            height:"42px",
            borderRadius:"8px",
            border:"1px solid #1e3d1a",
            background:"#0b1109",
            color:"#4ade80",
            cursor:"pointer"
          }}
        >
          ☰ 
        </button>
      )}
      <main
        style={{
          flex:1,
          overflowY:"auto",
          padding:isMobile
            ? "70px 12px 20px"
            : "28px 32px",

          minWidth:0,

          width:"100%",

          maxWidth:"100vw"
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}