// src/components/ChatBot.jsx
import { useState, useRef, useEffect } from "react";
import { FaRobot, FaTrash, FaPaperPlane } from "react-icons/fa";
import { useFarm } from "../context/FarmContext";
import { callMistral, checkAgricultureTopic, buildFarmContext } from "../services/api";

export default function ChatBot({ mini = false }) {
  const { liveData, cropInfo, chatHistory, setChatHistory, mistralMessages, setMistralMessages } = useFarm();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!mini) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [chatHistory, mini]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput(""); setLoading(true);

    try {
      const isAgri = await checkAgricultureTopic(q);
      let reply;
      if (!isAgri) {
        reply = "I can only answer agriculture-related questions.\n\nTry asking about:\n• Crops & planting techniques\n• Soil health & fertilizers\n• Irrigation & water management\n• Pest control & plant diseases\n• Harvesting & post-harvest storage\n• Temperature & weather impact on crops";
        setChatHistory(h => [...h, { role:"user", text:q }, { role:"reject", text:reply }]);
      } else {
        const sysMsg = {
        role: "system",
        content: `
        ${buildFarmContext(liveData, cropInfo)}

        You are Smart Agri AI.

        Rules:

        1. Answer ANY agriculture-related question.

        2. Do NOT limit answers to the current farm crop.

        3. If user asks about Rice, answer Rice.

        4. If user asks about Wheat, answer Wheat.

        5. If user asks about Sugarcane, answer Sugarcane.

        6. If user asks about Cotton, Tomato, Paddy, Maize or any crop, answer that crop.

        7. Use farm sensor data only when the question is about the user's current farm.

        8. Reject ONLY questions unrelated to agriculture.

        9. Give practical farmer-friendly recommendations.

        10. Keep answers SHORT.

        11. Maximum 5 bullet points.

        12. Maximum 120 words.

        13. Do not provide long reports, large tables, or lengthy explanations unless explicitly requested.

        14. Give direct actionable advice first.

        15. For irrigation, fertilizer, pest, disease, weather, and crop questions:
            - Answer in 3–5 bullet points.
            - Include only key values and recommendations.

        16. Use this format:

        ✅ Response:
        • Point 1
        • Point 2
        • Point 3

        🌱 Farmer Tip:
        • One practical tip
        `
        };
        const ackMsg = { role:"assistant", content:"Understood! I am Smart Agri AI with access to your live farm data. I will provide accurate, data-driven agricultural advice." };
        const msgs   = [sysMsg, ackMsg, ...mistralMessages, { role:"user", content:q }];
        reply = await callMistral(msgs);
        setMistralMessages(m => [...m, { role:"user", content:q }, { role:"assistant", content:reply }]);
        setChatHistory(h => [...h, { role:"user", text:q }, { role:"ai", text:reply }]);
      }
    } catch (e) {
      setChatHistory(h => [...h, { role:"user", text:q }, { role:"reject", text:`AI error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const visibleMsgs = mini ? chatHistory.slice(-6) : chatHistory;

  return (
    <div style={{ background:"#0b1109",border:"1px solid #1e3d1a",borderRadius:14,padding:"1rem 1.2rem" }}>
      {!mini && chatHistory.length === 0 && (
        <div style={{ background:"#101f0e",border:"1px solid #1e3d1a",borderRadius:10,padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:"0.82rem",color:"#61ba6a",marginBottom:12,lineHeight:1.6 }}>
          Hello! I am Smart Agri AI, powered by Mistral AI. I have full context of your <strong>{cropInfo.crop} ({cropInfo.variety})</strong> farm — Day {cropInfo.cropAgeDays}, Stage: {liveData.cropStage}, Est. Harvest: {cropInfo.estimatedHarvestDate}. Ask me anything!
        </div>
      )}

      <div style={{ maxHeight: mini ? 240 : 400, overflowY:"auto", marginBottom:12 }}>
        {visibleMsgs.map((msg, i) => (
          <div key={i} style={{ marginBottom:8 }}>
            <p style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.6rem",color:"#3a6633",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3 }}>
              {msg.role === "user" ? "YOU" : "SMART AGRI AI"}
            </p>
            <div style={{
              background: msg.role==="user" ? "transparent" : msg.role==="reject" ? "#1a0909" : "#101f0e",
              border:     msg.role==="user" ? "none" : msg.role==="reject" ? "1px solid #6a1a1a" : "1px solid #1e3d1a",
              borderRadius: msg.role==="user" ? 0 : 10,
              padding:    msg.role==="user" ? "0 0 0 0" : "8px 12px",
              textAlign:  msg.role==="user" ? "right" : "left",
              fontFamily:"'Space Mono',monospace", fontSize:"0.82rem",
              color:      msg.role==="user" ? "#c8e8b2" : msg.role==="reject" ? "#fa5d5d" : "#61ba6a",
              lineHeight:1.6, whiteSpace:"pre-wrap",
            }}>
              {msg.role==="user" ? `→ ${msg.text}` : msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:"0.75rem",color:"#3a6633",display:"flex",alignItems:"center",gap:8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:12,height:12,animation:"spin 1s linear infinite" }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display:"flex",gap:8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
          placeholder="Ask Smart Agri AI about water, fertilizer, pests…"
          style={{ flex:1,background:"#0e1f0c",border:"1px solid #1e3d1a",borderRadius:8,padding:"9px 12px",color:"#c8e8b2",fontSize:13,outline:"none",fontFamily:"'Space Mono',monospace" }}
          onFocus={e => e.target.style.borderColor="rgba(74,222,128,0.4)"}
          onBlur={e => e.target.style.borderColor="#1e3d1a"}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          style={{ padding:"9px 14px",borderRadius:8,background:"rgba(22,163,74,0.2)",border:"1px solid #2a6a2a",color:"#61ba6a",cursor:"pointer",display:"flex",alignItems:"center",transition:"all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(22,163,74,0.35)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(22,163,74,0.2)"}>
          <FaPaperPlane size={13} />
        </button>
        <button onClick={() => { setChatHistory([]); setMistralMessages([]); }}
          style={{ padding:"9px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#fca5a5",cursor:"pointer",display:"flex",alignItems:"center",transition:"all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.08)"}>
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  );
}