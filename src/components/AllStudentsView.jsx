import React, { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import './AllStudentsView.css';

const AllStudentsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  });
  const [teacherCount, setTeacherCount] = useState(0);

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

  const fetchAttendanceData = async (date) => {
    try {
      const year = date.split('-')[0];
      const attendanceData = await apiRequest(API_ENDPOINTS.attendance.getByDate(year, date));
      // 출석 상태를 studentId로 매핑
      const attendanceMap = attendanceData.reduce((map, item) => {
        map[item.studentId] = attendanceStatusMap[item.attendanceStatus];
        return map;
      }, {});
      // 학생 데이터와 출석 상태 결합
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          status: attendanceMap[student.studentId] || ''
        }))
      );
    } catch (err) {
      console.error('출석 데이터를 불러오는 중 오류 발생:', err);
    }
  };

  const fetchTeacherAttendance = async (date) => {
    try {
      const teacherAttendance = await apiRequest(API_ENDPOINTS.teacherAttendance.getByDate(date));
      // 출석(ATTEND, LATE) 상태인 선생님만 카운트
      const count = teacherAttendance.filter(t => t.attendanceStatus === 'ATTEND' || t.attendanceStatus === 'LATE').length;
      setTeacherCount(count);
    } catch (err) {
      setTeacherCount(0);
    }
  };

  const fetchData = async () => {
    try {
      const year = selectedDate.split('-')[0];
      const classData = await apiRequest(API_ENDPOINTS.classes.getBySchoolYear(year));
      const transformedStudents = classData.flatMap(classRoom => {
        const classPrefix = classRoom.schoolType === 'MIDDLE' ? '중' : '고';
        return classRoom.students.map(student => ({
          id: student.id,  // 출석 체크에 사용할 ID
          studentId: student.studentId,  // 학생 고유 ID
          name: student.studentName,
          class: `${classPrefix}${classRoom.grade}-${classRoom.classNumber}`,
          status: ''
        }));
      });
      setStudents(transformedStudents);
      await fetchAttendanceData(selectedDate);
      await fetchTeacherAttendance(selectedDate);
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleStatusChange = async (studentClassId, newStatus, studentId) => {
    try {
      const status = reverseAttendanceStatusMap[newStatus];
      const endpoint = API_ENDPOINTS.attendance.update(studentClassId, selectedDate);
      const requestBody = { status: status };
      await apiRequest(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      // 서버 응답 후에만 fetchAttendanceData로 상태 동기화
      await fetchAttendanceData(selectedDate);
    } catch (err) {
      await fetchAttendanceData(selectedDate);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const renderExportModal = () => {
    if (!showExportModal) return null;

    // 출석과 지각한 학생들만 필터링
    const presentAndLateStudents = students.filter(student => 
      student.status === 'present' || student.status === 'late'
    );

    // 반별로 학생 목록 정리
    const classGroups = presentAndLateStudents.reduce((groups, student) => {
      if (!groups[student.class]) {
        groups[student.class] = [];
      }
      groups[student.class].push(student.name);
      return groups;
    }, {});

    // 반 이름 파싱 함수
    const parseClassName = (className) => {
      const match = className.match(/(중|고)(\d+)-(\d+)/);
      if (!match) return ["", 0, 0];
      return [match[1], parseInt(match[2]), parseInt(match[3])];
    };

    // 반 정렬 함수
    const sortClasses = (a, b) => {
      const [aType, aGrade, aClass] = parseClassName(a);
      const [bType, bGrade, bClass] = parseClassName(b);

      if (aType !== bType) {
        return aType === '중' ? -1 : 1;
      }
      if (aGrade !== bGrade) {
        return aGrade - bGrade;
      }
      return aClass - bClass;
    };

    // 정렬된 반 목록 생성
    const sortedClassGroups = Object.entries(classGroups)
      .sort(([a], [b]) => sortClasses(a, b))
      .map(([className, studentNames]) => `${className}: ${studentNames.join(', ')}`)
      .join('\n\n');

    // 전체 출석자 수 계산
    const totalPresentStudents = presentAndLateStudents.length;

    return (
      <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>출석부 내보내기 ({selectedDate})</h2>
          <div className="export-summary" style={{marginBottom: '16px', fontWeight: 500, fontSize: '1.1em'}}>
            {selectedDate.replace(/-/g, '.')}<br/>
            학생: {presentAndLateStudents.length}명<br/>
            선생님 (헬퍼포함): {teacherCount}명
          </div>
          <div className="export-content">
            <pre className="export-text">
              {sortedClassGroups}
            </pre>
          </div>
          <div className="modal-actions">
            <button className="btn-close" onClick={() => setShowExportModal(false)}>
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const groupedStudents = filteredStudents.reduce((groups, student) => {
    if (!groups[student.class]) {
      groups[student.class] = [];
    }
    groups[student.class].push(student);
    return groups;
  }, {});

  // 반 이름 파싱 함수
  const parseClassName = (className) => {
    // 예: "중1-2" → ["중", 1, 2]
    const match = className.match(/(중|고)(\d+)-(\d+)/);
    if (!match) return ["", 0, 0];
    return [match[1], parseInt(match[2]), parseInt(match[3])];
  };

  // 반 정렬 함수
  const sortClasses = (a, b) => {
    const [aType, aGrade, aClass] = parseClassName(a);
    const [bType, bGrade, bClass] = parseClassName(b);

    if (aType !== bType) {
      return aType === '중' ? -1 : 1;
    }
    if (aGrade !== bGrade) {
      return aGrade - bGrade;
    }
    return aClass - bClass;
  };

  const sortedClasses = Object.keys(groupedStudents).sort(sortClasses);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="all-students-container">
      <div className="header">
        <h1>전체 학생 조회</h1>
        <div className="controls">
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
          <input 
            type="text" 
            placeholder="학생 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">전체 반</option>
            {sortedClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="class-groups">
        {sortedClasses.map(className => (
          <div key={className} className="class-section">
            <div className="class-header">
              <h2>{className}</h2>
              <span className="student-count">{groupedStudents[className].length}명</span>
            </div>
            <div className="class-content">
              <table>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>이름</th>
                    <th>출석 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedStudents[className].map(student => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>
                        <div className="attendance-buttons">
                          <button 
                            className={`btn-status ${student.status === 'present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'present', student.studentId)}
                          >
                            출석
                          </button>
                          <button 
                            className={`btn-status ${student.status === 'late' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'late', student.studentId)}
                          >
                            지각
                          </button>
                          <button 
                            className={`btn-status ${student.status === 'absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'absent', student.studentId)}
                          >
                            결석
                          </button>
                          <button 
                            className={`btn-status ${student.status === 'etc' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'etc', student.studentId)}
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
        ))}
      </div>

      <div className="attendance-actions">
        <button className="btn-export" onClick={handleExport}>
          <span className="icon">📊</span> 출석부 내보내기
        </button>
      </div>

      {renderExportModal()}
    </div>
  );
};

export default AllStudentsView;