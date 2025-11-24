import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onMenuSelect, activeItem, onClose }) => {
  const location = useLocation();

  const handleItemClick = (itemId) => {
    if (onMenuSelect) {
      onMenuSelect(itemId);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img 
            src="/logo512.png" 
            alt="PW3 로고" 
            className="logo-image"
          />
        </div>
        <button className="sidebar-close" onClick={onClose}>
          ✕
        </button>
      </div>
      
      <div className="sidebar-divider"></div>
      
      <ul className="sidebar-menu">
        <li className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Link to="/" className="menu-link" onClick={() => handleItemClick('students')}>
            <div className="menu-icon">👥</div>
            <span>학생 출석</span>
          </Link>
        </li>
        {/* <li className={`menu-item ${location.pathname === '/attendance' ? 'active' : ''}`}>
          <Link to="/attendance" className="menu-link" onClick={() => handleItemClick('attendance')}>
            <div className="menu-icon">✓</div>
            <span>반별 출석</span>
          </Link>
        </li> */}
        <li className={`menu-item ${location.pathname === '/student-management' ? 'active' : ''}`}>
          <Link to="/student-management" className="menu-link" onClick={() => handleItemClick('student-management')}>
            <div className="menu-icon">👨‍🎓</div>
            <span>학생 관리</span>
          </Link>
        </li>
        <li className={`menu-item ${location.pathname === '/self-check' ? 'active' : ''}`}>
          <Link to="/self-check" className="menu-link" onClick={() => handleItemClick('self-check')}>
            <div className="menu-icon">✅</div>
            <span>셀프 출석</span>
          </Link>
        </li>
        <li className={`menu-item ${location.pathname === '/teacher-attendance' ? 'active' : ''}`}>
          <Link to="/teacher-attendance" className="menu-link" onClick={() => handleItemClick('teacher-attendance')}>
            <div className="menu-icon">👨‍🏫</div>
            <span>선생님 출석</span>
          </Link>
        </li>
        
        <li className={`menu-item ${location.pathname === '/teacher-management' ? 'active' : ''}`}>
          <Link to="/teacher-management" className="menu-link" onClick={() => handleItemClick('teacher-management')}>
            <div className="menu-icon">👨‍🏫</div>
            <span>선생님 관리</span>
          </Link>
        </li>
        <li className={`menu-item ${location.pathname === '/attendance-stats' ? 'active' : ''}`}>
          <Link to="/attendance-stats" className="menu-link" onClick={() => handleItemClick('attendance-stats')}>
            <div className="menu-icon">📊</div>
            <span>출석 통계</span>
          </Link>
        </li>
        <li className={`menu-item ${location.pathname === '/monthly-student-list' ? 'active' : ''}`}>
          <Link to="/monthly-student-list" className="menu-link" onClick={() => handleItemClick('monthly-student-list')}>
            <div className="menu-icon">📅</div>
            <span>월별 등록 학생</span>
          </Link>
        </li>
      
      </ul>
    
    </div>
  );
};

export default Sidebar;