import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const plans = [
  { name: 'Basic', price: 700 }, { name: 'Standard', price: 1200 },
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
            const qTeam = query(collection(db, "users"), where("referredBy", "==", user.uid));
            const tSnap = await getDocs(qTeam);
            setMyTeam(tSnap.docs.map(d => ({ name: d.data().name, plan: d.data().plan })));
          }
        } catch (err) { console.error("Error:", err); }
      } else { window.location.href = "/login"; }
    });
    return () => unsub();
  }, []);

  const getAdReward = () => {
    if (userData?.plan === 'Professional') return 2;
    if (userData?.plan === 'Elite') return 3;
    if (userData?.plan === 'Master') return 5;
    return 0;
  };

  const handleAdComplete = async (adNum) => {
    const watched = userData.adsWatchedToday || 0;
    if (watched >= 5) return alert("Daily limit reached!");
    
    const reward = getAdReward();
    const newBalance = (userData.walletBalance || 0) + reward;
    const newWatched = watched + 1;

    try {
      await updateDoc(doc(db, "users", userData.uid), {
        walletBalance: newBalance,
        adsWatchedToday: newWatched
      });
      setUserData({...userData, walletBalance: newBalance, adsWatchedToday: newWatched});
      alert(`Rs. ${reward} added! Total ads today: ${newWatched}/5`);
    } catch (err) { alert("Error updating reward!"); }
  };

  const handleActivationRequest = async () => {
    if(!tid || !senderAccount || !selectedPlan) return alert("Please fill all fields!");
    await updateDoc(doc(db, "users", userData.uid), {
      plan: selectedPlan.name, planPrice: selectedPlan.price, tid: tid, senderAccount: senderAccount, status: "pending_approval", adsWatchedToday: 0
    });
    alert("Request Sent! Admin will verify soon.");
    setActiveModal(null);
    window.location.reload();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawData.amount);
    if (amount > userData.walletBalance) return alert("Insufficient Balance!");
    const fee = amount * 0.05;
    await addDoc(collection(db, "withdraw_requests"), { 
      uid: userData.uid, userName: userData.name, requestedAmount: amount, payableAmount: amount - fee,
      method: withdrawData.method, accTitle: withdrawData.accTitle, accNumber: withdrawData.accNumber,
      status: 'pending', createdAt: serverTimestamp() 
    });
    alert("Withdrawal Requested!");
    setActiveModal(null);
  };

  if (!userData) return <div className="h-screen flex items-center justify-center font-bold text-blue-600 uppercase">Loading FintechCash...</div>;

  const isLocked = userData.status === 'inactive' || userData.status === 'pending_approval';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans relative">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col p-6 sticky top-0 h-screen shadow-sm z-50">
        <h1 className="text-2xl font-black text-blue-700 mb-10 italic uppercase tracking-tighter">FintechCash</h1>
        <nav className="space-y-2 flex-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left p-4 rounded-3xl font-bold transition-all ${activeTab==='dashboard'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>HOME</button>
          <button onClick={()=>setActiveTab('network')} className={`w-full text-left p-4 rounded-3xl font-bold transition-all ${activeTab==='network'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>TEAM</button>
          <button onClick={()=>setActiveTab('ads')} className={`w-full text-left p-4 rounded-3xl font-bold transition-all ${activeTab==='ads'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>DAILY ADS</button>
          <button onClick={()=>setActiveTab('rewards')} className={`w-full text-left p-4 rounded-3xl font-bold transition-all ${activeTab==='rewards'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>REWARDS</button>
        </nav>
        <button onClick={()=>signOut(auth)} className="text-red-500 font-black text-xs uppercase p-4 hover:bg-red-50 rounded-3xl transition-all text-left">LOGOUT</button>
      </aside>

      {/* MOBILE NAV (Bottom) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white border border-slate-100 flex justify-around p-3 z-50 shadow-2xl rounded-full">
        <button onClick={()=>setActiveTab('dashboard')} className={`px-2 py-1 font-black text-[9px] uppercase italic tracking-tighter transition-all ${activeTab==='dashboard'?'text-blue-600 border-b-2 border-blue-600':'text-gray-400'}`}>HOME</button>
        <button onClick={()=>setActiveTab('network')} className={`px-2 py-1 font-black text-[9px] uppercase italic tracking-tighter transition-all ${activeTab==='network'?'text-blue-600 border-b-2 border-blue-600':'text-gray-400'}`}>TEAM</button>
        <button onClick={()=>setActiveTab('ads')} className={`px-2 py-1 font-black text-[9px] uppercase italic tracking-tighter transition-all ${activeTab==='ads'?'text-blue-600 border-b-2 border-blue-600':'text-gray-400'}`}>ADS</button>
        <button onClick={()=>setActiveTab('rewards')} className={`px-2 py-1 font-black text-[9px] uppercase italic tracking-tighter transition-all ${activeTab==='rewards'?'text-blue-600 border-b-2 border-blue-600':'text-gray-400'}`}>GIFT</button>
        <button onClick={()=>signOut(auth)} className="px-2 py-1 font-black text-[9px] uppercase italic tracking-tighter text-red-400">EXIT</button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-10 relative pb-28 lg:pb-10">
        
        {isLocked && (
          <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md px-4 text-center">
            <div className="bg-white p-8 md:p-12 rounded-4xl shadow-2xl border w-full max-w-md animate-in zoom-in duration-300">
               <h2 className="text-xl md:text-3xl font-black mb-4 uppercase italic">Account {userData.status === 'inactive' ? 'Locked' : 'Pending'}</h2>
               <p className="text-gray-400 font-bold text-[10px] uppercase mb-10 tracking-widest">{userData.status === 'inactive' ? 'Activate plan to start daily earning' : 'Verification in progress...'}</p>
               {userData.status === 'inactive' && (
                <button onClick={() => { setSelectedPlan(plans[0]); setActiveModal('upgrade'); }} className="bg-blue-700 text-white px-10 py-4 rounded-full font-black text-lg shadow-xl uppercase italic hover:scale-105 transition-transform">Activate Now</button>
               )}
            </div>
          </div>
        )}

        <div className={isLocked ? "blur-md pointer-events-none" : "animate-in fade-in duration-500"}>
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase italic tracking-tighter">{activeTab}</h2>
            <div className="bg-white px-3 py-1 rounded-full border shadow-sm font-black text-[8px] text-blue-600 uppercase italic">{userData.plan} Member</div>
          </header>

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-4xl border text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-400 font-bold text-[9px] uppercase mb-1">Available Balance</p>
                <h3 className="text-2xl md:text-3xl font-black mb-4 italic text-gray-800">Rs. {userData.walletBalance}</h3>
                <button onClick={()=>setActiveModal('withdraw')} className="w-full bg-red-600 text-white py-3 rounded-full font-black text-[9px] uppercase shadow-lg active:scale-95 transition-all">Withdraw</button>
              </div>
              <div className="bg-white p-6 rounded-4xl border text-center flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-gray-400 font-bold text-[9px] uppercase mb-1">Total Earnings</p>
                <h3 className="text-2xl md:text-3xl font-black text-green-600 italic">Rs. {userData.walletBalance + (userData.totalWithdraw || 0)}</h3>
              </div>
              <div className="bg-white p-6 rounded-4xl border text-center flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-gray-400 font-bold text-[9px] uppercase mb-1">Daily Ads Progress</p>
                <h3 className="text-2xl md:text-3xl font-black text-blue-600 italic">{userData.adsWatchedToday || 0} / 5</h3>
                <button onClick={()=>setActiveModal('upgrade')} className="mt-2 text-[8px] font-black text-blue-400 hover:text-blue-700 underline uppercase tracking-widest transition-colors">Upgrade Membership</button>
              </div>
              
              <div className="grid grid-cols-1 lg:col-span-3 bg-blue-600 p-6 md:p-8 rounded-4xl text-white shadow-xl mt-4 relative overflow-hidden group">
                  <h3 className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-70">Referral Link (25% Commission)</h3>
                  <div className="flex flex-col gap-3">
                     <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="w-full bg-white/10 px-4 py-3 rounded-2xl text-[9px] font-mono outline-none border border-white/10 break-all" />
                     <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Copied!")}} className="w-full md:w-auto bg-white text-blue-700 px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Copy Link</button>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="bg-white p-6 md:p-8 rounded-4xl border text-center shadow-sm mb-6">
                <h3 className="font-black text-gray-800 uppercase italic text-lg mb-2 tracking-tighter">DAILY AD TASKS</h3>
                <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest text-center">Remaining Today: {5 - (userData.adsWatchedToday || 0)}</p>
              </div>

              {getAdReward() > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isWatched = (userData.adsWatchedToday || 0) >= num;
                    return (
                      <div key={num} className={`p-5 md:p-6 rounded-4xl border flex justify-between items-center transition-all ${isWatched ? 'bg-gray-100 opacity-60' : 'bg-white shadow-sm border-blue-50'}`}>
                         <span className="font-black text-gray-700 text-xs md:text-sm italic uppercase">Ad #{num}</span>
                         {isWatched ? (
                           <span className="text-green-600 font-black text-[9px] uppercase italic">Completed ✅</span>
                         ) : (
                           <button onClick={() => handleAdComplete(num)} className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-black text-[9px] uppercase shadow-md active:scale-95 transition-all">Watch & Earn</button>
                         )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-yellow-50 p-10 rounded-4xl border border-yellow-200 text-center">
                  <p className="font-black text-yellow-700 uppercase italic text-xs tracking-widest">Upgrade to unlock Ads! 🚀</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-white p-6 md:p-12 rounded-4xl shadow-sm border text-center">
               <h3 className="font-black text-gray-800 uppercase text-lg mb-8 border-b pb-4 italic tracking-tighter">MY TEAM NETWORK</h3>
               <div className="flex flex-col items-center">
                  <div className="bg-blue-600 text-white px-8 py-3 rounded-full font-black uppercase shadow-lg text-sm italic">You ({userData.name})</div>
                  <div className="w-1 h-8 bg-gray-100"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full pt-6 border-t border-gray-50">
                    {myTeam.map((m, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-3xl border text-center relative hover:border-blue-300 transition-all">
                        <p className="font-black text-gray-800 uppercase text-xs mb-1">{m.name}</p>
                        <p className="text-[9px] text-blue-600 font-bold uppercase italic tracking-widest">{m.plan}</p>
                      </div>
                    ))}
                    {myTeam.length === 0 && <p className="col-span-full py-10 text-gray-300 font-black italic uppercase text-[10px]">No members yet</p>}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map((m, i) => (
                <div key={i} className={`p-6 rounded-4xl border-2 flex flex-col sm:flex-row justify-between items-center gap-4 ${userData.referralCount >= m.goal ? 'bg-green-50 border-green-200 shadow-md' : 'bg-white border-slate-100 opacity-90'}`}>
                  <div className="flex items-center gap-4 text-left flex-1">
                    <span className="text-4xl">{m.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-800 uppercase text-[10px] md:text-xs leading-tight">{m.reward}</h4>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Target: {m.goal}</p>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${userData.referralCount >= m.goal ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${Math.min((userData.referralCount / m.goal) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <span className={`font-black text-[9px] uppercase italic p-2 rounded-xl ${userData.referralCount >= m.goal ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-300'}`}>
                    {userData.referralCount >= m.goal ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[95%] md:max-w-md rounded-4xl p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in">
            <h2 className="text-xl font-black mb-6 uppercase text-center text-gray-800 italic">{activeModal === 'upgrade' ? 'Activation' : 'Withdrawal'}</h2>
            
            {activeModal === 'upgrade' ? (
              <div className="space-y-4">
                <div className="bg-linear-to-br from-blue-700 to-indigo-900 p-6 rounded-4xl text-white shadow-xl text-center">
                  <p className="text-[8px] font-black opacity-60 mb-1 uppercase tracking-widest italic">MEEZAN BANK</p>
                  <p className="text-lg font-black tracking-widest mb-3 italic break-all">00300109721101</p>
                  <p className="text-[10px] font-black uppercase italic">Ayesha Usama</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map(p => (
                    <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-3 border-2 rounded-3xl text-center cursor-pointer transition-all ${selectedPlan?.name === p.name ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-100'}`}>
                      <p className="text-[8px] font-black text-gray-500 uppercase">{p.name}</p>
                      <p className="font-black text-blue-600 text-[10px]">Rs. {p.price}</p>
                    </div>
                  ))}
                </div>
                <input type="text" placeholder="Account Name / Number" className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-[11px] outline-none" onChange={(e)=>setSenderAccount(e.target.value)} />
                <input type="text" placeholder="TID Number" className="w-full p-4 bg-gray-50 border rounded-3xl font-black text-lg text-blue-700 text-center uppercase outline-none" onChange={(e)=>setTid(e.target.value)} />
                <button onClick={handleActivationRequest} className="w-full bg-blue-700 text-white p-4 rounded-3xl font-black uppercase shadow-xl italic text-sm">Submit Payment</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <input type="number" placeholder="Amount (Min 500)" className="w-full p-4 bg-gray-50 border rounded-3xl font-black text-center text-lg outline-none" onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} required />
                <select className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-xs outline-none" onChange={(e)=>setWithdrawData({...withdrawData, method: e.target.value})} required>
                  <option value="">Select Method</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Account">Bank Account</option>
                </select>
                <input type="text" placeholder="Account Title" className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-xs outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                <input type="text" placeholder="Account Number" className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-xs outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                <button type="submit" className="w-full bg-red-600 text-white p-4 rounded-3xl font-black uppercase shadow-xl italic text-sm">Request Funds</button>
              </form>
            )}
            <button onClick={()=>setActiveModal(null)} className="w-full mt-4 text-gray-400 font-bold text-[9px] uppercase tracking-widest text-center">Close Window</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;