import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";

export default function Hero() {
  // Image slides data - replace with your actual images
  const slides = [
    {
      id: 1,
      image: assets.hero1,
      title: "Start Your Digital Earnings Journey",
      subtitle: "Begin your path to financial freedom with our intuitive platform"
    },
    {
      id: 2,
      image: assets.hero2,
      title: "A Trading Platform Tailored for You",
      subtitle: "Customized tools and insights designed around your trading style"
    },
    {
      id: 3,
      image: assets.hero,
      title: "Unparalleled Trading Products and Services",
      subtitle: "Access exclusive tools, analytics, and market intelligence"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 sm:px-6 md:px-8 overflow-hidden">

      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full py-10 ">

        {/* Image slides section - placed first lg:h-[600px]  */}
        <div className="relative h-[500px] mb-8 md:mb-12">
          {/* Slides container */}
          <div className="relative w-full h-full overflow-hidden ">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: index === currentSlide ? 1 : 0,
                  scale: index === currentSlide ? 1 : 1.05
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />

                {/* Slide text */}
                <div className="absolute bottom-10 left-0 right-0 p-3 md:p-8 lg:p-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center"
                  >
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">
                      {slide.title}
                    </h3>
                    <p className="text-gray-200 text-sm sm:text-base md:text-lg opacity-90">
                      {slide.subtitle}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation buttons */}
          {/* <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white hover:bg-gray-800/90 hover:border-gray-600/50 transition-all duration-300 z-20 hover:scale-105"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button> */}

          {/* <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-white hover:bg-gray-800/90 hover:border-gray-600/50 transition-all duration-300 z-20 hover:scale-105"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button> */}

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "w-8 bg-blue-500 shadow-lg shadow-blue-500/30"
                    : "w-2 bg-gray-500/70 hover:bg-gray-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Creative tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8 text-center"
        >
          {/* <span className="inline-block px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-mono tracking-wider">
            REAL-TIME DATA STREAM
          </span> */}
        </motion.div>

        {/* Main heading with creative layout */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-semibold text-gray-100 mb-6 md:mb-8 leading-snug text-center"
        >
          {/* <div className="text-2xl sm:text-3xl md:text-4xl mb-3 md:mb-4">
            Track & Trade the{" "}
            <span className="relative inline-block">
              <span className="text-blue-400">Future</span>
              <svg className="absolute -bottom-1 left-0 w-full h-0.5" viewBox="0 0 100 2">
                <path d="M0,1 Q50,3 100,1" stroke="currentColor" strokeWidth="1" fill="none" className="text-blue-400/50"/>
              </svg>
            </span>{" "}
            of
          </div> */}

          {/* <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 md:mb-8">
            <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              Digital Assets
            </span>
          </div> */}
        </motion.h1>

        {/* Creative subtitle with smaller font */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-3 text-gray-400 mb-4 md:mb-6">
            <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            {/* <span className="text-xs sm:text-sm tracking-widest font-mono">REAL-TIME ANALYTICS</span> */}
            <span className="text-xs sm:text-sm tracking-widest font-mono">REAL-TIME DATA STREAM</span>
            <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>

          <p className="text-xs sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light tracking-wide text-center px-4">
            Advanced market intelligence and lightning-fast tracking for global cryptocurrency markets.
            Professional-grade tools for modern traders.
          </p>
        </motion.div>

        {/* Creative CTA buttons with icons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 md:mb-14"
        >
          <a
            href="#pd"
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center gap-3 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Explore Markets
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>

        {/* Creative stats grid */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-4"
        >
          {[
            { value: "24/7", label: "Live Tracking", color: "text-green-400", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { value: "150ms", label: "Avg Latency", color: "text-purple-400", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { value: "99.9%", label: "Reliability", color: "text-cyan-400", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gray-800/50 ${stat.color.replace('text-', 'bg-')}/10`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-sm text-gray-400 font-medium tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div> */}

      </div>

      {/* Minimal floating elements */}
      <div className="absolute top-20 left-5 w-6 h-6 opacity-10 md:opacity-15">
        <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="BTC" className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 right-5 w-6 h-6 opacity-10 md:opacity-15">
        <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="ETH" className="w-full h-full" />
      </div>

    </section>
  );
}