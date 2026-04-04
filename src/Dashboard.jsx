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

  const handleActivationRequest = async () => {
    if(!tid || !senderAccount || !selectedPlan) return alert("Please fill all fields!");
    await updateDoc(doc(db, "users", userData.uid), {
      plan: selectedPlan.name, planPrice: selectedPlan.price, tid: tid, senderAccount: senderAccount, status: "pending_approval"
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
        <h1 className="text-2xl font-black text-blue-700 mb-10 italic uppercase">FintechCash</h1>
        <nav className="space-y-2 flex-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left p-4 rounded-3xl font-bold ${activeTab==='dashboard'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>🏠 Dashboard</button>
          <button onClick={()=>setActiveTab('network')} className={`w-full text-left p-4 rounded-3xl font-bold ${activeTab==='network'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>🌳 My Team Tree</button>
          <button onClick={()=>setActiveTab('rewards')} className={`w-full text-left p-4 rounded-3xl font-bold ${activeTab==='rewards'?'bg-blue-600 text-white shadow-xl':'text-gray-400 hover:bg-gray-50'}`}>🎁 My Rewards</button>
        </nav>
        <button onClick={()=>signOut(auth)} className="text-red-500 font-black text-xs uppercase p-4 hover:bg-red-50 rounded-3xl transition-all">Logout</button>
      </aside>

      {/* MOBILE NAV (Bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-4 z-50 shadow-2xl">
        <button onClick={()=>setActiveTab('dashboard')} className={`p-2 rounded-2xl ${activeTab==='dashboard'?'text-blue-600':'text-gray-400'}`}>🏠</button>
        <button onClick={()=>setActiveTab('network')} className={`p-2 rounded-2xl ${activeTab==='network'?'text-blue-600':'text-gray-400'}`}>🌳</button>
        <button onClick={()=>setActiveTab('rewards')} className={`p-2 rounded-2xl ${activeTab==='rewards'?'text-blue-600':'text-gray-400'}`}>🎁</button>
        <button onClick={()=>signOut(auth)} className="p-2 text-red-500">🚪</button>
      </div>

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-10 relative pb-24 lg:pb-10">
        
        {/* LOCK OVERLAY (Removed Email Check) */}
        {isLocked && (
          <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md px-4">
            <div className="bg-white p-8 md:p-12 rounded-4xl shadow-2xl text-center border border-white w-full max-w-md animate-in zoom-in duration-300">
               <h2 className="text-2xl md:text-4xl font-black mb-4 uppercase italic tracking-tighter">Account {userData.status === 'inactive' ? 'Locked' : 'Pending'}</h2>
               <p className="text-gray-400 font-bold text-[10px] uppercase mb-10 tracking-widest leading-relaxed">
                 {userData.status === 'inactive' ? 'Activate membership to unlock earning potential' : 'Admin is verifying your TID. Please wait.'}
               </p>
               {userData.status === 'inactive' && (
                <button onClick={() => { setSelectedPlan(plans[0]); setActiveModal('upgrade'); }} className="bg-blue-700 text-white px-10 py-4 rounded-4xl font-black text-lg shadow-2xl hover:scale-105 transition-all uppercase italic">Activate Now</button>
               )}
               <button onClick={()=>signOut(auth)} className="block mx-auto mt-8 text-gray-300 font-bold text-[10px] uppercase tracking-widest">Logout Account</button>
            </div>
          </div>
        )}

        <div className={isLocked ? "blur-md pointer-events-none select-none" : ""}>
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic tracking-tighter">{activeTab}</h2>
            <div className="bg-white px-4 py-2 rounded-4xl border shadow-sm font-black text-[9px] text-blue-600 uppercase italic text-center">
               {userData.plan || 'No Plan'} Member
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* 6 CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center">
                  <p className="text-gray-400 font-bold text-[10px] uppercase mb-1 tracking-widest">Available Balance</p>
                  <h3 className="text-3xl md:text-4xl font-black mb-4 italic text-gray-800 tracking-tighter font-mono">Rs. {userData.walletBalance}</h3>
                  <button onClick={()=>setActiveModal('withdraw')} className="w-full bg-red-600 text-white py-3 rounded-3xl font-black text-[10px] uppercase shadow-lg shadow-red-100 active:scale-95 transition-all">Withdraw Now</button>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-gray-400 font-bold text-[10px] uppercase mb-1 tracking-widest">Total Earnings</p>
                  <h3 className="text-3xl md:text-4xl font-black text-green-600 italic tracking-tighter font-mono">Rs. {userData.walletBalance + (userData.totalWithdraw || 0)}</h3>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-gray-400 font-bold text-[10px] uppercase mb-1 tracking-widest">Total Withdraw</p>
                  <h3 className="text-3xl md:text-4xl font-black text-orange-600 italic tracking-tighter font-mono">Rs. {userData.totalWithdraw || 0}</h3>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-gray-400 font-bold text-[10px] uppercase mb-1 tracking-widest">Bonus Income</p>
                  <h3 className="text-3xl md:text-4xl font-black text-purple-600 italic tracking-tighter font-mono">Rs. {userData.bonusIncome || 0}</h3>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-gray-400 font-bold text-[10px] uppercase mb-1 tracking-widest">Total Network</p>
                  <h3 className="text-4xl md:text-5xl font-black text-gray-800 italic tracking-tighter font-mono">{userData.referralCount}</h3>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-gray-400 font-bold text-[10px] uppercase mb-1 tracking-widest">Current Plan</p>
                  <h3 className="text-xl md:text-2xl font-black text-blue-700 italic uppercase tracking-tighter">{userData.plan}</h3>
                  <button onClick={()=>setActiveModal('upgrade')} className="text-blue-600 font-bold text-[9px] uppercase underline mt-2">Upgrade Membership</button>
                </div>
              </div>

              {/* REFERRAL LINK */}
              <div className="bg-blue-600 p-6 md:p-10 rounded-4xl text-white shadow-2xl shadow-blue-200">
                  <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Referral Link (25% MAX COMMISSION)</h3>
                  <div className="flex flex-col gap-3 bg-white/10 p-2 md:p-3 rounded-3xl border border-white/20">
                     <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="w-full bg-transparent px-4 py-3 rounded-2xl text-[10px] md:text-xs font-mono text-blue-50 outline-none overflow-hidden text-ellipsis" />
                     <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Copied!")}} className="w-full md:w-auto bg-white text-blue-700 px-6 py-3 md:py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-50 active:scale-95 transition-all">Copy Link</button>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-white p-6 md:p-12 rounded-4xl shadow-sm border overflow-x-hidden">
               <h3 className="font-black text-gray-800 uppercase text-lg mb-8 md:mb-12 border-b pb-6 italic tracking-tighter text-center">My Network Tree</h3>
               <div className="flex flex-col items-center">
                  <div className="bg-blue-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-3xl font-black uppercase mb-10 shadow-xl tracking-widest italic text-sm md:text-base">You ({userData.name})</div>
                  <div className="w-1 h-10 bg-gray-100"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full pt-10 border-t border-gray-50">
                    {myTeam.map((m, i) => (
                      <div key={i} className="bg-gray-50 p-6 rounded-4xl border border-gray-100 text-center relative group hover:border-blue-500 transition-all">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border text-[9px] font-black uppercase text-gray-400">Direct Level</div>
                        <p className="font-black text-gray-800 uppercase text-sm mb-1">{m.name}</p>
                        <p className="text-[10px] text-blue-600 font-bold uppercase italic tracking-widest">{m.plan}</p>
                      </div>
                    ))}
                    {myTeam.length === 0 && <p className="col-span-full text-center py-20 text-gray-300 font-black italic uppercase tracking-widest text-xs">Tree is empty</p>}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {milestones.map((m, i) => (
                <div key={i} className={`p-6 md:p-10 rounded-4xl border-2 flex flex-col md:flex-row justify-between items-center gap-4 transition-all ${userData.referralCount >= m.goal ? 'bg-green-50 border-green-200 scale-105 shadow-xl' : 'bg-white border-gray-50 opacity-60'}`}>
                  <div className="flex items-center gap-6 md:gap-8 text-center md:text-left">
                    <span className="text-4xl md:text-6xl">{m.icon}</span>
                    <div>
                      <h4 className="font-black text-gray-800 uppercase text-base md:text-lg mb-1 leading-tight">{m.reward}</h4>
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target: {m.goal} Referrals</p>
                    </div>
                  </div>
                  <span className={`font-black text-[10px] uppercase italic ${userData.referralCount >= m.goal ? 'text-green-600' : 'text-gray-300'}`}>
                    {userData.referralCount >= m.goal ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODALS (Highly Responsive) */}
      {activeModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[95%] md:max-w-md rounded-4xl p-6 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in duration-200">
            <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 uppercase text-center text-gray-800 italic tracking-tighter">{activeModal === 'upgrade' ? 'Activation Details' : 'Withdrawal Request'}</h2>
            
            {activeModal === 'upgrade' ? (
              <div className="space-y-4 md:space-y-5">
                <div className="bg-linear-to-br from-blue-700 to-indigo-900 p-6 md:p-8 rounded-4xl text-white shadow-xl text-center border border-white/20">
                  <p className="text-[9px] font-black opacity-60 mb-2 uppercase tracking-widest italic text-center">Bank: MEEZAN BANK</p>
                  <p className="text-lg md:text-2xl font-black tracking-widest mb-4 italic break-all">00300109721101</p>
                  <p className="text-[10px] md:text-xs font-black uppercase opacity-90 italic">Ayesha Usama</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map(p => (
                    <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-3 md:p-4 border-2 rounded-3xl text-center cursor-pointer transition-all ${selectedPlan?.name === p.name ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-100'}`}>
                      <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase">{p.name}</p>
                      <p className="font-black text-blue-600 text-[11px] md:text-xs">Rs. {p.price}</p>
                    </div>
                  ))}
                </div>
                <input type="text" placeholder="Your Name / Number" className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-sm outline-none focus:border-blue-600" onChange={(e)=>setSenderAccount(e.target.value)} />
                <input type="text" placeholder="TID Number" className="w-full p-4 bg-gray-50 border rounded-3xl font-black text-xl text-blue-700 text-center uppercase outline-none focus:border-blue-600" onChange={(e)=>setTid(e.target.value)} />
                <button onClick={handleActivationRequest} className="w-full bg-blue-700 text-white p-4 md:p-5 rounded-3xl font-black uppercase shadow-xl italic tracking-tighter text-sm">Submit Proof</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="relative">
                   <input type="number" placeholder="Enter Amount (Min 500)" className="w-full p-4 md:p-5 bg-gray-50 border rounded-3xl font-black text-center text-xl md:text-2xl outline-none focus:border-red-600" onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} required />
                </div>
                <select className="w-full p-4 md:p-5 bg-gray-50 border rounded-3xl font-bold outline-none text-center text-sm" onChange={(e)=>setWithdrawData({...withdrawData, method: e.target.value})} required>
                  <option value="">Select Method</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Account">Bank Account</option>
                </select>
                <input type="text" placeholder="Account Title" className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-sm outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                <input type="text" placeholder="Number / IBAN" className="w-full p-4 bg-gray-50 border rounded-3xl font-bold text-center text-sm outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                <div className="bg-red-50 p-3 md:p-4 rounded-2xl text-center">
                  <p className="text-[9px] md:text-[10px] text-red-600 font-black uppercase tracking-widest italic">5% Fee Deduction</p>
                </div>
                <button type="submit" className="w-full bg-red-600 text-white p-4 md:p-5 rounded-3xl font-black uppercase shadow-xl italic tracking-tighter text-sm">Request Funds</button>
              </form>
            )}
            <button onClick={()=>setActiveModal(null)} className="w-full mt-4 text-gray-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">Close Window</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;