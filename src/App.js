import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import AllStudentsView from './components/AllStudentsView';
import AttendanceManagement from './components/AttendanceManagement';
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
    navigate(menuId === 'students' ? '/' : '/attendance');
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="App">
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          onMenuSelect={handleMenuSelect} 
          activeItem={location.pathname === '/' ? 'students' : 'management'} 
        />
      </div>
      <div className="main-container">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <Routes>
          <Route path="/" element={<AllStudentsView />} />
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