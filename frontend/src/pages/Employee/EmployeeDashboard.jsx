import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HardHat, Activity, CheckCircle2, Clock, RefreshCcw, UserCircle, Calendar } from 'lucide-react';

const EmployeeDashboard = () => {
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get user info from localStorage
  const userRole = localStorage.getItem('pipelineRole');
  const userId = localStorage.getItem('pipelineUserId');
  const userName = localStorage.getItem('pipelineUserName') || 'Site Manager';

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      // Added cache-busting timestamp to ensure fresh data after Admin edits
      const res = await axios.get(`http://localhost:5000/api/projects/all?t=${Date.now()}`);
      
      console.log("Logged-in ID from LocalStorage:", userId);

      if (userRole === 'manager' && userId) {
        const myWork = res.data.filter(p => {
          // Check for ID in multiple possible locations (populated object or raw string)
          const projectManagerId = p.projectManager?._id || p.projectManager;
          
          return String(projectManagerId) === String(userId);
        });
        
        setAssignedProjects(myWork);
      } else {
        setAssignedProjects(res.data);
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setAssignedProjects([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (userId) {
      fetchMyProjects(); 
    } else {
      setLoading(false);
    }
  }, [userId]);

  const updateProgress = async (id, newProgress) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/update/${id}`, {
        progressPercentage: newProgress
      });
      setAssignedProjects(prev => 
        prev.map(p => p._id === id ? { ...p, progressPercentage: newProgress } : p)
      );
    } catch (err) {
      console.error("Progress update failed");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/update/${id}`, {
        status: newStatus
      });
      fetchMyProjects(); 
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <RefreshCcw className="animate-spin text-orange-500 mb-4" size={40} />
      <span className="font-bold text-slate-500 tracking-widest uppercase text-xs">Accessing Field Records...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      {/* Personalized Welcome Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 capitalize">
            <UserCircle className="text-orange-500" /> Welcome, {userName}
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic text-sm text-transform: capitalize">
            Site Authority Level: {userRole}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Status</div>
          <div className="text-green-600 font-bold flex items-center gap-1 justify-end">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div> Live Connection
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedProjects.length > 0 ? assignedProjects.map((project) => (
          <div key={project._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800 text-lg">{project.title}</h3>
                <select 
                  value={project.status}
                  onChange={(e) => updateStatus(project._id, e.target.value)}
                  className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded uppercase border border-orange-100 cursor-pointer outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Testing">Testing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>

              {/* Added Timeline Section to show Admin Edits */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400"/>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Start</p>
                    <p className="text-[10px] font-bold text-slate-600">
                      {project.timeline?.startDate ? new Date(project.timeline.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Deadline</p>
                    <p className="text-[10px] font-bold text-red-600">
                      {project.timeline?.deadline ? new Date(project.timeline.deadline).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 font-sans">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Completion Progress</span>
                  <span className="text-blue-600 font-black">{project.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${project.progressPercentage}%` }}
                  ></div>
                </div>
                {userRole === 'manager' && (
                  <input 
                    type="range" 
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    value={project.progressPercentage}
                    onChange={(e) => updateProgress(project._id, e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-around text-slate-400">
              <button className="hover:text-blue-600 flex items-center gap-1 text-xs font-bold"><Activity size={14}/> Stats</button>
              <button className="hover:text-green-600 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={14}/> Report</button>
              <button className="hover:text-orange-600 flex items-center gap-1 text-xs font-bold" onClick={fetchMyProjects}><Clock size={14}/> Refresh</button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 font-sans">
             <p className="text-slate-400 font-medium tracking-tight">No projects assigned to your command ID ({userId || 'Not Found'}).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;