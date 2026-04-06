import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop/index.js';
import Navbar from './components/Navbar/index.js';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home/index.js';
import TestCatalog from './pages/TestCatalog/index.js';
import Booking from './pages/Booking/index.js';
import OffersHub from './pages/OffersHub/index.js';
import EmployerHub from './pages/EmployerHub/index.js';
import ResearchCentralLab from './pages/ResearchCentralLab/index.js';
import ResearchLogin from './pages/ResearchPortal/Login.js';
import ResearchDashboard from './pages/ResearchPortal/Dashboard.js';
import Cart from './pages/Cart/index.js';
import PlaceholderPage from './pages/PlaceholderPage/index.js';
import FloatingCart from './components/FloatingCart/index.js';
import Footer from './components/Footer/index.js';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import EmployerDashboard from './pages/EmployerDashboard/index.js';
import ProtectedRoute from './components/ProtectedRoute/index.js';
import SuperAdminLayout from './components/Admin/SuperAdminLayout.js';
import SuperAdminRoute from './components/ProtectedRoute/SuperAdminRoute.js';
import SuperAdminLogin from './pages/SuperAdmin/Login.js';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard.js';
import EmployeeEnrollment from './pages/EmployeeEnrollment/index.js';
import MobilePhlebotomy from './pages/MobilePhlebotomy/index.js';
import AssistedLiving from './pages/AssistedLiving/index.js';
import CommunityPrograms from './pages/CommunityPrograms/index.js';
import PhysicianPortal from './pages/PhysicianPortal/index.js';
import EarlyDiagnostics from './pages/EarlyDiagnostics/index.js';
import PhlebotomistDashboard from './pages/MobilePhlebotomy/Dashboard.js';
import PhlebotomistLogin from './pages/MobilePhlebotomy/Login.js';

// Layout component for public-facing site
const PublicLayout = ({ children }) => (
  <div className="app-container">
    <Navbar />
    <main>
      {children}
    </main>
    <Footer />
    <FloatingCart />
  </div>
);

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              {/* Super Admin Routes (Separate Layout) */}
              <Route path="/superadmin/login" element={<SuperAdminLogin />} />
              <Route path="/superadmin" element={
                <SuperAdminRoute>
                  <SuperAdminLayout />
                </SuperAdminRoute>
              }>
                <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="identity" element={<PlaceholderPage title="Identity & Access" />} />
                <Route path="cms" element={<PlaceholderPage title="Website/CMS Oversight" />} />
                <Route path="commerce" element={<PlaceholderPage title="Commerce Management" />} />
                <Route path="offers" element={<PlaceholderPage title="Offers Engine" />} />
                <Route path="appointments" element={<PlaceholderPage title="Appointments & Routing" />} />
                <Route path="integrations" element={<PlaceholderPage title="Integrations" />} />
                <Route path="crm" element={<PlaceholderPage title="CRM & Marketing" />} />
                <Route path="portals" element={<PlaceholderPage title="Portals Management" />} />
                <Route path="activity-log" element={<PlaceholderPage title="System Activity Log" />} />
              </Route>
              {/* Public & Employer Routes (Shared Layout) */}
              {/* Portal Routes (Clean Layout - No Global Navbar) */}
              <Route path="/portal/employer" element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/portal/research/login" element={<ResearchLogin />} />
              <Route path="/portal/research/*" element={<ResearchDashboard />} />
              <Route path="/portal/phlebotomist/login" element={<PhlebotomistLogin isOpen={true} onClose={() => window.location.href='/mobile-phlebotomy'} />} />
              <Route path="/portal/phlebotomist/dashboard" element={<PhlebotomistDashboard />} />
              <Route path="/enroll/:token" element={<EmployeeEnrollment />} />
              {/* Public Site Routes (Shared Layout with Navbar/Footer) */}
              <Route path="*" element={
                <PublicLayout>
                  <Routes>
                    {/* Existing Core Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/tests" element={<TestCatalog />} />
                    <Route path="/test-catalog" element={<TestCatalog />} />
                    <Route path="/book" element={<Booking />} />
                    <Route path="/offers" element={<OffersHub />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/employer-health-program" element={<EmployerHub />} />
                    {/* Top Level SEO Routes */}
                    <Route path="/about" element={<PlaceholderPage />} />
                    <Route path="/contact" element={<PlaceholderPage />} />
                    <Route path="/locations" element={<PlaceholderPage />} />
                    <Route path="/panels" element={<PlaceholderPage />} />
                    <Route path="/pricing" element={<PlaceholderPage />} />
                    <Route path="/blog" element={<PlaceholderPage />} />
                    <Route path="/login" element={<PlaceholderPage />} />
                    {/* Other Portals (Placeholders) */}
                    <Route path="/portal/customer" element={<PlaceholderPage />} />
                    <Route path="/portal/physician" element={<PlaceholderPage />} />
                    <Route path="/portal/facility" element={<PlaceholderPage />} />
                    <Route path="/portal/biomarker" element={<PlaceholderPage />} />
                    <Route path="/portal/affiliate" element={<PlaceholderPage />} />
                    <Route path="/portal/staff" element={<PlaceholderPage />} />
                    <Route path="/research-central-lab" element={<ResearchCentralLab />} />
                    <Route path="/mobile-phlebotomy" element={<MobilePhlebotomy />} />
                    <Route path="/assisted-living-testing" element={<AssistedLiving />} />
                    <Route path="/community-programs" element={<CommunityPrograms />} />
                    <Route path="/physicians" element={<PhysicianPortal />} />
                    <Route path="/early-diagnostics" element={<EarlyDiagnostics />} />
                    <Route path="/self-pay-lab-tests" element={<TestCatalog />} />
                    
                    {/* Fallback 404 Route */}
                    <Route path="*" element={<PlaceholderPage />} />
                  </Routes>
                </PublicLayout>
              } />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
