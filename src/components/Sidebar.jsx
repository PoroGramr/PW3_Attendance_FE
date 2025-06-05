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
          <span className="logo-icon">📚</span>
          <h2>PW3 출석 체크</h2>
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
        {/* <li className={`menu-item ${location.pathname === '/campaign' ? 'active' : ''}`}>
          <Link to="/campaign" className="menu-link" onClick={() => handleItemClick('campaign')}>
            <div className="menu-icon">🙏</div>
            <span>캠페인 기도</span>
          </Link>
        </li> */}
      </ul>
      
      <div className="sidebar-footer">
        <div className="sidebar-divider"></div>
        <div className="menu-item">
          <div className="menu-icon">⚙️</div>
          <span>설정</span>
        </div>
        <div className="menu-item">
          <div className="menu-icon">🚪</div>
          <span>로그아웃</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;