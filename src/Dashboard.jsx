// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// 1. ADReward Component ko import karein
import ADReward from './components/AdReward'; 

const plans = [
  { name: 'Basic', price: 1000 },
  { name: 'Professional', price: 2500 },
  { name: 'Elite', price: 5000 }
];

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [myTeam, setMyTeam] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tid, setTid] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [withdrawData, setWithdrawData] = useState({ amount: '', method: '', accTitle: '', accNumber: '' });
  const [isSurveyLaunched, setIsSurveyLaunched] = useState(false);

  const navigate = useNavigate();

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            // User UID ko state mein save karna zaroori hai components ke liye
            setUserData({ ...snap.data(), uid: user.uid }); 
            const qTeam = query(
              collection(db, "users"), 
              where("referredBy", "==", user.uid),
              where("status", "==", "active")
            );
            const tSnap = await getDocs(qTeam);
            setMyTeam(tSnap.docs.map(d => ({ name: d.data().name, plan: d.data().plan })));
          }
        } catch (err) { console.error("Data Fetch Error:", err); }
      } else {
        navigate('/login');
      }
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (activeTab !== 'surveys') setIsSurveyLaunched(false);
  }, [activeTab]);

  // --- Logic Handlers ---
  const handleActivationRequest = async () => {
    if(!tid || !senderAccount || !selectedPlan) return alert("Please fill all fields.");
    await updateDoc(doc(db, "users", userData.uid), {
      plan: selectedPlan.name, planPrice: selectedPlan.price, tid: tid, senderAccount: senderAccount, status: "pending_approval"
    });
    alert("Request submitted! Verification in progress.");
    setActiveModal(null);
    window.location.reload();
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const coinAmount = Number(withdrawData.amount);

    if (coinAmount < 5000) return alert("Minimum withdrawal limit is Rs. 500 (5,000 Coins).");
    if (coinAmount > userData.walletBalance) return alert("Insufficient balance!");
    if (!withdrawData.method) return alert("Select a method.");

    const pkrAmount = coinAmount / 10;
    const fee = pkrAmount * 0.05; 
    const payablePKR = pkrAmount - fee;

    try {
      await addDoc(collection(db, "withdraw_requests"), { 
        uid: userData.uid, 
        userName: userData.name, 
        coinAmount: coinAmount,
        pkrAmount: pkrAmount,
        payableAmount: payablePKR,
        method: withdrawData.method, 
        accTitle: withdrawData.accTitle, 
        accNumber: withdrawData.accNumber,
        status: 'pending', 
        createdAt: serverTimestamp() 
      });

      await updateDoc(doc(db, "users", userData.uid), {
        walletBalance: increment(-coinAmount)
      });

      alert(`Success! Withdrawal for Rs. ${payablePKR.toFixed(2)} sent.`);
      setActiveModal(null);
      setWithdrawData({ amount: '', method: '', accTitle: '', accNumber: '' });
      window.location.reload(); 
    } catch (error) {
      console.error("Withdrawal Error:", error);
    }
  };

  if (!userData) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FD]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2D1B69]"></div>
    </div>
  );

  const isLocked = userData.status === 'inactive' || userData.status === 'pending_approval';
  const canAccessSurveys = ['Professional', 'Elite'].includes(userData.plan);

  return (
    <div className="flex h-screen bg-[#F8F9FD] font-sans overflow-hidden relative">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#2D1B69]/40 backdrop-blur-sm z-60 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Section */}
      <aside className={`fixed inset-y-0 left-0 z-70 w-72 bg-white border-r border-slate-200 p-8 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2D1B69] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg italic">F</div>
            <span className="text-xl font-bold text-[#2D1B69] tracking-tighter uppercase italic">FintechCash</span>
          </div>
          <button className="lg:hidden text-slate-400 text-3xl" onClick={() => setIsSidebarOpen(false)}>&times;</button>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <NavItem icon="📝" label="Earn Coins" active={activeTab === 'surveys'} onClick={() => { setActiveTab('surveys'); setIsSidebarOpen(false); }} />
          <NavItem icon="👥" label="Network" active={activeTab === 'network'} onClick={() => { setActiveTab('network'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="pt-6 border-t border-slate-100">
           <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-xs hover:text-red-500 transition-all uppercase tracking-widest text-left">🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main Content Section */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="sticky top-0 z-50 flex items-center justify-between lg:hidden bg-white/90 backdrop-blur-md p-4 border-b border-slate-100 shadow-sm">
           <button onClick={() => setIsSidebarOpen(true)} className="text-[#2D1B69] text-2xl p-2 hover:bg-slate-50 rounded-xl transition-all">☰</button>
           <div className="text-[#2D1B69] font-black italic tracking-tighter">FINTECH CASH</div>
           <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xs">👤</div>
        </div>

        <div className="p-4 md:p-10 pb-24 lg:pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="hidden md:block">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'surveys' ? 'Earning Hub' : 'Network'}
              </h1>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Official Console</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {isLocked ? (
                <button onClick={() => setActiveModal('upgrade')} className="flex-1 md:flex-none bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase italic shadow-lg animate-pulse">Activate Account ⚡</button>
              ) : (
                <div className="flex-1 md:flex-none bg-teal-50 text-[#2D1B69] px-8 py-4 rounded-2xl border border-teal-100 font-black text-[10px] uppercase italic text-center">{userData.plan} Member</div>
              )}
            </div>
          </div>

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Available Coins</p>
                    <h2 className="text-3xl font-black text-[#2D1B69] mb-8">{userData.walletBalance} <span className="text-sm font-bold text-slate-300">Coins</span></h2>
                    <button onClick={() => setActiveModal('withdraw')} className="w-full py-4 bg-[#F8F9FD] hover:bg-[#2D1B69] hover:text-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Withdraw Funds</button>
                 </div>

                 <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Network Status</p>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">{myTeam.length} <span className="text-sm font-bold text-slate-300">Active</span></h2>
                    <div className="flex items-end gap-1.5 h-12">
                       {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} style={{height: `${h}%`}} className={`flex-1 rounded-md ${i===3 ? 'bg-teal-400' : 'bg-slate-50'}`}></div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#2D1B69] p-8 rounded-[40px] shadow-xl text-white">
                    <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-2">Total Earnings</p>
                    <h2 className="text-3xl font-black">{userData.walletBalance + (userData.totalWithdraw || 0)}</h2>
                    <p className="text-[10px] font-bold text-teal-500 uppercase mt-4 italic">Lifetime Growth ↑</p>
                 </div>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                 <h3 className="text-lg font-black text-slate-800 mb-2 uppercase italic tracking-tighter">Affiliate Link</h3>
                 <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-widest">Share and earn 15% commissions</p>
                 <div className="flex flex-col sm:flex-row gap-3 p-3 bg-[#F8F9FD] border border-slate-100 rounded-3xl">
                    <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="bg-transparent flex-1 text-[10px] font-mono text-slate-500 px-4 py-2 outline-none overflow-hidden text-ellipsis" />
                    <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Link Copied!")}} className="bg-teal-400 text-[#2D1B69] px-8 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg">Copy Link</button>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: EARN COINS (Surveys + ADReward) */}
          {activeTab === 'surveys' && (
            <div className="w-full max-w-5xl mx-auto space-y-10">
              
              {/* 2. ADReward Section (Sab se upar priority par) */}
              <div className="animate-in slide-in-from-top-5 duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">⚡ Instant Rewards</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">No surveys needed - Guaranteed coins</p>
                </div>
                {/* UID passing zaroori hai rewards ke liye */}
                <ADReward userId={userData.uid} />
              </div>

              <hr className="border-slate-100" />

              {/* Offerwalls Section */}
              {!isSurveyLaunched ? (
                <div className="space-y-8">
                  <div className="text-center mb-10">
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Premium Offerwalls</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Professional & Elite Access Only</p>
                  </div>

                  {!canAccessSurveys ? (
                    <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center border-4 border-dashed border-slate-50 max-w-xl mx-auto">
                       <div className="text-5xl mb-6">🔐</div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase italic">Portal Locked</h3>
                       <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 mb-10 tracking-widest">Upgrade plan to unlock TheoremReach & CPAGrip</p>
                       <button onClick={() => setActiveModal('upgrade')} className="bg-[#2D1B69] text-white px-12 py-5 rounded-3xl font-black text-xs uppercase italic shadow-xl">Upgrade Account ⚡</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <a 
                        href={`https://www.theoremreach.com/respondent_entry/direct?api_key=d7c4aff2362e855e36808605c173&user_id=${userData.uid}`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-50 hover:scale-[1.02] transition-all group no-underline text-left block"
                      >
                         <div className="w-16 h-16 bg-blue-50 rounded-[25px] flex items-center justify-center text-3xl mb-8">💎</div>
                         <h3 className="text-2xl font-black text-slate-800 uppercase italic">TheoremReach</h3>
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">Global surveys with high rewards.</p>
                         <div className="inline-block bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Open Surveys 🚀</div>
                      </a>

                      <div 
                        onClick={() => setIsSurveyLaunched(true)}
                        className="bg-white p-10 rounded-[50px] shadow-xl border border-slate-100 hover:scale-[1.02] transition-all group cursor-pointer text-left"
                      >
                         <div className="w-16 h-16 bg-orange-50 rounded-[25px] flex items-center justify-center text-3xl mb-8">🔥</div>
                         <h3 className="text-2xl font-black text-slate-800 uppercase italic">CPAGrip Offers</h3>
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">Fast tasks and app installs.</p>
                         <div className="inline-block bg-[#FF4B2B] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">View Offers 🔥</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="fixed inset-0 z-100 bg-[#F8F9FD] flex flex-col lg:relative lg:h-[85vh] lg:rounded-[40px] lg:overflow-hidden animate-in fade-in">
                   <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100">
                      <button onClick={() => setIsSurveyLaunched(false)} className="bg-[#2D1B69] text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase italic transition-all">← Back to Hub</button>
                      <div className="hidden sm:block text-[#2D1B69] font-black text-[10px] uppercase italic tracking-widest">CPAGrip Rewards</div>
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-xs">🔥</div>
                   </div>
                   <div className="flex-1 bg-white relative">
                      <iframe 
                        src={`https://www.cpagrip.com/show.php?l=0&u=2521913&id=1892780&tracking_id=${userData.uid}`} 
                        width="100%" height="100%" frameBorder="0" title="CPAGrip"
                        className="w-full h-full"
                      ></iframe>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: NETWORK */}
          {activeTab === 'network' && (
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 animate-in fade-in">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic text-center mb-12 tracking-tighter">Referral Registry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {myTeam.map((m, i) => (
                   <div key={i} className="bg-[#F8F9FD] p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl">👤</div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-xs">{m.name}</p>
                        <p className="text-[9px] text-teal-500 font-black uppercase italic tracking-widest">{m.plan} Member</p>
                      </div>
                   </div>
                 ))}
                 {myTeam.length === 0 && <p className="col-span-full py-20 text-center text-slate-300 font-bold uppercase italic text-[11px]">No active members found</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- Modals Section --- */}
      {activeModal && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-[#2D1B69]/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[50px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase italic text-slate-800 tracking-tighter">{activeModal === 'upgrade' ? 'Activation' : 'Withdraw'}</h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-300 text-4xl hover:text-red-500 transition-all">&times;</button>
            </div>
            
            {activeModal === 'upgrade' ? (
              <div className="space-y-6">
                 <div className="bg-[#2D1B69] p-8 rounded-[35px] text-white text-center border-b-8 border-teal-400">
                    <p className="text-[10px] font-black text-teal-300 uppercase italic mb-2 tracking-widest">Meezan Bank Account</p>
                    <p className="text-xs font-bold uppercase mb-1">Title: USAMA</p>
                    <p className="text-xl font-black tracking-widest font-mono text-teal-50">00300109721101</p>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-3">
                    {plans.map(p => (
                      <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-5 border-2 rounded-3xl flex justify-between items-center cursor-pointer transition-all ${selectedPlan?.name === p.name ? 'border-teal-400 bg-teal-50 shadow-md scale-[1.02]' : 'border-slate-50 bg-slate-50'}`}>
                        <p className="text-[11px] font-black uppercase text-slate-700">{p.name}</p>
                        <p className="font-black text-sm text-[#2D1B69]">Rs. {p.price}</p>
                      </div>
                    ))}
                 </div>

                 <div className="space-y-3">
                    <input type="text" placeholder="Sender Account Name" className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-[11px] font-bold border border-slate-100" onChange={(e)=>setSenderAccount(e.target.value)} />
                    <input type="text" placeholder="Transaction ID (TID)" className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-[11px] font-black text-blue-600 border border-slate-100" onChange={(e)=>setTid(e.target.value)} />
                 </div>
                 
                 <button onClick={handleActivationRequest} className="w-full bg-[#2D1B69] text-white p-5 rounded-3xl font-black uppercase italic text-xs shadow-2xl transition-all mt-4">Confirm Activation 🚀</button>
              </div>
            ) : (
               <form onSubmit={handleWithdraw} className="space-y-6">
                  <div className="bg-red-50 p-6 rounded-[30px] text-center border border-red-100">
                    <p className="text-red-500 text-[10px] font-black uppercase mb-1">Limit Policy</p>
                    <p className="text-xl font-black text-[#2D1B69] italic">Min: 5,000 Coins <span className="text-[10px] text-slate-400">(Rs. 500)</span></p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">10 Coins = Rs. 1 | Fee: 5%</p>
                  </div>

                  <div className="bg-teal-50 p-6 rounded-[30px] text-center border border-teal-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Your Wallet</p>
                    <p className="text-2xl font-black text-teal-600 italic tracking-tighter">{userData.walletBalance} Coins</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Coins Amount</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 5000" 
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-xl text-[#2D1B69] border border-slate-100" 
                        onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} 
                        required 
                      />
                      {withdrawData.amount && (
                        <div className="flex justify-between mt-2 px-2">
                          <p className="text-[10px] font-bold text-emerald-500 italic">PKR: Rs. {Number(withdrawData.amount) / 10}</p>
                          <p className="text-[10px] font-bold text-orange-500 italic">After Tax: Rs. {((Number(withdrawData.amount) / 10) * 0.95).toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {['EasyPaisa', 'JazzCash', 'Bank', 'Nayapay'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setWithdrawData({ ...withdrawData, method: m })}
                            className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${withdrawData.method === m ? 'bg-[#2D1B69] text-white border-[#2D1B69]' : 'bg-white text-slate-400 border-slate-100'}`}
                          >
                            {m}
                          </button>
                        ))}
                    </div>

                    <input type="text" placeholder="Account Title" className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-[11px] font-bold border border-slate-100" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                    <input type="text" placeholder="Account Number" className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-[11px] font-bold border border-slate-100" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                  </div>
                  <button type="submit" className="w-full bg-[#2D1B69] text-white p-6 rounded-3xl font-black uppercase italic text-xs shadow-2xl transition-all mt-2">Process Withdrawal 💰</button>
               </form>
            )}
            <button onClick={() => setActiveModal(null)} className="w-full mt-6 text-slate-300 font-bold text-[10px] uppercase text-center">Back to Console</button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-teal-50 text-[#2D1B69] font-black border-l-4 border-teal-400 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'}`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-[10px] uppercase tracking-widest">{label}</span>
  </div>
);

export default Dashboard;