import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, User, Mail, Lock } from 'lucide-react';
import { registerUser } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const InputField = ({ id, label, type = 'text', value, onChange, required, error, icon }) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-2 tracking-wider uppercase">
        {label}
      </label>
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
          className={`w-full pl-10 pr-4 py-3 border-b ${
            error ? 'border-red-400' : 'border-gray-700'
          } bg-gray-900/50 text-gray-100 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 
          focus:border-indigo-500 transition-all duration-200 backdrop-blur-sm`}
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};

const Register = () => {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [localErrors, setLocalErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (localErrors[id]) {
      setLocalErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(registerUser(formData));
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Registered successfully:', user);
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Join us to get started with your journey</p>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="w-full bg-gray-800/30 backdrop-blur-md rounded-xl shadow-xl p-8 border border-gray-700/50"
        >
          <InputField
            id="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            required
            error={localErrors.username}
            icon={<User size={16} />}
          />
          
          <InputField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={localErrors.email}
            icon={<Mail size={16} />}
          />
          
          <InputField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            error={localErrors.password}
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
            <span>{loading ? 'Creating account...' : 'Create account'}</span>
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;