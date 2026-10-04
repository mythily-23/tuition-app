import React, { useState, useContext } from 'react';
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
        setError('Account created! Please login.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">📚 Tuition Pro</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your name"
                required={isSignup}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-blue-600 hover:underline text-sm"
          >
            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign up'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Demo credentials: username: demo | password: demo
        </p>
      </div>
    </div>
  );
}
