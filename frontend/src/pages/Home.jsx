import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── Icons ──────────────────────────────────────────────────────────────────────
const SproutIcon = ({ size = 20, color = "#4ade80" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{ width: size, height: size }}>
    <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 1 1.3 4.5c-1-.1-1.9-.4-2.6-.9" />
  </svg>
);

const PlusIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size }}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EditIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ChevronDown = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MapPinIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const LeafIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const DropletIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const LayersIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const GridIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const XIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size }}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowRightIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: size, height: size }}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const SunIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const LogOutIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ClockIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Constants ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token =
    localStorage.getItem("agri_token") ||
    sessionStorage.getItem("agri_token");

  return {
    Authorization: `Bearer ${token}`,
  };
};
const CROP_TYPES = ["Wheat","Rice","Maize","Cotton","Sugarcane","Tomato","Paddy","Other"];
const SOIL_TYPES = [    "Clay",
    "Sandy",
    "Loamy",
    "Silt",
    "Peaty",
    "Saline","Other"];
const FARMING_TYPES = ["Conventional","Organic","Precision","Hydroponic","Greenhouse","Mixed","Sustainable","Biodynamic"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "acres-desc", label: "Largest First" },
  { value: "acres-asc", label: "Smallest First" },
];

const CROP_COLORS = {
  Wheat: "#d4a017", Rice: "#7ab648", Maize: "#f5c518", Cotton: "#e0e0e0",
  Sugarcane: "#2e7d32", Tomato: "#e53935", Paddy: "#a1887f",
  Other: "#4ade80",
};

