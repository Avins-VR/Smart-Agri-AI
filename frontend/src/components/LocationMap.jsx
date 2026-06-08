// src/components/LocationMap.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import SectionHead from "./SectionHead";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationMap() {
  const [loc, setLoc] = useState(null);
  const [place, setPlace] = useState({ name:"Unknown Area", city:"", state:"", country:"" });
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setDenied(true); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLoc({ lat, lng });
        try {
            const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
            {
                headers: {
                "User-Agent": "SmartAgriAI",
                "Accept-Language": "en"
                }
            }
            );
          const d = await r.json();
          const addr = d.address || {};
          setPlace({
            name:    addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || "Unknown Area",
            city:    addr.city || addr.town || addr.district || "",
            state:   addr.state || "",
            country: addr.country || "",
            lat: lat.toFixed(5), lng: lng.toFixed(5),
          });
        } catch { /* keep defaults */ }
      },
      () => setDenied(true)
    );
  }, []);

  return (
    <div>
      <SectionHead><FaMapMarkerAlt style={{ display:"inline",marginRight:8 }} />Current Location</SectionHead>
      {denied ? (
        <div style={{ background:"linear-gradient(135deg,#0e1f0c,#111a0f)",border:"1px solid #1e3d1a",borderRadius:14,padding:"2rem",textAlign:"center",fontFamily:"'Space Mono',monospace",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8 }}>
          <p style={{ fontSize:"0.65rem",color:"#fa5d5d",textTransform:"uppercase",letterSpacing:"0.12em" }}>Location Access Denied</p>
          <p style={{ fontSize:"1.1rem",fontWeight:700,color:"#c8e8b2" }}>Allow Browser Location</p>
        </div>
      ) : loc ? (
        <div style={{ borderRadius:14,overflow:"hidden",border:"1px solid #1e3d1a" }}>
          <div style={{ background:"linear-gradient(135deg,#0d1b0c,#101710)",padding:"10px 14px",fontFamily:"'Space Mono',monospace",borderBottom:"none" }}>
            <p style={{ fontSize:"0.65rem",color:"#61ba6a",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:700,marginBottom:2 }}>Live Farm Location</p>
            <p style={{ fontSize:"1rem",fontWeight:700,color:"#d7f5c8",margin:0 }}>{place.name}</p>
            <p style={{ fontSize:"0.75rem",color:"#7edc87",margin:0 }}>{place.city}, {place.state}, {place.country}</p>
            <p style={{ fontSize:"0.6rem",color:"#4a7a42",marginTop:4 }}>Lat: {place.lat} | Lon: {place.lng}</p>
          </div>
          <MapContainer center={[loc.lat, loc.lng]} zoom={15} style={{ height:300,width:"100%" }}
            attributionControl={false} scrollWheelZoom>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[loc.lat, loc.lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div style={{ background:"rgba(14,31,12,0.5)",border:"1px solid #1e3d1a",borderRadius:14,height:250,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ textAlign:"center",fontFamily:"'Space Mono',monospace",color:"#4a7a42",fontSize:"0.75rem" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:20,height:20,animation:"spin 1s linear infinite",margin:"0 auto 8px",display:"block" }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Getting location…
          </div>
        </div>
      )}
    </div>
  );
}