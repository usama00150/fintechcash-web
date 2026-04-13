import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const plans = [
  { name: 'Beginner', price: 700 }, { name: 'Standard', price: 1200 },
  { name: 'Professional', price: 3000 }, { name: 'Elite', price: 5000 }, { name: 'Master', price: 10000 }
];

const milestones = [
  { goal: 50, reward: "🎨 Graphic Design Course + Rs. 10,000", icon: "💰" },
  { goal: 100, reward: "💻 Web Dev Course + Rs. 20,000 + Laptop", icon: "🚀" },
  { goal: 200, reward: "🕋 Umrah Ticket + Rs. 30,000 Cash", icon: "✈️" },
  { goal: 400, reward: "🏍️ Honda CD 70 + Rs. 50,000 Cash", icon: "💵" },
  { goal: 700, reward: "🚗 Suzuki Alto + Rs. 1 Lac + Dubai Trip", icon: "🏖️" },
];

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [myTeam, setMyTeam] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null); 
  const [tid, setTid] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [withdrawData, setWithdrawData] = useState({ amount: '', method: '', accTitle: '', accNumber: '' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            setUserData(snap.data());
            const qTeam = query(
              collection(db, "users"), 
              where("referredBy", "==", user.uid),
              where("status", "==", "active")
            );
            const tSnap = await getDocs(qTeam);
            setMyTeam(tSnap.docs.map(d => ({ name: d.data().name, plan: d.data().plan })));
          }
        } catch (err) { console.error("Internal State Error:", err); }
      } else { window.location.href = "/login"; }
    });
    return () => unsub();
  }, []);

  const handleActivationRequest = async () => {
    if(!tid || !senderAccount || !selectedPlan) return alert("Please complete all required fields.");
    await updateDoc(doc(db, "users", userData.uid), {
      plan: selectedPlan.name, planPrice: selectedPlan.price, tid: tid, senderAccount: senderAccount, status: "pending_approval"
    });
    alert("Request submitted. Admin will verify your payment details shortly.");
    setActiveModal(null);
    window.location.reload();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawData.amount);
    if (amount > userData.walletBalance) return alert("Insufficient account balance.");
    const fee = amount * 0.05;
    await addDoc(collection(db, "withdraw_requests"), { 
      uid: userData.uid, userName: userData.name, requestedAmount: amount, payableAmount: amount - fee,
      method: withdrawData.method, accTitle: withdrawData.accTitle, accNumber: withdrawData.accNumber,
      status: 'pending', createdAt: serverTimestamp() 
    });
    alert("Withdrawal request submitted.");
    setActiveModal(null);
  };

  if (!userData) return <div className="h-screen flex items-center justify-center font-sans font-black text-blue-700 animate-pulse uppercase tracking-widest">FintechCash Core Initializing...</div>;

  const isLocked = userData.status === 'inactive' || userData.status === 'pending_approval';
  
  // LOGIC: Check if plan is high enough for surveys
  const canAccessSurveys = ['Professional', 'Elite', 'Master'].includes(userData.plan);

  const FeatureLock = ({ children, title, subtitle, customCondition = true }) => {
    const shouldLock = isLocked || !customCondition;
    const lockText = !isLocked && !customCondition ? "Plan Upgrade Required" : "Account Activation Required";
    const subText = !isLocked && !customCondition ? "Upgrade to Professional or higher to earn from surveys." : subtitle;

    return (
      <div className="relative overflow-hidden transition-all duration-500 group">
        {shouldLock && (
          <div className="absolute inset-0 z-20 bg-slate-50/90 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center border border-slate-200 shadow-inner p-6 text-center">
             <div className="bg-white p-3 rounded-full shadow-md mb-3">🔒</div>
             <h4 className="text-slate-800 font-bold text-xs uppercase mb-1">{title || lockText}</h4>
             <p className="text-[10px] text-slate-500 font-medium mb-4">{subText || "Unlock access to start earning."}</p>
             <button onClick={() => setActiveModal('upgrade')} className="bg-blue-600 text-white text-[9px] px-6 py-2 rounded-full font-black uppercase shadow-lg active:scale-95">Unlock Now</button>
          </div>
        )}
        <div className={shouldLock ? "opacity-20 pointer-events-none grayscale h-full" : "h-full"}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-900 antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r hidden lg:flex flex-col p-8 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-12">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-blue-200">F</div>
           <h1 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">FintechCash</h1>
        </div>
        <nav className="space-y-3 flex-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab==='dashboard'?'bg-blue-600 text-white shadow-xl shadow-blue-100':'text-slate-400 hover:bg-slate-50'}`}>Dashboard Overview</button>
          <button onClick={()=>setActiveTab('surveys')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab==='surveys'?'bg-blue-600 text-white shadow-xl shadow-blue-100':'text-slate-400 hover:bg-slate-50'}`}>Earn from Surveys 🔥</button>
          <button onClick={()=>setActiveTab('network')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab==='network'?'bg-blue-600 text-white shadow-xl shadow-blue-100':'text-slate-400 hover:bg-slate-50'}`}>Network Directory</button>
          <button onClick={()=>setActiveTab('rewards')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab==='rewards'?'bg-blue-600 text-white shadow-xl shadow-blue-100':'text-slate-400 hover:bg-slate-50'}`}>Achievement Hub</button>
        </nav>
        <button onClick={()=>signOut(auth)} className="text-slate-400 font-bold text-xs uppercase py-4 px-5 hover:text-red-500 text-left">Sign Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 pb-32 lg:pb-12">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-1">{activeTab === 'dashboard' ? 'Overview' : activeTab}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Management Console</p>
          </div>
          <div className="flex gap-3">
            {isLocked ? (
              <button onClick={() => setActiveModal('upgrade')} className="bg-emerald-500 text-white px-5 py-2 rounded-full shadow-lg font-black text-[9px] uppercase italic animate-pulse">Activate account ⚡</button>
            ) : (
              <div className="bg-blue-50 px-5 py-2 rounded-full border border-blue-100 font-black text-[9px] text-blue-600 uppercase tracking-widest">{userData.plan} Member</div>
            )}
            <button onClick={() => setActiveModal('upgrade')} className="bg-slate-900 text-white px-5 py-2 rounded-full shadow-md font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Upgrade account</button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureLock title="My Wallet">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center h-full flex flex-col justify-between">
                <div>
                   <p className="text-slate-400 font-bold text-[10px] uppercase mb-2">Available Balance</p>
                   <h3 className="text-3xl font-black text-slate-800 font-mono italic">Rs. {userData.walletBalance}</h3>
                </div>
                <button onClick={()=>setActiveModal('withdraw')} className="mt-6 w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 shadow-xl active:scale-95">Withdraw Funds</button>
              </div>
            </FeatureLock>

            <FeatureLock title="Total Earnings">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col justify-center h-full">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Total Income (LTD)</p>
                <h3 className="text-3xl font-black text-emerald-500 font-mono italic">Rs. {userData.walletBalance + (userData.totalWithdraw || 0)}</h3>
              </div>
            </FeatureLock>

            <FeatureLock title="Team Stats">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col justify-center h-full">
                <p className="text-slate-400 font-bold text-[10px] uppercase mb-2">Total Referral Team</p>
                <h3 className="text-3xl font-black text-blue-600 font-mono italic">{myTeam.length} <span className="text-xs uppercase text-slate-300">Active</span></h3>
              </div>
            </FeatureLock>
            
            <div className="lg:col-span-3 bg-linear-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-2xl mt-4 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="bg-white/20 p-2 rounded-lg">🔗</div>
                   <h3 className="text-[11px] font-bold uppercase tracking-widest opacity-90">Affiliate Referral Link (15% Bonus Commission)</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                   <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="flex-1 bg-white/10 px-6 py-4 rounded-2xl text-xs font-mono outline-none border border-white/20" />
                   <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Link Copied Successfully!")}} className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Copy My Link</button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'surveys' && (
          <FeatureLock 
            title="Premium Survey Core" 
            subtitle="Please activate your account to earn money from surveys"
            customCondition={canAccessSurveys} 
          >
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-indigo-50 rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <span className="text-5xl animate-pulse">🎯</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 uppercase italic mb-3">Survey Achievement Wall</h3>
              <p className="text-slate-400 font-semibold text-xs uppercase tracking-wide mb-10 max-w-sm mx-auto leading-relaxed">High-yield market research surveys. Earn up to <span className="text-indigo-600 font-black underline">Rs. 50</span> per completion.</p>
              
              <a 
                href={`https://www.theoremreach.com/respondent_entry/direct?api_key=d7c4aff2362e855e36808605c173&user_id=${userData.uid}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-indigo-600 text-white font-black py-6 rounded-4xl shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase italic text-sm"
              >
                Launch Survey Core 🚀
              </a>
              <p className="mt-8 text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">Verified earnings credit within 24 business hours.</p>
            </div>
          </FeatureLock>
        )}

        {activeTab === 'network' && (
          <FeatureLock title="My Team">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
               <h3 className="font-black text-slate-800 uppercase text-lg mb-10 border-b border-slate-50 pb-6 italic text-center">My Network Registry</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTeam.map((m, i) => (
                    <div key={i} className="bg-slate-50/50 p-6 rounded-4xl border border-slate-100 text-center hover:shadow-md transition-all">
                      <p className="font-black text-slate-800 uppercase text-xs mb-1 tracking-tight">{m.name}</p>
                      <p className="text-[9px] text-blue-500 font-black uppercase italic tracking-widest">{m.plan}</p>
                    </div>
                  ))}
                  {myTeam.length === 0 && <p className="col-span-full py-20 text-slate-300 font-bold uppercase italic text-[10px] text-center tracking-[0.3em]">No registered members in your network.</p>}
               </div>
            </div>
          </FeatureLock>
        )}

        {/* ... (Rewards Tab remains same) */}
      </main>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-8 uppercase text-center text-slate-800 italic tracking-tighter">{activeModal === 'upgrade' ? 'Subscription Portal' : 'Secure Withdrawal'}</h2>
            
            {activeModal === 'upgrade' ? (
              <div className="space-y-5">
                {/* IMPROVED BANK DETAILS CARD */}
                <div className="bg-linear-to-br from-slate-800 to-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl text-center border-b-4 border-blue-500 relative overflow-hidden">
                  <p className="text-[10px] font-black opacity-40 mb-3 uppercase tracking-[0.2em] relative z-10 text-slate-100">Primary Payment Node</p>
                  
                  <div className="relative z-10 mb-5 bg-white/5 py-3 rounded-2xl border border-white/10">
                     <p className="text-[11px] font-bold text-blue-300 uppercase mb-1">Meezan Bank</p>
                     <p className="text-xs font-black text-white uppercase tracking-widest italic">Title: USAMA</p>
                  </div>

                  <p className="text-2xl font-black tracking-widest mb-2 italic break-all font-mono uppercase text-white drop-shadow-lg">00300109721101</p>
                  
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 italic relative z-10">Verified Business Merchant</p>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 rounded-full blur-3xl opacity-20 z-0"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {plans.map(p => (
                    <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-4 border-2 rounded-4xl text-center cursor-pointer transition-all duration-300 ${selectedPlan?.name === p.name ? 'border-blue-600 bg-blue-50 shadow-md scale-95' : 'border-slate-50 hover:border-slate-100'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{p.name}</p>
                      <p className="font-black text-blue-600 text-[12px]">Rs. {p.price}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                   <input type="text" placeholder="Send Account" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-center text-xs outline-none focus:border-blue-600" onChange={(e)=>setSenderAccount(e.target.value)} />
                   <input type="text" placeholder="Transaction ID (TID)" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl text-blue-700 text-center uppercase outline-none focus:border-blue-600 shadow-inner" onChange={(e)=>setTid(e.target.value)} />
                </div>
                
                <button onClick={handleActivationRequest} className="w-full bg-blue-600 text-white p-5 rounded-4xl font-black uppercase shadow-xl italic text-sm active:scale-95 transition-all mt-4">Confirm Activation</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4 pt-2">
                 {/* Withdrawal Fields Same As Before */}
                 <div className="bg-slate-50 p-6 rounded-3xl mb-4 text-center border border-dashed border-slate-200">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Funds</p>
                   <p className="text-2xl font-black italic">Rs. {userData.walletBalance}</p>
                </div>
                <input type="number" placeholder="Enter Amount (PKR)" className="w-full p-5 bg-white border border-slate-100 rounded-2xl font-black text-center text-xl outline-none" onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} required />
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-center text-xs outline-none" onChange={(e)=>setWithdrawData({...withdrawData, method: e.target.value})} required>
                  <option value="">Select Gateway</option><option value="EasyPaisa">EasyPaisa</option><option value="JazzCash">JazzCash</option><option value="Bank Account">Bank Transfer</option>
                </select>
                <input type="text" placeholder="Full Account Title" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-center text-xs outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                <input type="text" placeholder="Account Number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-center text-xs outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-4xl font-black uppercase shadow-xl italic text-sm active:scale-95 transition-all mt-4">Process Withdrawal</button>
              </form>
            )}
            <button onClick={()=>setActiveModal(null)} className="w-full mt-6 text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] text-center hover:text-slate-500 transition-all">Cancel & Exit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;