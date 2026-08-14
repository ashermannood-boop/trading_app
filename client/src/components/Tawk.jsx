import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Tawk = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.Tawk_API) {
      window.Tawk_API = {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement("script");
      script.async = true;
      script.src =
        "https://embed.tawk.to/696e5ddcf657ac197b782230/1jfbhta3i";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      document.body.appendChild(script);

      // hide until fully loaded
      window.Tawk_API.onLoad = () => {
        if (window.innerWidth < 768) {
          window.Tawk_API.hideWidget();
        }
      };
    }

    const showAboveNav = () => {
      if (!window.Tawk_API?.maximize) return;

      if (window.innerWidth < 768) {
        // position manually by moving iframe
        const iframe = document.querySelector(
          'iframe[src*="tawk.to"]'
        );
        if (iframe) {
          iframe.style.bottom = "800px"; // matches your nav height
        }
        window.Tawk_API.showWidget();
      }
    };

    // retry multiple times because iframe may load late
    const retries = [1000, 2000, 3000, 4000, 5000, 7000];
    retries.forEach((t) => setTimeout(showAboveNav, t));

    // fix on resize
    window.addEventListener("resize", showAboveNav);

    return () => window.removeEventListener("resize", showAboveNav);
  }, [location.pathname]);

  return null;
};

export default Tawk;
