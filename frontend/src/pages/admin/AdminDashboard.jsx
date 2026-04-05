import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ShieldCheck, RefreshCcw, UserCheck, UserPlus, FolderPlus, ClipboardList, X, HardHat } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
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
      console.error("Fetch failed", err);
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
      setTimeout(() => fetchData(), 600);
      alert("Personnel added!");
    } catch (err) { alert("Error adding user"); }
  };

  const handleUpdate = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}`, { [field]: value });
      fetchData();
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove user?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
        fetchData();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectData.projectManager) { alert("Assign a Manager!"); return; }
    try {
      const payload = {
        title: projectData.title,
        description: projectData.description,
        projectManager: projectData.projectManager,
        timeline: { startDate: projectData.startDate, deadline: projectData.deadline }
      };
      await axios.post('http://localhost:5000/api/projects/create', payload);
      setShowAddProject(false);
      setProjectData({ title: '', description: '', startDate: '', deadline: '', projectManager: '' });
      setTimeout(() => fetchData(), 600);
      alert("Project Deployed!");
    } catch (err) { alert("Check all fields!"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">SYNCING DATA...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 text-slate-800 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={28} /> Admin Control Panel
          </h1>
          <p className="text-slate-500 text-sm">Full authority over personnel and pipeline assets</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-bold shadow-md"><UserPlus size={18}/> Add Employee</button>
          <button onClick={() => setShowAddProject(true)} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-900 font-bold shadow-md"><FolderPlus size={18}/> New Project</button>
        </div>
      </div>

      {/* Workforce List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-black">
            <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4 text-center">Role</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold">{user.name}<br/><span className="text-[10px] font-mono text-slate-400">{user.email}</span></td>
                <td className="px-6 py-4 text-center">
                  <select value={user.role} onChange={e => handleUpdate(user._id, 'role', e.target.value)} className="border rounded px-2 py-1 text-xs font-bold">
                    <option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <select value={user.status || 'Active'} onChange={e => handleUpdate(user._id, 'status', e.target.value)} className="text-[10px] font-black uppercase border rounded-full px-3 py-1">
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(user._id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Project Tracker with Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 font-bold text-sm uppercase tracking-widest"><ClipboardList size={18} className="inline mr-2 text-blue-500"/>Pipeline Tracking</div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p._id} className="p-5 rounded-2xl border bg-white hover:shadow-lg transition">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-slate-800">{p.title}</h3>
                <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase tracking-tighter">{p.status}</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 h-8 overflow-hidden">{p.description}</p>
              
              <div className="flex justify-between border-t border-slate-50 pt-3 mb-4 text-[10px] font-bold text-slate-400">
                <span>START: {p.timeline?.startDate ? new Date(p.timeline.startDate).toLocaleDateString() : 'N/A'}</span>
                <span className="text-red-400">END: {p.timeline?.deadline ? new Date(p.timeline.deadline).toLocaleDateString() : 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-slate-400">Manager:</span>
                <span className="text-blue-600">{p.projectManager?.name || 'Unknown'}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${p.progressPercentage}%` }}></div>
              </div>
              <p className="text-right text-[10px] font-black mt-1 text-slate-400">{p.progressPercentage}% COMPLETE</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal - Register Person */}
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setShowAddUser(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">New Workforce Entry</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" placeholder="Name" required className="w-full p-3 border rounded-xl" onChange={e => setNewUserData({...newUserData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl" onChange={e => setNewUserData({...newUserData, email: e.target.value})} />
              <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl" onChange={e => setNewUserData({...newUserData, password: e.target.value})} />
              <select className="w-full p-3 border rounded-xl bg-white" onChange={e => setNewUserData({...newUserData, role: e.target.value})}>
                <option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest">Grant Access</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Deploy Project */}
      {showAddProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative">
            <button onClick={() => setShowAddProject(false)} className="absolute top-4 right-4 text-slate-400"><X/></button>
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Deploy Infrastructure</h2>
            <form onSubmit={handleProjectSubmit} className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Title" required className="col-span-2 p-3 border rounded-xl" onChange={e => setProjectData({...projectData, title: e.target.value})} />
              <textarea placeholder="Technical Scope" required className="col-span-2 p-3 border rounded-xl" onChange={e => setProjectData({...projectData, description: e.target.value})} />
              <input type="date" required className="p-3 border rounded-xl" onChange={e => setProjectData({...projectData, startDate: e.target.value})} />
              <input type="date" required className="p-3 border rounded-xl" onChange={e => setProjectData({...projectData, deadline: e.target.value})} />
              <select required className="col-span-2 p-3 border rounded-xl bg-white font-bold" onChange={e => setProjectData({...projectData, projectManager: e.target.value})}>
                <option value="">Assign Site Manager</option>
                {users.filter(u => u.role === 'manager').map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              <button type="submit" className="col-span-2 bg-slate-800 text-white py-4 rounded-xl font-black uppercase tracking-widest">Activate Pipeline</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;