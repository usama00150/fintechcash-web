import React from 'react';
import { motion } from 'framer-motion';

const activities = [
  { user: "Usama***", action: "claimed 10 Coins", icon: "⚡" },
  { user: "Ali***", action: "withdrew Rs. 500", icon: "💰" },
  { user: "Sana***", action: "earned 15% commission", icon: "👥" },
  { user: "Raza***", action: "upgraded to Elite", icon: "👑" },
  { user: "Ahmed***", action: "claimed 10 Coins", icon: "⚡" },
];

const LiveTicker = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-t border-white/5 py-2 overflow-hidden">
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="flex whitespace-nowrap gap-16"
      >
        {/* Loop twice for seamless scrolling */}
        {[...activities, ...activities].map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic">
            <span className="text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]">{item.icon}</span>
            <span className="text-white">{item.user}</span>
            <span className="text-slate-400">{item.action}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default LiveTicker;