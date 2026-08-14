import { Home, Megaphone, User, PiggyBank, Wallet,ArrowLeftRight,HandCoins,ChartNoAxesCombined } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function MobileNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /** 
    const tabs = [
      { icon: <Home size={18} />, label: "Home", path: "/" },
      { icon: <Wallet size={18} />, label: "Wallet", path: "/wallet" },
      { 
        icon: <Megaphone size={22} />, 
        label: "News", 
        path: "/news", 
        isCenter: true 
      },
      { icon: <PiggyBank size={18} />, label: "Loans", path: "/loan" },
      { icon: <User size={18} />, label: "Profile", path: "/profile" },
    ];
  
  */
  const tabs = [
    { icon: <Home size={18} />, label: "Home", path: "/" },
    { icon: <Wallet size={18} />, label: "Wallet", path: "/wallet" },
    {
      icon: <ChartNoAxesCombined size={22} />,
      label: "Market",
      path: "/markets",
      isCenter: true
    },
    { icon: <HandCoins size={18} />, label: "Earn", path: "/earn" },
    { icon: <User size={18} />, label: "Profile", path: "/profile" },
  ];




  return (
    <nav
      className="fixed inset-x-0 bottom-0 bg-gray-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/80 border-t border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] flex justify-between items-center py-3 px-4 md:hidden z-50 safe-bottom"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.path}
          icon={tab.icon}
          label={tab.label}
          active={pathname === tab.path}
          onClick={() => navigate(tab.path)}
          isCenter={tab.isCenter}
        />
      ))}
    </nav>
  );
}

function Tab({ icon, label, active, onClick, isCenter }) {
  if (isCenter) {
    return (
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-[20px] transition-all duration-300 ease-out flex-1 min-w-0 mx-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${active
          ? "text-white bg-blue-500 shadow-xl shadow-blue-500/30 border-2 border-blue-400"
          : "text-white bg-blue-600 hover:bg-blue-500 shadow-lg border-2 border-blue-500/50"
          }`}
        aria-current={active ? "page" : undefined}
        aria-label={label}
      >
        <div
          className={`transition-transform duration-300 ${active ? "scale-125" : "scale-100"
            }`}
          aria-hidden="true"
        >
          {icon}
        </div>

        <span
          className={`text-xs font-semibold truncate max-w-full transition-all duration-300 ${active ? "text-white" : "text-white/90"
            }`}
        >
          {label}
        </span>

        {/* Active indicator */}
        {active && (
          <div
            className="absolute -top-1.5 w-2.5 h-2.5 bg-white rounded-full animate-pulse ring-1 ring-blue-400"
            aria-hidden="true"
          />
        )}

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />
      </button>
    );
  }

  // Regular tabs - smaller
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 ease-out flex-1 min-w-0 mx-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900 ${active
        ? "text-blue-400 bg-blue-500/10"
        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/20"
        }`}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <div
        className={`transition-transform duration-200 ${active ? "scale-105" : "scale-100"
          }`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <span
        className={`text-[11px] font-medium truncate max-w-full transition-all duration-200 ${active ? "text-blue-400" : ""
          }`}
      >
        {label}
      </span>

      {/* Active indicator */}
      {active && (
        <div
          className="absolute -top-1 w-1.5 h-1.5 bg-blue-400 rounded-full"
          aria-hidden="true"
        />
      )}

      {/* Subtle hover effect */}
      {!active && (
        <div
          className="absolute inset-0 rounded-lg bg-gradient-to-t from-gray-700/0 to-gray-700/0 hover:from-gray-700/10 hover:to-gray-700/0 transition-all duration-200"
          aria-hidden="true"
        />
      )}
    </button>
  );
}