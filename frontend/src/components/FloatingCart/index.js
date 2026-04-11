import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './FloatingCart.css';

const FloatingCart = () => {
  const { cartCount } = useCart();
  const location = useLocation();

  // Only show cart on catalog and offers pages
  const visibleRoutes = ['/test-catalog', '/tests', '/self-pay-lab-tests', '/offers'];
  const isVisible = visibleRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));

  if (!isVisible) {
    return null;
  }

  return (
    <Link to="/cart" className="floating-cart-btn fade-in" aria-label="View Cart">
      <ShoppingCart className="floating-cart-icon" />
      {cartCount > 0 && <span className="floating-cart-badge">{cartCount}</span>}
    </Link>
  );
};

export default FloatingCart;
