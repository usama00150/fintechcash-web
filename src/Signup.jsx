import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
  const [referredBy, setReferredBy] = useState("Direct");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  // Referral Link Logic
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const ref = queryParams.get('ref');
    if (ref) { setReferredBy(ref); }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      return alert("Please verify reCAPTCHA.");
    }

    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = res.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        referredBy: referredBy, 
        walletBalance: 0,
        totalWithdraw: 0,
        bonusIncome: 0,
        referralCount: 0,
        adsWatchedToday: 0, 
        status: "inactive",
        plan: "None",
        createdAt: serverTimestamp()
      });

      // Direct redirect for smooth experience
      navigate('/dashboard');
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // h-screen aur overflow-hidden screen ko lock rakhega
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen overflow-hidden font-sans bg-white">
      
      {/* 👈 Left Side: Form Section */}
      <div className="bg-[#2D1B69] p-4 md:p-8 lg:p-12 flex flex-col justify-center text-white relative">
        <div className="max-w-xl mx-auto w-full">
            <div className="mb-3 flex items-center gap-2 text-left">
                <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center">
                    <span className="text-[#2D1B69] font-bold text-sm">F</span>
                </div>
                <span className="text-base font-bold tracking-tight uppercase italic text-teal-400">Fintech Cash</span>
            </div>

            <h1 className="text-2xl font-black mb-0.5 text-left uppercase italic tracking-tighter">Create Account</h1>
            
            {/* Referral Badge - Compact */}
            <div className="bg-[#3D2B7A] border border-purple-400/30 p-1 px-3 rounded-lg inline-block mb-4">
                <p className="text-[9px] text-purple-300 uppercase font-bold tracking-widest leading-none">Invited By: <span className="text-teal-300 ml-1 font-black">{referredBy}</span></p>
            </div>

            <form onSubmit={handleSignup} className="space-y-2.5">
                {/* Full Name */}
                <div>
                    <label className="block text-[10px] font-bold mb-0.5 uppercase text-purple-200 tracking-widest">Full Name</label>
                    <input type="text" placeholder="Full Name" className="w-full p-2.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white placeholder-purple-400 focus:outline-none focus:ring-1 focus:ring-teal-400 text-xs" 
                    onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold mb-0.5 uppercase text-purple-200 tracking-widest">Email</label>
                        <input type="email" placeholder="user@gmail.com" className="w-full p-2.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white text-xs" 
                            onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold mb-0.5 uppercase text-purple-200 tracking-widest">Phone</label>
                        <input type="text" placeholder="03XXXXXXXXX" className="w-full p-2.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white text-xs" 
                            onChange={(e)=>setFormData({...formData, phone: e.target.value})} required />
                    </div>
                </div>

                {/* Passwords Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold mb-0.5 uppercase text-purple-200 tracking-widest">Password</label>
                        <input type="password" placeholder="••••••••" className="w-full p-2.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white text-xs" 
                            onChange={(e)=>setFormData({...formData, password: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold mb-0.5 uppercase text-purple-200 tracking-widest">Confirm</label>
                        <input type="password" placeholder="••••••••" className="w-full p-2.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white text-xs" 
                            onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} required />
                    </div>
                </div>

                {/* Google reCAPTCHA - Scaled down to 75% to save vertical space */}
                <div className="py-1 transform scale-[0.75] origin-left -ml-2 -mb-2">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LdcBrwsAAAAAINWKyi4KAQOZmvCfozpRC6ivFPv"
                        onChange={(token) => setCaptchaToken(token)}
                        theme="dark"
                    />
                </div>

                {/* Privacy & Terms Links */}
                <p className="text-[9px] text-purple-200 leading-tight uppercase font-bold tracking-tight">
                    By joining, you agree to our 
                    <span className="underline text-teal-300 mx-1 cursor-pointer hover:text-white" onClick={() => navigate('/privacy')}>Privacy</span> and 
                    <span className="underline text-teal-300 mx-1 cursor-pointer hover:text-white" onClick={() => navigate('/terms')}>Terms</span>.
                </p>

                {/* Signup Button */}
                <button type="submit" disabled={loading} className="w-full bg-teal-400 hover:bg-teal-500 text-[#2D1B69] font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 text-[11px] uppercase tracking-widest">
                    {loading ? "Registering..." : "Create Account"}
                </button>
            </form>

            {/* LOGIN LINK */}
            <p className="mt-4 text-center text-[10px] text-purple-200 uppercase font-bold tracking-widest">
                Existing user? <span className="text-teal-300 font-black hover:underline cursor-pointer ml-1" onClick={() => navigate('/login')}>Login here</span>
            </p>
        </div>
      </div>

      {/* 👉 Right Side: Static Branding */}
      <div className="hidden md:flex bg-slate-50 justify-center items-center p-8 relative overflow-hidden h-full">
        <div className="absolute w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-30 -bottom-10 -right-10"></div>
        <div className="max-w-xs z-10 text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-1 uppercase italic tracking-tighter">Scale Your Earnings</h2>
          <p className="text-slate-400 text-[10px] mb-8 font-bold uppercase tracking-widest">Join 100k+ users in Pakistan</p>
          
          <div className="bg-white p-6 rounded-4xl shadow-xl border border-slate-100">
             <div className="space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 text-[9px] font-bold uppercase">Payout Limit</span>
                  <span className="font-black text-teal-600 text-xs">Rs. 500+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[9px] font-bold uppercase">Network Fee</span>
                  <span className="font-black text-slate-800 text-xs">0% Direct</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;