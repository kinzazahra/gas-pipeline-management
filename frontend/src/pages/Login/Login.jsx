import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HardHat, User, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('employee'); // Default role
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
      
      // We now use the selectedRole from our toggle!
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : { ...formData, role: selectedRole };

      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, payload);
      
      localStorage.setItem('pipelineToken', response.data.token);
      localStorage.setItem('pipelineRole', response.data.role);

      // Redirect based on the role returned by the server
      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
      
      window.location.reload(); 

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-lg shadow-blue-200">
            <HardHat className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Pipeline Co.</h2>
          <p className="text-slate-500 font-medium mt-1">
            {isLogin ? 'Sign in to your portal' : 'Create a new account'}
          </p>
        </div>

        {/* ROLE SELECTOR BUTTONS */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => setSelectedRole('employee')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedRole === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={16} /> Employee
          </button>
          <button 
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedRole === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Full Name</label>
              <input 
                type="text" name="name" required={!isLogin} onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email Address</label>
            <input 
              type="email" name="email" required onChange={handleInputChange}
              placeholder="name@company.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
            <input 
              type="password" name="password" required onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all" 
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2">
            {isLogin ? `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline ml-1">
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;