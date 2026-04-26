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

  // Referral Link Logic (Purani wali)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const ref = queryParams.get('ref');
    if (ref) { setReferredBy(ref); }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      return alert("Please verify that you are not a robot.");
    }

    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = res.user;

      // Wahi exact fields jo pehlay thi
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

      alert("Signup Successful! Welcome to FintechCash.");
      navigate('/dashboard');
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen font-sans bg-white">
      
      {/* 👈 Left Side: Purple Form Section */}
      <div className="bg-[#2D1B69] p-8 md:p-16 flex flex-col justify-center text-white overflow-y-auto">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <span className="text-[#2D1B69] font-bold">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight">FINTECH CASH</span>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-left">Create Account</h1>
        
        {/* Referral Badge */}
        <div className="bg-[#3D2B7A] border border-purple-400 p-2 px-4 rounded-xl inline-block mb-6 w-fit">
          <p className="text-[10px] text-purple-300 uppercase tracking-widest">Invited By</p>
          <p className="text-sm font-bold text-teal-300">{referredBy}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-100">Full Name</label>
            <input type="text" placeholder="Enter your name" className="w-full p-3 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400" 
              onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-100">Email Address</label>
              <input type="email" placeholder="Enter your email @gmail.com" className="w-full p-3 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400" 
                onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-100">Phone Number</label>
              <input type="text" placeholder="03XXXXXXXXX" className="w-full p-3 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400" 
                onChange={(e)=>setFormData({...formData, phone: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-100">Password</label>
              <input type="password" placeholder="Enter your password" className="w-full p-3 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400" 
                onChange={(e)=>setFormData({...formData, password: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-purple-100">Confirm Password</label>
              <input type="password" placeholder="Confirm your password" className="w-full p-3 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400" 
                onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} required />
            </div>
          </div>

          {/* Google reCAPTCHA (Using your original key) */}
          <div className="py-2 flex justify-center md:justify-start">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LdcBrwsAAAAAINWKyi4KAQOZmvCfozpRC6ivFPv"
              onChange={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>

          <p className="text-[12px] text-purple-200">
            By continuing, you agree to our 
            <span className="underline text-teal-300 mx-1 cursor-pointer" onClick={() => navigate('/privacy')}>Privacy Policy</span> and 
            <span className="underline text-teal-300 mx-1 cursor-pointer" onClick={() => navigate('/terms')}>Terms of Service</span>.
          </p>

          <button type="submit" disabled={loading} className="w-full bg-teal-400 hover:bg-teal-500 text-[#2D1B69] font-black py-4 rounded-xl shadow-lg transition-all active:scale-95">
            {loading ? "Processing..." : "Create Account & Start"}
          </button>
        </form>

        <p className="mt-6 text-center text-purple-200">
          Already have an account? <span className="text-teal-300 font-bold hover:underline cursor-pointer" onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>

      {/* 👉 Right Side: Light Branding Section */}
      <div className="hidden md:flex bg-slate-50 relative flex-col justify-center items-center p-12 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Grow Your Earnings</h2>
        <p className="text-slate-500 max-w-sm mb-12">Connect with global surveys and maximize your daily income with ease.</p>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm">
           <div className="flex items-center gap-4 mb-6 text-left">
              <div className="w-12 h-12 bg-linear-to-br from-teal-400 to-blue-500 rounded-2xl shadow-lg shadow-teal-100"></div>
              <div>
                <p className="font-bold text-slate-800">Start Earning Today</p>
                <p className="text-xs text-slate-400">Join 100k+ active users</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-sm font-medium">Total Paid Out</span>
                <span className="font-bold text-teal-600">$12.5M+</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-sm font-medium">Exchange Rate</span>
                <span className="font-bold text-slate-700 text-sm">10 Coins = 1 PKR</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;