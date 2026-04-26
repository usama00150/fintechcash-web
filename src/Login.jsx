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
      alert("Login Successful! Welcome back.");
      navigate('/dashboard');
    } catch (err) {
      alert("Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen font-sans bg-white">
      
      {/* 👈 Left Side: Purple Section */}
      <div className="bg-[#2D1B69] p-8 md:p-20 flex flex-col justify-center text-white">
        <div className="mb-10 flex items-center gap-2 text-left">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <span className="text-[#2D1B69] font-bold">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight">FINTECH CASH</span>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-left">Login to Account</h1>
        <p className="text-purple-200 mb-8 text-left">Enter your details to access your account.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-purple-100">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email @gmail.com"
              className="w-full p-4 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-purple-100">Password</label>
              <span 
                className="text-xs text-teal-300 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full p-4 rounded-xl border border-purple-400 bg-[#3D2B7A] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Google reCAPTCHA */}
          <div className="py-2 flex justify-center md:justify-start">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LdcBrwsAAAAAINWKyi4KAQOZmvCfozpRC6ivFPv" // Aapki purani key
              onChange={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>

          <p className="text-[12px] text-purple-200">
            By logging in, you agree to our 
            <span className="underline text-teal-300 mx-1 cursor-pointer" onClick={() => navigate('/privacy')}>Privacy Policy</span> and 
            <span className="underline text-teal-300 mx-1 cursor-pointer" onClick={() => navigate('/terms')}>Terms of Service</span>.
          </p>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-400 hover:bg-teal-500 text-[#2D1B69] font-black py-4 rounded-xl shadow-lg transition-all active:scale-95"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-purple-200">
          Don't have an account? <span className="text-teal-300 font-bold hover:underline cursor-pointer" onClick={() => navigate('/signup')}>Signup here</span>
        </p>
      </div>

      {/* 👉 Right Side: Light Branding Section (Matching Signup) */}
      <div className="hidden md:flex bg-slate-50 justify-center items-center p-12 text-center relative overflow-hidden">
        {/* Decorative Blur */}
        <div className="absolute w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-40 -bottom-20 -right-20"></div>

        <div className="max-w-sm z-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Grow Your Earnings</h2>
          <p className="text-slate-500 mb-12">Connect with global surveys and maximize your daily income with ease.</p>
          
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
             <p className="text-slate-400 text-[10px] font-black mb-4 uppercase tracking-widest">Platform Status</p>
             <div className="space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-600 text-sm">Active Users</span>
                  <span className="font-bold text-slate-800">100k+</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-600 text-sm">Total Paid</span>
                  <span className="font-bold text-teal-600 text-sm">$12.5M+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Withdrawals</span>
                  <span className="font-bold text-slate-800 text-sm italic">Instant</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;