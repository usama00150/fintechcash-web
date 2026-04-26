import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  const [tid, setTid] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [withdrawData, setWithdrawData] = useState({ amount: '', method: '', accTitle: '', accNumber: '' });
  const navigate = useNavigate();

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
      } else { navigate('/login'); }
    });
    return () => unsub();
  }, [navigate]);

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
    alert("Withdrawal requested successfully.");
    setActiveModal(null);
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
      
      {/* 📱 Mobile Sidebar Overlay (Backdrop) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#2D1B69]/40 backdrop-blur-sm z-60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* 👈 Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-70 w-72 bg-white border-r border-slate-200 p-8 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2D1B69] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg italic">F</div>
            <span className="text-xl font-bold text-[#2D1B69] tracking-tighter uppercase italic">FintechCash</span>
          </div>
          {/* Close button for mobile */}
          <button className="lg:hidden text-slate-400 text-2xl" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <NavItem icon="📝" label="Earn Coins" active={activeTab === 'surveys'} onClick={() => { setActiveTab('surveys'); setIsSidebarOpen(false); }} />
          <NavItem icon="👥" label="Network" active={activeTab === 'network'} onClick={() => { setActiveTab('network'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="pt-6 border-t border-slate-100">
           <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-sm hover:text-red-500 transition-all uppercase tracking-widest text-left">
             🚪 Sign Out
           </button>
        </div>
      </aside>

      {/* 👉 Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        
        {/* Mobile Top Header (Hamburger Button) */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
           <button onClick={() => setIsSidebarOpen(true)} className="text-[#2D1B69] text-2xl">☰</button>
           <div className="text-[#2D1B69] font-black italic">FINTECH CASH</div>
           <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">👤</div>
        </div>

        {/* Header Section (Desktop Style) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="hidden md:block">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Global Console Control</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isLocked ? (
              <button onClick={() => setActiveModal('upgrade')} className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase italic shadow-lg animate-pulse text-center">Activate Account ⚡</button>
            ) : (
              <div className="flex-1 md:flex-none bg-teal-50 text-[#2D1B69] px-6 py-3 rounded-2xl border border-teal-100 font-black text-xs uppercase italic text-center">{userData.plan} Member</div>
            )}
            <button onClick={() => setActiveModal('upgrade')} className="bg-[#2D1B69] text-white p-3 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-purple-200">🚀</button>
          </div>
        </div>

        {/* --- Content Views --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100 relative overflow-hidden">
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Available Coins</p>
                 <h2 className="text-2xl md:text-3xl font-black text-[#2D1B69] mb-6">{userData.walletBalance} <span className="text-sm font-bold text-slate-300">Coins</span></h2>
                 <button onClick={() => setActiveModal('withdraw')} className="w-full py-4 bg-[#F8F9FD] hover:bg-[#2D1B69] hover:text-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">Withdraw</button>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100">
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Earned</p>
                 <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">{userData.walletBalance + (userData.totalWithdraw || 0)} <span className="text-sm font-bold text-slate-300">Coins</span></h2>
                 <div className="flex items-end gap-1.5 h-10">
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                      <div key={i} style={{height: `${h}%`}} className={`flex-1 rounded-md ${i===3 ? 'bg-teal-400' : 'bg-slate-50'}`}></div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100 flex flex-col justify-between">
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Team Members</p>
                 <h2 className="text-2xl md:text-3xl font-black text-slate-800">{myTeam.length} Active</h2>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[35px] shadow-sm border border-slate-100">
                 <h3 className="text-lg font-black text-slate-800 mb-2 uppercase italic tracking-tighter">Affiliate Program</h3>
                 <p className="text-[11px] text-slate-400 mb-6 font-medium">Invite your network and earn 15% commission:</p>
                 <div className="flex flex-col sm:flex-row gap-3 p-2 bg-[#F8F9FD] border border-slate-100 rounded-2xl">
                    <input readOnly value={`${window.location.origin}/signup?ref=${userData.uid}`} className="bg-transparent flex-1 text-[9px] font-mono text-slate-500 px-2 py-2 outline-none overflow-hidden text-ellipsis" />
                    <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData.uid}`); alert("Copied!")}} className="bg-teal-400 text-[#2D1B69] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Copy</button>
                 </div>
            </div>
          </div>
        )}

        {/* --- Surveys View --- */}
        {activeTab === 'surveys' && (
          <div className="max-w-xl mx-auto mt-6">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-slate-50 text-center">
               <div className="w-20 h-20 bg-teal-50 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner text-4xl">🎯</div>
               <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">Survey Portal</h3>
               <p className="text-slate-400 font-bold text-xs uppercase mb-10">Earn up to 500 Coins per survey</p>
               
               {!canAccessSurveys ? (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Upgrade to Professional/Elite</p>
                    <button onClick={() => setActiveModal('upgrade')} className="bg-[#2D1B69] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase italic">Unlock Now</button>
                  </div>
               ) : (
                  <a href={`https://www.theoremreach.com/respondent_entry/direct?api_key=d7c4aff2362e855e36808605c173&user_id=${userData.uid}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-teal-400 text-[#2D1B69] font-black py-5 rounded-2xl shadow-lg uppercase italic text-xs">Launch Console 🚀</a>
               )}
            </div>
          </div>
        )}

        {/* --- Network View --- */}
        {activeTab === 'network' && (
          <div className="bg-white p-6 md:p-10 rounded-[35px] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter mb-8 text-center">Referral Registry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {myTeam.map((m, i) => (
                 <div key={i} className="bg-[#F8F9FD] p-6 rounded-3xl border border-slate-100 text-center">
                    <p className="font-black text-slate-800 uppercase text-[11px] mb-1">{m.name}</p>
                    <p className="text-[9px] text-teal-500 font-black uppercase italic">{m.plan}</p>
                 </div>
               ))}
               {myTeam.length === 0 && <p className="col-span-full py-12 text-slate-300 font-bold uppercase italic text-[10px] text-center tracking-widest">No members yet</p>}
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS (Unchanged Logic, Improved Responsiveness) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#2D1B69]/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black mb-8 uppercase text-center text-slate-800 italic">
              {activeModal === 'upgrade' ? 'System Activation' : 'Withdraw Coins'}
            </h2>
            
            {activeModal === 'upgrade' ? (
              <div className="space-y-5">
                <div className="bg-[#2D1B69] p-6 rounded-3xl text-white text-center border-b-4 border-teal-400">
                  <p className="text-[10px] font-black text-teal-300 uppercase italic mb-3">Meezan Bank</p>
                  <p className="text-xs font-bold uppercase mb-1">Title: USAMA</p>
                  <p className="text-lg font-black tracking-widest font-mono">00300109721101</p>
                </div>
                
                <div className="space-y-2">
                  {plans.map(p => (
                    <div key={p.name} onClick={() => setSelectedPlan(p)} className={`p-4 border-2 rounded-2xl flex justify-between items-center cursor-pointer ${selectedPlan?.name === p.name ? 'border-teal-400 bg-teal-50' : 'border-[#F8F9FD]'}`}>
                      <p className="text-[10px] font-black text-slate-800 uppercase">{p.name} Plan</p>
                      <p className="font-black text-[#2D1B69] text-xs">Rs. {p.price}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                   <input type="text" placeholder="Sender Account" className="w-full p-4 bg-[#F8F9FD] border border-slate-100 rounded-xl text-[10px] text-center uppercase outline-none" onChange={(e)=>setSenderAccount(e.target.value)} />
                   <input type="text" placeholder="Transaction ID (TID)" className="w-full p-4 bg-[#F8F9FD] border border-slate-100 rounded-xl font-black text-blue-700 text-center uppercase outline-none" onChange={(e)=>setTid(e.target.value)} />
                </div>
                
                <button onClick={handleActivationRequest} className="w-full bg-[#2D1B69] text-white p-4 rounded-xl font-black uppercase italic text-xs active:scale-95 transition-all">Submit Request</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="bg-[#F8F9FD] p-6 rounded-3xl text-center border border-dashed border-slate-300">
                   <p className="text-2xl font-black italic text-teal-600">{userData.walletBalance} Coins</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase mt-1">10 Coins = 1 PKR</p>
                </div>
                <input type="number" placeholder="Coins to Withdraw" className="w-full p-4 bg-white border border-[#F8F9FD] rounded-xl font-black text-center text-xl outline-none" onChange={(e)=>setWithdrawData({...withdrawData, amount: e.target.value})} required />
                <select className="w-full p-4 bg-[#F8F9FD] border border-slate-100 rounded-xl text-[10px] uppercase font-bold text-center outline-none" onChange={(e)=>setWithdrawData({...withdrawData, method: e.target.value})} required>
                  <option value="">Select Gateway</option><option value="EasyPaisa">EasyPaisa</option><option value="JazzCash">JazzCash</option><option value="Bank">Bank</option>
                </select>
                <input type="text" placeholder="Account Title" className="w-full p-4 bg-[#F8F9FD] border border-slate-100 rounded-xl text-[10px] text-center font-bold outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accTitle: e.target.value})} required />
                <input type="text" placeholder="Account Number" className="w-full p-4 bg-[#F8F9FD] border border-slate-100 rounded-xl text-[10px] text-center font-bold outline-none" onChange={(e)=>setWithdrawData({...withdrawData, accNumber: e.target.value})} required />
                <button type="submit" className="w-full bg-[#2D1B69] text-white p-4 rounded-xl font-black uppercase italic text-xs">Withdraw Now</button>
              </form>
            )}
            <button onClick={()=>setActiveModal(null)} className="w-full mt-4 text-slate-300 font-bold text-[9px] uppercase text-center">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all duration-300 ${active ? 'bg-teal-50 text-[#2D1B69] font-black border-l-4 border-teal-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] uppercase tracking-widest">{label}</span>
  </div>
);

export default Dashboard;