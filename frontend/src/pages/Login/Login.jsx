import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HardHat, User, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('employee'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : { ...formData, role: selectedRole };

      // Consistently use localhost to avoid auth handshake issues
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      // Extract data safely from various possible backend structures
      const data = response.data;
      const user = data.user || data; // Handles if backend wraps user in an object or sends it flat

      // --- PERSISTENCE LAYER ---
      localStorage.setItem('pipelineToken', data.token);
      
      // Determine the role (Essential for App.jsx routing)
      const role = user.role || data.role;
      localStorage.setItem('pipelineRole', role);
      
      // Save ID and Name for Dashboard filtering and Personalization
      const userId = user.id || user._id || data.id;
      const userName = user.name || data.name;
      
      localStorage.setItem('pipelineUserId', userId);
      localStorage.setItem('pipelineUserName', userName);

      console.log("Login Successful. Role:", role, "User ID:", userId);

      // --- REDIRECT LOGIC ---
      if (role === 'admin') {
        navigate('/admin');
      } else {
        // This covers both 'manager' and 'employee' roles
        navigate('/employee');
      }
      
      // Force refresh to update the Navbar and Auth states immediately
      window.location.reload(); 

    } catch (err) {
      console.error("Login Error Details:", err.response?.data);
      setError(err.response?.data?.message || 'Authorization failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-lg shadow-blue-200">
            <HardHat className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight text-center uppercase">Pipeline Portal</h2>
          <p className="text-slate-500 font-bold mt-1 text-sm opacity-70">
            {isLogin ? 'AUTHENTICATE PERSONNEL' : 'REGISTER NEW OPERATIVE'}
          </p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
          <button 
            type="button"
            onClick={() => setSelectedRole('employee')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedRole === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User size={14} /> Field Staff
          </button>
          <button 
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${selectedRole === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={14} /> Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-[10px] text-center font-black border border-red-100 uppercase tracking-tighter">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Identity</label>
              <input 
                type="text" name="name" required={!isLogin} onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-sm" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Identity</label>
            <input 
              type="email" name="email" required onChange={handleInputChange}
              placeholder="worker@pipeline.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-sm" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Security Keyphrase</label>
            <input 
              type="password" name="password" required onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-sm" 
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2 text-xs">
            {isLogin ? `Authorize Access` : `Complete Registration`}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-slate-400 font-bold uppercase tracking-tight">
          {isLogin ? "New to the workforce? " : "Already registered? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline ml-1">
            {isLogin ? 'Create Account' : 'Back to Login'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;