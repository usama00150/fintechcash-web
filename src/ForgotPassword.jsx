import React, { useState } from 'react';
import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      // Optional: 3 second baad login par wapis le jaye
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen font-sans bg-white">
      
      {/* 👈 Left Side: Purple Section */}
      <div className="bg-[#2D1B69] p-8 md:p-20 flex flex-col justify-center text-white">
        <div className="mb-10 flex items-center gap-2 text-left cursor-pointer" onClick={() => navigate('/login')}>
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <span className="text-[#2D1B69] font-bold text-lg">←</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-teal-300">BACK TO LOGIN</span>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-left">Reset Password</h1>
        <p className="text-purple-200 mb-8 text-left">Enter your email and we'll send you a link to reset your password.</p>

        {/* Success Message */}
        {message && (
          <div className="bg-teal-400/20 border border-teal-400 p-4 rounded-xl mb-6 text-teal-300 text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-400 hover:bg-teal-500 text-[#2D1B69] font-black py-4 rounded-xl shadow-lg transition-all active:scale-95"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-8 text-center text-purple-200 text-sm">
          Remembered your password? <span className="text-teal-300 font-bold hover:underline cursor-pointer" onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>

      {/* 👉 Right Side: Light Branding Section */}
      <div className="hidden md:flex bg-slate-50 justify-center items-center p-12 text-center relative overflow-hidden">
        <div className="absolute w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-40 -top-20 -left-20"></div>

        <div className="max-w-sm z-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Secure Your Account</h2>
          <p className="text-slate-500 mb-12">FintechCash uses high-level encryption to keep your data and earnings safe.</p>
          
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
             </div>
             <p className="text-slate-800 font-bold mb-1">Security First</p>
             <p className="text-slate-400 text-xs">Password reset links expire in 1 hour for your protection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;