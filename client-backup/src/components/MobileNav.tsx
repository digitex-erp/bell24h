import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaBell, FaUser, FaList } from 'react-icons/fa';
import './MobileNav.css';

const navLinks = [
  { to: '/', label: 'Home', icon: <FaHome /> },
  { to: '/rfq', label: 'RFQs', icon: <FaList /> },
  { to: '/notifications', label: 'Alerts', icon: <FaBell /> },
  { to: '/profile', label: 'Profile', icon: <FaUser /> },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="mobile-nav">
      <button
        className="mobile-nav__toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`mobile-nav__drawer${open ? ' open' : ''}`}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setOpen(false)}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mobile-nav__bottom">
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} className="mobile-nav__bottom-link">
            {link.icon}
            <span className="sr-only">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
