import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import AllStudentsView from './components/AllStudentsView';
import AttendanceManagement from './components/AttendanceManagement';
import StudentManagement from './components/StudentManagement';
import TeacherAttendanceView from './components/TeacherAttendanceView';
import TeacherManagement from './components/TeacherManagement';
import AttendanceStats from './components/AttendanceStats';
import Sidebar from './components/Sidebar';
import CampaignPrayer from './components/CampaignPrayer';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // campaign 페이지에서는 사이드바를 숨김
  const showSidebar = location.pathname !== '/campaign';

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
      case 'attendance-stats':
        navigate('/attendance-stats');
        break;
      case 'teacher-attendance':
        navigate('/teacher-attendance');
        break;
      case 'teacher-management':
        navigate('/teacher-management');
        break;
      case 'campaign':
        navigate('/campaign');
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
      {showSidebar && (
        <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar 
            onMenuSelect={handleMenuSelect} 
            activeItem={location.pathname === '/' ? 'students' : 
                       location.pathname === '/student-management' ? 'student-management' : 
                       location.pathname === '/attendance-stats' ? 'attendance-stats' :
                       location.pathname === '/teacher-attendance' ? 'teacher-attendance' :
                       location.pathname === '/teacher-management' ? 'teacher-management' :
                       location.pathname === '/campaign' ? 'campaign' : 'attendance'} 
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}
      <div className="main-container">
        {showSidebar && (
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
        )}
        <Routes>
          <Route path="/" element={<AllStudentsView />} />
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/attendance-stats" element={<AttendanceStats />} />
          <Route path="/teacher-attendance" element={<TeacherAttendanceView />} />
          <Route path="/teacher-management" element={<TeacherManagement />} />
          <Route path="/campaign" element={<CampaignPrayer />} />
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