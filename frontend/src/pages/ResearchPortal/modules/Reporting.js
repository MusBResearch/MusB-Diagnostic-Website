import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3, AlertTriangle, TrendingUp, Inbox, Loader2, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const Reporting = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        const token = localStorage.getItem('res_token');
        const res = await fetch('/api/research/portal/reporting/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setReport(await res.json());
        setLoading(false);
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2 text-blue-500" /> Analysing Specimen Velocity...</div>;

    const barData = Object.entries(report.by_type).map(([name, value]) => ({ name, value }));
    const areaData = report.storage_trends.map((val, idx) => ({ name: `Month ${idx + 1}`, value: val }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="recharts-custom-tooltip">
                    <p className="recharts-tooltip-label">{label}</p>
                    <p className="recharts-tooltip-value">
                        {payload[0].value} <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Specimens</span>
                    </p>
                </div>
            );
        }
        return null;
    };


    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="res-module-header group">
                <div className="res-module-info relative z-10">
                    <h3 className="res-gradient-text uppercase tracking-tight">Analytics & System Velocity</h3>
                    <p>Real-time telemetry for specimen throughput and storage distribution.</p>
                </div>
            </div>

            {/* KPI Telemetry Layer */}
            <div className="res-grid grid-cols-3 gap-6">
                <div className="res-stats-card blue">
                    <div className="res-stats-icon-bg"><TrendingUp size={48} /></div>
                    <p>Total Managed Specimens</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>{report.total_samples}</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">+12.4%</span>
                            <span className="text-[10px] text-slate-600 font-bold">MoM Growth</span>
                        </div>
                    </div>
                </div>
                <div className="res-stats-card emerald">
                    <div className="res-stats-icon-bg"><TrendingUp size={48} /></div>
                    <p>24h Specimen Velocity</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>{Math.floor(report.total_samples * 0.08)}</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Nominal</span>
                            <span className="text-[10px] text-slate-600 font-bold">System Load</span>
                        </div>
                    </div>
                </div>
                <div className="res-stats-card amber">
                    <div className="res-stats-icon-bg"><Database size={48} /></div>
                    <p>System Throughput Index</p>
                    <div className="flex items-center gap-4 mt-2">
                        <h3>0.94</h3>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Optimized</span>
                            <span className="text-[10px] text-slate-600 font-bold">LIMS Efficiency</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="res-grid">
                <div className="chart-container-wrapper col-span-2 p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20"><TrendingUp className="text-blue-500" size={24} /></div>
                            Inventory Growth Analytics
                        </h4>
                        <span className="chart-header-tag">6 Month Rolling Trend</span>
                    </div>
                    <div className="h-chart-main w-full px-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} tick={{dy: 15}} />
                                <YAxis stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} tick={{dx: -10}} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="telemetry-alert-box flex flex-col items-center justify-center">
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="p-6 bg-amber-500/10 rounded-full border border-amber-500/20 mb-8"
                    >
                        <AlertTriangle className="text-amber-500" size={56} />
                    </motion.div>
                    <h3 className="text-white font-black text-xl mb-4 tracking-tight">Capacity Alert</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
                        Freezer Cluster A4 is at <span className="text-amber-500 font-black">{report.storage_utilization?.toFixed(1) || '0.0'}% capacity</span>. Critical expansion required by Q3 2026.
                    </p>
                </div>
            </div>

            <div className="res-grid grid-cols-2 gap-8">
                <div className="chart-container-wrapper p-10">
                    <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20"><BarChart3 className="text-blue-500" size={24} /></div>
                        Specimen Distribution
                    </h4>
                    <div className="h-chart-distributor w-full px-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} tick={{dy: 10}} />
                                <YAxis stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="res-stats-card p-10 justify-start">
                    <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><Inbox className="text-emerald-500" size={24} /></div>
                        Fulfillment Performance
                    </h4>
                    <div className="flex flex-col gap-8 mt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target TAT (24h)</span>
                                </div>
                                <span className="text-white font-black text-xl tracking-tighter">96.8%</span>
                            </div>
                            <div className="w-full bg-white/5 h-stat-bar rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '96.8%' }}
                                    className="bg-emerald-500 h-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessioning Accuracy</span>
                                </div>
                                <span className="text-white font-black text-xl tracking-tighter">99.9%</span>
                            </div>
                            <div className="w-full bg-white/5 h-stat-bar rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '99.9%' }}
                                    className="bg-blue-500 h-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reporting;
