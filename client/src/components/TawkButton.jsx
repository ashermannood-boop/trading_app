//script.src = "https://embed.tawk.to/696e5ddcf657ac197b782230/1jfbhta3i";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// --- Global Function ---
export const openTawkChat = () => {
 
  if (window.Tawk_API) {
    window.Tawk_API.maximize();
    window.Tawk_API.showWidget();
  }
};

const TawkButton = () => {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(true){
      return; // Skip Tawk integration in development mode
    }
    // 1. Pre-configure Tawk before the script even loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // This is the secret: It hides the default bubble BEFORE it renders
    window.Tawk_API.onLoad = function() {
      window.Tawk_API.hideWidget();
      setLoading(false);
    };

    window.Tawk_API.onChatMaximized = () => setVisible(false);
    window.Tawk_API.onChatMinimized = () => {
        window.Tawk_API.hideWidget(); // Hide default again on minimize
        setVisible(true);
    };

    // 2. Load the script if not already present
    if (!document.getElementById("tawk-script")) {
      const script = document.createElement("script");
      script.id = "tawk-script";
      script.async = true;
      //script.src = "https://embed.tawk.to/69f63171e0f3f91c34db3d2e/1jnkr29fp";
      script.src = "https://embed.tawk.to/6a8211bb89f62e1d43af0a2a/1k061ah92";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      document.body.appendChild(script);
    } else {
      setLoading(false);
    }
  }, []);

  // Only render OUR button if the chat isn't currently open
  if (!visible) return null;

  return (
    <button
      onClick={()=>navigate('/support')}
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
        zIndex: 9999, // High z-index to stay on top
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
