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
      
      <div className="profile-section">
        <div className="profile-avatar">
          <img src="https://via.placeholder.com/40" alt="Profile" />
        </div>
        <div className="profile-info">
          <h3>김선생님</h3>
          <p>수학 교사</p>
        </div>
      </div>
      
      <div className="sidebar-divider"></div>
      
      <ul className="sidebar-menu">
        <li 
          className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => handleItemClick('students')}
        >
          <div className="menu-icon">👥</div>
          <span>전체 학생 조회</span>
        </li>
        <li 
          className={`menu-item ${location.pathname === '/attendance' ? 'active' : ''}`}
          onClick={() => handleItemClick('management')}
        >
          <div className="menu-icon">✓</div>
          <span>출석 관리</span>
        </li>
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