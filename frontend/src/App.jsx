import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './features/auth/authSlice'; // Adjust path if needed
import api from './api';

// Import pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Token is already handled in api.js interceptors
      // Just fetch the user data
      const fetchUser = async () => {
        try {
          const res = await api.get('/me'); // Adjust endpoint as needed
          if (res.data && res.data.data) {
            dispatch(loginUser(res.data.data));
          }
        } catch (error) {
          // If token is invalid, clear it
          localStorage.removeItem('token');
        }
      };
      
      fetchUser();
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes - Add your dashboard component when ready */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-white text-2xl">Dashboard Coming Soon</div>
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;