import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ menuItems, currentPath, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="p-6 border-b border-purple-700">
        <div className="text-2xl font-bold mb-2">📚</div>
        <h1 className="text-xl font-bold">Tuition Pro</h1>
        <p className="text-xs text-purple-300 mt-1">Management System</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${currentPath === item.path ? 'active' : ''}`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700">
        <div className="mb-4 pb-4 border-b border-purple-700">
          <p className="text-xs text-purple-300">Logged in as</p>
          <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
