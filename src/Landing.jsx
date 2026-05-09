import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#020202] text-white font-sans overflow-hidden relative flex flex-col items-center justify-center p-6 pb-24 text-center">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-purple-600/10 blur-[130px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-teal-600/10 blur-[130px] -z-10"></div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl"
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-teal-400 rounded-2xl flex items-center justify-center font-black text-[#050505] text-2xl shadow-[0_0_20px_rgba(45,212,191,0.4)]">F</div>
          <span className="text-2xl font-black uppercase tracking-tighter italic">Fintech Cash</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6">
          Turn Your Time Into <span className="text-teal-400">Real Cash.</span>
        </h1>
        
        <p className="text-slate-400 text-sm md:text-lg uppercase font-bold tracking-widest mb-12 max-w-xl mx-auto leading-relaxed">
          The most trusted digital earning platform in Pakistan From USA. Join 100k+ users earning daily via surveys, adds watching & networking.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="w-full md:w-64 bg-teal-400 text-[#050505] py-5 rounded-3xl font-black uppercase italic text-sm shadow-[0_10px_30px_rgba(45,212,191,0.3)] transition-all"
          >
            Start Earning Now Signup🚀
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="w-full md:w-64 bg-white/5 border border-white/10 text-white py-5 rounded-3xl font-black uppercase italic text-sm hover:bg-white/10 transition-all"
          >
            Login here🚪
          </motion.button>
        </div>
      </motion.div>

      {/* Features Quick Look */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-10 grid grid-cols-3 gap-8 md:gap-20 text-[10px] font-black uppercase tracking-widest text-slate-500"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-teal-400 text-lg">⚡</span>
          Instant Payout
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-purple-500 text-lg">💎</span>
          Elite Rewards
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-blue-500 text-lg">🛡️</span>
          100% Secure
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;