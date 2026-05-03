import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, Calendar as CalIcon, User, Phone, Info } from 'lucide-react';
import './App.css'; // <-- CSS Imported Here

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginInput] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

 

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAppointments();
    await fetchCalendar();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      apps.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(apps);
    } catch (error) { console.error(error); }
  };

  const fetchCalendar = async () => {
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    try {
      const docSnap = await getDoc(doc(db, "calendar_sync", yearMonth));
      if (docSnap.exists()) setCalendarData(docSnap.data().days || {});
      else setCalendarData({});
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchCalendar();
    }
  }, [isAuthenticated, currentDate]);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0fdfa', padding: '20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(13, 148, 136, 0.15)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <img src="/clinic-logo.png" alt="Clinic Logo" style={{ width: '70px', height: 'auto', marginBottom: '10px' }} />
          <h2 style={{ color: '#0d9488', marginBottom: '30px', fontWeight: '800' }}>DentOS Admin</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Username" 
              onChange={(e) => setLoginInput({...loginForm, username: e.target.value})}
              style={{ padding: '14px', borderRadius: '12px', border: '2px solid #f0fdfa', backgroundColor: '#f9fafb', fontSize: '16px', outline: 'none', color: '#1f2937' }}
              />
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setLoginInput({...loginForm, password: e.target.value})}
              style={{ padding: '14px', borderRadius: '12px', border: '2px solid #f0fdfa', backgroundColor: '#f9fafb', fontSize: '16px', outline: 'none', color: '#1f2937' }}
              />
            <button type="submit" style={{ padding: '14px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>Sign In</button>
          </form>
        </motion.div>
      </div>
    );
  }
   const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'doctor' && loginForm.password === 'secure123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Credentials');
    }
  };

  return (
    <div style={{ padding: '15px', backgroundColor: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', flex: 1 }}>
        
        {/* Navbar */}
        <div className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', width: '100%' }}>
            <img src="/clinic-logo.png" alt="Logo" style={{ width: '35px' }} />
            <h1 className="navbar-title">DentOS Admin</h1>
          </div>
          <div className="navbar-controls">
            <motion.button 
                animate={{ rotate: isRefreshing ? 360 : 0 }} 
                transition={{ repeat: isRefreshing ? Infinity : 0, duration: 0.6 }}
                onClick={refreshData} 
                style={{ padding: '10px', borderRadius: '50%', border: 'none', background: '#f0fdfa', color: '#0d9488', cursor: 'pointer' }}
            >
              <RefreshCw size={20} />
            </motion.button>
            <div style={{ background: '#f0fdfa', padding: '5px', borderRadius: '15px', display: 'flex', gap: '5px' }}>
                <button onClick={() => setActiveTab('appointments')} style={{ padding: '8px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'appointments' ? '#0d9488' : 'transparent', color: activeTab === 'appointments' ? 'white' : '#0d9488', fontWeight: '700' }}>Requests</button>
                <button onClick={() => setActiveTab('calendar')} style={{ padding: '8px 15px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'calendar' ? '#0d9488' : 'transparent', color: activeTab === 'calendar' ? 'white' : '#0d9488', fontWeight: '700' }}>Calendar</button>
            </div>
            <button onClick={() => setIsAuthenticated(false)} style={{ padding: '8px 15px', borderRadius: '12px', border: '1px solid #fee2e2', color: '#ef4444', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', minHeight: '60vh' }}>
            {activeTab === 'appointments' ? (
              <div>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   <Info size={14}/> Appointments below are pending. Process them in your Desktop Software to sync.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {appointments.length === 0 ? <p style={{ color: '#94a3b8' }}>No pending requests.</p> : appointments.map((app) => (
                    <div key={app.id} style={{ padding: '20px', background: '#f9fafb', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Incoming</span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{app.date}</span>
                      </div>
                      <h3 style={{ margin: '0', color: '#1f2937' }}>{app.name}</h3>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={14}/> {app.phone}</p>
                      <div style={{ margin: '15px 0 0 0', padding: '12px', background: 'white', borderRadius: '15px', fontSize: '13px', color: '#475569', border: '1px solid #edf2f7' }}>
                        <strong>Reason:</strong> {app.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* CALENDAR VIEW */
              <div>
                <div className="month-header">
                  <button className="month-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
                  <h2 style={{ color: '#134e4a', margin: 0, fontSize: '1.2rem' }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                  <button className="month-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
                </div>
                <div className="calendar-grid">
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => <div key={d} className="day-label">{d}</div>)}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const dayIndex = i + 1;
                    const dayKey = String(dayIndex).padStart(2, '0');
                    const data = calendarData[dayKey];
                    return (
                      <div
                        key={dayIndex}
                        className="calendar-day-box"
                        onClick={() => data && setSelectedDayData({ day: dayIndex, ...data })}
                        style={{ cursor: data ? 'pointer' : 'default', background: data ? '#f0fdfa' : 'white' }}
                      >
                        <span style={{ fontWeight: '700', fontSize: '14px', color: data ? '#0d9488' : '#94a3b8' }}>{dayIndex}</span>
                        {/* Number Badges */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {data?.visits?.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#dcfce7', color: '#15803d', fontSize: '10px', fontWeight: '800', padding: '2px', borderRadius: '4px' }}>
                              {data.visits.length} V
                            </div>
                          )}
                          {data?.scheduled?.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: '800', padding: '2px', borderRadius: '4px' }}>
                              {data.scheduled.length} S
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* AYRASOFT FOOTER */}
        <div style={{ textAlign: 'center', marginTop: '30px', paddingBottom: '20px', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
          Developed by <span style={{ color: '#0d9488', fontWeight: '800' }}>AyraSoft</span>
        </div>

      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ color: '#0d9488', marginBottom: '20px', fontWeight: '800' }}>Day Summary: {selectedDayData.day}</h2>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>Visits ({selectedDayData.visits?.length || 0})</h4>
                {selectedDayData.visits?.map((v, i) => (
                  <div key={i} style={{ padding: '15px', background: '#f0fdf4', borderRadius: '15px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>{v.name}</div>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{v.detail}</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '5px' }}>Dr. {v.doctor}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>📅 Scheduled ({selectedDayData.scheduled?.length || 0})</h4>
                {selectedDayData.scheduled?.map((s, i) => (
                  <div key={i} style={{ padding: '15px', background: '#eff6ff', borderRadius: '15px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{s.detail}</div>
                    <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '800', marginTop: '5px' }}>Dr. {s.doctor}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedDayData(null)} style={{ width: '100%', padding: '15px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;