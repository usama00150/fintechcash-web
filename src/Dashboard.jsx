// Dashboard.jsx 
import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import AdReward from './components/AdReward'; 
import LiveTicker from './components/LiveTicker';

// Dollar Plans
const plans = [
  { name: 'Basic', price: 5 },
  { name: 'Standard', price: 10 },
  { name: 'Professional', price: 25 },
  { name: 'Elite', price: 50 }
];

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [myTeam, setMyTeam] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]); // For Admin
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tid, setTid] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank'); 
  const [withdrawData, setWithdrawData] = useState({ amount: '', method: '', accTitle: '', accNumber: '' });

  const navigate = useNavigate();

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        getDoc(doc(db, "users", user.uid)).then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            
            // --- 24 Hour Reset Logic for Ad Tracking ---
            const todayStr = new Date().toDateString();
            let currentAdsWatched = data.adsWatchedToday || 0;

            if (data.lastAdWatchedDate !== todayStr) {
              currentAdsWatched = 0;
              updateDoc(doc(db, "users", user.uid), {
                adsWatchedToday: 0,
                lastAdWatchedDate: todayStr
              });
            }

            setUserData({ 
              ...data, 
              uid: user.uid,
              adsWatchedToday: currentAdsWatched,
              lastAdWatchedDate: todayStr 
            }); 
            
            // Fetch Team
            const qTeam = query(collection(db, "users"), where("referredBy", "==", user.uid), where("status", "==", "active"));
            getDocs(qTeam).then((tSnap) => {
              setMyTeam(tSnap.docs.map(d => ({ name: d.data().name, plan: d.data().plan })));
            });

            // Fetch Pending Requests for Admin
            if (data.role === 'admin') {
              const qPending = query(collection(db, "users"), where("status", "==", "pending_approval"));
              getDocs(qPending).then((pSnap) => {
                setPendingUsers(pSnap.docs.map(d => ({ ...d.data(), id: d.id })));
              });
            }
          }
        });
      } else {
        navigate('/login');
      }
    });

    return () => unsub();
  }, [navigate, activeTab]);

  // --- Admin Actions ---
  const approveUser = (uid, planName) => {
    updateDoc(doc(db, "users", uid), {
      status: "active",
      plan: planName
    }).then(() => {
      alert("User Activated Successfully!");
      window.location.reload();
    });
  };

  const removeRequest = (uid) => {
    updateDoc(doc(db, "users", uid), {
      status: "inactive",
      tid: "",
      senderAccount: "",
      plan: "None"
    }).then(() => {
      alert("Request Removed.");
      window.location.reload();
    });
  };

  // --- User Actions ---
  const handleActivationRequest = () => {
    if(!tid || !senderAccount || !selectedPlan) return alert("Please fill all fields.");
    updateDoc(doc(db, "users", userData.uid), {
      plan: selectedPlan.name, 
      planPrice: selectedPlan.price, 
      tid: tid, 
      senderAccount: senderAccount, 
      status: "pending_approval",
      paymentMethod: paymentMethod,
      currency: 'USD'
    }).then(() => {
      alert("Request submitted! Verification in progress.");
      setActiveModal(null);
      window.location.reload();
    });
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const coinAmount = Number(withdrawData.amount);
    if (coinAmount < 5000) return alert("Minimum withdrawal is 5,000 Coins.");
    if (coinAmount > userData.walletBalance) return alert("Insufficient balance!");

    addDoc(collection(db, "withdraw_requests"), { 
      uid: userData.uid, userName: userData.name, coinAmount,
      method: withdrawData.method, accTitle: withdrawData.accTitle, accNumber: withdrawData.accNumber,
      status: 'pending', createdAt: serverTimestamp() 
    }).then(() => {
      updateDoc(doc(db, "users", userData.uid), { walletBalance: increment(-coinAmount) });
      alert(`Success! Withdrawal request sent.`);
      setActiveModal(null);
      window.location.reload(); 
    });
  };

  // --- Ad Limit Handler ---
  const getPlanAdLimit = (planName) => {
    if (planName === 'Professional') return 10; 
    if (planName === 'Elite') return 15;        
    return 0;
  };

  const handleAdWatchedIncrement = () => {
    const todayStr = new Date().toDateString();
    const nextCount = userData.adsWatchedToday + 1;

    updateDoc(doc(db, "users", userData.uid), {
      adsWatchedToday: increment(1),
      lastAdWatchedDate: todayStr
    }).then(() => {
      setUserData(prev => ({ ...prev, adsWatchedToday: nextCount }));
      // Alert completely removed from here as requested.
    });
  };

  if (!userData) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-12 w-12 border-t-2 border-b-2 border-purple-500 rounded-full"></motion.div>
    </div>
  );

  const hasPremiumAccess = ['Professional', 'Elite'].includes(userData.plan);
  const adLimit = getPlanAdLimit(userData.plan);
  const isAdLimitReached = userData.adsWatchedToday >= adLimit;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden relative">
      <div className="absolute top-0 right-0 w-125 h-125 bg-purple-600/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-blue-600/5 blur-[120px] -z-10"></div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* --- Sidebar --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 p-8 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-xl italic shadow-[0_0_15px_rgba(168,85,247,0.4)]">F</div>
          <span className="text-xl font-bold tracking-tighter uppercase italic">FintechCash</span>
        </div>
        <nav className="space-y-4">
          <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <NavItem icon="⚡" label="Earn Coins" active={activeTab === 'surveys'} onClick={() => { setActiveTab('surveys'); setIsSidebarOpen(false); }} />
          <NavItem icon="👥" label="My Team" active={activeTab === 'network'} onClick={() => { setActiveTab('network'); setIsSidebarOpen(false); }} />
          {userData.role === 'admin' && (
            <NavItem icon="🛡️" label="Admin Panel" active={activeTab === 'admin'} onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }} />
          )}
        </nav>
        <button onClick={() => signOut(auth)} className="absolute bottom-12 left-8 text-slate-500 hover:text-red-500 font-bold text-[10px] uppercase">🚪 Sign Out</button>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto relative pb-24">
        <div className="sticky top-0 z-30 lg:hidden flex justify-between items-center bg-black/40 backdrop-blur-md p-4 border-b border-white/5">
           <button onClick={() => setIsSidebarOpen(true)} className="text-white text-2xl">☰</button>
           <div className="text-purple-500 font-black italic tracking-tighter text-sm">FINTECH CASH</div>
           <div className="w-8 h-8 bg-purple-500/20 rounded-full"></div>
        </div>

        <div className="p-4 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                {activeTab === 'admin' ? 'Management' : activeTab === 'dashboard' ? 'Overview' : activeTab === 'surveys' ? 'Earning Hub' : 'Network'}
              </h1>
              <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Operator: {userData.name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {userData.status === 'pending_approval' ? (
                <div className="glass-card px-8 py-4 border-l-4 border-orange-500 text-orange-400 font-black text-[10px] uppercase italic animate-pulse">Verification Pending... ⏳</div>
              ) : userData.status === 'inactive' ? (
                <button onClick={() => setActiveModal('upgrade')} className="bg-purple-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase italic shadow-lg">Activate Plan ⚡</button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div className="glass-card px-8 py-3 border-l-4 border-purple-500 text-purple-400 font-black italic text-sm">{userData.plan} Member</div>
                  <button onClick={() => setActiveModal('upgrade')} className="text-[9px] font-black uppercase text-purple-500 hover:text-white transition-all underline italic">Upgrade Plan ↑</button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="glass-card p-8 rounded-[40px] group">
                      <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Available Balance</p>
                      <h2 className="text-4xl font-black text-white mb-8">{userData.walletBalance} <span className="text-sm font-bold text-purple-400 italic">Coins</span></h2>
                      <button onClick={() => setActiveModal('withdraw')} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase hover:bg-purple-600 transition-all">Withdraw Funds</button>
                   </div>
                   <div className="glass-card p-8 rounded-[40px]"><p className="text-slate-500 text-[10px] font-black uppercase mb-2">Active Team</p><h2 className="text-4xl font-black text-white mb-4">{myTeam.length} Members</h2></div>
                   <div className="bg-linear-to-br from-purple-600 to-blue-700 p-8 rounded-[40px] shadow-2xl"><p className="text-white/60 text-[10px] font-black uppercase mb-2">Total Accumulated</p><h2 className="text-4xl font-black italic text-white">{userData.walletBalance + (userData.totalWithdraw || 0)}</h2></div>
                </div>
                <div className="glass-card p-8 md:p-10 rounded-[40px]">
                   <h3 className="text-lg font-black text-white mb-2 uppercase italic">Affiliate Hub</h3>
                   <div className="flex flex-col sm:flex-row gap-3 p-2 bg-black/40 rounded-3xl border border-white/5">
                      <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="bg-transparent flex-1 text-[10px] font-mono text-purple-300 px-4 py-3 outline-none" />
                      <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Link Copied!")}} className="bg-purple-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase">Copy Link</button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'surveys' && (
              <motion.div key="earn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl mx-auto space-y-12">
                {!hasPremiumAccess ? (
                  <div className="glass-card p-16 text-center max-w-xl mx-auto border-dashed border-white/10">
                     <div className="text-6xl mb-6">🔐</div>
                     <h2 className="text-2xl font-black uppercase italic text-white">Premium Content Locked</h2>
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4 mb-10 leading-relaxed">Upgrade to Professional or Elite plan to unlock TheoremReach Surveys & Adsterra Rewards.</p>
                     <button onClick={() => setActiveModal('upgrade')} className="bg-purple-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase italic shadow-2xl">Upgrade Now ⚡</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <h3 className="text-center text-sm font-black uppercase text-purple-400 italic">
                         ⚡ Instant Rewards ({userData.adsWatchedToday}/{adLimit} Ads)
                       </h3>
                       
                       {isAdLimitReached ? (
                         <div className="glass-card p-10 text-center min-h-80 flex flex-col items-center justify-center border border-red-500/20 bg-red-500/5">
                           <div className="text-4xl mb-4">🚫</div>
                           <p className="text-red-400 font-black uppercase text-xs tracking-wider">Daily Limit Reached!</p>
                           <p className="text-slate-500 text-[10px] mt-2 uppercase font-bold">Come back tomorrow after 24 hours to watch more ads.</p>
                         </div>
                       ) : (
                         /* Pass logic down as a prop cleanly */
                         <AdReward userId={userData.uid} onAdWatched={handleAdWatchedIncrement} />
                       )}
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-center text-sm font-black uppercase text-blue-400 italic">💎 TheoremReach</h3>
                       <a href={`https://www.theoremreach.com/respondent_entry/direct?api_key=d7c4aff2362e855e36808605c173&user_id=${userData.uid}`} target="_blank" rel="noopener noreferrer" className="glass-card p-10 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-all no-underline min-h-80">
                         <div className="text-5xl mb-6">💸</div>
                         <h3 className="text-2xl font-black text-white uppercase italic mb-4">Premium Tasks</h3>
                         <div className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Open Portal 🚀</div>
                       </a>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'network' && (
              <motion.div key="net" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 rounded-[40px]">
                <h3 className="text-xl font-black text-white uppercase italic text-center mb-8">My Active Referrals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {myTeam.map((m, i) => (
                     <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg">👤</div>
                        <div>
                          <p className="font-black text-white uppercase text-xs">{m.name}</p>
                          <p className="text-[9px] text-purple-400 font-bold uppercase">{m.plan} Plan</p>
                        </div>
                     </div>
                   ))}
                   {myTeam.length === 0 && <p className="col-span-full py-20 text-center text-slate-500 uppercase italic text-[11px]">No active members in your registry</p>}
                </div>
              </motion.div>
            )}

            {/* --- ADMIN PANEL TAB --- */}
            {activeTab === 'admin' && (
              <motion.div key="adm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-xl font-black uppercase italic mb-8 border-b border-white/10 pb-4">Activation Requests</h3>
                <div className="grid grid-cols-1 gap-4">
                  {pendingUsers.map((p) => (
                    <div key={p.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-left flex-1">
                        <p className="text-sm font-black uppercase text-white">{p.name} <span className="text-[9px] text-slate-500 lowercase">({p.email})</span></p>
                        <p className="text-[10px] text-purple-400 font-bold uppercase mt-1">{p.plan} Activation Request - ${p.planPrice}</p>
                        <div className="bg-black/40 p-3 rounded-xl mt-3 border border-white/5 space-y-1">
                           <p className="text-[10px] text-slate-400 font-mono italic">TID: <span className="text-white font-bold">{p.tid}</span></p>
                           <p className="text-[10px] text-slate-400 font-mono italic">Sender: <span className="text-white font-bold">{p.senderAccount}</span></p>
                           <p className="text-[10px] text-slate-400 font-mono italic">Method: <span className="text-emerald-500 font-bold uppercase">{p.paymentMethod || 'bank'}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => approveUser(p.id, p.plan)} className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-green-600/20">Approve ✅</button>
                        <button onClick={() => removeRequest(p.id)} className="flex-1 md:flex-none bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all">Reject ❌</button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length === 0 && <div className="text-center py-20"><p className="text-slate-600 font-bold uppercase text-xs italic">Clear! No pending activations found.</p></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- ACTIVATION MODAL --- */}
        <AnimatePresence>
          {activeModal === 'upgrade' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[50px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[95vh]">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Plan Portal</h2>
                  <button onClick={() => setActiveModal(null)} className="text-slate-500 text-4xl hover:text-white">&times;</button>
                </div>

                {userData.status === 'pending_approval' ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">⏳</div>
                    <h3 className="text-xl font-black uppercase italic text-orange-500 mb-4 tracking-tighter">Proof Received!</h3>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed px-6">Verification takes 1-12 hours. Please do not submit multiple requests.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-purple-400 uppercase mb-4 italic">Step 1: Choose Dollar Plan</p>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {plans.map(p => (
                        <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-4 border-2 rounded-3xl cursor-pointer transition-all ${selectedPlan?.name === p.name ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5'}`}>
                          <p className="text-[10px] font-black uppercase text-white">{p.name}</p>
                          <p className="font-black text-lg text-purple-400">${p.price}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mb-6">
                      <button onClick={() => setPaymentMethod('bank')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase ${paymentMethod === 'bank' ? 'bg-purple-600 shadow-lg' : 'bg-white/5 text-slate-500'}`}>Bank</button>
                      <button onClick={() => setPaymentMethod('crypto')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase ${paymentMethod === 'crypto' ? 'bg-purple-600 shadow-lg' : 'bg-white/5 text-slate-500'}`}>Crypto</button>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[35px] border border-white/5 mb-8 text-center">
                      {paymentMethod === 'bank' ? (
                        <>
                          <p className="text-[9px] font-black text-purple-300 uppercase mb-1">Meezan Account (Usama)</p>
                          <p className="text-xl font-black tracking-widest font-mono text-white">00300109721101</p>
                          <p className="text-[8px] text-slate-500 mt-2 font-bold uppercase italic">Pay PKR equivalent to Plan Price</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[9px] font-black text-emerald-400 uppercase mb-3">USDT (TRC20) Wallet</p>
                          <div className="bg-black/60 p-4 rounded-2xl border border-emerald-500/20 mb-4">
                             <p className="text-[10px] font-black text-white break-all font-mono leading-tight tracking-tight">TFU4jL1AukpZcKpHzFYwGwVh8EcFVhJBUd</p>
                          </div>
                          <button onClick={() => {navigator.clipboard.writeText("TFU4jL1AukpZcKpHzFYwGwVh8EcFVhJBUd"); alert("Wallet Copied!")}} className="text-[9px] font-black text-emerald-400 uppercase hover:underline">Copy Address</button>
                        </>
                      )}
                    </div>

                    <div className="space-y-4">
                      <input type="text" placeholder="Sender Name / Account" className="w-full p-5 bg-white/5 rounded-2xl outline-none text-[11px] font-bold border border-white/5 text-white" onChange={(e)=>setSenderAccount(e.target.value)} />
                      <input type="text" placeholder="Transaction ID (TID) / Hash" className="w-full p-5 bg-white/5 rounded-2xl outline-none text-[11px] font-black text-purple-400 border border-white/5" onChange={(e)=>setTid(e.target.value)} />
                      <button onClick={handleActivationRequest} className="w-full bg-purple-600 text-white p-6 rounded-3xl font-black uppercase italic text-xs shadow-2xl mt-4 active:scale-95 transition-all">Submit Activation 🚀</button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- WITHDRAW MODAL --- */}
        <AnimatePresence>
          {activeModal === 'withdraw' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[50px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                 <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Payout</h2>
                    <button onClick={() => setActiveModal(null)} className="text-slate-500 text-4xl hover:text-white">&times;</button>
                 </div>
                 <form onSubmit={handleWithdraw} className="space-y-6">
                    <div className="bg-red-500/10 p-6 rounded-[35px] text-center border border-red-500/20 text-red-500">
                      <p className="text-[10px] font-black uppercase mb-1 italic">Withdraw Limit</p>
                      <p className="text-xl font-black italic">Min: 5,000 Coins</p>
                    </div>
                    <div className="bg-purple-500/10 p-6 rounded-[35px] text-center border border-purple-500/20 text-purple-400">
                      <p className="text-[10px] font-bold uppercase mb-1">Total Available</p>
                      <p className="text-2xl font-black italic tracking-tighter">{userData.walletBalance} Coins</p>
                    </div>
                    <div className="space-y-4">
                      <input type="number" placeholder="Enter Coins Amount" className="w-full p-5 bg-white/5 rounded-2xl outline-none font-black text-xl text-white border border-white/5" onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} required />
                      <div className="grid grid-cols-2 gap-2">
                          {['EasyPaisa', 'JazzCash', 'Bank', 'Nayapay'].map((m) => (
                            <button key={m} type="button" onClick={() => setWithdrawData({ ...withdrawData, method: m })} className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${withdrawData.method === m ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white/5 text-slate-500 border-white/5'}`}>{m}</button>
                          ))}
                      </div>
                      <input type="text" placeholder="Account Title" className="w-full p-5 bg-white/5 rounded-2xl outline-none text-[11px] font-bold border border-white/5 text-white" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                      <input type="text" placeholder="Account Number" className="w-full p-5 bg-white/5 rounded-2xl outline-none text-[11px] font-bold border border-white/5 text-white" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white p-6 rounded-3xl font-black uppercase italic text-xs shadow-2xl transition-all">Process Payment 💰</button>
                 </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <LiveTicker />
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <motion.div whileHover={{ x: 5 }} onClick={onClick} className={`flex items-center gap-4 px-6 py-5 rounded-[25px] cursor-pointer transition-all duration-300 ${active ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500 font-black shadow-inner' : 'text-slate-500 hover:text-slate-300 font-bold'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] uppercase tracking-widest">{label}</span>
  </motion.div>
);

export default Dashboard;