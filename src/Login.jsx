import React, { useState, useRef } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Security Check: Captcha
    if (!captchaToken) {
      return alert("Please verify that you are not a robot.");
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ✅ No alert, direct redirect for smooth experience
      navigate('/dashboard');
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fixed Height View
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen overflow-hidden font-sans bg-white">
      
      {/* 👈 Left Side: Form Section */}
      <div className="bg-[#2D1B69] p-6 md:p-10 lg:p-14 flex flex-col justify-center text-white relative">
        <div className="max-w-md mx-auto w-full">
            {/* Header Logo */}
            <div className="mb-4 flex items-center gap-2 text-left">
                <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
                    <span className="text-[#2D1B69] font-bold">F</span>
                </div>
                <span className="text-xl font-bold tracking-tight uppercase italic">Fintech Cash</span>
            </div>

            <h1 className="text-3xl font-black mb-1 text-left uppercase italic tracking-tighter">Login to Account</h1>
            <p className="text-purple-200 mb-6 text-left text-xs uppercase tracking-widest">Enter details to access your portal</p>

            <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                    <label className="block text-[10px] font-bold mb-1 uppercase text-purple-100 tracking-widest">Email Address</label>
                    <input 
                    type="email" 
                    placeholder="email@gmail.com"
                    className="w-full p-3.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-sm"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase text-purple-100 tracking-widest">Password</label>
                        <span 
                            className="text-[10px] text-teal-300 hover:underline cursor-pointer font-bold uppercase"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Forgot Password?
                        </span>
                    </div>
                    <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-3.5 rounded-xl border border-purple-400/30 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-sm"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>

                {/* Google reCAPTCHA - Scaled to fit screen height */}
                <div className="py-1 flex justify-center md:justify-start transform scale-90 origin-left">
                    <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LdcBrwsAAAAAINWKyi4KAQOZmvCfozpRC6ivFPv" 
                    onChange={(token) => setCaptchaToken(token)}
                    theme="dark"
                    />
                </div>

                {/* Legal Links */}
                <p className="text-[10px] text-purple-300 leading-tight uppercase font-bold tracking-tight">
                    By logging in, you agree to our 
                    <span className="underline text-teal-300 mx-1 cursor-pointer hover:text-white" onClick={() => navigate('/privacy')}>Privacy Policy</span> and 
                    <span className="underline text-teal-300 mx-1 cursor-pointer hover:text-white" onClick={() => navigate('/terms')}>Terms</span>.
                </p>

                {/* Login Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-teal-400 hover:bg-teal-500 text-[#2D1B69] font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                    {loading ? "Authenticating..." : "Login to Fintech"}
                </button>
            </form>

            {/* ✅ SIGNUP LINK (Added Back properly) */}
            <p className="mt-6 text-center text-xs text-purple-200 uppercase font-bold tracking-widest">
                Don't have an account? <span className="text-teal-300 font-black hover:underline cursor-pointer ml-1" onClick={() => navigate('/signup')}>Signup here</span>
            </p>
        </div>
      </div>

      {/* 👉 Right Side: Branding (Fixed & No Scroll) */}
      <div className="hidden md:flex bg-slate-50 justify-center items-center p-12 text-center relative overflow-hidden h-full">
        <div className="absolute w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30 -bottom-20 -right-20"></div>

        <div className="max-w-sm z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase italic tracking-tighter">Grow Your Network</h2>
          <p className="text-slate-400 mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">Connect with global surveys and maximize your income.</p>
          
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100">
             <div className="space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Status</span>
                  <span className="font-black text-slate-800 text-sm">Active ✅</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Payout Pool</span>
                  <span className="font-black text-teal-600 text-sm">$12.5M+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Withdrawals</span>
                  <span className="font-black text-slate-800 text-sm italic">24/7 Fast</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;