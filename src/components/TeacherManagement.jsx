import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import TeacherAddModal from './TeacherAddModal';
import './TeacherManagement.css';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');

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

  const openMatchModal = async (teacher) => {
    setSelectedTeacher(teacher);
    setIsMatchModalOpen(true);
    try {
      setClassroomsLoading(true);
      // 2025 학년도 반 목록 로드
      const data = await apiRequest(API_ENDPOINTS.classes.getAll(2025));
      setClassrooms(data);
      if (data && data.length > 0) {
        setSelectedClassroomId(String(data[0].id));
      }
    } catch (e) {
      console.error('반 목록 로드 에러:', e);
    } finally {
      setClassroomsLoading(false);
    }
  };

  const handleSaveMatch = async () => {
    if (!selectedTeacher || !selectedClassroomId) {
      setIsMatchModalOpen(false);
      return;
    }
    try {
      await apiRequest(API_ENDPOINTS.teacherClasses.assign(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          classRoomId: Number(selectedClassroomId),
          schoolYear: 2025,
        }),
      });
      // 성공 후 닫기 및 알림/갱신
      setIsMatchModalOpen(false);
    } catch (e) {
      console.error('반 매칭 저장 실패:', e);
      setIsMatchModalOpen(false);
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

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('정말로 이 선생님을 삭제하시겠습니까?')) {
      try {
        await apiRequest(API_ENDPOINTS.teachers.delete(teacherId), {
          method: 'DELETE'
        });
        // 성공 시 목록 새로고침
        await fetchTeachers();
      } catch (err) {
        console.error('선생님 삭제 중 오류 발생:', err);
        setError('선생님 삭제 중 오류가 발생했습니다.');
      }
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
                    {/* <button className="btn-edit">
                      <span className="icon">✏️</span>
                    </button> */}
                    <button className="btn-delete" onClick={() => handleDeleteTeacher(teacher.id)}>
                      <span className="icon">🗑️</span>
                    </button>
                    <button className="btn-match" onClick={() => openMatchModal(teacher)}>
                      <span className="icon">🔗</span> 반 매칭
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isMatchModalOpen && ReactDOM.createPortal(
        <div className="tm-modal-backdrop" role="dialog" aria-modal="true">
          <div className="tm-modal">
            <div className="tm-modal-header">
              <h2>반 매칭 - {selectedTeacher?.name}</h2>
              <button className="tm-modal-close" onClick={() => setIsMatchModalOpen(false)}>✖</button>
            </div>
            <div className="tm-modal-body">
              {classroomsLoading ? (
                <div>반 목록을 불러오는 중...</div>
              ) : (
                <>
                  <label htmlFor="classroomSelect" className="tm-modal-label">담당 반 선택</label>
                  <select 
                    id="classroomSelect"
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="tm-modal-select"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.schoolType === 'MIDDLE' ? '중' : '고'} {c.grade}학년 {c.classNumber}반
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="tm-modal-footer">
              <button className="btn-secondary" onClick={() => setIsMatchModalOpen(false)}>취소</button>
              <button className="btn-primary" onClick={handleSaveMatch}>저장</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <TeacherAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTeacher}
      />
    </div>
  );
};

export default TeacherManagement; 