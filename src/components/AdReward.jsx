import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; 
import { doc, updateDoc, increment } from "firebase/firestore";

const AdReward = ({ userId }) => {
  const [timer, setTimer] = useState(30);
  const [status, setStatus] = useState('idle'); // idle, counting, claim, cooldown
  const timerRef = useRef(null);

  const smartLink = "https://www.profitablecpmratenetwork.com/ndag6ngf?key=bc188a1ee0dc0ec6f301803cb2e2a9bc";

  const handleStartAd = () => {
    if (!userId) return alert("User ID missing! Please refresh dashboard.");
    window.open(smartLink, '_blank');
    setTimer(30);
    setStatus('counting');
  };

  useEffect(() => {
    if (status === 'counting') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setStatus('claim'); // Timer end status change
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const claimReward = async () => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        walletBalance: increment(10)
      });
      
      alert("Mubarak ho! 10 Coins add ho gaye.");
      setStatus('cooldown');
      
      // 2 Minute Cooldown
      setTimeout(() => {
        setStatus('idle');
        setTimer(30);
      }, 120000);

    } catch (error) {
      console.error("Reward Error:", error);
      alert("Coins update nahi ho sakay. Console check karein.");
    }
  };

  return (
    <div className="my-6 p-8 bg-[#111827] border-2 border-indigo-500 rounded-[35px] shadow-2xl text-center max-w-sm mx-auto">
      <h2 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">Instant Coins ⚡</h2>

      {/* --- INITIAL STATE --- */}
      {status === 'idle' && (
        <button 
          onClick={handleStartAd}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic shadow-lg active:scale-95 transition-all"
        >
          Watch Ad & Earn
        </button>
      )}

      {/* --- COUNTING STATE --- */}
      {status === 'counting' && (
        <div className="space-y-4">
          <div className="text-5xl font-mono font-black text-indigo-400 drop-shadow-md">
            00:{timer < 10 ? `0${timer}` : timer}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase animate-pulse">Stay on this tab for reward...</p>
        </div>
      )}

      {/* --- CLAIM STATE (Is status par component ruk jaye ga) --- */}
      {status === 'claim' && (
        <div className="space-y-4">
          <button 
            onClick={claimReward}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xl uppercase italic shadow-2xl animate-bounce"
          >
            CLAIM 10 COINS! 💰
          </button>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Ready to Collect</p>
        </div>
      )}

      {/* --- COOLDOWN STATE --- */}
      {status === 'cooldown' && (
        <div className="py-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <p className="text-slate-500 font-black text-[10px] uppercase italic">Next Task in 2 Minutes</p>
        </div>
      )}
    </div>
  );
};

export default AdReward;