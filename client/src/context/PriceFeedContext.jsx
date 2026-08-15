import { createContext, useContext, useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
import io from "socket.io-client";

const PriceFeedContext = createContext();
 //const socket = io("https://trading-app-fdzj.onrender.com", { transports: ["websocket"] });
 const socket = io(API_URL, { transports: ["websocket"] });

export const PriceFeedProvider = ({ children }) => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    socket.on("priceUpdate", (data) => {
      setPrices({ ...data }); // always new reference
     // console.log("Received price update:", data);
    });

    return () => socket.off("priceUpdate");
  }, []);

  return (
    <PriceFeedContext.Provider value={{ prices }}>
      {children}
    </PriceFeedContext.Provider>
  );
};

export const usePriceFeed = () => useContext(PriceFeedContext);



