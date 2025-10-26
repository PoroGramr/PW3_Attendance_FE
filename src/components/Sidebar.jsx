import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onMenuSelect, activeItem }) => {
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
            src="https://www.onnuri.org/wp-content/themes/onnuri/images/m_sub04/top_box_photo_03.png" 
            alt="온누리교회 로고" 
            className="logo-image"
          />
        </div>
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
        <li className={`menu-item ${location.pathname === '/invited-friend-registration' ? 'active' : ''}`}>
          <Link to="/invited-friend-registration" className="menu-link" onClick={() => handleItemClick('invited-friend-registration')}>
            <div className="menu-icon">👋</div>
            <span>초청 친구 등록</span>
          </Link>
        </li>
        <li className={`menu-item ${location.pathname === '/invited-friend-list' ? 'active' : ''}`}>
          <Link to="/invited-friend-list" className="menu-link" onClick={() => handleItemClick('invited-friend-list')}>
            <div className="menu-icon">📋</div>
            <span>초청 친구 목록</span>
          </Link>
        </li>
      </ul>
    
    </div>
  );
};

export default Sidebar;