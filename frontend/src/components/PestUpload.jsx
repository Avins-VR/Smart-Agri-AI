// src/components/PestUpload.jsx
import { useState, useRef, useEffect } from "react";
import { FaUpload, FaMicroscope } from "react-icons/fa";
import { useFarm } from "../context/FarmContext";
import { mlApi } from "../services/api";
import { computeHealthScore, getHealthStatus } from "../utils/farmLogic";

export default function PestUpload() {
  const { liveData, pestPrediction, pestConfidence, pestImageUploaded,
          setPestPrediction, setPestConfidence, setPestImageUploaded } = useFarm();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleFile = (f) => {
    if (!f) return;

    setFile(f);

    const reader = new FileReader();

    reader.onload = (e) => {
      setPreview(e.target.result);
    };

    reader.readAsDataURL(f);
  };
  const handlePredict = async () => {
    if (!file) return;
    setRunning(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await mlApi.pestPredict(fd);
      setPestPrediction(res.data.prediction);
      setPestConfidence(res.data.confidence);
      setPestImageUploaded(true);
    } catch (err) {
      console.error("Pest predict failed:", err);

      console.log("Response:", err?.response);
      console.log("Data:", err?.response?.data);
      console.log("Status:", err?.response?.status);

      alert(
        err?.response?.data?.message ||
        "Pest prediction failed"
      );
    } finally {
      setRunning(false);
    }
  };

  const pred        = pestPrediction;
  const conf        = pestConfidence;
  const predColor   = pred === "Healthy" ? "#61ba6a" : "#fa5d5d";
  const predBg      = pred === "Healthy" ? "#0d2b0d" : "#2b0909";
  const predBorder  = pred === "Healthy" ? "#2a6a2a" : "#6a1a1a";
  const pestDisp    = pred === "Healthy" ? "Not Detected" : "Detected";
  const hNow        = computeHealthScore(pred, liveData.moistureNumeric, liveData.temp, liveData.humidity, liveData.n, liveData.p, liveData.k);
  const hStat       = getHealthStatus(hNow);
  const recText     = pred === "Healthy"
    ? "No pest treatment required. Continue standard care."
    : "Apply targeted pesticide immediately. Inspect field zones.";

  return (
    <div
      style={{
        display:"grid",

        gridTemplateColumns:isMobile
          ? "1fr"
          : "1fr 1fr",

        gap:isMobile ? 16 : 24,

        width:"100%",

        maxWidth:"100%"
      }}
    >
      {/* Upload column */}
      <div
        style={{
          width:"100%",
          minWidth:0
        }}
      >
        <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.68rem",color:"#4a7a42",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8 }}>
          Upload Crop Image
        </p>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); }}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border:"1.5px dashed rgba(74,222,128,0.25)",

            borderRadius:12,

            padding:preview
              ? "12px"
              : (isMobile ? "20px" : "32px"),

            width:"100%",

            boxSizing:"border-box",

            minHeight:isMobile ? 180 : "auto",textAlign:"center",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Space Mono',monospace" }}
          onMouseEnter={e => e.currentTarget.style.borderColor="rgba(74,222,128,0.5)"}
          onMouseLeave={e => e.currentTarget.style.borderColor="rgba(74,222,128,0.25)"}
        >
          {preview ? (
            <img
            src={preview}
            alt="Upload"
            style={{
              width:"100%",

              maxWidth:"100%",

              maxHeight:isMobile ? 220 : 200,

              borderRadius:8,

              objectFit:"cover"
            }}
          />
          ) : (
            <>
              <FaUpload size={24} color="rgba(74,222,128,0.4)" style={{ marginBottom:8 }} />
              <p style={{ fontSize:"0.72rem",color:"#3a6633" }}>Click or drag to upload</p>
              <p style={{ fontSize:"0.6rem",color:"#2a5a28" }}>JPG / PNG / JPEG</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }}
          onChange={e => handleFile(e.target.files[0])} />

        {file && (
          <button onClick={handlePredict} disabled={running}
            style={{ marginTop:10,width:"100%",padding:"11px",borderRadius:10,fontSize:isMobile ? 12 : 13,fontWeight:600,cursor:running?"not-allowed":"pointer",border:"1px solid rgba(74,222,128,0.4)",background:running?"rgba(22,163,74,0.4)":"linear-gradient(135deg,#16a34a,#15803d)",color:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s" }}>
            {running ? (
              <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14,animation:"spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Analysing…</>
            ) : (
              <><FaMicroscope size={13} /> Run Pest Prediction</>
            )}
          </button>
        )}
      </div>

      {/* Result column */}
      <div style={{ fontFamily:"'Space Mono',monospace",width:"100%",minWidth:0 }}>
        <p style={{ fontSize:"0.68rem",color:"#4a7a42",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12 }}>
          Prediction Result
        </p>
        {pestImageUploaded ? (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <div>
              <p style={{ fontSize:"0.62rem",color:"#4a7a42",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>Classification</p>
              <p
                style={{
                  fontSize:isMobile
                    ? "1.2rem"
                    : "1.5rem",

                  fontWeight:700,

                  color:predColor,

                  wordBreak:"break-word"
                }}
              >{pred}</p>
            </div>
            <div style={{ background:predBg,border:`1px solid ${predBorder}`,borderRadius:8,padding:"6px 12px",fontSize:"0.7rem",color:predColor }}>
              Confidence: {conf?.toFixed(1)}%
            </div>
            <div>
              <p style={{ fontSize:"0.62rem",color:"#4a7a42",marginBottom:2 }}>Pest Status</p>
              <p style={{ fontWeight:700,color: pestDisp==="Not Detected" ? "#61ba6a" : "#fa5d5d" }}>{pestDisp}</p>
            </div>
            <div>
              <p style={{ fontSize:"0.62rem",color:"#4a7a42",marginBottom:2 }}>Health Score</p>
              <p style={{ fontWeight:700,color:hStat.color }}>{hNow}/100 — {hStat.label}</p>
            </div>
            <div style={{
              background:"#0b180a",

              border:"1px solid #1e3d1a",

              borderRadius:8,

              padding:isMobile
                ? "10px"
                : "8px 12px",

              width:"100%",

              boxSizing:"border-box",fontSize:"0.7rem",color:"#c8e8b2",lineHeight:1.6 }}>
              <span style={{ fontSize:"0.58rem",color:"#4a7a42",textTransform:"uppercase",letterSpacing:"0.08em" }}>Recommendation</span><br />
              {recText}
            </div>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:isMobile
            ? 160
            : 220,color:"#3a6633",textAlign:"center",gap:8 }}>
            <FaMicroscope size={28} color="rgba(74,222,128,0.2)" />
            <p style={{ fontSize:"0.72rem" }}>Awaiting image upload</p>
            <p style={{ fontSize:"0.62rem",color:"#2a5a28" }}>Upload and predict to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
}