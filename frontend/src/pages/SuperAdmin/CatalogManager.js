import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Plus, Edit2, Trash2, Filter, 
    CheckCircle, XCircle, Beaker, Layers, 
    ArrowUpRight, Activity, AlertCircle
} from 'lucide-react';
import { superAdminAPI, catalogAPI } from '../../services/api';
import './CatalogManager.css';

const CatalogManager = () => {
    const [tests, setTests] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [notification, setNotification] = useState(null);

    // Local Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const [formData, setFormData] = useState({
        title: '',
        category_name: 'General Wellness',
        sample_type: 'Blood',
        price: '',
        turnaround: '24h',
        preparation: 'No fasting required',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchTests();
        fetchCategories();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        const res = await superAdminAPI.getAdminTests();
        if (res.ok) setTests(res.data);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await catalogAPI.getCategories();
        if (res.ok) setCategories(res.data);
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Derived State: Metrics
    const metrics = useMemo(() => {
        return {
            total: tests.length,
            active: tests.filter(t => t.is_active).length,
            inactive: tests.filter(t => !t.is_active).length,
            categories: new Set(tests.map(t => t.category_name)).size
        };
    }, [tests]);

    // Derived State: Filtered Tests
    const filteredTests = useMemo(() => {
        return tests.filter(test => {
            const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 test.id.toString().includes(searchQuery);
            const matchesCategory = filterCategory === 'All' || test.category_name === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [tests, searchQuery, filterCategory]);

    const handleOpenModal = (test = null) => {
        if (test) {
            setEditingTest(test);
            setFormData({
                title: test.title,
                category_name: test.category_name,
                sample_type: test.sample_type,
                price: test.price,
                turnaround: test.turnaround,
                preparation: test.preparation || test.fasting || 'No fasting required',
                description: test.description || '',
                is_active: test.is_active
            });
        } else {
            setEditingTest(null);
            setFormData({
                title: '',
                category_name: 'General Wellness',
                sample_type: 'Blood',
                price: '',
                turnaround: '24h',
                preparation: 'No fasting required',
                description: '',
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (editingTest) {
            res = await superAdminAPI.updateTest(editingTest.id, formData);
        } else {
            res = await superAdminAPI.createTest(formData);
        }

        if (res.ok) {
            showNotify(`Test ${editingTest ? 'updated' : 'created'} successfully!`);
            setShowModal(false);
            fetchTests();
        } else {
            showNotify('Error saving test', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            const res = await superAdminAPI.deleteTest(id);
            if (res.ok) {
                showNotify('Test removed from catalog');
                fetchTests();
            }
        }
    };

    const handleToggle = async (id) => {
        const res = await superAdminAPI.toggleTest(id);
        if (res.ok) {
            // Update local state immediately for better UX
            setTests(prev => prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t));
        }
    };

    return (
        <div className="catalog-manager optimized fade-in">
            {/* Header Section */}
            <div className="mgr-header-enhanced">
                <div className="title-area">
                    <div className="icon-badge"><Beaker size={24} /></div>
                    <div>
                        <h1>Catalog Intelligence</h1>
                        <p>Configure, monitor, and deploy site-wide diagnostic tests</p>
                    </div>
                </div>
                <button className="btn-add-premium" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add New Test
                </button>
            </div>

            {/* KPI Metrics Strip */}
            <div className="metrics-strip">
                <div className="metric-card">
                    <div className="m-icon total"><Layers size={20} /></div>
                    <div className="m-info">
                        <span className="m-label">Total Tests</span>
                        <span className="m-value">{metrics.total}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="m-icon active"><CheckCircle size={20} /></div>
                    <div className="m-info">
                        <span className="m-label">Active</span>
                        <span className="m-value">{metrics.active}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="m-icon inactive"><AlertCircle size={20} /></div>
                    <div className="m-info">
                        <span className="m-label">Inactive</span>
                        <span className="m-value">{metrics.inactive}</span>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="m-icon categories"><Activity size={20} /></div>
                    <div className="m-info">
                        <span className="m-label">Categories</span>
                        <span className="m-value">{metrics.categories}</span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="control-bar glass-panel">
                <div className="search-box">
                    <Search size={18} className="s-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by test name or ID..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} className="f-icon" />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {notification && (
                <div className={`notification-pill ${notification.type}`}>
                    {notification.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {notification.msg}
                </div>
            )}

            {/* Main Table Content */}
            <div className="mgr-main-content glass-panel">
                {loading ? (
                    <div className="mgr-loader">
                        <div className="pulse-loader"></div>
                        <p>Syncing with Lab Database...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                    <table className="mgr-table-premium">
                        <thead>
                            <tr>
                                <th>Test Module</th>
                                <th>Analytical Category</th>
                                <th>Benchmark Price</th>
                                <th>Status</th>
                                <th className="text-right">Intelligence Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.map(test => (
                                <tr key={test.id} className={!test.is_active ? 'row-disabled' : ''}>
                                    <td>
                                        <div className="test-info-cell">
                                            <div className="test-avatar">
                                                {test.title.charAt(0)}
                                            </div>
                                            <div className="test-details">
                                                <span className="t-title">{test.title}</span>
                                                <span className="t-id">UID: #{test.id} • {test.sample_type}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`cat-pill ${test.category_name.split(' ')[0].toLowerCase()}`}>
                                            {test.category_name}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="price-cell">
                                            <span className="curr">$</span>
                                            <span className="val">{test.price}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="status-cell">
                                            <label className="ios-switch">
                                                <input 
                                                    type="checkbox" 
                                                    checked={test.is_active} 
                                                    onChange={() => handleToggle(test.id)}
                                                />
                                                <span className="ios-slider"></span>
                                            </label>
                                            <span className={`status-text ${test.is_active ? 'active' : 'inactive'}`}>
                                                {test.is_active ? 'LIVE' : 'HIDDEN'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns-premium">
                                            <button className="btn-icon-p edit" onClick={() => handleOpenModal(test)} title="Edit Configuration">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-p delete" onClick={() => handleDelete(test.id)} title="Purge Module">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="btn-icon-p link" title="View Public Link">
                                                <ArrowUpRight size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            {/* Modal Logic Remains Similar but with Enhanced Styles */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content-premium glass-panel bounce-in">
                        <div className="modal-header-p">
                            <h2>{editingTest ? 'Optimize Test Module' : 'Configure New Module'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-grid">
                                <div className="form-group-p">
                                    <label>Formal Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        placeholder="e.g. Advanced Lipid Profile"
                                    />
                                </div>
                                <div className="form-group-p">
                                    <label>Analytical Category</label>
                                    <select 
                                        value={formData.category_name}
                                        onChange={e => setFormData({...formData, category_name: e.target.value})}
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group-p">
                                    <label>Benchmark Price ($)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div className="form-group-p">
                                    <label>Sample Matrix</label>
                                    <select 
                                        value={formData.sample_type}
                                        onChange={e => setFormData({...formData, sample_type: e.target.value})}
                                    >
                                        <option value="Blood">Blood</option>
                                        <option value="Urine">Urine</option>
                                        <option value="Saliva">Saliva</option>
                                        <option value="Swab">Swab</option>
                                    </select>
                                </div>
                                <div className="form-group-p">
                                    <label>Preparation / Fasting</label>
                                    <input 
                                        type="text" 
                                        value={formData.preparation}
                                        onChange={e => setFormData({...formData, preparation: e.target.value})}
                                        placeholder="e.g. 8h Fasting required"
                                    />
                                </div>
                            </div>
                            <div className="form-group-p full-width">
                                <label>Clinical Methodology / Description</label>
                                <textarea 
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="modal-actions-p">
                                <button type="button" className="btn-p-secondary" onClick={() => setShowModal(false)}>Discard</button>
                                <button type="submit" className="btn-p-primary">Sync Configuration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogManager;
