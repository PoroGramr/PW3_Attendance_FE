import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import './TeacherAttendanceView.css';

const TeacherAttendanceView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  });

  // 출석 상태 매핑 (UI 표시용)
  const attendanceStatusMap = {
    'ATTEND': 'present',
    'LATE': 'late',
    'ABSENT': 'absent',
    'OTHER': 'etc',
    'UNCHECKED': ''
  };

  // UI 상태를 API 상태로 변환하는 매핑
  const reverseAttendanceStatusMap = {
    'present': 'ATTEND',
    'late': 'LATE',
    'absent': 'ABSENT',
    'etc': 'OTHER'
  };

  const fetchAttendanceData = async (date) => {
    try {
      const attendanceData = await apiRequest(API_ENDPOINTS.teacherAttendance.getByDate(date));
      const transformedTeachers = attendanceData.map(teacher => ({
        id: teacher.teacherId,
        name: teacher.teacherName,
        status: attendanceStatusMap[teacher.attendanceStatus] || ''
      }));
      setTeachers(transformedTeachers);
      setLoading(false);
    } catch (err) {
      console.error('선생님 출석 데이터를 불러오는 중 오류 발생:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const handleStatusChange = async (teacherId, newStatus) => {
    try {
      // UI 상태를 API 상태로 변환
      const apiStatus = reverseAttendanceStatusMap[newStatus];
      const endpoint = API_ENDPOINTS.teacherAttendance.update(teacherId, apiStatus, selectedDate);
      await apiRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      await fetchAttendanceData(selectedDate);
    } catch (err) {
      console.error('출석 상태 업데이트 중 오류 발생:', err);
      await fetchAttendanceData(selectedDate);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const filteredTeachers = teachers
    .filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="teacher-attendance-container">
      <div className="header">
        <h1>선생님 출석 조회</h1>
        <div className="controls">
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
          <input 
            type="text" 
            placeholder="이름 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="teachers-list">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>출석 상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.name}</td>
                <td>
                  <div className="attendance-buttons">
                    <button 
                      className={`btn-status ${teacher.status === 'present' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(teacher.id, 'present')}
                    >
                      출석
                    </button>
                    <button 
                      className={`btn-status ${teacher.status === 'late' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(teacher.id, 'late')}
                    >
                      지각
                    </button>
                    <button 
                      className={`btn-status ${teacher.status === 'absent' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(teacher.id, 'absent')}
                    >
                      결석
                    </button>
                    <button 
                      className={`btn-status ${teacher.status === 'etc' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(teacher.id, 'etc')}
                    >
                      기타
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAttendanceView; 