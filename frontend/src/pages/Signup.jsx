import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Shared SVG icons ──────────────────────────────────────────────────────────
const SproutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" style={{ width: 36, height: 36 }}>
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 1 1.3 4.5c-1-.1-1.9-.4-2.6-.9" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// ── Reusable field components ─────────────────────────────────────────────────
function FieldIcon({ children, hasError }) {
  return (
    <div style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none", color: hasError ? "#f87171" : "rgba(74,222,128,0.5)" }}>
      {children}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, onBlur, placeholder, error, touched, icon, rightSlot, delay = 0, mounted }) {
  const showErr = error && touched;
  return (
    <div style={{ transform: mounted ? "translateX(0)" : "translateX(-20px)", opacity: mounted ? 1 : 0, transition: `all 0.5s ease ${delay}s` }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "rgba(134,239,172,0.8)" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <FieldIcon hasError={showErr}>{icon}</FieldIcon>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            width: "100%", background: "rgba(15,30,18,0.9)", color: "#e2e8f0",
            border: `1px solid ${showErr ? "rgba(248,113,113,0.5)" : "rgba(74,222,128,0.2)"}`,
            borderRadius: 12, padding: `14px 16px 14px ${rightSlot ? "44px" : "44px"}`,
            paddingRight: rightSlot ? 44 : 16, fontSize: 14, outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
          }}
          onFocus={e => {
            e.target.style.borderColor = showErr ? "rgba(248,113,113,0.7)" : "rgba(74,222,128,0.5)";
            e.target.style.boxShadow = showErr ? "0 0 0 3px rgba(248,113,113,0.1)" : "0 0 0 3px rgba(74,222,128,0.08)";
          }}
          onBlurCapture={e => { e.target.style.boxShadow = "none"; }}
        />
        {rightSlot}
      </div>
      {showErr && <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SmartAgriSignUp({ onNavigateToLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); nameRef.current?.focus(); }, []);
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const rules = {
    name: v => !v ? "Full name is required" : v.trim().split(" ").length < 2 ? "Please enter your first and last name" : "",
    email: v => !v ? "Email is required" : !/\S+@\S+\.\S+/.test(v) ? "Enter a valid email address" : "",
    phone: v => !v ? "Phone number is required" : !/^\+?[\d\s\-()]{7,15}$/.test(v) ? "Enter a valid phone number" : "",
    password: v => !v ? "Password is required" : v.length < 8 ? "Password must be at least 8 characters" : !/[A-Z]/.test(v) ? "Include at least one uppercase letter" : !/[0-9]/.test(v) ? "Include at least one number" : "",
    confirm: v => !v ? "Please confirm your password" : v !== form.password ? "Passwords do not match" : "",
  };

  const validate = (field, val) => {
    const msg = rules[field](val);
    setErrors(e => msg ? { ...e, [field]: msg } : (() => { const c = { ...e }; delete c[field]; return c; })());
    return msg;
  };

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (touched[field]) validate(field, val);
    // Re-validate confirm when password changes
    if (field === "password" && touched.confirm) {
      const msg = !form.confirm ? "Please confirm your password" : val !== form.confirm ? "Passwords do not match" : "";
      setErrors(e => msg ? { ...e, confirm: msg } : (() => { const c = { ...e }; delete c.confirm; return c; })());
    }
  };

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }));
    validate(field, form[field]);
  };

  const handleSubmit = async () => {
    const fields = ["name", "email", "phone", "password", "confirm"];
    setTouched(Object.fromEntries(fields.map(f => [f, true])));
    const errs = {};
    fields.forEach(f => { const m = rules[f](form[f]); if (m) errs[f] = m; });
    setErrors(errs);
    if (Object.keys(errs).length || !terms) { if (!terms) setTouched(t => ({ ...t, terms: true })); return; }
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            confirm_password: form.confirm,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert(data.message);
        }

        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Unable to connect to server");
      setLoading(false);
    }
  };

  // Password strength
  const pwStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const inputBase = { width: "100%", background: "rgba(15,30,18,0.9)", color: "#e2e8f0", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: "14px 16px 14px 44px", fontSize: 14, outline: "none", transition: "border-color 0.2s,box-shadow 0.2s", boxSizing: "border-box" };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0a1a0f 0%,#0f2b18 30%,#1a3a24 60%,#0d2419 100%)",
      fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative", overflow: "hidden", padding: "24px 16px",
    }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 20% 20%,rgba(34,197,94,0.08) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(16,185,129,0.06) 0%,transparent 60%)", pointerEvents: "none" }} />
      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(74,222,128,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      {/* Decorative rings */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 256, height: 256, opacity: 0.05, transform: "translate(-30%,-30%) rotate(45deg)", pointerEvents: "none", borderRadius: "50%", border: "2px solid #4ade80" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 384, height: 384, opacity: 0.04, transform: "translate(30%,30%) rotate(-20deg)", pointerEvents: "none", borderRadius: "50%", border: "1px solid #10b981" }} />
      {/* Floating particles */}
      {[{w:8,h:8,t:"10%",l:"8%",dur:"3s"},{w:12,h:12,t:"25%",r:"6%",dur:"4s",del:"1s"},{w:6,h:6,t:"60%",l:"5%",dur:"5s",del:"0.5s"},{w:10,h:10,b:"20%",r:"8%",dur:"3.5s",del:"1.5s"},{w:7,h:7,t:"40%",r:"4%",dur:"3s",del:"0.8s"}].map((p,i) => (
        <div key={i} style={{ position: "absolute", width: p.w, height: p.h, top: p.t, left: p.l, right: p.r, bottom: p.b, borderRadius: "50%", opacity: 0.2, animation: `pulse ${p.dur} ease-in-out ${p.del||""} infinite`, background: "radial-gradient(circle,#86efac,#4ade80)", pointerEvents: "none" }} />
      ))}

      {/* Card wrapper */}
      <div style={{ width: "100%", maxWidth: 500, position: "relative", transform: mounted ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)", opacity: mounted ? 1 : 0, transition: "all 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {/* Glow */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, boxShadow: "0 0 80px rgba(34,197,94,0.15),0 32px 64px rgba(0,0,0,0.5)", pointerEvents: "none" }} />

        <div style={{ background: "rgba(10,22,14,0.95)", backdropFilter: "blur(40px)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(74,222,128,0.15)" }}>
          {/* Shimmer bar */}
         

          <div style={{ padding: "36px 36px 32px" }}>
            {/* Brand */}
            <div style={{ textAlign: "center", marginBottom: 28, transform: mounted ? "translateY(0)" : "translateY(20px)", opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.1s" }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(22,163,74,0.3),rgba(4,120,87,0.2))", border: "1px solid rgba(74,222,128,0.3)", boxShadow: "0 0 30px rgba(34,197,94,0.2),inset 0 1px 0 rgba(74,222,128,0.2)", margin: "0 auto 18px", position: "relative" }}>
                <SproutIcon />
                <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: "1px solid rgba(74,222,128,0.2)", animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite" }} />
              </div>
              <h1 style={{ background: "linear-gradient(135deg,#f0fdf4,#86efac,#4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Smart Agri AI</h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ height: 1, width: 32, background: "rgba(34,197,94,0.3)" }} />
                <span style={{ fontSize: 10, color: "rgba(74,222,128,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>Create Your Account</span>
                <div style={{ height: 1, width: 32, background: "rgba(34,197,94,0.3)" }} />
              </div>
              <p style={{ color: "rgba(134,239,172,0.55)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Join thousands of farmers using AI-driven insights to maximize yields
              </p>
            </div>

            {/* Success state */}
            {success ? (
              <div style={{ textAlign: "center", padding: "24px 0", animation: "fadeIn 0.5s ease" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,163,74,0.2)", border: "1px solid rgba(74,222,128,0.4)", boxShadow: "0 0 30px rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ color: "#86efac", fontWeight: 600, fontSize: 18, margin: "0 0 6px" }}>Account Created!</p>
                <p style={{ color: "rgba(134,239,172,0.5)", fontSize: 13, margin: "0 0 20px" }}>Welcome to Smart Agri AI, {form.name.split(" ")[0]}. Redirecting to Home Page…</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                  {[0.1,0.2,0.3].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: `bounce 1s ease ${d}s infinite` }} />)}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Full Name */}
                <InputField label="Full Name" value={form.name} onChange={e => handleChange("name", e.target.value)} onBlur={() => handleBlur("name")} placeholder="John Appleseed" error={errors.name} touched={touched.name} delay={0.2} mounted={mounted}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                />

                {/* Email */}
                <InputField label="Email Address" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} onBlur={() => handleBlur("email")} placeholder="you@example.com" error={errors.email} touched={touched.email} delay={0.25} mounted={mounted}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                />

                {/* Phone */}
                <InputField label="Phone Number" type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)} onBlur={() => handleBlur("phone")} placeholder="+1 (555) 000-0000" error={errors.phone} touched={touched.phone} delay={0.3} mounted={mounted}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.28-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
                />

                {/* Password */}
                <div style={{ transform: mounted ? "translateX(0)" : "translateX(-20px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.35s" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "rgba(134,239,172,0.8)" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none", color: errors.password && touched.password ? "#f87171" : "rgba(74,222,128,0.5)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <input type={showPw ? "text" : "password"} value={form.password} onChange={e => handleChange("password", e.target.value)} onBlur={() => handleBlur("password")} placeholder="Min. 8 characters"
                      style={{ ...inputBase, paddingRight: 44, borderColor: errors.password && touched.password ? "rgba(248,113,113,0.5)" : "rgba(74,222,128,0.2)" }}
                      onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                      onBlurCapture={e => { e.target.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}
                      style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(74,222,128,0.45)", display: "flex", alignItems: "center", padding: 4 }}
                      onMouseEnter={e => { e.currentTarget.style.color = "rgba(74,222,128,0.85)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(74,222,128,0.45)"; }}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                  {/* Strength meter */}
                  {form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? strengthColors[pwStrength] : "rgba(74,222,128,0.12)", transition: "background 0.3s" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strengthColors[pwStrength] }}>{strengthLabels[pwStrength]}</span>
                    </div>
                  )}
                  {errors.password && touched.password && <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div style={{ transform: mounted ? "translateX(0)" : "translateX(-20px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.4s" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 8, color: "rgba(134,239,172,0.8)" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none", color: errors.confirm && touched.confirm ? "#f87171" : "rgba(74,222,128,0.5)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <input type={showConfirm ? "text" : "password"} value={form.confirm} onChange={e => handleChange("confirm", e.target.value)} onBlur={() => handleBlur("confirm")} placeholder="Re-enter your password"
                      style={{ ...inputBase, paddingRight: 44, borderColor: errors.confirm && touched.confirm ? "rgba(248,113,113,0.5)" : form.confirm && form.confirm === form.password ? "rgba(74,222,128,0.5)" : "rgba(74,222,128,0.2)" }}
                      onFocus={e => { e.target.style.borderColor = "rgba(74,222,128,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.08)"; }}
                      onBlurCapture={e => { e.target.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Hide password" : "Show password"}
                      style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(74,222,128,0.45)", display: "flex", alignItems: "center", padding: 4 }}
                      onMouseEnter={e => { e.currentTarget.style.color = "rgba(74,222,128,0.85)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(74,222,128,0.45)"; }}>
                      <EyeIcon open={showConfirm} />
                    </button>
                    {/* Match tick */}
                    {form.confirm && form.confirm === form.password && (
                      <div style={{ position: "absolute", top: "50%", right: 40, transform: "translateY(-50%)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </div>
                  {errors.confirm && touched.confirm && <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{errors.confirm}</p>}
                </div>

                {/* Terms */}
                <div style={{ transform: mounted ? "translateY(0)" : "translateY(10px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.45s", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <button type="button" role="checkbox" aria-checked={terms} onClick={() => setTerms(!terms)}
                    style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, background: terms ? "rgba(22,163,74,0.3)" : "rgba(15,30,18,0.8)", border: `1.5px solid ${terms ? "rgba(74,222,128,0.6)" : touched.terms && !terms ? "rgba(248,113,113,0.5)" : "rgba(74,222,128,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, transition: "all 0.2s", boxShadow: terms ? "0 0 10px rgba(34,197,94,0.2)" : "none" }}>
                    {terms && <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}><polyline points="20 6 9 17 4 12" /></svg>}
                  </button>
                  <span style={{ fontSize: 13, color: "rgba(134,239,172,0.55)", lineHeight: 1.5, userSelect: "none" }}>
                    I agree to the{" "}
                    <span style={{ color: "#4ade80", cursor: "pointer", fontWeight: 500 }}>Terms of Service</span>
                    {" "}and{" "}
                    <span style={{ color: "#4ade80", cursor: "pointer", fontWeight: 500 }}>Privacy Policy</span>
                  </span>
                </div>
                {touched.terms && !terms && <p style={{ color: "#f87171", fontSize: 12, marginTop: -8 }}>You must accept the terms to continue</p>}

                {/* Submit */}
                <div style={{ transform: mounted ? "translateY(0)" : "translateY(10px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.5s" }}>
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    style={{ width: "100%", padding: "15px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#f0fdf4", letterSpacing: "0.03em", cursor: loading ? "not-allowed" : "pointer", border: "1px solid rgba(74,222,128,0.4)", background: loading ? "rgba(22,163,74,0.4)" : "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: loading ? "none" : "0 4px 24px rgba(22,163,74,0.3),inset 0 1px 0 rgba(134,239,172,0.2)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "linear-gradient(135deg,#15803d,#166534)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(22,163,74,0.4)"; } }}
                    onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "linear-gradient(135deg,#16a34a,#15803d)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(22,163,74,0.3)"; } }}
                    onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.99)"; }}
                    onMouseUp={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}>
                    {loading ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        Creating your account…
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(74,222,128,0.08)" }} />
                  <span style={{ fontSize: 11, color: "rgba(74,222,128,0.25)" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(74,222,128,0.08)" }} />
                </div>

                {/* Login link */}
                <p style={{ textAlign: "center", fontSize: 13, color: "rgba(134,239,172,0.45)", margin: 0, transform: mounted ? "translateY(0)" : "translateY(10px)", opacity: mounted ? 1 : 0, transition: "all 0.5s ease 0.55s" }}>
                  Already have an account?{" "}
                  <button type="button" onClick={onNavigateToLogin}
                    style={{ background: "none", border: "none", color: "#4ade80", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 13 }}
                    onClick={() => navigate("/")}
                    onMouseEnter={e => { e.target.style.color = "#86efac"; }}
                    onMouseLeave={e => { e.target.style.color = "#4ade80"; }}>
                    Sign in →
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        @keyframes ping { 75%,100%{transform:scale(1.5);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:0.15} 50%{opacity:0.3} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        input::placeholder { color: rgba(74,222,128,0.22); }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 30px #0f1e12 inset!important; -webkit-text-fill-color:#e2e8f0!important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}