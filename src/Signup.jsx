import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha"; // Don't forget to run: npm install react-google-recaptcha

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [referredBy, setReferredBy] = useState("Direct");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null); // Added for security
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const ref = queryParams.get('ref');
    if (ref) { setReferredBy(ref); }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Security Check: Captcha Verification
    if (!captchaToken) {
      return alert("Please verify that you are not a robot.");
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

      alert("Signup Successful! Welcome to FintechCash.");
      navigate('/dashboard');
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleSignup} className="bg-white p-6 md:p-10 rounded-4xl shadow-xl w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
        <h1 className="text-2xl md:text-3xl font-black text-blue-700 mb-6 uppercase italic tracking-tighter text-center">FintechCash Signup</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 mb-2 text-center">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Invited By:</p>
            <p className="text-xs font-bold text-blue-800 truncate text-center">{referredBy}</p>
          </div>

          <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password (Min 6 chars)" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" onChange={(e)=>setFormData({...formData, password: e.target.value})} required />
          <input type="text" placeholder="Phone Number" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" onChange={(e)=>setFormData({...formData, phone: e.target.value})} required />
        </div>

        {/* reCAPTCHA Section for TheoremReach Compliance */}
        <div className="mt-6 flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LdcBrwsAAAAAINWKyi4KAQOZmvCfozpRC6ivFPv" // Standard Test Key - Replace with your own from Google Admin Console later
            onChange={(token) => setCaptchaToken(token)}
          />
        </div>

        <button disabled={loading} className="w-full bg-blue-700 text-white p-5 rounded-3xl font-black uppercase shadow-xl mt-6 italic tracking-tighter active:scale-95 transition-all">
          {loading ? "Processing..." : "Create Account & Start"}
        </button>

        {/* Legal Links for TheoremReach Approval */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            By signing up, you agree to our <br />
            <span className="text-blue-600 cursor-pointer underline mr-1" onClick={() => navigate('/terms')}>Terms of Service</span> 
            & 
            <span className="text-blue-600 cursor-pointer underline ml-1" onClick={() => navigate('/privacy')}>Privacy Policy</span>
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-6 font-black uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate('/login')}>Already have an account? Login</p>
      </form>
    </div>
  );
};

export default Signup;