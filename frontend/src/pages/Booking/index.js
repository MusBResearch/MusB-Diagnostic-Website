import React, { useState, useEffect } from 'react';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { bookingsAPI, catalogAPI } from '../../services/api';
import './Booking.css';

const Booking = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    testId: '',
    date: '',
    timeSlot: '',
    visitType: 'home',
    address: ''
  });

  useEffect(() => {
    const fetchTests = async () => {
      const res = await catalogAPI.getTests();
      if (res.ok) setTests(res.data);
    };
    fetchTests();
    
    // Check if test ID is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('test');
    if (testId) {
      setFormData(prev => ({ ...prev, testId }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await bookingsAPI.createBooking(formData);
    setLoading(false);
    if (res.ok) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      alert("Failed to confirm booking. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="section fade-in">
      <div className="catalog-header">
        <h1 className="section-title">Book an Appointment</h1>
        <p>Schedule your diagnostic test or home collection at your convenience.</p>
      </div>

      <div className="booking-container">
        {submitted ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--secondary)' }}>
            <CalendarCheck size={64} color="var(--secondary)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Booking Confirmed!</h2>
            <p>Your appointment request has been received. Our team will contact you shortly to confirm the details.</p>
          </div>
        ) : (
          <form className="booking-form glass" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required 
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  required 
                  placeholder="+1 234 567 890" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email"
                required 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Test or Package</label>
              <select 
                name="testId" 
                required 
                value={formData.testId}
                onChange={handleChange}
              >
                <option value="">-- Choose a Test --</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>{test.title} - ${test.price}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input 
                  type="date" 
                  name="date"
                  required 
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Area</label>
                <select 
                  name="timeSlot" 
                  required 
                  value={formData.timeSlot}
                  onChange={handleChange}
                >
                  <option value="">-- Choose Time --</option>
                  <option value="morning">Morning (8 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>

            {formData.visitType === 'home' && (
              <div className="form-group slide-down">
                <label className="form-label">Collection Address</label>
                <input 
                  type="text" 
                  name="address"
                  required 
                  placeholder="Street, Apartment, City, Zip Code" 
                  value={formData.address}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500 mt-1">Our specialist will arrive within 5 miles of this location.</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Visit Type</label>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="visitType" 
                    value="home" 
                    checked={formData.visitType === 'home'}
                    onChange={handleChange}
                    required 
                  /> Home Collection
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="visitType" 
                    value="lab" 
                    checked={formData.visitType === 'lab'}
                    onChange={handleChange}
                    required 
                  /> Lab Visit
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin inline mr-2" size={18}/> : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Booking;
