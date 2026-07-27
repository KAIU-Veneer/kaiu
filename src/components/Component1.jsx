import React from 'react';
import { Link } from 'react-router-dom';
import './Component1.css';

/** Header nav link — ink text, warm-brown on hover/active. */
export default function Component1({ children, active = false, to = '/', onClick }) {
  return (
    <Link to={to} className={`nav-link${active ? ' active' : ''}`} onClick={onClick}>
      {children}
    </Link>
  );
}
