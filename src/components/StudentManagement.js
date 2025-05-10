import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignClassModal, setShowAssignClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.students.getAllWithClassInfo(currentYear));
      setStudents(data);
      setLoading(false);
    } catch (err) {
      setError('학생 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.classes.getAll(currentYear));
      setClasses(data);
    } catch (err) {
      console.error('반 목록을 불러오는데 실패했습니다:', err);
    }
  };

  const handleAddStudent = async (studentData) => {
    try {
      await apiRequest(API_ENDPOINTS.students.create, {
        method: 'POST',
        body: JSON.stringify({
          name: studentData.name,
          birth: studentData.birth,
          phone: studentData.phone || "string"
        }),
      });
      fetchStudents();
      setShowAddModal(false);
    } catch (err) {
      setError('학생 추가에 실패했습니다.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('정말로 이 학생을 삭제하시겠습니까?')) {
      try {
        await apiRequest(API_ENDPOINTS.students.delete(studentId), {
          method: 'DELETE'
        });
        fetchStudents();
      } catch (err) {
        setError('학생 삭제에 실패했습니다.');
      }
    }
  };

  const handleAssignClass = async (studentId, classId) => {
    try {
      await apiRequest(API_ENDPOINTS.classes.create, {
        method: 'POST',
        body: JSON.stringify({
          studentId: studentId,
          classRoomId: classId,
          schoolYear: currentYear
        }),
      });
      fetchStudents();
      setShowAssignClassModal(false);
    } catch (err) {
      setError('반 배정에 실패했습니다.');
    }
  };

  const getClassName = (classRoomId) => {
    const classInfo = classes.find(cls => cls.id === classRoomId);
    return classInfo ? classInfo.name : '-';
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="student-management">
      <div className="header">
        <h1>학생 관리</h1>
        <button onClick={() => setShowAddModal(true)}>새 학생 등록</button>
      </div>

      <div className="student-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>생년월일</th>
              <th>전화번호</th>
              <th>학년도</th>
              <th>반</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.birth || '-'}</td>
                <td>{student.phone || '-'}</td>
                <td>{student.schoolYear || '-'}</td>
                <td>{getClassName(student.classRoomId)}</td>
                <td>
                  <div className="action-buttons">
                    {!student.classRoomId && (
                      <button
                        className="assign-button"
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowAssignClassModal(true);
                        }}
                      >
                        반 배정
                      </button>
                    )}
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>새 학생 등록</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddStudent({
                name: formData.get('name'),
                birth: formData.get('birth'),
                phone: formData.get('phone') || "string"
              });
            }}>
              <input name="name" placeholder="이름" required />
              <input name="birth" type="date" placeholder="생년월일" />
              <input name="phone" placeholder="전화번호" />
              <button type="submit">등록</button>
              <button type="button" onClick={() => setShowAddModal(false)}>취소</button>
            </form>
          </div>
        </div>
      )}

      {showAssignClassModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h2>반 배정</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAssignClass(selectedStudent.id, parseInt(formData.get('classId')));
            }}>
              <select name="classId" required>
                <option value="">반 선택</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <button type="submit">배정</button>
              <button type="button" onClick={() => setShowAssignClassModal(false)}>취소</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 