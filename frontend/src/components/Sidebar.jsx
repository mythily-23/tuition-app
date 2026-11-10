import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ menuItems, currentPath, user, onLogout }) {
  const isActive = (path) => currentPath === path;

  return (
    <>
      {/* Desktop sidebar (hidden on phones) */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="text-3xl">📚</div>
          <div className="sidebar-brand-name">Tuition Pro</div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.name || user?.username}</div>
          <button onClick={onLogout} className="sidebar-logout">Logout</button>
        </div>
      </aside>

      {/* Phone top bar (hidden on desktop) */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-title">📚 Tuition Pro</div>
        <button onClick={onLogout} className="mobile-logout">Logout</button>
      </header>

      {/* Phone bottom navigation (hidden on desktop) */}
      <nav className="mobile-bottom-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}