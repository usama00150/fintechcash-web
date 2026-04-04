import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) { alert("Invalid Credentials!"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-b-8 border-blue-600">
        <h2 className="text-2xl font-black text-center mb-6 text-blue-900">WELCOME BACK</h2>
        <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl mb-4" onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl mb-6" onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold uppercase">Login</button>
        <p className="mt-4 text-center text-sm">New here? <span className="text-blue-600 cursor-pointer font-bold" onClick={()=>navigate("/signup")}>Create Account</span></p>
      </form>
    </div>
  );
};

export default Login;