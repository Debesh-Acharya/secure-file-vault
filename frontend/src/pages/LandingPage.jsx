import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CloudUpload, Download, Trash2 } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group">
      <div className="rounded-full bg-indigo-500/10 p-3 w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

const AnimatedBackground = () => { 
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl"></div>
    </div>
  );
};

const LandingPage = () => {
  const [animateHero, setAnimateHero] = useState(false);
  
  useEffect(() => {
    // Trigger animations after a short delay
    setTimeout(() => setAnimateHero(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield size={24} className="text-indigo-400" />
          <span className="font-bold text-xl tracking-tight">FileVault</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            Register
          </Link>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className={`transform transition-all duration-1000 ${
              animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-light mb-6">
              Secure your files with <span className="text-indigo-400 font-normal">FileVault</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              A private, secure storage solution for all your important documents, 
              built with security and simplicity in mind.
            </p>
          </div>
          
          <div 
            className={`flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 transform transition-all duration-1000 delay-300 ${
              animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <Link 
              to="/register" 
              className="px-8 py-4 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all font-medium flex items-center justify-center"
            >
              Get Started
              <FileText className="ml-2" size={18} />
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700 hover:bg-gray-700/70 transition-all font-medium flex items-center justify-center"
            >
              Sign In
              <Lock className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative z-10 bg-gray-900/50 backdrop-blur-md py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-12">Everything you need to manage your files</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<CloudUpload className="text-indigo-400" size={24} />}
              title="Easy Upload"
              description="Quickly upload your files with our intuitive interface. Support for multiple file types and batch uploads."
            />
            <FeatureCard
              icon={<Lock className="text-indigo-400" size={24} />}
              title="Bank-Level Security"
              description="Your files are encrypted end-to-end, ensuring only you have access to your sensitive information."
            />
            <FeatureCard
              icon={<Download className="text-indigo-400" size={24} />}
              title="Fast Downloads"
              description="Access and download your files from anywhere, anytime with our high-speed servers."
            />
            <FeatureCard
              icon={<Shield className="text-indigo-400" size={24} />}
              title="Privacy First"
              description="We don't mine your data or track your usage. Your privacy is our priority."
            />
            <FeatureCard
              icon={<FileText className="text-indigo-400" size={24} />}
              title="File Management"
              description="Organize, search, and manage your files with ease through our clean, minimal interface."
            />
            <FeatureCard
              icon={<Trash2 className="text-indigo-400" size={24} />}
              title="Easy Cleanup"
              description="Remove files you no longer need with a single click. Your storage, your control."
            />
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="relative z-10 container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-light mb-6">Ready to secure your files?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users who trust FileVault with their important documents.
          </p>
          <Link 
            to="/register" 
            className="inline-block px-8 py-4 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            Create your vault now
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} FileVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;