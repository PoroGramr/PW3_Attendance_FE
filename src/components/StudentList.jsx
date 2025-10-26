import React, { useState } from 'react';
import './StudentList.css';

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  
  // 샘플 학생 데이터
  const students = [
    { id: 1, name: '김학생', class: '중1-A', phone: '010-1234-5678', parent: '김부모', parentPhone: '010-8765-4321' },
    { id: 2, name: '이학생', class: '중1-A', phone: '010-2345-6789', parent: '이부모', parentPhone: '010-9876-5432' },
    { id: 3, name: '박학생', class: '중1-B', phone: '010-3456-7890', parent: '박부모', parentPhone: '010-0987-6543' },
    { id: 4, name: '최학생', class: '중1-B', phone: '010-4567-8901', parent: '최부모', parentPhone: '010-1098-7654' },
    { id: 5, name: '정학생', class: '중2-A', phone: '010-5678-9012', parent: '정부모', parentPhone: '010-2109-8765' },
    { id: 6, name: '강학생', class: '중2-A', phone: '010-6789-0123', parent: '강부모', parentPhone: '010-3210-9876' },
    { id: 7, name: '조학생', class: '중2-B', phone: '010-7890-1234', parent: '조부모', parentPhone: '010-4321-0987' },
    { id: 8, name: '윤학생', class: '중2-B', phone: '010-8901-2345', parent: '윤부모', parentPhone: '010-5432-1098' },
    { id: 9, name: '장학생', class: '중3-A', phone: '010-9012-3456', parent: '장부모', parentPhone: '010-6543-2109' },
    { id: 10, name: '임학생', class: '중3-A', phone: '010-0123-4567', parent: '임부모', parentPhone: '010-7654-3210' },
    { id: 11, name: '한학생', class: '중3-B', phone: '010-1234-5678', parent: '한부모', parentPhone: '010-8765-4321' },
    { id: 12, name: '오학생', class: '중3-B', phone: '010-2345-6789', parent: '오부모', parentPhone: '010-9876-5432' },
  ];

  // 반 목록
  const classes = ['중1-A', '중1-B', '중2-A', '중2-B', '중3-A', '중3-B'];

  // 검색 및 필터링된 학생 목록
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || 
                          student.phone.includes(searchTerm) ||
                          student.parent.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // 반별로 그룹화
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    if (!groups[student.class]) {
      groups[student.class] = [];
    }
    groups[student.class].push(student);
    return groups;
  }, {});

  return (
    <div className="student-list-container">
      <div className="header">
        <div className="header-top">
          <h1>전체 학생 조회</h1>
          <button className="btn-add-student">
            <span className="icon">+</span>
            학생 추가
          </button>
        </div>
        <div className="filter-controls">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="학생 이름, 연락처 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="class-filter">
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">전체 반</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="student-groups">
        {Object.keys(groupedStudents).sort().map(className => (
          <div key={className} className="class-group">
            <div className="class-header">
              <h2>{className}</h2>
              <span className="student-count">{groupedStudents[className].length}명</span>
            </div>
            <div className="student-table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>이름</th>
                    <th>연락처</th>
                    <th>학부모</th>
                    <th>학부모 연락처</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedStudents[className].map(student => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.phone}</td>
                      <td>{student.parent}</td>
                      <td>{student.parentPhone}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-edit">수정</button>
                          <button className="btn-delete">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 모바일용 카드 레이아웃 */}
              <div className="student-table-mobile">
                {groupedStudents[className].map(student => (
                  <div key={student.id} className="student-card">
                    <div className="student-card-header">
                      <div className="student-name">{student.name}</div>
                      <div className="student-id">#{student.id}</div>
                    </div>
                    <div className="student-info">
                      <div className="info-item">
                        <div className="info-label">연락처</div>
                        <div className="info-value">{student.phone}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">학부모</div>
                        <div className="info-value">{student.parent}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">학부모 연락처</div>
                        <div className="info-value">{student.parentPhone}</div>
                      </div>
                    </div>
                    <div className="student-actions">
                      <button className="btn-edit">수정</button>
                      <button className="btn-delete">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentList;