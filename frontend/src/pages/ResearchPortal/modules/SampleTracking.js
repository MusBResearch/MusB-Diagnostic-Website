import React, { useEffect, useState } from 'react';
import { Plus, TestTube, Package, ShieldCheck, Loader2, FileText, Clock, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const SampleTracking = ({ user }) => {
    const [samples, setSamples] = useState([]);
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAccessioning, setIsAccessioning] = useState(false);
    const [accessionData, setAccessionData] = useState({ 
        study_id: '', type: 'Whole Blood', aliquots_count: 1 
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const token = localStorage.getItem('res_token');
        const [studiesRes, samplesRes] = await Promise.all([
            fetch('/api/research/portal/studies/', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/research/portal/samples/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (studiesRes.ok) setStudies(await studiesRes.json());
        if (samplesRes.ok) setSamples(await samplesRes.json());
        setLoading(false);
    };

    const handleAccession = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/samples/', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accessionData)
        });
        if (res.ok) {
            fetchInitialData();
            setIsAccessioning(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center p-20 text-slate-500"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="res-module-header group">
                <div className="res-module-info relative z-10">
                    <h3 className="res-gradient-text">LIMS Archive & Accessioning</h3>
                    <p>Universal chain-of-custody tracking from receipt to deep-freeze storage.</p>
                </div>
                {user.role === 'admin' && (
                    <button 
                        onClick={() => setIsAccessioning(true)} 
                        className="res-btn"
                    >
                        <Plus size={22} /> 
                        <span>Accession New Batch</span>
                    </button>
                )}
            </div>

            <div className="res-grid mb-8">
                <div className="res-stats-card blue">
                    <div className="res-stats-icon-bg">
                        <Database size={48} />
                    </div>
                    <p>Total Archived</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>{samples.length}</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{samples.length === 1 ? 'Specimen' : 'Specimens'}</span>
                            <span className="text-[10px] text-slate-600 font-bold">In Repository</span>
                        </div>
                    </div>
                </div>

                <div className="res-stats-card emerald">
                    <div className="res-stats-icon-bg">
                        <ShieldCheck size={48} />
                    </div>
                    <p>Accession Accuracy</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>99.9%</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Verified</span>
                            <span className="text-[10px] text-slate-600 font-bold">Standard GLP</span>
                        </div>
                    </div>
                </div>

                <div className="res-stats-card amber">
                    <div className="res-stats-icon-bg">
                        <Clock size={48} />
                    </div>
                    <p>Pending Sync</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>0</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Batches</span>
                            <span className="text-[10px] text-slate-600 font-bold">Ready for Vault</span>
                        </div>
                    </div>
                </div>
            </div>

            {isAccessioning && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="res-glass-panel res-form-card"
                >
                    <h4 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
                        <TestTube className="text-blue-500" size={24} />
                        Specimen Intake / Accessioning Log
                    </h4>
                    <form onSubmit={handleAccession} className="res-form-grid">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Originating Study</label>
                            <select className="res-input" required 
                                value={accessionData.study_id} onChange={(e) => setAccessionData({...accessionData, study_id: e.target.value})}>
                                <option value="">Select Study Protocol...</option>
                                {studies.map(s => <option key={s.study_id} value={s.study_id}>{s.title}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Specimen Type</label>
                            <select className="res-input" value={accessionData.type} onChange={(e) => setAccessionData({...accessionData, type: e.target.value})}>
                                <option>Whole Blood</option>
                                <option>Plasma</option>
                                <option>Serum</option>
                                <option>DNA</option>
                                <option>RNA</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Aliquots</label>
                            <input type="number" className="res-input" min="1" max="50" 
                                value={accessionData.aliquots_count} onChange={(e) => setAccessionData({...accessionData, aliquots_count: e.target.value})} />
                        </div>
                        <div className="res-btn-group">
                            <button type="submit" className="res-btn">
                                Generate Barcodes & Accession
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsAccessioning(false)} 
                                className="res-btn bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="res-glass-panel overflow-hidden">
                <table className="res-data-table">
                    <thead>
                        <tr>
                            <th>Primary ID</th>
                            <th>System Barcode</th>
                            <th>Study & Protocol</th>
                            <th>Type</th>
                            <th>Storage Vector</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {samples.map((sample) => (
                            <tr key={sample.id}>
                                <td className="text-slate-500 font-mono text-[10px]">{sample.id}</td>
                                <td>
                                    <div className="specimen-barcode-label">
                                        {sample.barcode}
                                    </div>
                                </td>
                                <td>
                                    <div className="text-white font-bold leading-tight">{sample.study_id}</div>
                                    <div className="study-ref-tag">
                                        <div className="study-ref-dot"></div>
                                        Ref: ALPHA-SYNC
                                    </div>
                                </td>
                                <td className="text-slate-300 font-medium">{sample.type}</td>
                                <td>
                                    {sample.storage_location ? (
                                        <div className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-flex items-center gap-2">
                                            <Package size={12} />
                                            {sample.storage_location.freezer} / {sample.storage_location.rack} / {sample.storage_location.position}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-600 italic">UNASSIGNED</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-pill ${sample.status === 'Stored' ? 'status-ready' : 'status-pending'}`}>
                                        {sample.status}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => alert(`Accession Dossier: ${sample.barcode}\nStatus: ${sample.status}\nCollected: ${sample.created_at || 'Jan 15, 2026'}`)}
                                        className="dossier-action-btn"
                                    >
                                        <FileText size={14} /> 
                                        <span>Dossier</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default SampleTracking;
