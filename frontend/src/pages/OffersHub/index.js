import React, { useState, useEffect, useCallback } from 'react';
import { 
  Filter, MapPin, Clock, Share2, ShoppingCart, Calendar, 
  Copy, Download, Image as ImageIcon, Check, CheckCircle,
  Activity, Loader2
} from 'lucide-react';
import { offersAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './OffersHub.css';

const CATEGORIES = ['All', 'Heart', 'Thyroid', 'Women\'s', 'Metabolic', 'STD', 'Vitamins'];

const OffersHub = () => {
  const [activeType, setActiveType] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    const params = {
      type: activeType,
      category: activeCategory
    };
    const res = await offersAPI.getOffers(params);
    if (res.ok) {
      setOffers(res.data);
    }
    setLoading(false);
  }, [activeType, activeCategory]);

  const handleAddToCart = (offer, uniqueId) => {
    addToCart({
      id: uniqueId,
      title: offer.title,
      category: offer.offer_type + ' Deal',
      price: parseFloat(offer.discounted_price),
      sampleType: 'Package',
      turnaround: 'Multiple',
    });
    setAddedId(uniqueId);
    setTimeout(() => setAddedId(null), 1500);
  };

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Handled by API
  const filteredOffers = offers;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText("Take charge of your health this week with MusB Diagnostics! Get huge discounts on complete health panels. 🩺✨ #Health #Wellness #MusBDiagnostics");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="offers-page fade-in">
      {/* Header */}
      <div className="offers-header-banner">
        <h1 className="offers-title">Exclusive Health Offers</h1>
        <p className="offers-subtitle">Premium diagnostic packages tailored for your well-being at unbeatable prices.</p>
      </div>

      {/* Section A: Filters */}
      <section className="offers-filters glass-panel">
        <div className="filter-group">
          <label className="filter-label"><Filter size={16}/> Filter by Type</label>
          <div className="pill-group">
            {['All', 'Weekly', 'Monthly', 'Seasonal'].map(type => (
              <button 
                key={type} 
                className={`pill-btn ${activeType === type ? 'active' : ''}`}
                onClick={() => setActiveType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label"><Activity size={16}/> Category</label>
          <select 
            className="filter-select"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="filter-group location-group">
          <label className="filter-label"><MapPin size={16}/> Location</label>
          <div className="location-input-wrap">
            <input type="text" placeholder="Zip or City..." className="filter-input"/>
            <button className="btn btn-outline btn-sm">Near Me</button>
          </div>
        </div>
      </section>

      {/* Section B: Offer Cards */}
      <section className="offers-grid-section">
        <div className="offers-grid">
          {loading ? (
            <div className="loading-state full-width">
              <Loader2 className="animate-spin text-primary" size={48}/>
              <p>Loading offers...</p>
            </div>
          ) : filteredOffers.length > 0 ? filteredOffers.map((offer, idx) => {
            const uniqueId = `offer-${offer.id || idx}`;
            return (
              <div key={uniqueId} className="offer-card glass-panel">
                <div className={`offer-badge badge-${(offer.offer_type || 'weekly').toLowerCase()}`}>{offer.offer_type} Deal</div>
                <h3 className="offer-card-title">{offer.title}</h3>
                
                <div className="offer-price-block">
                  <span className="price-strike">${offer.original_price}</span>
                  <span className="price-new">${offer.discounted_price}</span>
                </div>
                
                <ul className="offer-includes-list">
                  {(offer.includes || []).map((item, i) => (
                    <li key={i}><CheckCircle size={14} className="text-secondary"/> {item}</li>
                  ))}
                </ul>
                
                <div className="offer-timer-wrap">
                  <Clock size={16} /> Ends in: <strong>{offer.time_left}</strong>
                </div>
                
                <div className="offer-actions-grid">
                  <button className="btn btn-primary action-btn"><Calendar size={16}/> Book Now</button>
                  <button 
                    className={`btn ${addedId === uniqueId ? 'btn-secondary' : 'btn-outline'} action-btn`}
                    onClick={() => handleAddToCart(offer, uniqueId)}
                  >
                    <ShoppingCart size={16}/> {addedId === uniqueId ? 'Added!' : 'Add to Cart'}
                  </button>
                  <button className="btn btn-light icon-btn" title="Share Offer"><Share2 size={18}/></button>
                </div>
              </div>
            );
          }) : (
            <div className="no-offers">
               <p>No offers found for the selected criteria. Try adjusting your filters.</p>
               <button className="btn btn-primary" onClick={() => { setActiveType('All'); setActiveCategory('All'); }}>Reset Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* Section C: Offer Share Kit */}
      <section className="share-kit-section">
        <div className="share-kit-container glass-panel">
          <div className="share-kit-header">
            <h2><Share2 size={24}/> Offer Share Kit</h2>
            <p>Help your friends and family save on essential health tests. Share our latest deals!</p>
          </div>
          
          <div className="share-kit-content">
            <div className="share-preview">
              <div className="preview-image-placeholder">
                <ImageIcon size={48} className="text-muted"/>
                <span>Weekly Promo Image</span>
              </div>
              <button className="btn btn-outline btn-full mt-3"><Download size={16}/> Download Image</button>
            </div>
            
            <div className="share-text-box">
              <label>Promo Caption</label>
              <div className="caption-box">
                <p>Take charge of your health this week with MusB Diagnostics! Get huge discounts on complete health panels. 🩺✨ #Health #Wellness #MusBDiagnostics</p>
              </div>
              <div className="share-kit-actions">
                <button 
                  className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} 
                  onClick={handleCopyCaption}
                >
                  {copied ? <><Check size={16}/> Copied!</> : <><Copy size={16}/> Copy Caption</>}
                </button>
                <div className="social-links">
                  <span className="social-label">Share link:</span>
                  <button className="social-btn face-btn">f</button>
                  <button className="social-btn x-btn">𝕏</button>
                  <button className="social-btn in-btn">in</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OffersHub;