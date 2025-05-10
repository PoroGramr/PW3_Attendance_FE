import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import AllStudentsView from './components/AllStudentsView';
import AttendanceManagement from './components/AttendanceManagement';
import StudentManagement from './components/StudentManagement';
import Sidebar from './components/Sidebar';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuSelect = (menuId) => {
    switch (menuId) {
      case 'students':
        navigate('/');
        break;
      case 'student-management':
        navigate('/student-management');
        break;
      case 'attendance':
        navigate('/attendance');
        break;
      default:
        navigate('/');
    }
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="App">
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          onMenuSelect={handleMenuSelect} 
          activeItem={location.pathname === '/' ? 'students' : 
                     location.pathname === '/student-management' ? 'student-management' : 'attendance'} 
        />
      </div>
      <div className="main-container">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <Routes>
          <Route path="/" element={<AllStudentsView />} />
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;