import React from 'react';

const Privacy = () => {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto text-gray-800 font-sans leading-relaxed">
      <h1 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-purple-600 inline-block">Privacy Policy</h1>
      
      <p className="mb-6 text-lg">Welcome to <strong>FintechCash</strong>. We value your privacy and are committed to protecting your personal data.</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-purple-700 underline">1. Information We Collect</h2>
        <p>We collect basic details such as your Name, Email Address, and Device Information to provide a secure earning environment and prevent fraudulent activities.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-purple-700 underline">2. How We Use Data</h2>
        <p>Your information helps us track survey completions from our partners (TheoremReach, Monlix) and ensures that rewards are accurately credited to your account.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-purple-700 underline">3. Third-Party Services</h2>
        <p>We integrate third-party ad networks and survey providers. These partners may collect data according to their own privacy policies to serve relevant offers.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-purple-700 underline">4. Security</h2>
        <p>We use industry-standard security measures to protect your data from unauthorized access or disclosure.</p>
      </section>
    </div>
  );
};

export default Privacy;