// ── Utility ────────────────────────────────────────────────────────────────────
const getCropColor = (crop) => CROP_COLORS[crop] || "#4ade80";
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getTimeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Setup Modal ────────────────────────────────────────────────────────────────
function SetupModal({ land, onClose, onSave }) {
  const isEdit = land && land.configured;
  const [form, setForm] = useState({
    name: land?.name || "", crop: land?.crop || "", soil: land?.soil || "",
    location: land?.location || "", acres: land?.acres || "",
    farmingType: land?.farmingType || "", plantingDate: land?.plantingDate || "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => { setTimeout(() => setVisible(true), 30); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 300); };

  const rules = {
    name: v => !v.trim() ? "Land name is required" : "",
    crop: v => !v ? "Crop type is required" : "",
    soil: v => !v ? "Soil type is required" : "",
    location: v => !v.trim() ? "Location is required" : "",
    acres: v => !v ? "Total acres is required" : isNaN(v) || Number(v) <= 0 ? "Enter a valid number" : "",
    farmingType: v => !v ? "Farming type is required" : "",
    plantingDate: v => !v ? "Planting date is required" : "",
  };

  const validate = (field, val) => {
    const msg = rules[field](val);
    setErrors(e => msg ? { ...e, [field]: msg } : (() => { const c = { ...e }; delete c[field]; return c; })());
    return msg;
  };

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (touched[field]) validate(field, val);
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    validate(field, form[field]);
  };

  const step1Fields = ["name", "crop", "soil", "location"];
  const step2Fields = ["acres", "farmingType", "plantingDate"];

  const nextStep = () => {
    const fields = step === 1 ? step1Fields : step2Fields;
    const newTouched = Object.fromEntries(fields.map(f => [f, true]));
    setTouched(t => ({ ...t, ...newTouched }));
    const errs = {};
    fields.forEach(f => { const m = rules[f](form[f]); if (m) errs[f] = m; });
    setErrors(e => ({ ...e, ...errs }));
    if (Object.keys(errs).length === 0) setStep(2);
  };

  const handleSave = async () => {
    const allFields = [...step1Fields, ...step2Fields];
    const newTouched = Object.fromEntries(allFields.map(f => [f, true]));
    setTouched(newTouched);
    const errs = {};
    allFields.forEach(f => { const m = rules[f](form[f]); if (m) errs[f] = m; });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    onSave(form);
  };

  const inputStyle = (field) => ({
    width: "100%", background: "rgba(15,30,18,0.9)", color: "#e2e8f0",
    border: `1px solid ${errors[field] && touched[field] ? "rgba(248,113,113,0.5)" : "rgba(74,222,128,0.2)"}`,
    borderRadius: 10, padding: "11px 14px", fontSize: 13.5, outline: "none",
    transition: "border-color 0.2s,box-shadow 0.2s", boxSizing: "border-box",
    appearance: "none", WebkitAppearance: "none",
  });

  const selectStyle = (field) => ({ ...inputStyle(field), cursor: "pointer" });

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && close()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: `rgba(5,12,7,${visible ? 0.85 : 0})`,
        backdropFilter: visible ? "blur(8px)" : "blur(0px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", transition: "all 0.3s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto",
        background: "rgba(10,22,14,0.97)", border: "1px solid rgba(74,222,128,0.18)",
        borderRadius: 22, boxShadow: "0 0 80px rgba(34,197,94,0.2),0 32px 64px rgba(0,0,0,0.6)",
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.96)",
        opacity: visible ? 1 : 0, transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, background: "linear-gradient(135deg,#f0fdf4,#86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.02em" }}>
              {isEdit ? "Edit Land Details" : "Configure Your Land"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "rgba(134,239,172,0.5)" }}>
              {isEdit ? "Update land configuration" : `Step ${step} of 2 — ${step === 1 ? "Basic Info" : "Farm Details"}`}
            </p>
          </div>
          <button onClick={close} style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 8, color: "rgba(74,222,128,0.6)", cursor: "pointer", padding: 7, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.15)"; e.currentTarget.style.color = "#4ade80"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(74,222,128,0.08)"; e.currentTarget.style.color = "rgba(74,222,128,0.6)"; }}>
            <XIcon size={16} />
          </button>
        </div>

        {/* Step progress (only for new) */}
        {!isEdit && (
          <div style={{ padding: "16px 28px 0", display: "flex", gap: 6 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "linear-gradient(90deg,#16a34a,#4ade80)" : "rgba(74,222,128,0.12)", transition: "all 0.3s" }} />
            ))}
          </div>
        )}

        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Step 1 OR Edit: Basic Info */}
          {(step === 1 || isEdit) && (
            <>
              <Field label="Land Name" error={errors.name} touched={touched.name}>
                <input value={form.name} onChange={e => handleChange("name", e.target.value)} onBlur={() => handleBlur("name")} placeholder="e.g. North Field, Farm A…" style={inputStyle("name")}
                  onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                  onBlurCapture={e => { e.target.style.boxShadow = "none"; }} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Crop Type" error={errors.crop} touched={touched.crop}>
                  <div style={{ position: "relative" }}>
                    <select value={form.crop} onChange={e => handleChange("crop", e.target.value)} onBlur={() => handleBlur("crop")} style={selectStyle("crop")}
                      onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                      onBlurCapture={e => { e.target.style.boxShadow = "none"; }}>
                      <option value="" style={{ background: "#0a160e" }}>Select crop</option>
                      {CROP_TYPES.map(c => <option key={c} value={c} style={{ background: "#0a160e" }}>{c}</option>)}
                    </select>
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(74,222,128,0.4)" }}><ChevronDown /></div>
                  </div>
                </Field>
                <Field label="Soil Type" error={errors.soil} touched={touched.soil}>
                  <div style={{ position: "relative" }}>
                    <select value={form.soil} onChange={e => handleChange("soil", e.target.value)} onBlur={() => handleBlur("soil")} style={selectStyle("soil")}
                      onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                      onBlurCapture={e => { e.target.style.boxShadow = "none"; }}>
                      <option value="" style={{ background: "#0a160e" }}>Select soil</option>
                      {SOIL_TYPES.map(s => <option key={s} value={s} style={{ background: "#0a160e" }}>{s}</option>)}
                    </select>
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(74,222,128,0.4)" }}><ChevronDown /></div>
                  </div>
                </Field>
              </div>
              <Field label="Location" error={errors.location} touched={touched.location}>
                <input value={form.location} onChange={e => handleChange("location", e.target.value)} onBlur={() => handleBlur("location")} placeholder="Village, District, State…" style={inputStyle("location")}
                  onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                  onBlurCapture={e => { e.target.style.boxShadow = "none"; }} />
              </Field>
            </>
          )}

          {/* Step 2 OR Edit: Farm Details */}
          {(step === 2 || isEdit) && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Total Acres" error={errors.acres} touched={touched.acres}>
                  <input type="number" min="0" step="0.1" value={form.acres} onChange={e => handleChange("acres", e.target.value)} onBlur={() => handleBlur("acres")} placeholder="e.g. 12.5" style={inputStyle("acres")}
                    onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                    onBlurCapture={e => { e.target.style.boxShadow = "none"; }} />
                </Field>
                <Field label="Planting Date" error={errors.plantingDate} touched={touched.plantingDate}>
                  <input type="date" value={form.plantingDate} onChange={e => handleChange("plantingDate", e.target.value)} onBlur={() => handleBlur("plantingDate")} style={{ ...inputStyle("plantingDate"), colorScheme: "dark" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                    onBlurCapture={e => { e.target.style.boxShadow = "none"; }} />
                </Field>
              </div>
              <Field label="Farming Type" error={errors.farmingType} touched={touched.farmingType}>
                <div style={{ position: "relative" }}>
                  <select value={form.farmingType} onChange={e => handleChange("farmingType", e.target.value)} onBlur={() => handleBlur("farmingType")} style={selectStyle("farmingType")}
                    onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                    onBlurCapture={e => { e.target.style.boxShadow = "none"; }}>
                    <option value="" style={{ background: "#0a160e" }}>Select type</option>
                    {FARMING_TYPES.map(t => <option key={t} value={t} style={{ background: "#0a160e" }}>{t}</option>)}
                  </select>
                  <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(74,222,128,0.4)" }}><ChevronDown /></div>
                </div>
              </Field>
            </>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {step === 2 && !isEdit && (
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.06)", color: "rgba(134,239,172,0.7)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(74,222,128,0.06)"; }}>
                ← Back
              </button>
            )}
            <button onClick={isEdit ? handleSave : step === 1 ? nextStep : handleSave} disabled={saving}
              style={{ flex: 2, padding: "13px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", border: "1px solid rgba(74,222,128,0.4)", background: saving ? "rgba(22,163,74,0.4)" : "linear-gradient(135deg,#16a34a,#15803d)", color: "#f0fdf4", boxShadow: saving ? "none" : "0 4px 20px rgba(22,163,74,0.3)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = "linear-gradient(135deg,#15803d,#166534)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { if (!saving) { e.currentTarget.style.background = "linear-gradient(135deg,#16a34a,#15803d)"; e.currentTarget.style.transform = ""; }}}>
              {saving ? (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg> Saving…</>
              ) : isEdit ? "Save Changes" : step === 1 ? "Next Step →" : "Save Land"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, touched, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, marginBottom: 6, color: "rgba(134,239,172,0.75)" }}>{label}</label>
      {children}
      {error && touched && <p style={{ color: "#f87171", fontSize: 11.5, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
function DeleteModal({ land, onClose, onConfirm }) {
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => { setTimeout(() => setVisible(true), 30); }, []);
  const close = () => { setVisible(false); setTimeout(onClose, 250); };
  const confirm = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 600));
    onConfirm();
  };

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && close()}
      style={{ position: "fixed", inset: 0, zIndex: 1100, background: `rgba(5,12,7,${visible ? 0.88 : 0})`, backdropFilter: visible ? "blur(8px)" : "blur(0)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, transition: "all 0.25s" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(10,22,14,0.98)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 18, padding: "28px", boxShadow: "0 0 60px rgba(239,68,68,0.15)", transform: visible ? "scale(1)" : "scale(0.94)", opacity: visible ? 1 : 0, transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <TrashIcon size={22} />
        </div>
        <h3 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 17, fontWeight: 700, color: "#fecaca" }}>Delete Land?</h3>
        <p style={{ margin: "0 0 22px", textAlign: "center", fontSize: 13.5, color: "rgba(134,239,172,0.5)", lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: "rgba(134,239,172,0.8)" }}>{land.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={close} style={{ flex: 1, padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.06)", color: "rgba(134,239,172,0.7)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(74,222,128,0.06)"}>
            Cancel
          </button>
          <button onClick={confirm} disabled={deleting} style={{ flex: 1, padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", border: "1px solid rgba(239,68,68,0.4)", background: deleting ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.2)", color: "#fca5a5", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = "rgba(239,68,68,0.3)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; }}}
            onMouseLeave={e => { if (!deleting) { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}}>
            {deleting ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }}><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" /></svg> Deleting…</> : <><TrashIcon size={13} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Land Card ──────────────────────────────────────────────────────────────────
function LandCard({ land, onOpen, onEdit, onDelete, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cropColor = getCropColor(land.crop);

  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!land.configured) {
    return (
      <div onClick={() => onOpen(land)}
        style={{ borderRadius: 16, border: "1.5px dashed rgba(74,222,128,0.2)", background: "rgba(10,22,14,0.4)", padding: "28px 20px", cursor: "pointer", transition: "all 0.25s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 180, transform: visible ? "translateY(0)" : "translateY(20px)", opacity: visible ? 1 : 0, transitionDelay: `${delay}ms` }}
        onMouseEnter={e => { e.currentTarget.style.border = "1.5px dashed rgba(74,222,128,0.45)"; e.currentTarget.style.background = "rgba(74,222,128,0.04)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
        onMouseLeave={e => { e.currentTarget.style.border = "1.5px dashed rgba(74,222,128,0.2)"; e.currentTarget.style.background = "rgba(10,22,14,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PlusIcon size={20} />
        </div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "rgba(134,239,172,0.5)" }}>Configure Land</p>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(74,222,128,0.3)" }}>Click to set up {land.name}</p>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 16, border: "1px solid rgba(74,222,128,0.12)", background: "rgba(10,22,14,0.85)",
      overflow: "hidden", cursor: "pointer", transition: "all 0.25s",
      transform: visible ? "translateY(0)" : "translateY(20px)", opacity: visible ? 1 : 0,
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)", position: "relative",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4),0 0 0 1px ${hexToRgba(cropColor, 0.25)}`; e.currentTarget.style.borderColor = hexToRgba(cropColor, 0.3); }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; e.currentTarget.style.borderColor = "rgba(74,222,128,0.12)"; }}>
      {/* Crop color accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cropColor}, ${hexToRgba(cropColor, 0.3)})` }} />

      <div style={{ padding: "18px 18px 14px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: hexToRgba(cropColor, 0.12), border: `1px solid ${hexToRgba(cropColor, 0.25)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LeafIcon size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{land.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: cropColor, background: hexToRgba(cropColor, 0.1), border: `1px solid ${hexToRgba(cropColor, 0.2)}`, padding: "1px 7px", borderRadius: 20 }}>{land.crop}</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.14)", borderRadius: 7, padding: "5px 8px", cursor: "pointer", color: "rgba(134,239,172,0.5)", display: "flex", alignItems: "center", transition: "all 0.15s", fontSize: 16, lineHeight: 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.15)"; e.currentTarget.style.color = "#4ade80"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(74,222,128,0.07)"; e.currentTarget.style.color = "rgba(134,239,172,0.5)"; }}>
              ⋮
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "rgba(8,18,10,0.98)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 50, minWidth: 160, overflow: "hidden" }}>
                {[
                  { label: "Open Dashboard", icon: <ArrowRightIcon size={13} />, action: () => { setMenuOpen(false); onOpen(land); }, color: "#4ade80" },
                  { label: "Edit Details", icon: <EditIcon />, action: () => { setMenuOpen(false); onEdit(land); }, color: "rgba(134,239,172,0.7)" },
                  { label: "Delete Land", icon: <TrashIcon />, action: () => { setMenuOpen(false); onDelete(land); }, color: "#f87171", danger: true },
                ].map((item, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); item.action(); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: item.danger ? "#f87171" : item.color, borderBottom: i < 2 ? "1px solid rgba(74,222,128,0.07)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = item.danger ? "rgba(239,68,68,0.08)" : "rgba(74,222,128,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    {item.icon}{item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {[
            { icon: <MapPinIcon />, text: land.location },
            { icon: <LayersIcon />, text: land.soil },
            { icon: <DropletIcon />, text: land.irrigation },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.1)", borderRadius: 20, padding: "3px 9px", color: "rgba(134,239,172,0.55)", fontSize: 11.5 }}>
              {item.icon}<span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(74,222,128,0.08)" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(74,222,128,0.4)" }}>Acres</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: cropColor }}>{land.acres}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(74,222,128,0.4)" }}>Planted</p>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "rgba(134,239,172,0.6)" }}>{formatDate(land.plantingDate)}</p>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onOpen(land); }}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: hexToRgba(cropColor, 0.1), border: `1px solid ${hexToRgba(cropColor, 0.25)}`, color: cropColor, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = hexToRgba(cropColor, 0.18); e.currentTarget.style.transform = "translateX(2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = hexToRgba(cropColor, 0.1); e.currentTarget.style.transform = ""; }}>
            Dashboard <ArrowRightIcon size={11} />
          </button>
        </div>
      </div>

      {/* Last accessed badge */}
      {land.lastAccessed && (
        <div style={{ position: "absolute", top: 12, right: 48, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(74,222,128,0.1)", borderRadius: 20, padding: "2px 7px", fontSize: 10.5, color: "rgba(134,239,172,0.4)" }}>
          <ClockIcon size={10} />{getTimeAgo(land.lastAccessed)}
        </div>
      )}
    </div>
  );
}

// ── Add Land Card ──────────────────────────────────────────────────────────────
function AddLandCard({ onClick, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div onClick={onClick}
      style={{ borderRadius: 16, border: "1.5px dashed rgba(74,222,128,0.18)", background: "transparent", padding: "28px 20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 200, transition: "all 0.25s", transform: visible ? "translateY(0)" : "translateY(20px)", opacity: visible ? 1 : 0 }}
      onMouseEnter={e => { e.currentTarget.style.border = "1.5px dashed rgba(74,222,128,0.45)"; e.currentTarget.style.background = "rgba(74,222,128,0.03)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1.5px dashed rgba(74,222,128,0.18)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(74,222,128,0.07)", border: "1.5px dashed rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(74,222,128,0.6)" }}>
        <PlusIcon size={22} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "rgba(134,239,172,0.5)" }}>Add New Land</p>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(74,222,128,0.3)" }}>Configure a new farm</p>
      </div>
    </div>
  );
}

// ── Main Home Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [setupModal, setSetupModal] = useState(null); // null | land object
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sortRef = useRef(null);

  // Get user info from storage
  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem("agri_user") || localStorage.getItem("agri_user") || "{}"); } catch { return {}; }
  })();
  const firstName = user?.full_name
  ? user.full_name.split(" ")[0]
  : "Farmer";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  useEffect(() => {
    axios
      .get(`${API}/lands`, {
        headers: authHeaders(),
      })
      .then((res) => {
        setLands(res.data.lands);
      })
      .catch((err) => {
        console.error(
          "Failed to load lands:",
          err
        );
      });
  }, []);
  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Stats
  const configured = lands.filter(l => l.configured);
  const totalAcres = configured.reduce((s, l) => s + (parseFloat(l.acres) || 0), 0);
  const recentLands = [...configured].sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0)).slice(0, 3);

  // Filter + sort
  const filtered = lands
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || (l.crop || "").toLowerCase().includes(search.toLowerCase()) || (l.location || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "acres-desc") return (parseFloat(b.acres) || 0) - (parseFloat(a.acres) || 0);
      if (sort === "acres-asc") return (parseFloat(a.acres) || 0) - (parseFloat(b.acres) || 0);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

const handleOpenLand = (land) => {
  if (!land.configured) {
    setSetupModal(land);
    return;
  }

  localStorage.setItem(
    "selectedLand",
    JSON.stringify(land)
  );

  setLands(prev =>
    prev.map(l =>
      l.id === land.id
        ? { ...l, lastAccessed: new Date().toISOString() }
        : l
    )
  );

  navigate(`/dashboard/${land.id}`);
};

  const handleSetupSave = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        crop: formData.crop,
        soil: formData.soil,
        acres: parseFloat(formData.acres),
        farmingType: formData.farmingType,
        plantingDate: formData.plantingDate,
      };

      const res = await axios.post(
        `${API}/lands`,
        payload,
        {
          headers: authHeaders(),
        }
      );

      const savedLand = {
        ...res.data.land,
        configured: true,
      };

      setLands((prev) => [
        ...prev,
        savedLand,
      ]);
      setSetupModal(null);

      localStorage.setItem(
        "selectedLand",
        JSON.stringify(savedLand)
      );

      setSetupModal(null);

      navigate("/home");

    } catch (err) {
      console.error(
        "Save failed:",
        err.response?.data || err.message
      );
    }
  };

  const handleEditSave = async (formData) => {
    try {
      const res = await axios.put(
        `${API}/lands/${editModal.id}`,
        {
          name: formData.name,
          location: formData.location,
          crop: formData.crop,
          soil: formData.soil,
          acres: parseFloat(formData.acres),
          farmingType: formData.farmingType,
          plantingDate: formData.plantingDate,
        },
        {
          headers: authHeaders(),
        }
      );

      setLands((prev) =>
        prev.map((l) =>
          l.id === editModal.id
            ? res.data.land
            : l
        )
      );

      setEditModal(null);

    } catch (err) {
      
      console.error(
        "Edit failed:",
        err.response?.data || err.message
      );
    }
  };

  const handleAddLand = () => {
    setSetupModal({});
  };

  const handleDelete = async (land) => {
    try {
      await axios.delete(
        `${API}/lands/${land.id}`,
        {
          headers: authHeaders(),
        }
      );

      setLands((prev) =>
        prev.filter(
          (l) => l.id !== land.id
        )
      );

      setDeleteModal(null);

    } catch (err) {
      console.error(
        "Delete failed:",
        err.response?.data || err.message
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agri_token"); localStorage.removeItem("agri_user");
    sessionStorage.removeItem("agri_token"); sessionStorage.removeItem("agri_user");
    navigate("/");
  };

  const statCards = [
    { label: "Total Lands", value: lands.length, sub: "registered", color: "#4ade80" },
    { label: "Configured", value: configured.length, sub: "ready to use", color: "#34d399" },
    { label: "Total Acres", value: totalAcres.toFixed(1), sub: "under management", color: "#86efac" },
    { label: "Active Crops", value: new Set(configured.map(l => l.crop).filter(Boolean)).size, sub: "crop varieties", color: "#a7f3d0" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1a0f 0%,#0f2b18 30%,#1a3a24 60%,#0d2419 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0", position: "relative", overflow: "hidden" }}>
      {/* Ambient BG */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 20% 20%,rgba(34,197,94,0.07) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(16,185,129,0.05) 0%,transparent 60%)", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(74,222,128,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* ── Navbar ── */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", transform: mounted ? "translateY(0)" : "translateY(-16px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(22,163,74,0.2)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SproutIcon size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg,#f0fdf4,#86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smart Agri AI</p>
              <p style={{ margin: 0, fontSize: 10.5, color: "rgba(74,222,128,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI-Powered Farm Intelligence</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 10, padding: "7px 14px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,rgba(22,163,74,0.3),rgba(4,120,87,0.2))", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#4ade80" }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(134,239,172,0.8)" }}>{firstName}</span>
            </div>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid rgba(74,222,128,0.12)", background: "rgba(74,222,128,0.04)", color: "rgba(134,239,172,0.5)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(74,222,128,0.04)"; e.currentTarget.style.color = "rgba(134,239,172,0.5)"; e.currentTarget.style.borderColor = "rgba(74,222,128,0.12)"; }}>
              <LogOutIcon /> Sign Out
            </button>
          </div>
        </nav>

        {/* ── Hero / Welcome ── */}
        <div style={{ padding: "20px 0 32px", transform: mounted ? "translateY(0)" : "translateY(16px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.1s" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(74,222,128,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
                <SunIcon size={14} />{getGreeting()}
              </p>
              <h1 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg,#f0fdf4 0%,#86efac 60%,#4ade80 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
                Welcome back, {firstName}
              </h1>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(134,239,172,0.5)", lineHeight: 1.5 }}>
                Manage your farms, track crops, and unlock AI-powered insights.
              </p>
            </div>
            <button onClick={handleAddLand}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(74,222,128,0.35)", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#f0fdf4", boxShadow: "0 4px 20px rgba(22,163,74,0.25)", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#15803d,#166534)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(22,163,74,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#16a34a,#15803d)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.25)"; }}>
              <PlusIcon size={16} /> Add New Land
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32, transform: mounted ? "translateY(0)" : "translateY(16px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.15s" }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ borderRadius: 14, border: "1px solid rgba(74,222,128,0.1)", background: "rgba(10,22,14,0.7)", padding: "16px 18px", backdropFilter: "blur(20px)", transition: "all 0.2s", transitionDelay: `${i * 50}ms` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.1)"; e.currentTarget.style.transform = ""; }}>
              <p style={{ margin: "0 0 4px", fontSize: 11.5, color: "rgba(134,239,172,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p style={{ margin: "0 0 2px", fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11.5, color: "rgba(134,239,172,0.35)" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Recently Accessed ── */}
        {recentLands.length > 0 && (
          <div style={{ marginBottom: 32, transform: mounted ? "translateY(0)" : "translateY(16px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "rgba(74,222,128,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Recently Accessed</p>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {recentLands.map((land) => {
                const cc = getCropColor(land.crop);
                return (
                  <button key={land.id} onClick={() => handleOpenLand(land)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, border: `1px solid ${hexToRgba(cc, 0.2)}`, background: hexToRgba(cc, 0.06), cursor: "pointer", color: "inherit", flexShrink: 0, transition: "all 0.2s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.background = hexToRgba(cc, 0.12); e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = hexToRgba(cc, 0.06); e.currentTarget.style.transform = ""; }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cc, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(226,232,240,0.9)" }}>{land.name}</span>
                    <span style={{ fontSize: 11.5, color: "rgba(134,239,172,0.4)" }}>{land.crop}</span>
                    <span style={{ fontSize: 11, color: "rgba(74,222,128,0.3)", display: "flex", alignItems: "center", gap: 3 }}><ClockIcon size={10} />{getTimeAgo(land.lastAccessed)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Search + Filter Bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap", transform: mounted ? "translateY(0)" : "translateY(16px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.25s" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(74,222,128,0.4)", pointerEvents: "none" }}><SearchIcon /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lands, crops, locations…"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: "rgba(10,22,14,0.8)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, color: "#e2e8f0", fontSize: 13.5, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s,box-shadow 0.2s" }}
              onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.07)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(74,222,128,0.15)"; e.target.style.boxShadow = "none"; }} />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(74,222,128,0.4)", display: "flex", padding: 2 }}><XIcon size={14} /></button>}
          </div>

          {/* Sort dropdown */}
          <div ref={sortRef} style={{ position: "relative" }}>
            <button onClick={() => setSortOpen(!sortOpen)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(74,222,128,0.15)", background: "rgba(10,22,14,0.8)", color: "rgba(134,239,172,0.7)", fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)"; e.currentTarget.style.color = "#86efac"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.15)"; e.currentTarget.style.color = "rgba(134,239,172,0.7)"; }}>
              {SORT_OPTIONS.find(o => o.value === sort)?.label} <ChevronDown />
            </button>
            {sortOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "rgba(8,18,10,0.98)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 50, minWidth: 180, overflow: "hidden" }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 14px", background: sort === opt.value ? "rgba(74,222,128,0.08)" : "none", border: "none", borderBottom: "1px solid rgba(74,222,128,0.06)", cursor: "pointer", fontSize: 13, color: sort === opt.value ? "#4ade80" : "rgba(134,239,172,0.65)", textAlign: "left", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (sort !== opt.value) e.currentTarget.style.background = "rgba(74,222,128,0.05)"; }}
                    onMouseLeave={e => { if (sort !== opt.value) e.currentTarget.style.background = "none"; }}>
                    {opt.label}{sort === opt.value && <CheckIcon size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View mode */}
          <div style={{ display: "flex", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, overflow: "hidden" }}>
            {[{ mode: "grid", icon: <GridIcon /> }, { mode: "list", icon: <ListIcon /> }].map(({ mode, icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                style={{ padding: "9px 12px", background: viewMode === mode ? "rgba(74,222,128,0.12)" : "rgba(10,22,14,0.8)", border: "none", cursor: "pointer", color: viewMode === mode ? "#4ade80" : "rgba(74,222,128,0.35)", display: "flex", transition: "all 0.15s" }}
                onMouseEnter={e => { if (viewMode !== mode) e.currentTarget.style.background = "rgba(74,222,128,0.05)"; }}
                onMouseLeave={e => { if (viewMode !== mode) e.currentTarget.style.background = "rgba(10,22,14,0.8)"; }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section title ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "rgba(74,222,128,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Your Lands {search && `— ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </p>
          {lands.length > 0 && (
            <p style={{ margin: 0, fontSize: 12, color: "rgba(74,222,128,0.3)" }}>{lands.length} land{lands.length !== 1 ? "s" : ""} total</p>
          )}
        </div>

        {/* ── Empty state ── */}
        {lands.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", transform: mounted ? "translateY(0)" : "translateY(16px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.3s" }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(74,222,128,0.07)", border: "1.5px dashed rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <SproutIcon size={36} color="rgba(74,222,128,0.4)" />
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "rgba(134,239,172,0.6)" }}>No lands yet</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "rgba(74,222,128,0.35)", lineHeight: 1.6, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              Start by adding your first land to manage crops, monitor soil health, and unlock AI-driven insights.
            </p>
            <button onClick={handleAddLand}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(74,222,128,0.35)", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#f0fdf4", boxShadow: "0 4px 20px rgba(22,163,74,0.25)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(22,163,74,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.25)"; }}>
              <PlusIcon size={16} /> Add Your First Land
            </button>
          </div>
        )}

        {/* ── No search results ── */}
        {lands.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 14, color: "rgba(134,239,172,0.4)" }}>No lands match "<span style={{ color: "rgba(134,239,172,0.7)" }}>{search}</span>"</p>
            <button onClick={() => setSearch("")} style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, fontSize: 12.5, cursor: "pointer", border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.06)", color: "rgba(134,239,172,0.6)", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(74,222,128,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(74,222,128,0.06)"}>
              Clear search
            </button>
          </div>
        )}

        {/* ── Land Grid ── */}
        {filtered.length > 0 && (
          <div style={viewMode === "grid" ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 } : { display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((land, i) => (
              <LandCard key={land.id} land={land} delay={i * 60} onOpen={handleOpenLand} onEdit={(l) => setEditModal(l)} onDelete={(l) => setDeleteModal(l)} />
            ))}
            <AddLandCard onClick={handleAddLand} delay={filtered.length * 60} />
          </div>
        )}

        {lands.length > 0 && filtered.length === 0 && search === "" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            <AddLandCard onClick={handleAddLand} delay={100} />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {setupModal && <SetupModal land={setupModal} onClose={() => setSetupModal(null)} onSave={handleSetupSave} />}
      {editModal && <SetupModal land={editModal} onClose={() => setEditModal(null)} onSave={handleEditSave} />}
      {deleteModal && <DeleteModal land={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={() => handleDelete(deleteModal)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 75%,100% { transform: scale(1.5); opacity: 0; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(10,22,14,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(74,222,128,0.35); }
        input[type="number"]::-webkit-inner-spin-button { opacity: 0.3; filter: invert(1); }
        select option { background: #0a160e; color: #e2e8f0; }
        input::placeholder { color: rgba(74,222,128,0.22); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #0f1e12 inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
      `}</style>
    </div>
  );
}