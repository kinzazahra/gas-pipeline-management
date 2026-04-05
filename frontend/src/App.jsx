import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login'; 
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard'; 

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('pipelineToken');
    localStorage.removeItem('pipelineRole');
    localStorage.removeItem('pipelineUserId'); // Added to clean up ID too
    window.location.href = '/login'; // Use href for a cleaner redirect
  };

  return (
    <nav className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-lg">
      <span className="font-bold text-lg tracking-tight">Pipeline Co. Portal</span>
      <button onClick={handleLogout} className="text-sm bg-slate-700 px-4 py-1.5 rounded-md hover:bg-red-600 transition-all duration-200">
        Logout
      </button>
    </nav>
  );
};

function App() {
  const token = localStorage.getItem('pipelineToken');
  const userRole = localStorage.getItem('pipelineRole');
  const isAuthenticated = !!token; 

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {isAuthenticated && <Navbar />}
        
        <div className="container mx-auto">
          <Routes>
            {/* Logic: If admin, go to /admin. If manager or employee, go to /employee */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to={userRole === 'admin' ? '/admin' : '/employee'} />} 
            />
            
            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            
            {/* Employee/Manager Route: Now allows both roles to enter */}
            <Route 
              path="/employee" 
              element={isAuthenticated && (userRole === 'employee' || userRole === 'manager') ? <EmployeeDashboard /> : <Navigate to="/login" />} 
            />

            {/* Default Catch-all */}
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? (userRole === 'admin' ? '/admin' : '/employee') : '/login'} />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;