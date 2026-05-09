import React from 'react';
import { motion } from 'framer-motion';

const SupportButton = () => {
  const handleSupportClick = (e) => {
    e.preventDefault();
    
    const email = "usama1500usama@gmail.com";
    const subject = encodeURIComponent("Support Request - Fintech Cash");
    const body = encodeURIComponent("Hi Usama,\n\nI am facing an issue with... \n\nMy User ID: ");
    
    // Window.location force karta hai default mail app kholne ke liye
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <motion.button
      onClick={handleSupportClick}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(45,212,191,0.4)" }}
      whileTap={{ scale: 0.95 }}
      // 'rounded-full' aur 'px-4 py-2.5' isay pill shape banayenge
      className="fixed bottom-6 right-4 z-9999 bg-teal-400 text-[#050505] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer border border-white/20 active:scale-90 transition-transform"
    >
      {/* Support Icon (Slightly Smaller for Mobile) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      
      {/* Proper Text: Ab ye mobile par bhi nazar aayega (hidden md:block hata diya gaya hai) */}
      <span className="font-black uppercase italic text-[9px] md:text-[10px] tracking-tight whitespace-nowrap">
        Customer Support
      </span>
    </motion.button>
  );
};

export default SupportButton;