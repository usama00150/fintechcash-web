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
        } catch (err) { console.error("State Error:", err); }
      } else { window.location.href = "/login"; }
    });
    return () => unsub();
  }, []);

  const handleActivationRequest = async () => {
    if(!tid || !senderAccount || !selectedPlan) return alert("Please fill all fields.");
    await updateDoc(doc(db, "users", userData.uid), {
      plan: selectedPlan.name, planPrice: selectedPlan.price, tid: tid, senderAccount: senderAccount, status: "pending_approval"
    });
    alert("Submitted! Verification in progress.");
    setActiveModal(null);
    window.location.reload();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawData.amount);
    if (amount > userData.walletBalance) return alert("Insufficient balance.");
    const fee = amount * 0.05;
    await addDoc(collection(db, "withdraw_requests"), { 
      uid: userData.uid, userName: userData.name, requestedAmount: amount, payableAmount: amount - fee,
      method: withdrawData.method, accTitle: withdrawData.accTitle, accNumber: withdrawData.accNumber,
      status: 'pending', createdAt: serverTimestamp() 
    });
    alert("Withdrawal requested.");
    setActiveModal(null);
  };

  if (!userData) return <div className="h-screen flex items-center justify-center font-sans font-black text-blue-600 uppercase tracking-widest animate-pulse">Loading...</div>;

  const isLocked = userData.status === 'inactive' || userData.status === 'pending_approval';
  const canAccessSurveys = ['Professional', 'Elite', 'Master'].includes(userData.plan);

  const FeatureLock = ({ children, title, subtitle, customCondition = true }) => {
    const shouldLock = isLocked || !customCondition;
    const lockText = !isLocked && !customCondition ? "Plan Upgrade Required" : "Account Activation Required";
    const subText = !isLocked && !customCondition ? "Upgrade to Professional or higher to unlock." : subtitle;

    return (
      <div className="relative overflow-hidden transition-all duration-500 h-full">
        {shouldLock && (
          <div className="absolute inset-0 z-20 bg-slate-50/90 backdrop-blur-sm rounded-4xl flex flex-col items-center justify-center border border-slate-200 shadow-inner p-4 text-center">
             <div className="bg-white p-2 rounded-full shadow-md mb-2">🔒</div>
             <h4 className="text-slate-800 font-bold text-[10px] uppercase mb-1">{title || lockText}</h4>
             <p className="text-[9px] text-slate-500 font-medium mb-3">{subText || "Activate account to unlock."}</p>
             <button onClick={() => setActiveModal('upgrade')} className="bg-blue-600 text-white text-[8px] px-5 py-2 rounded-full font-black uppercase shadow-lg">Unlock Now</button>
          </div>
        )}
        <div className={shouldLock ? "opacity-20 pointer-events-none grayscale h-full" : "h-full"}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-900 antialiased overflow-x-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r hidden lg:flex flex-col p-8 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-12">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg">F</div>
           <h1 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">FintechCash</h1>
        </div>
        <nav className="space-y-3 flex-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab==='dashboard'?'bg-blue-600 text-white shadow-xl':'text-slate-400 hover:bg-slate-50'}`}>Dashboard</button>
          <button onClick={()=>setActiveTab('surveys')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab==='surveys'?'bg-blue-600 text-white shadow-xl':'text-slate-400 hover:bg-slate-50'}`}>Earn money from surveys 🔥</button>
          <button onClick={()=>setActiveTab('network')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab==='network'?'bg-blue-600 text-white shadow-xl':'text-slate-400 hover:bg-slate-50'}`}>Network Directory</button>
          <button onClick={()=>setActiveTab('rewards')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab==='rewards'?'bg-blue-600 text-white shadow-xl':'text-slate-400 hover:bg-slate-50'}`}>Achievement Hub</button>
        </nav>
        <button onClick={()=>signOut(auth)} className="text-slate-400 font-bold text-xs uppercase py-4 px-5 hover:text-red-500 text-left">Sign Out</button>
      </aside>

      {/* MOBILE NAV */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white/95 backdrop-blur-xl border border-slate-200 flex justify-around p-3 z-50 shadow-2xl rounded-4xl">
        {['dashboard', 'surveys', 'network', 'rewards'].map((tab) => (
          <button key={tab} onClick={()=>setActiveTab(tab)} className={`flex flex-col items-center px-2 ${activeTab===tab?'text-blue-600':'text-slate-400'}`}>
            <span className="text-[9px] font-black uppercase tracking-tighter">{tab === 'dashboard' ? 'Home' : tab === 'surveys' ? 'Earn' : tab.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 md:p-12 pb-28 lg:pb-12 max-w-full overflow-x-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-5 md:p-7 rounded-4xl shadow-sm border border-slate-50">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight">
              {activeTab === 'dashboard' ? 'DASHBOARD' : activeTab === 'surveys' ? 'Earn money from surveys' : activeTab.toUpperCase()}
            </h2>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Global Console</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {isLocked ? (
              <button onClick={() => setActiveModal('upgrade')} className="flex-1 md:flex-none bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-lg font-black text-[8px] uppercase italic animate-pulse">Activate Account ⚡</button>
            ) : (
              <div className="flex-1 md:flex-none bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 font-black text-[8px] text-blue-600 uppercase text-center">{userData.plan} Member</div>
            )}
            <button onClick={() => setActiveModal('upgrade')} className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-md font-black text-[8px] uppercase tracking-widest hover:bg-blue-600">Upgrade</button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureLock title="My Wallet">
              <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center h-full flex flex-col justify-between">
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Balance</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 font-mono italic">Rs. {userData.walletBalance}</h3>
                <button onClick={()=>setActiveModal('withdraw')} className="mt-5 w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-[9px] uppercase hover:bg-red-600 transition-all">Withdraw</button>
              </div>
            </FeatureLock>

            <FeatureLock title="Total Income">
              <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center h-full min-h-35">
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Total Earned</p>
                <h3 className="text-2xl md:text-3xl font-black text-emerald-500 font-mono italic">Rs. {userData.walletBalance + (userData.totalWithdraw || 0)}</h3>
              </div>
            </FeatureLock>

            <FeatureLock title="Network">
              <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center h-full min-h-35">
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-1">Team Members</p>
                <h3 className="text-2xl md:text-3xl font-black text-blue-600 font-mono italic">{myTeam.length} <span className="text-[10px] text-slate-300 font-black uppercase">Active</span></h3>
              </div>
            </FeatureLock>
            
            <div className="lg:col-span-3 bg-linear-to-br from-blue-600 to-blue-800 p-6 md:p-8 rounded-4xl text-white shadow-2xl mt-2 relative overflow-hidden">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-90 mb-5 relative z-10">Affiliate Link (15% Bonus)</h3>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                   <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="flex-1 bg-white/10 px-5 py-3.5 rounded-xl text-[10px] font-mono outline-none border border-white/20" />
                   <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Copied!")}} className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-black text-[10px] uppercase shadow-lg">Copy Link</button>
                </div>
            </div>
          </div>
        )}

        {/* Surveys Content */}
        {activeTab === 'surveys' && (
          <FeatureLock 
            title="Survey Core" 
            subtitle="Activate account to earn money from surveys"
            customCondition={canAccessSurveys} 
          >
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
                 <span className="text-4xl md:text-5xl animate-pulse">🎯</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic mb-3">Earn money from surveys</h3>
              <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wide mb-8 leading-relaxed">High-yield market research surveys. Earn up to <span className="text-indigo-600 font-black text-xs underline">Rs. 50</span> per completion.</p>
              <a href={`https://www.theoremreach.com/respondent_entry/direct?api_key=d7c4aff2362e855e36808605c173&user_id=${userData.uid}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-indigo-600 text-white font-black py-5 md:py-6 rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase italic text-xs md:text-sm">Launch Survey 🚀</a>
            </div>
          </FeatureLock>
        )}

        {/* Rewards Content (Achievement Hub) */}
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((m, i) => {
              const isWon = userData.referralCount >= m.goal;
              return (
                <div key={i} className={`p-6 md:p-8 rounded-4xl border-2 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all duration-500 ${isWon ? 'bg-emerald-50 border-emerald-100 shadow-xl scale-[1.02]' : 'bg-white border-slate-50 opacity-60'}`}>
                  <div className="flex items-center gap-4 text-left flex-1 w-full">
                    <div className="text-3xl md:text-4xl bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-50">{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 uppercase text-[9px] md:text-[10px] leading-tight mb-2 truncate">{m.reward}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Progress: {userData.referralCount}/{m.goal}</p>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden shadow-inner">
                        <div className={`h-full transition-all duration-1000 ${isWon ? 'bg-emerald-500' : 'bg-blue-400'}`} style={{ width: `${Math.min((userData.referralCount / m.goal) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <span className={`font-black text-[8px] uppercase italic py-2 px-6 rounded-xl shadow-sm ${isWon ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                    {isWon ? "ACHIEVED" : "PENDING"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Team Network Registry */}
        {activeTab === 'network' && (
          <FeatureLock title="My Team Registry">
            <div className="bg-white p-6 md:p-10 rounded-4xl shadow-sm border border-slate-50">
               <h3 className="font-black text-slate-800 uppercase text-md mb-8 border-b border-slate-50 pb-5 italic text-center">Referral Registry</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                  {myTeam.map((m, i) => (
                    <div key={i} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 text-center">
                      <p className="font-black text-slate-800 uppercase text-[10px] mb-1 tracking-tight">{m.name}</p>
                      <p className="text-[8px] text-blue-500 font-black uppercase italic tracking-widest">{m.plan}</p>
                    </div>
                  ))}
                  {myTeam.length === 0 && <p className="col-span-full py-16 text-slate-300 font-bold uppercase italic text-[9px] text-center tracking-[0.2em]">No members yet.</p>}
               </div>
            </div>
          </FeatureLock>
        )}
      </main>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[95vh] relative">
            <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 uppercase text-center text-slate-800 italic tracking-tighter">{activeModal === 'upgrade' ? 'Subscription' : 'Withdraw'}</h2>
            
            {activeModal === 'upgrade' ? (
              <div className="space-y-4">
                <div className="bg-linear-to-br from-slate-800 to-slate-950 p-6 md:p-8 rounded-4xl text-white shadow-xl text-center border-b-4 border-blue-500 relative overflow-hidden">
                  <p className="text-[8px] font-black opacity-40 mb-3 uppercase tracking-widest relative z-10">Meezan Bank Gateway (USAMA)</p>
                  <div className="relative z-10 mb-5 bg-white/5 py-3 rounded-2xl border border-white/10">
                     <p className="text-[11px] font-bold text-blue-300 uppercase mb-1 tracking-widest italic">Bank Detail</p>
                     <p className="text-xs font-black text-white uppercase italic tracking-tighter">Title: USAMA</p>
                  </div>
                  <p className="text-2xl font-black tracking-widest mb-2 italic break-all font-mono uppercase text-white drop-shadow-lg">00300109721101</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 italic relative z-10">Core Payment Node</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map(p => (
                    <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-3 md:p-4 border-2 rounded-2xl text-center cursor-pointer transition-all ${selectedPlan?.name === p.name ? 'border-blue-600 bg-blue-50' : 'border-slate-50'}`}>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{p.name}</p>
                      <p className="font-black text-blue-600 text-[10px] md:text-[11px]">Rs. {p.price}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                   <input type="text" placeholder="Send Account" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-center text-[10px] outline-none" onChange={(e)=>setSenderAccount(e.target.value)} />
                   <input type="text" placeholder="Transaction ID (TID)" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-md text-blue-700 text-center uppercase outline-none focus:border-blue-600" onChange={(e)=>setTid(e.target.value)} />
                </div>
                <button onClick={handleActivationRequest} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase shadow-xl italic text-xs active:scale-95 transition-all">Submit</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div className="bg-slate-50 p-5 rounded-2xl mb-2 text-center border border-dashed border-slate-200">
                   <p className="text-[8px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Available Balance</p>
                   <p className="text-xl font-black italic text-emerald-600">Rs. {userData.walletBalance}</p>
                </div>
                <input type="number" placeholder="Amount (PKR)" className="w-full p-4 bg-white border border-slate-100 rounded-xl font-black text-center text-lg outline-none" onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} required />
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-center text-[10px] cursor-pointer" onChange={(e)=>setWithdrawData({...withdrawData, method: e.target.value})} required>
                  <option value="">Gateway</option><option value="EasyPaisa">EasyPaisa</option><option value="JazzCash">JazzCash</option><option value="Bank">Bank</option>
                </select>
                <input type="text" placeholder="Account Title" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-center text-[10px] outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                <input type="text" placeholder="Account Number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-center text-[10px] outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase italic text-xs active:scale-95 transition-all">Withdraw</button>
              </form>
            )}
            <button onClick={()=>setActiveModal(null)} className="w-full mt-4 text-slate-300 font-bold text-[9px] uppercase tracking-widest text-center">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;