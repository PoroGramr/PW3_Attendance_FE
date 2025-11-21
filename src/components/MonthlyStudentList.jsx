import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import './MonthlyStudentList.css';

const MonthlyStudentList = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 년도 옵션 생성 (현재 년도 기준 ±5년)
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  // 월 옵션
  const monthOptions = [
    { value: 1, label: '1월' },
    { value: 2, label: '2월' },
    { value: 3, label: '3월' },
    { value: 4, label: '4월' },
    { value: 5, label: '5월' },
    { value: 6, label: '6월' },
    { value: 7, label: '7월' },
    { value: 8, label: '8월' },
    { value: 9, label: '9월' },
    { value: 10, label: '10월' },
    { value: 11, label: '11월' },
    { value: 12, label: '12월' },
  ];

  // API에서 월별 등록 학생 데이터 가져오기
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(API_ENDPOINTS.students.getRegistrationsByYear(selectedYear));
        
        // API 응답을 월별로 매핑
        const dataByMonth = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            dataByMonth[item.month] = item.students || [];
          });
        }
        setMonthlyData(dataByMonth);
      } catch (err) {
        console.error('월별 등록 학생 데이터를 불러오는 중 오류 발생:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setMonthlyData({});
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedYear]);

  const getStudentsForMonth = () => {
    if (!selectedMonth) {
      return null; // 전체 선택 시 null 반환 (별도 렌더링)
    }
    return monthlyData[selectedMonth] || [];
  };

  const students = getStudentsForMonth();
  
  // 전체 선택 시 총 학생 수 계산
  const getTotalStudentCount = () => {
    let total = 0;
    for (let month = 1; month <= 12; month++) {
      if (monthlyData[month]) {
        total += monthlyData[month].length;
      }
    }
    return total;
  };

  return (
    <div className="monthly-student-container">
      <div className="monthly-student-header">
        <h1>월별 등록 학생 조회</h1>
        <p>년도와 월을 선택하여 해당 기간에 등록된 학생 목록을 확인하세요.</p>
      </div>

      <div className="monthly-student-controls">
        <div className="control-group">
          <label htmlFor="year-select">년도</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setSelectedMonth(null);
            }}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="month-select">월</label>
          <select
            id="month-select"
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">전체</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p style={{ color: '#dc3545' }}>{error}</p>
        </div>
      ) : selectedMonth ? (
        // 특정 월 선택 시
        <div className="monthly-student-content">
          <div className="monthly-student-summary">
            <h2>
              {selectedYear}년 {selectedMonth}월 등록 학생
            </h2>
            <span className="student-count">{students.length}명</span>
          </div>

          {students.length > 0 ? (
            <div className="student-list-table">
              <table>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>이름</th>
                    <th>생년월일</th>
                    <th>연락처</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.birth || '-'}</td>
                      <td>{student.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>해당 기간에 등록된 학생이 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        // 전체 선택 시 - 월별로 분류해서 표시
        <div className="monthly-student-content">
          <div className="monthly-student-summary">
            <h2>
              {selectedYear}년 전체 등록 학생
            </h2>
            <span className="student-count">{getTotalStudentCount()}명</span>
          </div>

          {getTotalStudentCount() > 0 ? (
            <div className="monthly-sections">
              {monthOptions.map((month) => {
                const monthStudents = monthlyData[month.value] || [];
                if (monthStudents.length === 0) return null;

                return (
                  <div key={month.value} className="month-section">
                    <div className="month-section-header">
                      <h3>{selectedYear}년 {month.label} 등록 학생</h3>
                      <span className="month-student-count">{monthStudents.length}명</span>
                    </div>
                    <div className="student-list-table">
                      <table>
                        <thead>
                          <tr>
                            <th>번호</th>
                            <th>이름</th>
                            <th>생년월일</th>
                            <th>연락처</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthStudents.map((student, index) => (
                            <tr key={student.id}>
                              <td>{index + 1}</td>
                              <td>{student.name}</td>
                              <td>{student.birth || '-'}</td>
                              <td>{student.phone || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>해당 기간에 등록된 학생이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyStudentList;

