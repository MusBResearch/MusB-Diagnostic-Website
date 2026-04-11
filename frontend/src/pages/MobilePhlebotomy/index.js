import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, ArrowRight, ShieldCheck, 
  MapPin, Phone, Droplets, Lock, X, CheckCircle, Loader2
} from 'lucide-react';
import './MobilePhlebotomy.css';
import PhlebotomistLogin from './Login.js';
import api from '../../api/api';

const MobilePhlebotomy = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    alt_phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get('/api/superadmin/catalog/tests/');
        setTests(res.data.slice(0, 6)); // Just show top 6 for the field page
      } catch (err) {
        console.error("Failed to fetch tests", err);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  const steps = [
    { title: 'Online Request', desc: 'Book your collection through our secure portal or call center.' },
    { title: 'Logistics Sync', desc: 'Our team confirms your location (Home/Office) and ETA.' },
    { title: 'Professional Collection', desc: 'A certified phlebotomist arrives with specialized cold-chain kits.' },
    { title: 'Secure Transport', desc: 'Samples are stabilized and rushed to the central laboratory.' },
    { title: 'Digital Results', desc: 'Access your research-grade results via the secure patient/facility portal.' }
  ];

  const handleBookClick = (test) => {
    setSelectedTest(test);
    setIsBookingOpen(true);
    setBookingStatus('idle');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    try {
      await api.post('/api/bookings/', {
        ...formData,
        test_id: selectedTest.id,
        visit_type: 'home'
      });
      setBookingStatus('success');
      setTimeout(() => {
        setIsBookingOpen(false);
        setFormData({ fullName: '', phone: '', alt_phone: '', address: '' });
      }, 3000);
    } catch (err) {
      alert("Booking failed. Please ensure all fields are filled.");
      setBookingStatus('idle');
    }
  };

  return (
    <div className="phlebotomy-page fade-in">
      {/* Hero Section */}
      <section className="phleb-hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <motion.div 
          className="phleb-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge-phleb">Precision Field Collections</div>
          <h1 className="phleb-hero-title">
            Laboratory Access, <br />
            <span>Delivered to Your Door.</span>
          </h1>
          <p className="phleb-hero-subtitle">
            Experience the gold standard of mobile blood collections. We bring the clinic to your home, office, or facility with absolute cold-chain integrity.
          </p>
          <div className="hero-actions">
            <a href="#test-selection" className="btn btn-primary btn-lg">Schedule Collection</a>
            <button 
              className="btn btn-outline-white btn-lg flex items-center gap-2"
              onClick={() => setIsLoginOpen(true)}
            >
              <Lock size={18} /> Phlebotomist Login
            </button>
          </div>
        </motion.div>
      </section>

      {/* Service Stats */}
      <section className="phleb-stats glass">
        <div className="stats-container">
          <div className="stat-item">
            <h3>45+</h3>
            <p>Certified Phlebotomists</p>
          </div>
          <div className="stat-item">
            <h3>2k+</h3>
            <p>Monthly Home Collections</p>
          </div>
          <div className="stat-item">
            <h3>99.8%</h3>
            <p>Sample Integrity Rate</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Logistics Monitoring</p>
          </div>
        </div>
      </section>

      {/* Test Selection Section */}
      <section id="test-selection" className="tests-grid-section">
        <div className="section-header">
          <h2 className="section-title">Select Your Test</h2>
          <p className="section-subtitle">Choose from our most popular mobile collection panels. Research-grade accuracy in the comfort of your home.</p>
        </div>

        {loadingTests ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="test-phleb-grid">
            {tests.map(test => (
              <motion.div 
                key={test.id} 
                className="test-phleb-card glass"
                whileHover={{ y: -5 }}
              >
                <h3>{test.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{test.description || 'Comprehensive clinical analysis.'}</p>
                <div className="test-phleb-price">${parseFloat(test.price).toFixed(2)}</div>
                <button 
                  className="btn btn-primary w-full"
                  onClick={() => handleBookClick(test)}
                >
                  Book Now
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {/* Booking Modal via Portal for absolute viewport positioning */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isBookingOpen && (
            <motion.div 
              key="booking-modal-overlay"
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsBookingOpen(false);
              }}
              style={{ zIndex: 999999 }}
            >
              <motion.div 
                key="booking-modal-card"
                className="booking-modal-content"
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setIsBookingOpen(false)}>
                  <X size={20} />
                </button>

                {bookingStatus === 'success' ? (
                  <div className="booking-success-anim">
                    <CheckCircle size={80} className="text-emerald-500 mx-auto mb-6" />
                    <h2>Booking Received!</h2>
                    <p className="text-slate-600">Our medical logistics team will review your request and assign a specialist shortly.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black mb-2">Book Field Collection</h2>
                    <p className="text-slate-500 font-bold mb-6">Test: {selectedTest?.title}</p>
                    
                    <form onSubmit={handleSubmit} className="booking-form-grid">
                      <div className="form-field">
                        <label>Full Patient Name <span>*</span></label>
                        <input 
                          type="text" 
                          name="fullName" 
                          required 
                          placeholder="e.g. John Doe"
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-field">
                        <label>Primary Phone Number <span>*</span></label>
                        <input 
                          type="tel" 
                          name="phone" 
                          required 
                          placeholder="e.g. +1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-field">
                        <label>Alternative Phone Number <span>*</span></label>
                        <input 
                          type="tel" 
                          name="alt_phone" 
                          required 
                          placeholder="Emergency / Alternate contact"
                          value={formData.alt_phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-field">
                        <label>Collection Address <span>*</span></label>
                        <textarea 
                          name="address" 
                          required 
                          rows="3"
                          placeholder="Street, Suite, City, State, ZIP"
                          value={formData.address}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg w-full mt-4 flex items-center justify-center gap-2"
                        disabled={bookingStatus === 'submitting'}
                      >
                        {bookingStatus === 'submitting' ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <><ArrowRight size={20}/> Confirm Booking</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* How It Works - High Fidelity Timeline */}
      <section id="how-it-works" className="timeline-section">
        <div className="section-header text-center">
          <h2 className="section-title">What to Expect</h2>
          <p className="section-subtitle">A seamless process designed for your comfort and safety.</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              className={`timeline-item ${idx % 2 === 0 ? 'left' : 'right'}`}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <div className="timeline-dot">
                <div className="inner-dot"></div>
              </div>
              <div className="timeline-card glass">
                <div className="phleb-step-number">0{idx + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Specialized Solutions */}
      <section className="solutions-section bg-light-alt">
        <div className="container">
          <div className="solutions-grid">
            <div className="solution-text">
              <h2 className="section-title text-center">Solutions for Every Need</h2>
              <p className="mb-5">We go beyond simple blood draws, offering specialized logistics for complex clinical requirements.</p>
              
              <div className="solution-list">
                <div className="sol-item glass">
                  <Truck size={24} className="text-secondary" />
                  <div>
                    <h4>Cold-Chain Mastery</h4>
                    <p>Validated transport for temperature-sensitive specimens (Frozen/Refrigerated).</p>
                  </div>
                </div>
                <div className="sol-item glass">
                  <ShieldCheck size={24} className="text-secondary" />
                  <div>
                    <h4>Compliance Driven</h4>
                    <p>Total HIPAA and OSHA compliance for onsite corporate testing events.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="solution-visual">
              <div className="visual-card glass">
                <Droplets size={48} className="text-secondary mb-4" />
                <h3>Ready for Action?</h3>
                <p>Our mobile teams are on standby to support your wellness journey or research project.</p>
                <div className="mt-8 flex gap-4">
                  <Phone size={20} /> <span>(800) 555-MUSB</span>
                </div>
                <div className="mt-4 flex gap-4">
                  <MapPin size={20} /> <span>NY • NJ • CT Metro Area</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="phleb-cta">
        <div className="cta-wrapper glass">
          <h2>Bring the Lab to You Today</h2>
          <p>Professional, convenient, and reliable collections at your location.</p>
          <a href="#test-selection" className="btn btn-primary btn-lg mt-4 inline-flex items-center gap-2">
            Book Appointment <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <AnimatePresence>
        {isLoginOpen && (
          <PhlebotomistLogin 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobilePhlebotomy;
