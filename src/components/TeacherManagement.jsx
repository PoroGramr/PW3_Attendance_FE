import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import TeacherAddModal from './TeacherAddModal';
import './TeacherManagement.css';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.teachers.getAll());
      console.log('선생님 정보 응답:', response);
      setTeachers(response);
      setLoading(false);
    } catch (err) {
      setError('선생님 정보를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('선생님 정보 로드 에러:', err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTeacher = async (teacherData) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.teachers.create(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherData)
      });
      console.log('선생님 추가 응답:', response);
      await fetchTeachers(); // 목록 새로고침
    } catch (err) {
      console.error('선생님 추가 중 오류 발생:', err);
      throw err;
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="teacher-management-container">
      <div className="header">
        <h1>선생님 관리</h1>
        <div className="controls">
          <input 
            type="text" 
            placeholder="이름 검색..." 
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>
            <span className="icon">➕</span> 선생님 추가
          </button>
        </div>
      </div>

      <div className="teachers-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>연락처</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.id}</td>
                <td>{teacher.name}</td>
                <td>{teacher.number}</td>
                <td>
                  <span className={`status-badge ${teacher.status.toLowerCase()}`}>
                    {teacher.status === 'ACTIVE' ? '활성' : '비활성'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit">
                      <span className="icon">✏️</span>
                    </button>
                    <button className="btn-delete">
                      <span className="icon">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TeacherAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTeacher}
      />
    </div>
  );
};

export default TeacherManagement; 