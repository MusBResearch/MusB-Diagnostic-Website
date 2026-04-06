import React, { useEffect, useState } from 'react';
import { Package, Thermometer, ShieldCheck, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const StorageInventory = ({ user }) => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFreezer, setSelectedFreezer] = useState('FZ-01');

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/samples/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setSamples(await res.json());
        setLoading(false);
    };

    const freezerStats = {
        'FZ-01': { temp: '-80.4°C', capacity: '10,000 Vials', status: 'Optimal' },
        'FZ-02': { temp: '-81.1°C', capacity: '10,000 Vials', status: 'Optimal' },
        'FZ-CRYO-01': { temp: '-196.2°C', capacity: '2,500 Straws', status: 'LN2 High' }
    };

    // Mock Grid Data Generation (8x12 Box)
    const gridRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const gridCols = Array.from({ length: 12 }, (_, i) => i + 1);


    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading Matrix...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="res-module-header group">
                <div className="res-module-info relative z-10">
                    <h3 className="res-gradient-text uppercase tracking-tight">Biorepository Storage Matrix</h3>
                    <p>Real-time physical location mapping and environmental monitoring.</p>
                </div>
            </div>

            <div className="res-grid gap-6">
                {Object.entries(freezerStats).map(([name, data]) => (
                    <div 
                        key={name}
                        onClick={() => setSelectedFreezer(name)}
                        className={`res-stats-card ${selectedFreezer === name ? 'blue border-2 border-blue-500/50' : 'border-white/5'} cursor-pointer p-8 relative overflow-hidden group`}
                    >
                        <div className={`freezer-card-glow ${data.status.includes('High') ? 'alert' : ''}`} />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <h4 className="text-white font-black tracking-widest text-xs uppercase">{name}</h4>
                            <span className={`status-pill ${data.status === 'Optimal' ? 'status-ready' : 'status-pending'} text-[9px] px-3`}>
                                {data.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className={`p-3 rounded-2xl ${data.status === 'Optimal' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                                <Thermometer size={24} className={data.status === 'Optimal' ? 'text-blue-400' : 'text-amber-400'} />
                            </div>
                            <h3 className="text-4xl font-black text-white tracking-tighter">{data.temp}</h3>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: name === 'FZ-CRYO-01' ? '40%' : '75%' }}
                                    className={`h-full ${data.status === 'Optimal' ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'}`}
                                />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex justify-between">
                                Capacity: <span className="text-white">{data.capacity}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="storage-grid-container relative">
                <div className="storage-matrix-header">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Positioning Matrix: {selectedFreezer}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Rack 01 → Shelf 2 → Box 8 → Alpha-Numeric Grid
                        </p>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-4 h-4 bg-blue-600 rounded-md shadow-[0_0_12px_rgba(37,99,235,0.6)]"></div> Occupied
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-4 h-4 bg-white/5 rounded-md border border-white/10"></div> Available
                        </div>
                    </div>
                </div>

                <div className="storage-grid">
                    {gridRows.map((row, rIdx) => (
                        gridCols.map((col, cIdx) => {
                            const occupiedSpecimen = samples.find(s => 
                                s.storage_location?.freezer === selectedFreezer && 
                                s.storage_location?.position === `${row}${col}`
                            );
                            return (
                                <motion.div 
                                    key={`${row}${col}`} 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (rIdx * 12 + cIdx) * 0.005 }}
                                    className={`storage-cell ${occupiedSpecimen ? 'occupied' : ''} group/cell`}
                                    onClick={() => {
                                        if (occupiedSpecimen) {
                                            alert(`Specimen Detected: ${occupiedSpecimen.barcode}\nID: ${occupiedSpecimen.id}\nStatus: ${occupiedSpecimen.status}`);
                                        } else {
                                            alert(`Coordinate ${row}${col} is available for local accessioning.`);
                                        }
                                    }}
                                    title={occupiedSpecimen ? `Specimen at ${row}${col}` : `Empty Slot ${row}${col}`}
                                >
                                    <span className="relative z-10">{row}{col}</span>
                                    {occupiedSpecimen && <div className="absolute inset-0 bg-blue-400/20 blur-md opacity-0 group-hover/cell:opacity-100 transition-opacity" />}
                                </motion.div>
                            );
                        })
                    ))}
                </div>

                <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl flex gap-5 text-sm text-slate-300 backdrop-blur-md">
                    <div className="p-2 bg-blue-500/20 rounded-xl h-fit">
                        <Info className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <span className="text-blue-400 font-black uppercase tracking-[0.2em] text-[11px] block mb-2 underline underline-offset-4">Security Protocol 402-A</span>
                        <p className="font-medium leading-relaxed opacity-80">
                            Selection locked: Role-based permissions required for vial retrieval or position reassignment. 
                            Contact the <span className="text-white font-bold">Lab Curator</span> for relocation requests or protocol deviations.
                        </p>
                    </div>
                </div>
            </div>

            <div className="res-grid grid-cols-2 gap-8">
                <div className="res-stats-card p-10 integrity-card">
                    <h4 className="text-white font-black text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <ShieldCheck className="text-emerald-500" size={24} />
                        </div>
                        System Integrity Log
                    </h4>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-slate-500 font-black uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Last QA Inspection</span>
                            <span className="text-white font-mono bg-white/5 px-3 py-1 rounded-lg">APR 01, 2026</span>
                        </div>
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-slate-500 font-black uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">LN2 Level Check</span>
                            <div className="flex items-center gap-2">
                                <div className="status-pulse-dot"></div>
                                <span className="text-emerald-500 font-black tracking-widest uppercase">PASSED</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-slate-500 font-black uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Backup Generator</span>
                            <div className="flex items-center gap-2">
                                <div className="status-pulse-dot active"></div>
                                <span className="text-blue-500 font-black tracking-widest uppercase">STANDBY</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="res-stats-card p-10 integrity-card">
                    <h4 className="text-white font-black text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                            <Package className="text-amber-500" size={24} />
                        </div>
                        Fulfillment Queue
                    </h4>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-slate-500 font-black uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Pending Retrieval</span>
                            <span className="text-white font-black bg-white/5 px-3 py-1 rounded-lg">12 Vials</span>
                        </div>
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-slate-500 font-black uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Outbound Shipping</span>
                            <span className="text-white font-black bg-white/5 px-3 py-1 rounded-lg">3 Shipments</span>
                        </div>
                        <div className="flex justify-between items-center text-xs group/item">
                            <span className="text-slate-500 font-black uppercase tracking-widest group-hover/item:text-slate-400 transition-colors">Incoming Batch</span>
                            <div className="flex items-center gap-2">
                                <div className="status-pulse-dot alert"></div>
                                <span className="text-amber-500 font-black tracking-widest uppercase">MON 08:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StorageInventory;
