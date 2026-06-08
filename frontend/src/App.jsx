// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login        from "./pages/Login";
import Signup       from "./pages/Signup";
import Home         from "./pages/Home";
import Dashboard    from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import SoilMoisture  from "./pages/SoilMoisture";
import NutrientStatus from "./pages/NutrientStatus";
import CropStage     from "./pages/CropStage";
import CropHealth    from "./pages/CropHealth";
import Irrigation    from "./pages/Irrigation";
import RainHistory   from "./pages/RainHistory";
import Advisory      from "./pages/Advisory";
import Chatbot       from "./pages/Chatbot";
import { FarmProvider } from "./context/FarmContext";

// Simple auth guard
function PrivateRoute({ children }) {
  const token =
    localStorage.getItem("agri_token") ||
    sessionStorage.getItem("agri_token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/"        element={<Login />} />
        <Route path="/signup"  element={<Signup />} />

        {/* Home (land manager) */}
        <Route path="/home" element={
          <PrivateRoute><Home /></PrivateRoute>
        } />

        {/* Dashboard shell + nested pages */}
        <Route path="/dashboard/:landId" element={
          <PrivateRoute>
            <FarmProvider>
              <Dashboard />
            </FarmProvider>
          </PrivateRoute>
        }>
          <Route index              element={<DashboardHome />} />
          <Route path="moisture"    element={<SoilMoisture />} />
          <Route path="nutrients"   element={<NutrientStatus />} />
          <Route path="crop-stage"  element={<CropStage />} />
          <Route path="health"      element={<CropHealth />} />
          <Route path="irrigation"  element={<Irrigation />} />
          <Route path="rain"        element={<RainHistory />} />
          <Route path="advisory"    element={<Advisory />} />
          <Route path="chatbot"     element={<Chatbot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}