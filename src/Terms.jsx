import React from 'react';

const Terms = () => {
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto text-gray-800 font-sans leading-relaxed">
      <h1 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-blue-600 inline-block">Terms of Service</h1>
      
      <p className="mb-6 text-lg">By accessing <strong>FintechCash</strong>, you agree to comply with the following terms and conditions.</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">1. User Accounts</h2>
        <p>You must provide accurate information during registration. Creating multiple accounts or using bots to manipulate earnings is strictly prohibited and will result in a permanent ban.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">2. Earning & Rewards</h2>
        <p>Earnings are generated through third-party survey completions. FintechCash reserves the right to verify all tasks. Any use of VPNs or proxies to access surveys will lead to account termination.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">3. Payments</h2>
        <p>Withdrawals are processed after reaching the minimum threshold. We aim to process payments within 24-72 hours, subject to verification of the tasks performed.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-blue-700 underline">4. Limitation of Liability</h2>
        <p>FintechCash is not responsible for any technical issues on third-party survey platforms or loss of data due to user negligence.</p>
      </section>

    </div>
  );
};

export default Terms;