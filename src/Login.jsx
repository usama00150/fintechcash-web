import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) { alert("Invalid Credentials!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleLogin} className="bg-white p-6 md:p-10 rounded-4xl shadow-xl w-full max-w-md border-b-8 border-blue-600 animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-blue-900 uppercase italic tracking-tighter">Welcome Back</h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:border-blue-600" onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold focus:border-blue-600" onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black uppercase shadow-xl mt-8 italic tracking-tighter transition-all active:scale-95">
          {loading ? "Logging In..." : "Login to Dashboard"}
        </button>
        <p className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">New here? <span className="text-blue-600 cursor-pointer font-black" onClick={()=>navigate("/signup")}>Create Account</span></p>
      </form>
    </div>
  );
};

export default Login;