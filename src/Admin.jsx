// admin.jsx 
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, increment, onSnapshot } from 'firebase/firestore';

const Admin = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const qUser = query(collection(db, "users"), where("status", "==", "pending_approval"));
    const unsubUsers = onSnapshot(qUser, (snap) => {
      setPendingUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => setError("User Fetch Error: " + err.message));

    const qWithdraw = query(collection(db, "withdraw_requests"), where("status", "==", "pending"));
    const unsubWithdraw = onSnapshot(qWithdraw, (snap) => {
      setWithdraws(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setError("Withdraw Fetch Error: " + err.message));

    return () => { unsubUsers(); unsubWithdraw(); };
  }, []);

  const handleApproveUser = async (user) => {
    try {
      // --- FIXED COMMISSION LOGIC ---
      let rate = 0.15; // Default 15% commission
      
      const pkrCommission = Number(user.planPrice) * rate;
      // Convert PKR to Coins (10 Coins = Rs. 1)
      const coinCommission = pkrCommission * 10; 

      // 1. User status active karein
      await updateDoc(doc(db, "users", user.id), { status: "active" });

      // 2. Referrer ko commission bhejein
      if (user.referredBy && user.referredBy !== "Direct") {
        const referrerRef = doc(db, "users", user.referredBy.trim());
        const referrerSnap = await getDoc(referrerRef);
        
        if(referrerSnap.exists()) {
          await updateDoc(referrerRef, {
            walletBalance: increment(coinCommission),
            referralCount: increment(1)
          });
        }
      }
      alert(`User ${user.name} Activated! Commission of ${coinCommission} Coins (Rs. ${pkrCommission}) sent to referrer.`);
    } catch (e) { alert("Approval Failed: " + e.message); }
  };

  const handleApproveWithdraw = async (w) => {
    try {
      // Note: Dashboard.jsx ne coins pehle hi minus kar diye hain request bhejte waqt
      // Isliye yahan hum sirf request status complete karenge.
      await updateDoc(doc(db, "withdraw_requests", w.id), { status: "completed" });
      
      // Agar aap totalWithdraw track karna chahte hain:
      const userRef = doc(db, "users", w.uid);
      await updateDoc(userRef, {
        totalWithdraw: increment(Number(w.coinAmount))
      });

      alert("Withdrawal marked as Paid!");
    } catch (e) { alert(e.message); }
  };

  if (error) return <div className="p-10 text-red-500 font-bold uppercase">Error: {error}</div>;

  return (
    <div className="p-10 bg-slate-50 min-h-screen font-sans">
      <h1 className="text-3xl font-black text-blue-900 border-b-4 border-blue-600 inline-block mb-10 uppercase italic">FintechCash Admin Control</h1>
      
      {/* NEW ACTIVATIONS SECTION */}
      <section className="bg-white rounded-4xl shadow-xl overflow-hidden mb-10">
        <h2 className="p-6 bg-blue-600 text-white font-black uppercase text-sm tracking-widest">New Activations ({pendingUsers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-500">
              <tr><th className="p-4">Name</th><th className="p-4">Sender Acc</th><th className="p-4">TID</th><th className="p-4">Plan Price</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody className="divide-y">
              {pendingUsers.map(u => (
                <tr key={u.id} className="text-sm font-bold">
                  <td className="p-4 uppercase">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.senderAccount || 'N/A'}</td>
                  <td className="p-4 font-mono text-blue-600">{u.tid}</td>
                  <td className="p-4">Rs. {u.planPrice}</td>
                  <td className="p-4"><button onClick={()=>handleApproveUser(u)} className="bg-green-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase">Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingUsers.length === 0 && !loading && <p className="p-10 text-center text-gray-300 font-bold italic">No pending activations found.</p>}
        </div>
      </section>

      {/* WITHDRAWALS SECTION */}
      <section className="bg-white rounded-4xl shadow-xl overflow-hidden">
        <h2 className="p-6 bg-red-600 text-white font-black uppercase text-sm tracking-widest">Withdrawal Requests ({withdraws.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-500">
              <tr><th className="p-4">User</th><th className="p-4">Payable</th><th className="p-4">Method & Details</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody className="divide-y">
              {withdraws.map(w => (
                <tr key={w.id} className="text-sm font-bold">
                  <td className="p-4">{w.userName}</td>
                  <td className="p-4 text-red-600">Rs. {w.payableAmount}</td>
                  <td className="p-4 font-mono text-[10px]">{w.method}: {w.accTitle} ({w.accNumber})</td>
                  <td className="p-4">
                    <button onClick={()=>handleApproveWithdraw(w)} className="bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase">Mark as Paid</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {withdraws.length === 0 && !loading && <p className="p-10 text-center text-gray-300 font-bold italic">No pending withdrawals.</p>}
        </div>
      </section>
    </div>
  );
};

export default Admin;