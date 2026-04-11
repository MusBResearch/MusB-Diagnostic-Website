import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import '../../styles/Admin.css';
import '../../styles/OffersEngine.css';

const OFFER_TYPES = ['Weekly', 'Monthly', 'Seasonal'];
const CATEGORIES = ['Vitamins', 'Heart', 'Thyroid', "Women's", 'Metabolic', 'STD', 'General'];

const emptyOffer = {
    title: '',
    offer_type: 'Weekly',
    category: 'Vitamins',
    original_price: '',
    discounted_price: '',
    includes: [''],
    time_left: '',
    is_active: true,
};

const OffersEngine = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({ ...emptyOffer });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/superadmin/offers/');
            setOffers(res.data);
        } catch (err) {
            console.error('Failed to fetch offers', err);
            setStatusMsg({ text: 'Failed to load offers', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const showStatus = (text, type = 'success') => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
    };

    const openCreateModal = () => {
        setEditingOffer(null);
        setFormData({ ...emptyOffer, includes: [''] });
        setShowModal(true);
    };

    const openEditModal = (offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            offer_type: offer.offer_type,
            category: offer.category,
            original_price: offer.original_price,
            discounted_price: offer.discounted_price,
            includes: offer.includes && offer.includes.length > 0 ? [...offer.includes] : [''],
            time_left: offer.time_left || '',
            is_active: offer.is_active !== undefined ? offer.is_active : true,
        });
        setShowModal(true);
    };

    const handleToggle = async (offerId) => {
        try {
            await api.patch(`/api/superadmin/offers/${offerId}/toggle/`);
            await fetchOffers();
            showStatus('Offer status toggled!');
        } catch (err) {
            console.error('Toggle failed', err);
            showStatus('Toggle failed', 'error');
        }
    };

    const handleDelete = async (offerId) => {
        try {
            await api.delete(`/api/superadmin/offers/${offerId}/delete/`);
            setDeleteConfirm(null);
            await fetchOffers();
            showStatus('Offer deleted!');
        } catch (err) {
            console.error('Delete failed', err);
            showStatus('Delete failed', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        // Clean includes — remove empties
        const cleanIncludes = formData.includes.filter(i => i.trim() !== '');
        const payload = { ...formData, includes: cleanIncludes };
        
        try {
            if (editingOffer) {
                await api.put(`/api/superadmin/offers/${editingOffer.id}/`, payload);
                showStatus('Offer updated successfully!');
            } else {
                await api.post('/api/superadmin/offers/create/', payload);
                showStatus('Offer created successfully!');
            }
            setShowModal(false);
            await fetchOffers();
        } catch (err) {
            console.error('Save failed', err);
            showStatus('Save failed. Please check all fields.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateInclude = (index, value) => {
        const updated = [...formData.includes];
        updated[index] = value;
        setFormData({ ...formData, includes: updated });
    };

    const addInclude = () => {
        setFormData({ ...formData, includes: [...formData.includes, ''] });
    };

    const removeInclude = (index) => {
        const updated = formData.includes.filter((_, i) => i !== index);
        setFormData({ ...formData, includes: updated.length > 0 ? updated : [''] });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    const activeCount = offers.filter(o => o.is_active !== false).length;
    const inactiveCount = offers.length - activeCount;
    const totalSavings = offers
        .filter(o => o.is_active !== false)
        .reduce((sum, o) => sum + (parseFloat(o.original_price || 0) - parseFloat(o.discounted_price || 0)), 0);

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="admin-spinner"></div>
                <p>Loading Offers Engine...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="offers-engine"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Status Toast */}
            <AnimatePresence>
                {statusMsg.text && (
                    <motion.div
                        className={`oe-toast ${statusMsg.type}`}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                    >
                        {statusMsg.type === 'success' ? '✅' : '❌'} {statusMsg.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div className="oe-header" variants={itemVariants}>
                <div>
                    <h1 className="oe-title">Offers Engine</h1>
                    <p className="oe-subtitle">Create, manage, and push promotional offers to the main website in real-time.</p>
                </div>
                <motion.button
                    className="oe-create-btn"
                    onClick={openCreateModal}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    ➕ Create New Offer
                </motion.button>
            </motion.div>

            {/* KPI Strip */}
            <motion.div className="oe-kpi-strip" variants={containerVariants}>
                <motion.div className="oe-kpi" variants={itemVariants}>
                    <span className="oe-kpi-value">{offers.length}</span>
                    <span className="oe-kpi-label">Total Offers</span>
                </motion.div>
                <motion.div className="oe-kpi active-kpi" variants={itemVariants}>
                    <span className="oe-kpi-value">{activeCount}</span>
                    <span className="oe-kpi-label">Live on Website</span>
                </motion.div>
                <motion.div className="oe-kpi" variants={itemVariants}>
                    <span className="oe-kpi-value">{inactiveCount}</span>
                    <span className="oe-kpi-label">Drafts / Paused</span>
                </motion.div>
                <motion.div className="oe-kpi" variants={itemVariants}>
                    <span className="oe-kpi-value">${totalSavings.toFixed(0)}</span>
                    <span className="oe-kpi-label">Total Savings Offered</span>
                </motion.div>
            </motion.div>

            {/* Offers Table */}
            <motion.div className="oe-table-wrap" variants={itemVariants}>
                <table className="oe-table">
                    <thead>
                        <tr>
                            <th>Offer</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {offers.map((offer) => (
                                <motion.tr
                                    key={offer.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={offer.is_active === false ? 'inactive-row' : ''}
                                >
                                    <td>
                                        <div className="oe-offer-cell">
                                            <span className="oe-offer-title">{offer.title}</span>
                                            <span className="oe-offer-meta">
                                                {(offer.includes || []).length} tests • Ends: {offer.time_left || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`oe-type-badge type-${(offer.offer_type || 'weekly').toLowerCase()}`}>
                                            {offer.offer_type}
                                        </span>
                                    </td>
                                    <td>{offer.category}</td>
                                    <td>
                                        <div className="oe-price-cell">
                                            <span className="oe-price-strike">${offer.original_price}</span>
                                            <span className="oe-price-final">${offer.discounted_price}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <motion.button
                                            className={`oe-toggle-btn ${offer.is_active !== false ? 'live' : 'paused'}`}
                                            onClick={() => handleToggle(offer.id)}
                                            whileTap={{ scale: 0.9 }}
                                            title={offer.is_active !== false ? 'Click to pause' : 'Click to go live'}
                                        >
                                            <span className="oe-toggle-dot"></span>
                                            {offer.is_active !== false ? 'LIVE' : 'PAUSED'}
                                        </motion.button>
                                    </td>
                                    <td>
                                        <div className="oe-actions">
                                            <button
                                                className="oe-action-btn edit"
                                                onClick={() => openEditModal(offer)}
                                                title="Edit Offer"
                                            >
                                                ✏️
                                            </button>
                                            {deleteConfirm === offer.id ? (
                                                <div className="oe-delete-confirm">
                                                    <button
                                                        className="oe-action-btn confirm-yes"
                                                        onClick={() => handleDelete(offer.id)}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="oe-action-btn confirm-no"
                                                        onClick={() => setDeleteConfirm(null)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="oe-action-btn delete"
                                                    onClick={() => setDeleteConfirm(offer.id)}
                                                    title="Delete Offer"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                        {offers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="oe-empty">
                                    No offers yet. Click "Create New Offer" to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="oe-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="oe-modal"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="oe-modal-header">
                                <h2>{editingOffer ? '✏️ Edit Offer' : '➕ Create New Offer'}</h2>
                                <button className="oe-modal-close" onClick={() => setShowModal(false)}>✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="oe-form">
                                <div className="oe-form-grid">
                                    {/* Title */}
                                    <div className="oe-field full-width">
                                        <label>Offer Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Essential Vitamin Profile"
                                            required
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className="oe-field">
                                        <label>Offer Type</label>
                                        <select
                                            value={formData.offer_type}
                                            onChange={(e) => setFormData({ ...formData, offer_type: e.target.value })}
                                        >
                                            {OFFER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    {/* Category */}
                                    <div className="oe-field">
                                        <label>Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Original Price */}
                                    <div className="oe-field">
                                        <label>Original Price ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.original_price}
                                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                            placeholder="120.00"
                                            required
                                        />
                                    </div>

                                    {/* Discounted Price */}
                                    <div className="oe-field">
                                        <label>Discounted Price ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.discounted_price}
                                            onChange={(e) => setFormData({ ...formData, discounted_price: e.target.value })}
                                            placeholder="69.00"
                                            required
                                        />
                                    </div>

                                    {/* Time Left */}
                                    <div className="oe-field">
                                        <label>Time Left / Expiry</label>
                                        <input
                                            type="text"
                                            value={formData.time_left}
                                            onChange={(e) => setFormData({ ...formData, time_left: e.target.value })}
                                            placeholder="e.g., 3d 14h 22m or Limited Time"
                                        />
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="oe-field">
                                        <label>Publish Status</label>
                                        <div className="oe-publish-toggle">
                                            <button
                                                type="button"
                                                className={`oe-pub-btn ${formData.is_active ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, is_active: true })}
                                            >
                                                🟢 Live
                                            </button>
                                            <button
                                                type="button"
                                                className={`oe-pub-btn ${!formData.is_active ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, is_active: false })}
                                            >
                                                ⏸️ Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Includes (Dynamic List) */}
                                <div className="oe-field full-width oe-includes-section">
                                    <label>Included Tests / Items</label>
                                    {formData.includes.map((item, idx) => (
                                        <div key={idx} className="oe-include-row">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => updateInclude(idx, e.target.value)}
                                                placeholder={`Test item ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className="oe-remove-include"
                                                onClick={() => removeInclude(idx)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="oe-add-include" onClick={addInclude}>
                                        + Add Item
                                    </button>
                                </div>

                                {/* Submit */}
                                <div className="oe-form-actions">
                                    <button type="button" className="oe-cancel-btn" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="oe-submit-btn" disabled={saving}>
                                        {saving ? '⏳ Saving...' : editingOffer ? '💾 Update Offer' : '🚀 Publish Offer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Overlay */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        className="oe-delete-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OffersEngine;
