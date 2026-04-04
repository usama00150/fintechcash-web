import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // sendEmailVerification remove kiya
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [referredBy, setReferredBy] = useState("Direct");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // URL se referral ID capture karna
    const queryParams = new URLSearchParams(window.location.search);
    const ref = queryParams.get('ref');
    if (ref) {
      setReferredBy(ref);
      console.log("Referral Detected:", ref);
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Firebase Authentication mein User Create karein
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = res.user;
      console.log("Auth Account Created:", user.uid);

      // 2. Firestore Database mein User ka Data Save karein
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
        status: "inactive",
        plan: "None",
        createdAt: serverTimestamp()
      });
      console.log("Firestore Document Created Successfully!");

      // 3. Seedha Dashboard par bhejein (No verification needed)
      alert("Signup Successful! Welcome to FintechCash.");
      navigate('/dashboard');

    } catch (err) {
      console.error("Signup Error Details:", err.code, err.message);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleSignup} className="bg-white p-6 md:p-10 rounded-4xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl md:text-3xl font-black text-blue-700 mb-6 uppercase italic tracking-tighter">FintechCash Signup</h1>
        
        <div className="space-y-4">
          {/* Referral Info Box */}
          <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 mb-2">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Invited By:</p>
            <p className="text-xs font-bold text-blue-800 truncate">{referredBy}</p>
          </div>

          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-600 font-bold" 
            onChange={(e)=>setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-600 font-bold" 
            onChange={(e)=>setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password (Min 6 chars)" 
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-600 font-bold" 
            onChange={(e)=>setFormData({...formData, password: e.target.value})} 
            required 
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-blue-600 font-bold" 
            onChange={(e)=>setFormData({...formData, phone: e.target.value})} 
            required 
          />
        </div>

        <button 
          disabled={loading} 
          className={`w-full bg-blue-700 text-white p-5 rounded-3xl font-black uppercase shadow-xl mt-8 italic tracking-tighter shadow-blue-100 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          {loading ? "Processing..." : "Create Account & Login"}
        </button>

        <p 
          className="text-center text-[10px] text-gray-400 mt-6 font-black uppercase tracking-widest cursor-pointer hover:text-blue-600"
          onClick={() => navigate('/login')}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
};

export default Signup;