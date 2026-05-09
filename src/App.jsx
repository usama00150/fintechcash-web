import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing'; 
import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './ForgotPassword'; 
import Dashboard from './Dashboard';
import Admin from './Admin';
import Privacy from './Privacy';
import Terms from './Terms';
import SupportButton from './SupportButton'; // 👈 Support Button Import kiya

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Entry Point */}
        <Route path="/" element={<Landing />} />

        {/* Authentication & Dashboard */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />

        {/* Legal Pages for Ad Network Approval */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      {/* 🛡️ Support Button (Global: Har page par dikhayi dega) */}
      <SupportButton /> 
    </Router>
  );
}

export default App;