import React, { useEffect, useState } from 'react';
import { Plus, MapPin, GraduationCap, Mail, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const UniversityDirectory = ({ user }) => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newUni, setNewUni] = useState({ name: '', location: '', contact: '', distance: '' });

    useEffect(() => {
        fetchUnis();
    }, []);

    const fetchUnis = async () => {
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/universities/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUniversities(await res.json());
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/universities/', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...newUni, contacts: [newUni.contact] })
        });
        if (res.ok) {
            fetchUnis();
            setShowForm(false);
            setNewUni({ name: '', location: '', contact: '', distance: '' });
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/universities/', {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        if (res.ok) fetchUnis();
    };

    const calculateAvgDistance = () => {
        if (!universities.length) return '0.0';
        const total = universities.reduce((acc, uni) => {
            const dist = parseInt(uni.distance) || 0;
            return acc + dist;
        }, 0);
        return (total / universities.length).toFixed(1);
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2 text-blue-500" /> Connecting to University Nodes...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="res-module-header group">
                <div className="res-module-info relative z-10">
                    <h3 className="res-gradient-text uppercase tracking-tight">University Partnership Intake</h3>
                    <p>Coordinating logistical proximity and grant metadata for academic collaborations.</p>
                </div>
            </div>

            {/* KPI Telemetry Layer */}
            <div className="res-grid grid-cols-3 gap-6">
                <div className="res-stats-card blue">
                    <div className="res-stats-icon-bg"><GraduationCap size={48} /></div>
                    <p>Active Partnerships</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>{universities.length}</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Verified</span>
                            <span className="text-[10px] text-slate-600 font-bold">Institutions</span>
                        </div>
                    </div>
                </div>
                <div className="res-stats-card emerald">
                    <div className="res-stats-icon-bg"><MapPin size={48} /></div>
                    <p>Mean Logistical Radius</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>{calculateAvgDistance()}</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Miles</span>
                            <span className="text-[10px] text-slate-600 font-bold">Avg Distance</span>
                        </div>
                    </div>
                </div>
                <div className="res-stats-card amber">
                    <div className="res-stats-icon-bg"><Mail size={48} /></div>
                    <p>Collaboration Index</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>0.91</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Strategic</span>
                            <span className="text-[10px] text-slate-600 font-bold">Grant Value</span>
                        </div>
                    </div>
                </div>
            </div>

            {user.role === 'admin' && !showForm && (
                <div className="flex justify-end">
                    <button onClick={() => setShowForm(true)} className="res-btn flex items-center gap-2 px-8">
                        <Plus size={20} /> Register Institution
                    </button>
                </div>
            )}

            {showForm && (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="res-glass-panel p-10 border-blue-500/20"
                >
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20"><GraduationCap className="text-blue-500" size={24} /></div>
                            Partner Institution Registration
                        </h4>
                    </div>
                    <form onSubmit={handleAdd} className="res-form-grid">
                        <div className="res-col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">University Name</label>
                            <input type="text" className="res-input" required value={newUni.name} onChange={e => setNewUni({...newUni, name: e.target.value})} placeholder="e.g. Stanford University School of Medicine" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Campus/Location</label>
                            <input type="text" className="res-input" required value={newUni.location} onChange={e => setNewUni({...newUni, location: e.target.value})} placeholder="Room 402, Building B" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Contact Email</label>
                            <input type="email" className="res-input" required value={newUni.contact} onChange={e => setNewUni({...newUni, contact: e.target.value})} placeholder="pi@university.edu" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logistical Distance (miles)</label>
                            <input type="number" className="res-input" required value={newUni.distance} onChange={e => setNewUni({...newUni, distance: e.target.value})} placeholder="15" />
                        </div>
                        <div className="res-btn-group pt-6">
                            <button type="submit" className="res-btn px-12">
                                Add to Directory
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)} 
                                className="res-btn bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {universities.map((uni) => {
                    const distanceVal = parseInt(uni.distance) || 0;
                    const proximityPct = Math.min(100, Math.max(10, (distanceVal / 100) * 100));
                    
                    return (
                        <div key={uni.id} className="res-glass-panel p-8 flex flex-col group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                            <div className="uni-card-glow" />
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <GraduationCap size={24} className="text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`uni-status-dot ${distanceVal < 50 ? 'active' : 'pending'}`} />
                                    {user.role === 'admin' && (
                                        <button onClick={() => handleDelete(uni.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <h4 className="relative z-10 text-white font-black text-xl mb-4 leading-tight tracking-tight min-h-[3rem]">
                                {uni.name}
                            </h4>

                            <div className="relative z-10 space-y-4 mb-8">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <span>Logistical Proximity</span>
                                        <span className={distanceVal < 50 ? 'text-blue-400' : 'text-amber-400'}>{parseInt(uni.distance)} Miles</span>
                                    </div>
                                    <div className="uni-proximity-bar">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${proximityPct}%` }}
                                            className={`uni-proximity-fill ${distanceVal > 50 ? 'far' : ''}`}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <MapPin size={14} className="text-blue-400" /> {uni.location}
                                </div>
                            </div>

                            <div className="relative z-10 mt-auto flex flex-col gap-4">
                                <div className="uni-contact-badge">
                                    <Mail size={16} className="text-blue-500" />
                                    {uni.contacts?.[0] || 'NO_CONTACT'}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[9px] px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-black uppercase tracking-widest">Active Partner</span>
                                    <span className="text-[9px] px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-black uppercase tracking-widest">Grant Award</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default UniversityDirectory;
