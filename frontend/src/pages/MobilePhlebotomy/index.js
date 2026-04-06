import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, ArrowRight, ShieldCheck, 
  MapPin, Phone, Droplets, Lock
} from 'lucide-react';
import './MobilePhlebotomy.css';
import PhlebotomistLogin from './Login.js';

const MobilePhlebotomy = () => {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  const steps = [
    { title: 'Online Request', desc: 'Book your collection through our secure portal or call center.' },
    { title: 'Logistics Sync', desc: 'Our team confirms your location (Home/Office) and ETA.' },
    { title: 'Professional Collection', desc: 'A certified phlebotomist arrives with specialized cold-chain kits.' },
    { title: 'Secure Transport', desc: 'Samples are stabilized and rushed to the central laboratory.' },
    { title: 'Digital Results', desc: 'Access your research-grade results via the secure patient/facility portal.' }
  ];

  return (
    <div className="phlebotomy-page fade-in">
      {/* Hero Section */}
      <section className="phleb-hero">
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
            <button className="btn btn-primary btn-lg">Schedule Collection</button>
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
                <div className="step-number">0{idx + 1}</div>
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
          <button className="btn btn-primary btn-lg mt-4">
            Book Appointment <ArrowRight size={20} />
          </button>
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
