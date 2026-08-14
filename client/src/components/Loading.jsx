// Loading.jsx
import {assets} from '../assets/assets';
export default function Loading({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black/40 backdrop-blur-xl">

    
      <img src={assets.logo} alt="Loading..." className="w-26 h-26 mb-4 animate" />

      {/* General text */}
      <p className="text-white text-xs font-medium tracking-wide animate-pulse">
        {text}
      </p>

    </div>
  );
}
