import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { openTawkChat } from '../components/TawkButton';

import TawkButton from '../components/TawkButton';

const THEME = {
  bg: 'bg-[#05070A]',
  card: 'bg-[#0D111C]',
  accent: 'blue-500', 
  textAccent: 'text-blue-500',
  border: 'border-white/[0.05]',
  glass: 'backdrop-blur-xl bg-[#05070A]/80',
  fontMain: 'font-sans antialiased tracking-tight',
};

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.fontMain} text-slate-200 selection:bg-blue-500/30`}>
      <div className="max-w-[1000px] mx-auto w-full animate-in slide-in-from-right-8 duration-500">
        
        {/* Sticky Mobile-First Back Button */}
        <nav className={`fixed top-0 left-0 right-0 z-50 ${THEME.glass} border-b ${THEME.border} px-4 py-4 sm:px-8`}>
          <div className="max-w-[1000px] mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all">
                <svg className="w-5 h-5 -translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Back</span>
            </button>
          </div>
        </nav>

        {/* Content Body */}
        <div className="pt-32 pb-20 px-4 space-y-12">
          <header className="text-center space-y-6">
            {/* <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">
              Help Center v4.2
            </div> */}
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter leading-none">
              System <span className="text-blue-500">Support</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto font-medium leading-relaxed">
              Technical intervention and account correspondence for the pro terminal ecosystem.
            </p>
          </header>

          <div className="grid gap-6">
            {/* Email Support Card */}
            <section className={`p-8 sm:p-10 rounded-[32px] ${THEME.card} border ${THEME.border} flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group`}>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <div className="flex-1 text-center md:text-left space-y-3 relative z-10">
                <h3 className="text-white font-black text-xl sm:text-2xl tracking-tight">Email Correspondence</h3>
                <p className="text-slate-500 text-sm sm:text-base max-w-sm">
                  General inquiries, feature requests, or documentation help. Response within 24 hours.
                </p>
              </div>
              <a 
                href="mailto:lucasgjs890@gmail.com" 
                className="w-full md:w-auto px-10 py-5 bg-blue-500 text-[#05070A] font-black rounded-2xl text-xs uppercase tracking-widest text-center shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                Send Message
              </a>
            </section>

            {/* Live Support Card */}
            <section className="relative rounded-[40px] bg-gradient-to-br from-blue-500 to-blue-900 p-px shadow-2xl shadow-blue-500/10">
              <div className={`${THEME.bg} rounded-[39px] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8`}>
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-xl  sm:text-2xl font-black text-white tracking-tight">Live Escalation</h2>
                  <p className="text-slate-500 text-sm sm:text-base">Real-time intervention for critical terminal sessions.</p>
                </div>
                <button className="w-full md:w-auto px-10 py-5 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-[0.98] transition-all" onClick={openTawkChat}>
                  Start Chat
                </button>
              </div>
            </section>
          </div>

          <TawkButton className="hidden" />

          {/* Footer Info */}
          {/* <footer className="pt-12 text-center">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">
              Support Status: Operational &bull; {new Date().getFullYear()}
            </p>
          </footer> */}
        </div>
      </div>
    </div>
  );
};

/**
 * 3. EXPORT
 */
export default Support;