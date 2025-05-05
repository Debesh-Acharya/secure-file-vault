import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const InputField = ({ id, type = 'text', value, onChange, required, placeholder, icon }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          {icon}
        </div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border-b border-gray-700 bg-gray-900/50 text-gray-100 text-sm rounded-lg 
          focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 backdrop-blur-sm"
        />
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/login', { email, password });
      const token = res.data.data.accessToken;
      localStorage.setItem('token', token);
      dispatch(loginUser(res.data.data.user));
      navigate('/dashboard'); // or wherever your home page is
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue your journey</p>
        </div>
        
        <form 
          onSubmit={handleLogin} 
          className="w-full bg-gray-800/30 backdrop-blur-md rounded-xl shadow-xl p-8 border border-gray-700/50"
        >
          <InputField
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            icon={<Mail size={16} />}
          />
          
          <InputField
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            icon={<Lock size={16} />}
          />

          {error && (
            <div className="py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 flex items-center justify-center text-white bg-indigo-600 rounded-lg
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              focus:ring-offset-gray-900 transition-all duration-200 ease-in-out font-medium
              disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account yet? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;