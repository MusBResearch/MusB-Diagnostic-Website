import React, { useEffect, useState } from 'react';
import { Plus, Database, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StudyManagement = ({ user }) => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newStudy, setNewStudy] = useState({ 
        title: '', sponsor: '', pi_name: '', sample_types: '', sops: '', status: 'Active',
        description: '', pdf_data: null
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewStudy({ ...newStudy, pdf_data: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchStudies();
    }, []);

    const fetchStudies = async () => {
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/studies/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setStudies(await res.json());
        setLoading(false);
    };

    const handleDeleteStudy = async (studyId) => {
        if (!window.confirm('WARNING: Are you sure you want to permanently delete this study and its associated meta-data?')) return;
        
        const token = localStorage.getItem('res_token');
        const res = await fetch(`/api/research/portal/studies/?study_id=${studyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchStudies();
    };

    const handleCreateStudy = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/studies/', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...newStudy,
                sample_types: typeof newStudy.sample_types === 'string' ? newStudy.sample_types.split(',').map(s => s.trim()) : newStudy.sample_types
            })
        });
        if (res.ok) {
            fetchStudies();
            setShowNewForm(false);
            setNewStudy({ 
                title: '', sponsor: '', pi_name: '', sample_types: '', sops: '', status: 'Active',
                description: '', pdf_data: null
            });
        }
    };

    const openPdf = (base64) => {
        const win = window.open();
        win.document.write('<iframe src="' + base64  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    };

    if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="res-module-header">
                <div className="res-module-info">
                    <h3>Project Protocol Repository</h3>
                    <p>Foundational data for biorepository operations and LIMS accessioning.</p>
                </div>
                {user.role === 'admin' && (
                    <button onClick={() => setShowNewForm(true)} className="res-btn flex items-center gap-2">
                        <Plus size={20} /> Initialize New Study
                    </button>
                )}
            </div>

            {showNewForm && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="res-glass-panel res-form-card"
                >
                    <form onSubmit={handleCreateStudy} className="res-form-grid">
                        <div className="res-col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Study Title</label>
                            <input type="text" className="res-input" required 
                                value={newStudy.title} onChange={(e) => setNewStudy({...newStudy, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sponsoring Institution</label>
                            <input type="text" className="res-input" required 
                                value={newStudy.sponsor} onChange={(e) => setNewStudy({...newStudy, sponsor: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Principal Investigator</label>
                            <input type="text" className="res-input" required 
                                value={newStudy.pi_name} onChange={(e) => setNewStudy({...newStudy, pi_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sample Types (comma separated)</label>
                            <input type="text" className="res-input" placeholder="Whole Blood, Plasma, DNA" required 
                                value={newStudy.sample_types} onChange={(e) => setNewStudy({...newStudy, sample_types: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SOP Identifier</label>
                            <input type="text" className="res-input" placeholder="v2.1 Clinical Standard" required 
                                value={newStudy.sops} onChange={(e) => setNewStudy({...newStudy, sops: e.target.value})} />
                        </div>
                        <div className="res-col-span-2 space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scientific Abstract / Synopsis</label>
                            <textarea 
                                className="res-input res-textarea" 
                                placeholder="Describe the study objectives, primary end-points, and clinical scope..."
                                required
                                value={newStudy.description} 
                                onChange={(e) => setNewStudy({...newStudy, description: e.target.value})} 
                            />
                        </div>
                        <div className="res-col-span-2 space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Finalized Protocol Document (PDF)</label>
                            <div className={`res-file-upload-wrapper ${newStudy.pdf_data ? 'active' : ''}`}>
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={handleFileChange}
                                    className="res-file-input"
                                />
                                <div className="res-file-custom">
                                    <div className="flex items-center gap-3">
                                        <Database size={18} className={newStudy.pdf_data ? 'text-emerald-500' : 'text-slate-500'} />
                                        <span>{newStudy.pdf_data ? 'Protocol Document Attached' : 'Select Protocol File (Max 10MB)'}</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${newStudy.pdf_data ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                                        {newStudy.pdf_data ? 'Ready' : 'PDF Required'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="res-btn-group">
                            <button type="submit" className="res-btn px-12">
                                Confirm & Initialize Protocol
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowNewForm(false)} 
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
                            <th>Study ID</th>
                            <th>Title & Protocol</th>
                            <th>Synopsis</th>
                            <th>Lead / Sponsor</th>
                            <th>Compliance</th>
                            <th>Operations Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studies.map((study) => (
                            <tr key={study.id}>
                                <td className="text-blue-500 font-mono font-black">{study.study_id}</td>
                                <td>
                                    <div className="text-white font-bold">{study.title}</div>
                                    <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-2 uppercase tracking-widest font-black">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Types: {Array.isArray(study.sample_types) ? study.sample_types.join(', ') : (study.sample_types || 'Global')}
                                    </div>
                                    {study.pdf_data && (
                                        <button 
                                            onClick={() => openPdf(study.pdf_data)}
                                            className="mt-2 text-[10px] text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1 uppercase"
                                            style={{ background: 'transparent', border: 'none', padding: 0 }}
                                        >
                                            <Database size={10} /> View Protocol PDF
                                        </button>
                                    )}
                                </td>
                                <td className="max-w-[200px]">
                                    <div className="text-xs text-slate-400 line-clamp-2 hover:line-clamp-none cursor-help transition-all" title={study.description}>
                                        {study.description || 'No synopsis provided.'}
                                    </div>
                                </td>
                                <td>
                                    <div className="text-slate-300 font-medium text-xs">{study.pi_name}</div>
                                    <div className="text-slate-500 text-[10px] uppercase font-bold mt-1">{study.sponsor}</div>
                                </td>
                                <td>
                                    <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md font-mono text-[10px] border border-white/5">
                                        {study.sops}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-6">
                                        <span className={`status-pill ${study.status === 'Active' ? 'status-ready' : 'status-pending'}`}>
                                            {study.status}
                                        </span>
                                        {user.role === 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteStudy(study.study_id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Study"
                                                style={{ background: 'transparent', border: 'none', color: '#ff4d4d' }}
                                            >
                                                <Trash2 size={16} color="#ff4d4d" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default StudyManagement;
