import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './AttendanceManagement.css';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const AttendanceManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 출석 상태 매핑
  const attendanceStatusMap = {
    'ATTEND': 'present',
    'LATE': 'late',
    'ABSENT': 'absent',
    'OTHER': 'etc',
    'UNCHECKED': ''
  };

  const reverseAttendanceStatusMap = {
    'present': 'ATTEND',
    'late': 'LATE',
    'absent': 'ABSENT',
    'etc': 'OTHER'
  };

  const fetchAttendanceData = async () => {
    if (!selectedClass) return;

    try {
      const year = selectedDate.split('-')[0];
      const attendanceData = await apiRequest(API_ENDPOINTS.attendance.getByClass(selectedClass, year, selectedDate));
      console.log('출석 데이터 응답:', attendanceData); // 디버깅용 로그

      // 출석 상태를 학생 ID로 매핑
      const attendanceMap = attendanceData.reduce((map, item) => {
        map[item.studentId] = attendanceStatusMap[item.attendanceStatus];
        return map;
      }, {});

      // 학생 데이터와 출석 상태를 결합
      setStudents(prevStudents => 
        prevStudents.map(student => ({
          ...student,
          status: attendanceMap[student.id] || ''
        }))
      );
    } catch (err) {
      console.error('출석 데이터를 불러오는 중 오류 발생:', err);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiRequest(API_ENDPOINTS.classes.getAll(2025));
        console.log('반 정보 응답:', response); // 디버깅용 로그
        const transformedClasses = response.map(cls => ({
          classId: cls.id,
          grade: cls.grade,
          classNumber: cls.classNumber,
          name: cls.name
        }));
        setClasses(transformedClasses);
        if (transformedClasses.length > 0) {
          setSelectedClass(transformedClasses[0].classId);
        }
      } catch (err) {
        setError('반 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('반 정보 로드 에러:', err);
      }
    };

    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.students.getByClass(selectedClass));
      console.log('학생 정보 응답:', response); // 디버깅용 로그
      const transformedStudents = response.map(student => ({
        id: student.studentId,
        name: student.studentName,
        status: ''
      }));
      setStudents(transformedStudents);
      setLoading(false);
    } catch (err) {
      setError('학생 정보를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('학생 정보 로드 에러:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      const status = reverseAttendanceStatusMap[newStatus];
      console.log('출석 상태 변경:', { studentId, newStatus, status }); // 디버깅용 로그
      
      // 먼저 로컬 상태 업데이트
      setStudents(prevStudents => 
        prevStudents.map(student => {
          if (student.id === studentId) {
            return {
              ...student,
              status: student.status === newStatus ? '' : newStatus
            };
          }
          return student;
        })
      );
      
      // API로 출석 상태 업데이트
      const endpoint = API_ENDPOINTS.attendance.update(studentId, selectedDate);
      const requestBody = { status: status };
      console.log('출석 상태 업데이트 요청:', { endpoint, requestBody }); // 디버깅용 로그
      
      const response = await apiRequest(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      console.log('출석 상태 업데이트 응답:', response); // 디버깅용 로그

      // 출석 상태 다시 불러오기
      await fetchAttendanceData();
    } catch (err) {
      console.error('출석 상태 업데이트 에러:', err);
      // 에러 발생 시 원래 상태로 되돌리기
      await fetchAttendanceData();
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAllPresent = () => {
    setStudents(prevStudents => 
      prevStudents.map(student => ({
        ...student,
        status: 'present'
      }))
    );
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      late: 0,
      absent: 0,
      etc: 0,
      unchecked: 0
    };

    students.forEach(student => {
      if (student.status === 'present') stats.present++;
      else if (student.status === 'late') stats.late++;
      else if (student.status === 'absent') stats.absent++;
      else if (student.status === 'etc') stats.etc++;
      else stats.unchecked++;
    });

    return stats;
  };

  const getChartData = () => {
    const stats = getAttendanceStats();
    return {
      labels: ['출석', '지각', '결석', '기타', '미체크'],
      datasets: [
        {
          data: [stats.present, stats.late, stats.absent, stats.etc, stats.unchecked],
          backgroundColor: [
            '#4CAF50', // 출석: 초록색
            '#FFC107', // 지각: 노란색
            '#F44336', // 결석: 빨간색
            '#9C27B0', // 기타: 보라색
            '#9E9E9E'  // 미체크: 회색
          ],
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const handleExport = () => {
    // Implementation of handleExport function
  };

  const renderExportModal = () => {
    // Implementation of renderExportModal function
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-container">
      <div className="header">
        <h1>출석 관리</h1>
        <div className="date-selector">
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
          />
          <select value={selectedClass} onChange={handleClassChange}>
            {classes.map(cls => (
              <option key={cls.classId} value={cls.classId}>
                {cls.grade}학년 {cls.classNumber}반
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="main-content">
        <div className="attendance-list">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="학생 검색..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>이름</th>
                <th>출석 상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>
                    <div className="attendance-buttons">
                      <button 
                        className={`btn-status ${student.status === 'present' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'present')}
                      >
                        출석
                      </button>
                      <button 
                        className={`btn-status ${student.status === 'late' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'late')}
                      >
                        지각
                      </button>
                      <button 
                        className={`btn-status ${student.status === 'absent' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                      >
                        결석
                      </button>
                      <button 
                        className={`btn-status ${student.status === 'etc' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'etc')}
                      >
                        기타
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="attendance-actions">
            <button className="btn-all-present" onClick={handleAllPresent}>
              <span className="icon">✓</span> 전체 출석
            </button>
            <div className="action-buttons-right">
              <button className="btn-export" onClick={handleExport}>
                <span className="icon">📊</span> 출석부 내보내기
              </button>
            </div>
          </div>
        </div>

        <div className="attendance-summary">
          <h2>출석 현황</h2>
          <div className="summary-stats">
            <div className="stat-item total">
              <span>전체 인원</span>
              <span className="count">{students.length}명</span>
            </div>
            <div className="stat-item present">
              <span>출석</span>
              <span className="count">{getAttendanceStats().present}명</span>
            </div>
            <div className="stat-item absent">
              <span>결석</span>
              <span className="count">{getAttendanceStats().absent}명</span>
            </div>
            <div className="stat-item late">
              <span>지각</span>
              <span className="count">{getAttendanceStats().late}명</span>
            </div>
          </div>
          <div className="chart-container">
            <Pie data={getChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {renderExportModal()}
    </div>
  );
};

export default AttendanceManagement;