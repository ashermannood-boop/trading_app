import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Global Function ---
export const openTawkChat = () => {
  if (window.Tawk_API) {
    window.Tawk_API.maximize();
    window.Tawk_API.showWidget();
  }
};

const TawkButton = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip during development if desired (set to false to enable in dev)
    if (process.env.NODE_ENV === "development") {
      setLoading(false);
      return;
    }

    // 1. Pre-configure Tawk before the script loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Hides default Tawk widget bubble before it renders
    window.Tawk_API.onLoad = function () {
      window.Tawk_API.hideWidget();
      setLoading(false);
    };

    window.Tawk_API.onChatMaximized = () => setVisible(false);
    window.Tawk_API.onChatMinimized = () => {
      window.Tawk_API.hideWidget(); // Hide default again on minimize
      setVisible(true);
    };

    // 2. Load the script using your updated embed URL
    if (!document.getElementById("tawk-script")) {
      const script = document.createElement("script");
      script.id = "tawk-script";
      script.async = true;
      script.src = "https://embed.tawk.to/6a849bb727f5991d51f60256/1k0b11a1b";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      const s0 = document.getElementsByTagName("script")[0];
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(script, s0);
      } else {
        document.body.appendChild(script);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Only render our custom button if the chat isn't open
  if (!visible) return null;

  return (
    <button
      onClick={() => navigate("/support")}
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: loading ? "#9ca3af" : "#2196F3",
        color: "white",
        fontSize: "28px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        zIndex: 9999,
        boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? "..." : "💬"}
    </button>
  );
};

export default TawkButton;