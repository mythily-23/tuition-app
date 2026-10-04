import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold">📚 Tuition Pro</Link>
            <div className="flex gap-6">
              <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded transition">Dashboard</Link>
              <Link to="/students" className="hover:bg-blue-700 px-3 py-2 rounded transition">Students</Link>
              <Link to="/payments" className="hover:bg-blue-700 px-3 py-2 rounded transition">Payments</Link>
              <Link to="/teachers" className="hover:bg-blue-700 px-3 py-2 rounded transition">Teachers</Link>
              <Link to="/reports" className="hover:bg-blue-700 px-3 py-2 rounded transition">Reports</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.name || 'Admin'}</span>
            <button 
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
