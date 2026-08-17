import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";

export default function Hero() {
  // Image slides data
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

      <div className="relative z-10 max-w-6xl mx-auto w-full py-10">
        {/* Image slides section */}
        <div className="relative h-[500px] mb-8 md:mb-12">
          {/* Slides container */}
          <div className="relative w-full h-full overflow-hidden">
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

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-blue-500 shadow-lg shadow-blue-500/30"
                    : "w-2 bg-gray-500/70 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Subtitle / Real-time indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-3 text-gray-400 mb-4 md:mb-6">
            <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            <span className="text-xs sm:text-sm tracking-widest font-mono">
              REAL-TIME DATA STREAM
            </span>
            <div className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>

          <p className="text-xs sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light tracking-wide text-center px-4">
            Advanced market intelligence and lightning-fast tracking for global
            cryptocurrency markets. Professional-grade tools for modern traders.
          </p>
        </motion.div>

        {/* CTA Button */}
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
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Explore Markets
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Floating assets */}
      <div className="absolute top-20 left-5 w-6 h-6 opacity-10 md:opacity-15">
        <img
          src="https://cryptologos.cc/logos/bitcoin-btc-logo.png"
          alt="BTC"
          className="w-full h-full"
        />
      </div>
      <div className="absolute bottom-20 right-5 w-6 h-6 opacity-10 md:opacity-15">
        <img
          src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
          alt="ETH"
          className="w-full h-full"
        />
      </div>
    </section>
  );
}