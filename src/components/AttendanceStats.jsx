import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import './AttendanceStats.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AttendanceStats = () => {
  const [activeTab, setActiveTab] = useState('class'); // 'class', 'grade', 'total'
  const [selectedClass, setSelectedClass] = useState(null); // 선택된 반 객체
  const [classrooms, setClassrooms] = useState([]); // 반 목록
  const [classAttendanceData, setClassAttendanceData] = useState({}); // 반별 출석 데이터
  const [totalAttendanceData, setTotalAttendanceData] = useState([]); // 전체 출석 데이터
  const [gradeStats, setGradeStats] = useState([]); // 학년별 통계
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 반 목록 가져오기
  const fetchClassrooms = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.attendanceStats.getClassrooms);
      setClassrooms(data);
      if (data.length > 0) {
        setSelectedClass(data[0]); // 첫 번째 반을 기본 선택
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 특정 반의 일요일 출석 데이터 가져오기
  const fetchClassAttendance = async (classroomId) => {
    if (!classroomId) return;
    
    setLoading(true);
    try {
      const data = await apiRequest(API_ENDPOINTS.attendanceStats.getClassAttendance(classroomId));
      
      // 출석률 계산 및 데이터 정리
      const processedData = data.map(item => ({
        date: item.sunday,
        attendedCount: item.attendedCount,
        totalCount: item.totalCount,
        attendanceRate: Math.round((item.attendedCount / item.totalCount) * 100)
      }));
      
      setClassAttendanceData(prev => ({
        ...prev,
        [classroomId]: processedData
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 전체 일요일 출석 데이터 가져오기
  const fetchTotalAttendance = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.attendanceStats.getTotalAttendance);
      
      // 출석률 계산 및 데이터 정리
      const processedData = data.map(item => ({
        date: item.attendanceDate,
        attendedCount: item.attendedCount,
        totalCount: item.totalCount,
        attendanceRate: Math.round((item.attendedCount / item.totalCount) * 100)
      }));
      
      setTotalAttendanceData(processedData);
    } catch (err) {
      setError(err.message);
    }
  };

  // 학년별 통계 계산
  const calculateGradeStats = async () => {
    if (classrooms.length === 0) return;
    
    try {
      const gradeData = {};
      
      // 각 반의 최신 출석 데이터를 가져와서 학년별로 집계
      for (const classroom of classrooms) {
        if (!classAttendanceData[classroom.id]) {
          // 아직 데이터가 없는 경우 API에서 가져오기
          const attendanceData = await apiRequest(API_ENDPOINTS.attendanceStats.getClassAttendance(classroom.id));
          if (attendanceData.length > 0) {
            const latestData = attendanceData[0]; // 가장 최근 데이터
            const attendanceRate = Math.round((latestData.attendedCount / latestData.totalCount) * 100);
            
            if (!gradeData[classroom.grade]) {
              gradeData[classroom.grade] = {
                totalStudents: 0,
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                classCount: 0
              };
            }
            
            gradeData[classroom.grade].totalStudents += latestData.totalCount;
            gradeData[classroom.grade].totalPresent += latestData.attendedCount;
            gradeData[classroom.grade].totalAbsent += (latestData.totalCount - latestData.attendedCount);
            gradeData[classroom.grade].classCount += 1;
          }
        } else {
          // 이미 데이터가 있는 경우
          const latestData = classAttendanceData[classroom.id][0];
          const attendanceRate = latestData.attendanceRate;
          
          if (!gradeData[classroom.grade]) {
            gradeData[classroom.grade] = {
              totalStudents: 0,
              totalPresent: 0,
              totalAbsent: 0,
              totalLate: 0,
              classCount: 0
            };
          }
          
          gradeData[classroom.grade].totalStudents += latestData.totalCount;
          gradeData[classroom.grade].totalPresent += latestData.attendedCount;
          gradeData[classroom.grade].totalAbsent += (latestData.totalCount - latestData.attendedCount);
          gradeData[classroom.grade].classCount += 1;
        }
      }
      
      // 모든 학년을 포함하여 통계 데이터 생성 (중1~고3)
      const allGrades = [
        { grade: 1, schoolType: 'MIDDLE', name: '중학교 1학년' },
        { grade: 2, schoolType: 'MIDDLE', name: '중학교 2학년' },
        { grade: 3, schoolType: 'MIDDLE', name: '중학교 3학년' },
        { grade: 1, schoolType: 'HIGH', name: '고등학교 1학년' },
        { grade: 2, schoolType: 'HIGH', name: '고등학교 2학년' },
        { grade: 3, schoolType: 'HIGH', name: '고등학교 3학년' }
      ];
      
      const gradeStatsArray = allGrades.map(gradeInfo => {
        const key = `${gradeInfo.schoolType}_${gradeInfo.grade}`;
        const data = gradeData[gradeInfo.grade] || {
          totalStudents: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          classCount: 0
        };
        
        const attendanceRate = data.totalStudents > 0 ? Math.round((data.totalPresent / data.totalStudents) * 100) : 0;
        
        return {
          grade: gradeInfo.name,
          totalStudents: data.totalStudents,
          present: data.totalPresent,
          absent: data.totalAbsent,
          late: data.totalLate,
          attendanceRate: attendanceRate,
          classCount: data.classCount
        };
      });
      
      setGradeStats(gradeStatsArray);
    } catch (err) {
      console.error('학년별 통계 계산 중 오류:', err);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchTotalAttendance();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassAttendance(selectedClass.id);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (classrooms.length > 0 && Object.keys(classAttendanceData).length > 0) {
      calculateGradeStats();
    }
  }, [classrooms, classAttendanceData]);

  // 전체 통계 계산
  const totalStats = {
    totalStudents: totalAttendanceData.length > 0 ? totalAttendanceData[0].totalCount : 0,
    totalPresent: totalAttendanceData.length > 0 ? totalAttendanceData[0].attendedCount : 0,
    totalAbsent: totalAttendanceData.length > 0 ? totalAttendanceData[0].totalCount - totalAttendanceData[0].attendedCount : 0,
    totalLate: 0, // API에 지각 데이터가 없어서 0으로 설정
    overallAttendanceRate: totalAttendanceData.length > 0 ? Math.round((totalAttendanceData[0].attendedCount / totalAttendanceData[0].totalCount) * 100) : 0,
  };

  // 월별 출석률 계산
  const calculateMonthlyAttendance = () => {
    if (totalAttendanceData.length === 0) return { labels: [], data: [] };
    
    const monthlyData = {};
    
    totalAttendanceData.forEach(item => {
      const date = new Date(item.date);
      const month = date.getMonth() + 1; // 1-12월
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalAttended: 0,
          totalStudents: 0,
          count: 0
        };
      }
      
      monthlyData[month].totalAttended += item.attendedCount;
      monthlyData[month].totalStudents += item.totalCount;
      monthlyData[month].count += 1;
    });
    
    // 데이터가 있는 월만 필터링하여 정렬
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const labels = [];
    const data = [];
    
    Object.keys(monthlyData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(month => {
      const monthNum = parseInt(month);
      const avgAttendanceRate = Math.round((monthlyData[month].totalAttended / monthlyData[month].totalStudents) * 100);
      labels.push(monthNames[monthNum - 1]);
      data.push(avgAttendanceRate);
    });
    
    return { labels, data };
  };

  const monthlyTrend = calculateMonthlyAttendance();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleClassChange = (classroom) => {
    setSelectedClass(classroom);
  };

  // 날짜를 간단한 형태로 변환 (8/31, 8/24 등)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 학교 타입을 한글로 변환
  const getSchoolTypeName = (schoolType) => {
    switch (schoolType) {
      case 'MIDDLE': return '중학교';
      case 'HIGH': return '고등학교';
      default: return schoolType;
    }
  };

  // Chart.js 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `출석률: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          }
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: '#f3f4f6',
          borderColor: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 3,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      }
    }
  };

  if (error) {
    return (
      <div className="attendance-stats-container">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-stats-container">
      <div className="stats-header">
        <h1>출석 통계</h1>
        <p>반별, 학년별, 전체 출석 현황을 확인할 수 있습니다.</p>
      </div>

      <div className="stats-tabs">
        <button 
          className={`tab-button ${activeTab === 'class' ? 'active' : ''}`}
          onClick={() => handleTabChange('class')}
        >
          반별 통계
        </button>
        <button 
          className={`tab-button ${activeTab === 'grade' ? 'active' : ''}`}
          onClick={() => handleTabChange('grade')}
        >
          학년별 통계
        </button>
        <button 
          className={`tab-button ${activeTab === 'total' ? 'active' : ''}`}
          onClick={() => handleTabChange('total')}
        >
          전체 통계
        </button>
      </div>

      <div className="stats-content">
        {activeTab === 'class' && (
          <div className="class-stats">
            <h2>반별 출석 현황</h2>
            
            <div className="class-selector">
              <label htmlFor="class-select">반 선택:</label>
              <select 
                id="class-select"
                value={selectedClass ? selectedClass.id : ''}
                onChange={(e) => {
                  const classroom = classrooms.find(c => c.id === parseInt(e.target.value));
                  handleClassChange(classroom);
                }}
                className="class-select-dropdown"
              >
                {classrooms.map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {getSchoolTypeName(classroom.schoolType)} {classroom.grade}학년 {classroom.classNumber}반
                  </option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <div className="class-chart-container">
                <h3>
                  {getSchoolTypeName(selectedClass.schoolType)} {selectedClass.grade}학년 {selectedClass.classNumber}반 
                  주별 출석률 추이
                </h3>
                
                {loading ? (
                  <div className="loading-message">데이터를 불러오는 중...</div>
                ) : classAttendanceData[selectedClass.id] ? (
                  <div className="chart-wrapper">
                    <Line 
                      data={{
                        labels: classAttendanceData[selectedClass.id].map(item => formatDate(item.date)),
                        datasets: [{
                          label: '출석률',
                          data: classAttendanceData[selectedClass.id].map(item => item.attendanceRate),
                          fill: true,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderColor: '#3b82f6',
                          borderWidth: 3,
                          pointBackgroundColor: '#ffffff',
                          pointBorderColor: '#3b82f6',
                          pointBorderWidth: 3,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                          tension: 0.4,
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                ) : (
                  <div className="no-data-message">출석 데이터가 없습니다.</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'grade' && (
          <div className="grade-stats">
            <h2>학년별 출석 현황</h2>
            {loading ? (
              <div className="loading-message">데이터를 불러오는 중...</div>
            ) : gradeStats.length > 0 ? (
              <div className="stats-grid">
                {gradeStats.map((stat, index) => (
                  <div key={index} className="stat-card grade-card">
                    <div className="stat-header">
                      <h3>{stat.grade}</h3>
                      <span className="attendance-rate">{stat.attendanceRate}%</span>
                    </div>
                    <div className="stat-details">
                      <div className="stat-item">
                        <span className="label">전체 학생</span>
                        <span className="value">{stat.totalStudents}명</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">출석</span>
                        <span className="value present">{stat.present}명</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">결석</span>
                        <span className="value absent">{stat.absent}명</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">반 수</span>
                        <span className="value">{stat.classCount}개</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-message">학년별 출석 데이터가 없습니다.</div>
            )}
          </div>
        )}

        {activeTab === 'total' && (
          <div className="total-stats">
            <h2>전체 출석 현황</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <div className="overview-icon">👥</div>
                <div className="overview-content">
                  <h3>전체 학생</h3>
                  <span className="overview-number">{totalStats.totalStudents}명</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">✅</div>
                <div className="overview-content">
                  <h3>출석률</h3>
                  <span className="overview-number">{totalStats.overallAttendanceRate}%</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">📊</div>
                <div className="overview-content">
                  <h3>이번 주 출석</h3>
                  <span className="overview-number">{totalStats.totalPresent}명</span>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">📈</div>
                <div className="overview-content">
                  <h3>이번 주 출석률</h3>
                  <span className="overview-number">
                    {totalAttendanceData.length > 0 ? totalAttendanceData[0].attendanceRate : 0}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="charts-section">
              <div className="chart-card">
                <h3>일요일별 전체 출석률 추이</h3>
                <div className="chart-wrapper">
                  {totalAttendanceData.length > 0 ? (
                    <Line 
                      data={{
                        labels: totalAttendanceData.map(item => formatDate(item.date)),
                        datasets: [{
                          label: '전체 출석률',
                          data: totalAttendanceData.map(item => item.attendanceRate),
                          fill: true,
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderColor: '#22c55e',
                          borderWidth: 3,
                          pointBackgroundColor: '#ffffff',
                          pointBorderColor: '#22c55e',
                          pointBorderWidth: 3,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                          tension: 0.4,
                        }]
                      }}
                      options={{
                        ...chartOptions,
                        scales: {
                          ...chartOptions.scales,
                          y: {
                            ...chartOptions.scales.y,
                            beginAtZero: false,
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="no-data-message">전체 출석 데이터가 없습니다.</div>
                  )}
                </div>
              </div>
              
              <div className="chart-card">
                <h3>월별 출석률 추이</h3>
                <div className="chart-wrapper">
                  <Line 
                    data={{
                      labels: monthlyTrend.labels,
                      datasets: [{
                        label: '월별 출석률',
                        data: monthlyTrend.data,
                        fill: true,
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        borderColor: '#a855f7',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#a855f7',
                        pointBorderWidth: 3,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.4,
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          beginAtZero: false,
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceStats;
