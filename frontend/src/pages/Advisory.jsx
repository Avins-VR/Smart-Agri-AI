// src/pages/Advisory.jsx
import { useState, useEffect } from "react";
import { useFarm } from "../context/FarmContext";
import { callMistral, buildAdvisoryPrompt, parseAdvisorySections } from "../services/api";
import { FaRobot, FaSyncAlt } from "react-icons/fa";
import AdvisoryCard from "../components/AdvisoryCard";
import AlertCard from "../components/AlertCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Advisory() {
  const {
    liveData, cropInfo, cropAgeInfo, irrRec,
    pestConfidence, advisoryCache, setAdvisoryCache,
    advisoryCacheKey, setAdvisoryCacheKey,
    advisoryGeneratedAt, setAdvisoryGeneratedAt,
  } = useFarm();

  const [loading, setLoading] = useState(false);

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

  const currentKey = JSON.stringify({ ...liveData, ...cropInfo });

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = buildAdvisoryPrompt(liveData, cropInfo, pestConfidence);
      const raw    = await callMistral([{ role:"user", content:prompt }]);
      const sects  = parseAdvisorySections(raw);
      setAdvisoryCache(sects.length ? sects : [{ icon:"info", title:"AI Advisory", body:raw.trim() }]);
      setAdvisoryCacheKey(currentKey);
      setAdvisoryGeneratedAt(new Date());
    } catch (e) {
      setAdvisoryCache([{ icon:"info", title:"Advisory Unavailable", body:`Could not fetch advisory. Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const needFetch = !advisoryCache || advisoryCacheKey !== currentKey;

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
        <FaRobot style={{ display:"inline",marginRight:8 }} />AI Advisory Center
      </h1>
      <p style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
        ? "0.65rem"
        : "0.72rem",color:"#4a7a42",marginBottom:16,lineHeight:1.6,overflowWrap:"break-word"}}>
        Live AI-generated agronomic recommendations · Mistral AI · {cropInfo.crop} ({cropInfo.variety}) · {cropInfo.acres} acres · Day {cropInfo.cropAgeDays} · Stage: {liveData.cropStage}
      </p>

      {/* Snapshot bar */}
      <div style={{ background:"#0b180a",border:"1px solid #1e3d1a",borderRadius:10,padding:isMobile
  ? "10px"
  : "10px 14px",marginBottom:16,fontFamily:"'Space Mono',monospace",fontSize:"0.7rem",color:"#4a7a42",display:"flex",flexWrap:"wrap",gap:"0 12px",width:"100%",boxSizing:"border-box"}}>
        {[
          ["Crop", `${cropInfo.crop} · ${cropInfo.variety}`],
          ["Age", `${cropInfo.cropAgeDays}d`],
          ["Stage", liveData.cropStage],
          ["Harvest", cropAgeInfo.estimatedHarvestDate],
          ["Moisture", `${liveData.moistureNumeric}% (${liveData.moistureLabel})`],
          ["Temp", `${liveData.temp}°C`],
          ["Irrigation", `${irrRec.status} (${irrRec.urgency})`],
        ].map(([k,v]) => (
          <span key={k}>{k}: <span style={{ color:"#61ba6a" }}>{v}</span></span>
        ))}
      </div>

      <div
        style={{
          display:"flex",

          flexDirection:isMobile
            ? "column"
            : "row",

          alignItems:isMobile
            ? "stretch"
            : "center",

          gap:12,

          marginBottom:20
        }}
      >
        <button onClick={generate} disabled={loading}
          style={{ display:"flex",  width:isMobile
            ? "100%"
            : "auto",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",border:"1px solid #2a6a2a",background:"rgba(22,163,74,0.15)",color:"#61ba6a",transition:"all 0.2s" }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.background="rgba(22,163,74,0.25)"; }}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.background="rgba(22,163,74,0.15)"; }}>
          <FaSyncAlt size={12} style={{ animation:loading?"spin 1s linear infinite":"none" }} />
          {loading ? "Generating…" : needFetch ? "Generate Advisory" : "Regenerate Advisory"}
        </button>
        {advisoryGeneratedAt && (
          <span style={{ fontFamily:"'Space Mono',monospace",fontSize:isMobile
  ? "0.62rem"
  : "0.68rem",color:"#3a6633" }}>
            Last: {advisoryGeneratedAt.toLocaleTimeString()}
          </span>
        )}
      </div>

      {loading && <LoadingSpinner text="Analysing live farm data with Mistral AI…" />}

      {!loading && advisoryCache && (
        <div style={{ display:"grid",gridTemplateColumns:isMobile
          ? "1fr"
          : "repeat(auto-fill,minmax(550px,1fr))",gap:16,marginBottom:16 }}>
          {advisoryCache.map((s, i) => (
            <AdvisoryCard key={i} icon={s.icon} title={s.title} body={s.body}
              meta={advisoryGeneratedAt ? `AI-generated · ${cropInfo.crop} · ${cropInfo.acres} acres · Day ${cropInfo.cropAgeDays} · ${advisoryGeneratedAt.toLocaleTimeString()}` : null} />
          ))}
        </div>
      )}

      {!loading && !advisoryCache && (
        <AlertCard variant="info">Click "Generate Advisory" to get AI-powered recommendations based on your live farm data.</AlertCard>
      )}

      <AlertCard variant="info" style={{ marginTop:16 }}>
        Advisory is AI-generated. Always validate with a qualified agronomist before applying inputs at scale.
      </AlertCard>
    </div>
  );
}