import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Dashboard from './Dashboard';
import Admin from './Admin';
import Privacy from './Privacy'; // Naya Page
import Terms from './Terms';     // Naya Page

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication & Dashboard */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Signup />} />

        {/* Legal Pages for Ad Network Approval */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;