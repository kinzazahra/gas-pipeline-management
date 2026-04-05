import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ShieldCheck, RefreshCcw, UserCheck, UserPlus, FolderPlus, ClipboardList, X, HardHat, Edit3, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [projectData, setProjectData] = useState({
    title: '', description: '', startDate: '', deadline: '', projectManager: ''
  });

  const fetchData = async () => {
    const timestamp = Date.now();
    setLoading(true);
    try {
      const userRes = await axios.get(`http://localhost:5000/api/admin/users?t=${timestamp}`);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      const projectRes = await axios.get(`http://localhost:5000/api/projects/all?t=${timestamp}`);
      setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', newUserData);
      setShowAddUser(false);
      setNewUserData({ name: '', email: '', password: '', role: 'employee' });
      fetchData();
      alert("Personnel added successfully!");
    } catch (err) { alert("Registration failed"); }
  };

  const handleUpdateUser = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}`, { [field]: value });
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Remove this user permanently?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
        fetchData();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("TERMINATE PROJECT? This action removes all field data for this pipeline.")) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        fetchData();
        alert("Project Terminated.");
      } catch (err) { alert("Termination failed."); }
    }
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project._id);
    setProjectData({
      title: project.title,
      description: project.description,
      startDate: project.timeline?.startDate?.split('T')[0] || '',
      deadline: project.timeline?.deadline?.split('T')[0] || '',
      projectManager: project.projectManager?._id || project.projectManager
    });
    setShowAddProject(true);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: projectData.title,
      description: projectData.description,
      projectManager: projectData.projectManager,
      timeline: { startDate: projectData.startDate, deadline: projectData.deadline }
    };

    try {
      if (editingProject) {
        await axios.put(`http://localhost:5000/api/projects/update/${editingProject}`, payload);
        alert("Project Updated.");
      } else {
        await axios.post('http://localhost:5000/api/projects/create', payload);
        alert("New Project Deployed.");
      }
      setShowAddProject(false);
      setEditingProject(null);
      setProjectData({ title: '', description: '', startDate: '', deadline: '', projectManager: '' });
      fetchData();
    } catch (err) { alert("Operation failed."); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Syncing Authority...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 font-sans">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={28} /> Admin Control Panel
          </h1>
          <p className="text-slate-500 text-sm tracking-tight font-medium">Full infrastructure and workforce authority</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold transition shadow-md text-xs uppercase tracking-widest">
            <UserPlus size={16} /> Add Staff
          </button>
          <button onClick={() => { setEditingProject(null); setShowAddProject(true); }} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-900 font-bold transition shadow-md text-xs uppercase tracking-widest">
            <FolderPlus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Workforce Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/50">
            <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><UserCheck size={14}/> Personnel Registry</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-black">
            <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4 text-center">Role</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">{user.name}<br/><span className="text-[10px] font-mono text-slate-400">{user.email}</span></td>
                <td className="px-6 py-4 text-center">
                  <select value={user.role} onChange={e => handleUpdateUser(user._id, 'role', e.target.value)} className="border rounded px-2 py-1 text-xs font-bold bg-white">
                    <option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <select value={user.status || 'Active'} onChange={e => handleUpdateUser(user._id, 'status', e.target.value)} className="text-[10px] font-black uppercase border rounded-full px-3 py-1 bg-white">
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteUser(user._id)} className="text-slate-300 hover:text-red-600"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILED PROJECT TRACKING (FIXED UI) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/50 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <ClipboardList size={14} className="text-blue-500"/> Pipeline Infrastructure Tracking
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p._id} className="p-5 rounded-2xl border bg-white hover:shadow-lg transition flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">{p.title}</h3>
                  <p className="text-[9px] font-mono text-slate-300 uppercase tracking-tighter">REF: {p._id.slice(-6)}</p>
                </div>
                {/* ACTION BUTTONS */}
                <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(p)} className="text-slate-300 hover:text-blue-600 p-1 transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeleteProject(p._id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
              
              {/* TIMELINE DISPLAY */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-slate-400"/>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Started</p>
                    <p className="text-[11px] font-bold text-slate-600">{p.timeline?.startDate ? new Date(p.timeline.startDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Deadline</p>
                    <p className="text-[11px] font-bold text-red-600">{p.timeline?.deadline ? new Date(p.timeline.deadline).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                  <span className="flex items-center gap-1"><HardHat size={12}/> {p.projectManager?.name || 'Unassigned'}</span>
                  <span className={p.progressPercentage >= 100 ? "text-green-600" : "text-blue-600"}>{p.progressPercentage}% Operational</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${p.progressPercentage >= 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${p.progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FOR NEW/EDIT PROJECT */}
      {showAddProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative">
            <button onClick={() => { setShowAddProject(false); setEditingProject(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"><X/></button>
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight text-slate-800">
                {editingProject ? 'Modify Infrastructure' : 'Deploy Infrastructure'}
            </h2>
            <form onSubmit={handleProjectSubmit} className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Project Title" required className="col-span-2 p-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={projectData.title} onChange={e => setProjectData({...projectData, title: e.target.value})} />
              <textarea placeholder="Technical Scope" required className="col-span-2 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="3" value={projectData.description} onChange={e => setProjectData({...projectData, description: e.target.value})} />
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Start Date</label>
                  <input type="date" required className="w-full p-3 border border-slate-200 rounded-xl" value={projectData.startDate} onChange={e => setProjectData({...projectData, startDate: e.target.value})} />
              </div>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Deadline</label>
                  <input type="date" required className="w-full p-3 border border-slate-200 rounded-xl" value={projectData.deadline} onChange={e => setProjectData({...projectData, deadline: e.target.value})} />
              </div>
              <select required className="col-span-2 p-3 border border-slate-200 rounded-xl bg-white font-bold outline-none" value={projectData.projectManager} onChange={e => setProjectData({...projectData, projectManager: e.target.value})}>
                <option value="">Assign Site Manager</option>
                {users.filter(u => u.role === 'manager').map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              <button type="submit" className="col-span-2 bg-slate-800 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 shadow-lg transition text-xs">
                {editingProject ? 'Update Pipeline Operations' : 'Activate Pipeline Operations'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setShowAddUser(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"><X/></button>
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight text-slate-800">New Workforce Entry</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" placeholder="Worker Name" required className="w-full p-3 border border-slate-200 rounded-xl" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
              <input type="email" placeholder="Email Identity" required className="w-full p-3 border border-slate-200 rounded-xl" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
              <input type="password" placeholder="Security Keyphrase" required className="w-full p-3 border border-slate-200 rounded-xl" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
              <select className="w-full p-3 border border-slate-200 rounded-xl bg-white font-bold" value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})}>
                <option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700 transition">Grant Access</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;