import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const LeafIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const SproutIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 1 1.3 4.5c-1-.1-1.9-.4-2.6-.9" />
  </svg>
);

const EyeIcon = ({ open, className }) =>
  open ? (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const FloatingParticle = ({ style }) => (
  <div
    className="absolute rounded-full opacity-20 animate-pulse"
    style={{
      background: "radial-gradient(circle, #86efac, #4ade80)",
      ...style,
    }}
  />
);

export default function SmartAgriLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    emailRef.current?.focus();
  }, []);
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loginSuccess, navigate]);

  const validate = (field, value) => {
    const newErrors = { ...errors };
    if (field === "email") {
      if (!value) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = "Enter a valid email address";
      else delete newErrors.email;
    }
    if (field === "password") {
      if (!value) newErrors.password = "Password is required";
      else if (value.length < 8) newErrors.password = "Password must be at least 8 characters";
      else delete newErrors.password;
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validate(field, field === "email" ? email : password);
  };
const handleSubmit = async () => {
  console.log("Login button clicked");
  setErrors({});

  const validationErrors = {};

  if (!email) {
    validationErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    validationErrors.email = "Enter a valid email address";
  }

  if (!password) {
    validationErrors.password = "Password is required";
  } else if (password.length < 8) {
    validationErrors.password = "Password must be at least 8 characters";
  }

  setTouched({ email: true, password: true });

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);
  console.log("Sending login request...");
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe,
        }),
      }
    );

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", data);
    if (!response.ok) {
      if (data.errors) {
        setErrors(data.errors);
      } else {
        setErrors({
          email: data.message || "Login failed",
        });
      }
      return;
    }

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem("agri_token", data.token);
    storage.setItem("agri_user", JSON.stringify(data.user));
    console.log("LOGIN SUCCESS");
    setLoginSuccess(true);

  } catch (err) {
    setErrors({
      email: "Unable to connect to server",
    });
  } finally {
    setIsLoading(false);
  }
};

  const particles = [
    { width: 8, height: 8, top: "10%", left: "8%", animationDuration: "3s" },
    { width: 12, height: 12, top: "25%", right: "6%", animationDuration: "4s", animationDelay: "1s" },
    { width: 6, height: 6, top: "60%", left: "5%", animationDuration: "5s", animationDelay: "0.5s" },
    { width: 10, height: 10, bottom: "20%", right: "8%", animationDuration: "3.5s", animationDelay: "1.5s" },
    { width: 5, height: 5, top: "75%", left: "12%", animationDuration: "4.5s", animationDelay: "2s" },
    { width: 7, height: 7, top: "40%", right: "4%", animationDuration: "3s", animationDelay: "0.8s" },
  ];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a1a0f 0%, #0f2b18 30%, #1a3a24 60%, #0d2419 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Ambient background circles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(34,197,94,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} style={p} />
      ))}

      {/* Decorative leaf shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-5 pointer-events-none" style={{ transform: "translate(-30%, -30%) rotate(45deg)" }}>
        <div className="w-full h-full rounded-full border-2 border-green-400" />
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-5 pointer-events-none" style={{ transform: "translate(30%, 30%) rotate(-20deg)" }}>
        <div className="w-full h-full rounded-full border border-emerald-500" />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,222,128,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main card */}
      <div
        className="relative w-full mx-4"
        style={{
          maxWidth: 480,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
          opacity: mounted ? 1 : 0,
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Card glow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: "0 0 80px rgba(34,197,94,0.15), 0 32px 64px rgba(0,0,0,0.5)",
          }}
        />

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10, 22, 14, 0.92)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(74,222,128,0.15)",
          }}
        >

          <div className="px-8 pt-10 pb-10">
            {/* Brand section */}
            <div
              className="flex flex-col items-center mb-10"
              style={{
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                opacity: mounted ? 1 : 0,
                transition: "all 0.6s ease 0.1s",
              }}
            >
              {/* Logo mark */}
              <div className="relative mb-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(22,163,74,0.3), rgba(4,120,87,0.2))",
                    border: "1px solid rgba(74,222,128,0.3)",
                    boxShadow: "0 0 30px rgba(34,197,94,0.2), inset 0 1px 0 rgba(74,222,128,0.2)",
                  }}
                >
                  <SproutIcon className="w-10 h-10 text-green-400" />
                </div>
                {/* Ping ring */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    border: "1px solid rgba(74,222,128,0.2)",
                    animation: "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
              </div>

              <h1
                className="text-3xl font-bold tracking-tight mb-1"
                style={{
                  background: "linear-gradient(135deg, #f0fdf4, #86efac, #4ade80)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                Smart Agri AI
              </h1>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-10 bg-green-700" />
                <span className="text-xs text-green-600 tracking-widest uppercase font-medium">
                  Intelligence · Growth · Yield
                </span>
                <div className="h-px w-10 bg-green-700" />
              </div>
              <p className="text-center text-sm leading-relaxed" style={{ color: "rgba(134,239,172,0.6)", maxWidth: 280 }}>
                AI-powered precision agriculture for smarter harvests and sustainable farming
              </p>
            </div>

            {/* Success state */}
            {loginSuccess ? (
              <div
                className="flex flex-col items-center py-8 gap-4"
                style={{ animation: "fadeIn 0.5s ease" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(22,163,74,0.2)",
                    border: "1px solid rgba(74,222,128,0.4)",
                    boxShadow: "0 0 30px rgba(34,197,94,0.3)",
                  }}
                >
                  <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-green-300 font-semibold text-lg">Welcome back!</p>
                <p style={{ color: "rgba(134,239,172,0.6)", fontSize: 14 }}>Redirecting to your home page…</p>
              </div>
            ) : (
              /* Form */
              <div className="space-y-5">
                {/* Email field */}
                <div
                  style={{
                    transform: mounted ? "translateX(0)" : "translateX(-20px)",
                    opacity: mounted ? 1 : 0,
                    transition: "all 0.5s ease 0.2s",
                  }}
                >
                  <label className="block text-sm font-medium mb-2" style={{ color: "rgba(134,239,172,0.8)" }}>
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4" style={{ color: errors.email && touched.email ? "#f87171" : "rgba(74,222,128,0.5)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touched.email) validate("email", e.target.value);
                      }}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none"
                      style={{
                        background: "rgba(15, 30, 18, 0.8)",
                        border: `1px solid ${errors.email && touched.email ? "rgba(248,113,113,0.5)" : "rgba(74,222,128,0.2)"}`,
                        color: "#e2e8f0",
                        fontSize: 14,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = errors.email && touched.email ? "rgba(248,113,113,0.7)" : "rgba(74,222,128,0.5)";
                        e.target.style.boxShadow = errors.email && touched.email ? "0 0 0 3px rgba(248,113,113,0.1)" : "0 0 0 3px rgba(74,222,128,0.08)";
                      }}
                      onBlurCapture={(e) => {
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#f87171" }}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity=".2"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">!</text></svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div
                  style={{
                    transform: mounted ? "translateX(0)" : "translateX(-20px)",
                    opacity: mounted ? 1 : 0,
                    transition: "all 0.5s ease 0.3s",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: "rgba(134,239,172,0.8)" }}>
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs transition-colors duration-150"
                      style={{ color: "rgba(74,222,128,0.6)" }}
                      onMouseEnter={(e) => (e.target.style.color = "#4ade80")}
                      onMouseLeave={(e) => (e.target.style.color = "rgba(74,222,128,0.6)")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4" style={{ color: errors.password && touched.password ? "#f87171" : "rgba(74,222,128,0.5)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (touched.password) validate("password", e.target.value);
                      }}
                      onBlur={() => handleBlur("password")}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm transition-all duration-200 outline-none"
                      style={{
                        background: "rgba(15, 30, 18, 0.8)",
                        border: `1px solid ${errors.password && touched.password ? "rgba(248,113,113,0.5)" : "rgba(74,222,128,0.2)"}`,
                        color: "#e2e8f0",
                        fontSize: 14,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = errors.password && touched.password ? "rgba(248,113,113,0.7)" : "rgba(74,222,128,0.5)";
                        e.target.style.boxShadow = errors.password && touched.password ? "0 0 0 3px rgba(248,113,113,0.1)" : "0 0 0 3px rgba(74,222,128,0.08)";
                      }}
                      onBlurCapture={(e) => { e.target.style.boxShadow = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center px-1 transition-colors duration-150"
                      style={{ color: "rgba(74,222,128,0.4)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(74,222,128,0.8)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(74,222,128,0.4)")}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div
                  className="flex items-center gap-3"
                  style={{
                    transform: mounted ? "translateY(0)" : "translateY(10px)",
                    opacity: mounted ? 1 : 0,
                    transition: "all 0.5s ease 0.35s",
                  }}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    className="relative w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      background: rememberMe ? "rgba(22,163,74,0.3)" : "rgba(15,30,18,0.8)",
                      border: `1.5px solid ${rememberMe ? "rgba(74,222,128,0.6)" : "rgba(74,222,128,0.2)"}`,
                      boxShadow: rememberMe ? "0 0 10px rgba(34,197,94,0.2)" : "none",
                    }}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm select-none" style={{ color: "rgba(134,239,172,0.6)" }}>
                    Keep me signed in for 30 days
                  </span>
                </div>

                {/* Login button */}
                <div
                  style={{
                    transform: mounted ? "translateY(0)" : "translateY(10px)",
                    opacity: mounted ? 1 : 0,
                    transition: "all 0.5s ease 0.4s",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 relative overflow-hidden"
                    style={{
                      background: isLoading
                        ? "rgba(22,163,74,0.4)"
                        : "linear-gradient(135deg, #16a34a, #15803d)",
                      color: "#f0fdf4",
                      border: "1px solid rgba(74,222,128,0.4)",
                      boxShadow: isLoading ? "none" : "0 4px 24px rgba(22,163,74,0.3), inset 0 1px 0 rgba(134,239,172,0.2)",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      letterSpacing: "0.03em",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #15803d, #166534)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(22,163,74,0.4), inset 0 1px 0 rgba(134,239,172,0.2)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #16a34a, #15803d)";
                        e.currentTarget.style.boxShadow = "0 4px 24px rgba(22,163,74,0.3), inset 0 1px 0 rgba(134,239,172,0.2)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                    onMouseDown={(e) => { if (!isLoading) e.currentTarget.style.transform = "translateY(0) scale(0.99)"; }}
                    onMouseUp={(e) => { if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        Authenticating…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In to Dashboard
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px" style={{ background: "rgba(74,222,128,0.1)" }} />
                  <span className="text-xs" style={{ color: "rgba(74,222,128,0.3)" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(74,222,128,0.1)" }} />
                </div>

                {/* Sign up */}
                <p
                  className="text-center text-sm"
                  style={{
                    color: "rgba(134,239,172,0.5)",
                    transform: mounted ? "translateY(0)" : "translateY(10px)",
                    opacity: mounted ? 1 : 0,
                    transition: "all 0.5s ease 0.5s",
                  }}
                >
                  New to Smart Agri AI?{" "}
                  <button
                    type="button"
                    className="font-semibold transition-colors duration-150"
                    style={{ color: "#4ade80" }}
                    onClick={() => navigate("/signup")}
                    onMouseEnter={(e) => (e.target.style.color = "#86efac")}
                    onMouseLeave={(e) => (e.target.style.color = "#4ade80")}
                  >
                    Create an account →
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        input::placeholder { color: rgba(74,222,128,0.25); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #0f1e12 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}