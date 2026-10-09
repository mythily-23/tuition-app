import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Payments from './pages/Payments';
import Teachers from './pages/Teachers';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ApiContext = React.createContext();

function AppContent({ user, onLogout, apiClient }) {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Students', path: '/students', icon: '👨‍🎓' },
    { label: 'Subjects', path: '/subjects', icon: '📚' },
    { label: 'Payments', path: '/payments', icon: '💰' },
    { label: 'Teachers', path: '/teachers', icon: '👨‍🏫' },
    { label: 'Reports', path: '/reports', icon: '📈' },
  ];

  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} currentPath={location.pathname} user={user} onLogout={onLogout} />
      <main className="main-content flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    }
  }, [token]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const apiClient = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!token) {
    return <Login onLogin={login} />;
  }

  return (
    <ApiContext.Provider value={apiClient}>
      <BrowserRouter>
        <AppContent user={user} onLogout={logout} apiClient={apiClient} />
      </BrowserRouter>
    </ApiContext.Provider>
  );
}

export default App;
