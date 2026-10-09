import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/auth/register' : '/auth/login';
      const data = isSignup 
        ? { username, password, name }
        : { username, password };

      const response = await axios.post(`${API_URL}${endpoint}`, data);
      
      if (isSignup) {
        setIsSignup(false);
        setUsername('');
        setPassword('');
        setName('');
        setError('✅ Account created! Please login.');
      } else {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-4xl font-bold text-gray-900">Tuition Pro</h1>
          <p className="text-sm text-gray-600 mt-2">Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your full name"
                required={isSignup}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className={`text-sm p-3 rounded-lg ${error.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full text-lg font-semibold py-3"
          >
            {loading ? '⏳ Loading...' : (isSignup ? '✨ Create Account' : '🔓 Login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-3">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setName('');
              setUsername('');
              setPassword('');
            }}
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            {isSignup ? '← Login instead' : 'Sign up here →'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600 font-medium mb-2">💡 Demo Credentials:</p>
          <p className="text-xs text-gray-700">Username: <span className="font-mono">demo</span></p>
          <p className="text-xs text-gray-700">Password: <span className="font-mono">demo</span></p>
        </div>
      </div>
    </div>
  );
}
