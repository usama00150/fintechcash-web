import React from 'react';

const Privacy = () => {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto text-gray-800 font-sans leading-relaxed">
      <h1 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-blue-600 inline-block">Privacy Policy</h1>
      
      <p className="mb-6 text-lg">Welcome to <strong>FintechCash</strong>. We value your privacy and are committed to protecting your personal data in accordance with global standards, including <strong>GDPR</strong>.</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">1. Information We Collect</h2>
        <p>We collect essential information to provide a secure environment, including:</p>
        <ul className="list-disc ml-6 mt-2">
          <li><strong>Identity Data:</strong> Name and Email Address.</li>
          <li><strong>Technical Data:</strong> IP address, device type, and unique identifiers (UID).</li>
          <li><strong>Usage Data:</strong> Information on how you interact with our rewards system.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">2. How We Use Data</h2>
        <p>Your data is used solely to track successful task completions and ensure that <strong>in-app rewards (Points/Coins)</strong> are accurately credited to your account balance. We also use this data to prevent fraudulent activities and duplicate accounts.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">3. GDPR & User Rights</h2>
        <p>In compliance with the <strong>General Data Protection Regulation (GDPR)</strong>, users have the following rights regarding their personal data:</p>
        <ul className="list-disc ml-6 mt-2">
          <li><strong>Right to Access:</strong> You can request a copy of the data we hold.</li>
          <li><strong>Right to Erasure:</strong> You can request the deletion of your account and associated data.</li>
          <li><strong>Right to Rectification:</strong> You can update your information at any time via your profile.</li>
        </ul>
        <p className="mt-2 text-sm italic">To exercise these rights, please contact our support team via your registered email.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">4. Third-Party Data Sharing</h2>
        <p>We work with various market research and offer-wall providers. These third-party partners may collect data (such as device IDs) to provide relevant surveys and tasks. This data is handled according to their respective privacy standards and is only used for reward verification.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">5. Data Security</h2>
        <p>FintechCash employs industry-standard encryption and security protocols to ensure your data is protected from unauthorized access, disclosure, or alteration.</p>
      </section>

      {/* NEW SECTION ADDED FOR THEOREMREACH COMPLIANCE */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">6. Contact & Support</h2>
        <p>If you have any questions about this Privacy Policy, your data, or the rewards system, please feel free to reach out to us at our official support email:</p>
        <p className="mt-4 text-xl font-black text-blue-600">usama1500usama@gmail.com</p>
      </section>

      <p className="text-xs text-gray-500 mt-10 italic">Last Updated: April 2026</p>
    </div>
  );
};

export default Privacy;