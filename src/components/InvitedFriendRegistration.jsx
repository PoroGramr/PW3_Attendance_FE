import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, API_ENDPOINTS } from '../api/api';
import './InvitedFriendRegistration.css';

const InvitedFriendRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    phoneNumber: '',
    invitedBy: null
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 학생 검색 함수
  const searchStudents = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // 2025년 학생 목록과 반 정보를 가져옴
      const [studentsResponse, classesResponse] = await Promise.all([
        apiRequest(API_ENDPOINTS.students.getByYear(2025)),
        apiRequest(API_ENDPOINTS.classes.getAll(2025))
      ]);

      // 반 정보를 Map으로 변환하여 빠른 조회 가능하게 함
      const classMap = new Map();
      classesResponse.forEach(classInfo => {
        classMap.set(classInfo.id, classInfo);
      });

      // 학생 이름으로 필터링하고 반 정보를 추가
      const filteredStudents = studentsResponse
        .filter(student => 
          student.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(student => {
          const classInfo = classMap.get(student.classRoomId);
          return {
            ...student,
            schoolType: classInfo?.schoolType || null,
            grade: classInfo?.grade || null,
            classNumber: classInfo?.classNumber || null,
            className: classInfo?.name || null,
            teacherName: classInfo?.teacherName || null
          };
        });

      setSearchResults(filteredStudents);
      setShowSearchResults(true);
    } catch (error) {
      console.error('학생 검색 중 오류:', error);
      setMessage('학생 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchStudents(query);
  };

  // 학생 선택 핸들러
  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      invitedBy: student
    }));
    setSearchQuery(student.name);
    setShowSearchResults(false);
  };

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthday || !formData.phoneNumber || !formData.invitedBy) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 초청 친구 등록 데이터 준비
      const invitedFriendData = {
        name: formData.name,
        birth: formData.birthday,
        phone: formData.phoneNumber,
        studentId: formData.invitedBy.id,
        studentName: formData.invitedBy.name
      };
      
      // 초청 친구 등록 API 호출
      await apiRequest(API_ENDPOINTS.invitedFriends.create, {
        method: 'POST',
        body: JSON.stringify(invitedFriendData)
      });
      
      setMessage('초청 친구가 성공적으로 등록되었습니다.');
      
      // 폼 초기화
      setFormData({
        name: '',
        birthday: '',
        phoneNumber: '',
        invitedBy: null
      });
      setSearchQuery('');
      
    } catch (error) {
      console.error('초청 친구 등록 중 오류:', error);
      setMessage('초청 친구 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 결과 외부 클릭 시 숨기기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="invited-friend-registration">
      <div className="header">
        <h1>초청 친구 등록</h1>
        <p>새로운 초청 친구의 정보를 입력해주세요.</p>
        <button 
          onClick={() => navigate('/invited-friend-list')}
          className="list-button"
        >
          📋 초청 친구 목록 보기
        </button>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="name">이름 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthday">생일 *</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">전화번호 *</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="010-1234-5678"
            required
          />
        </div>

        <div className="form-group search-container">
          <label htmlFor="invitedBy">데려온 친구 *</label>
          <input
            type="text"
            id="invitedBy"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="학생 이름을 검색하세요"
            required
          />
          
          {showSearchResults && (
            <div className="search-results">
              {isLoading ? (
                <div className="loading">검색 중...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(student => (
                    <li 
                      key={student.id} 
                      onClick={() => handleStudentSelect(student)}
                      className="search-result-item"
                    >
                      <div className="student-info">
                        <div className="student-name">{student.name}</div>
                        <div className="student-details">
                          <div className="detail-item">
                            <span className="detail-label">학교:</span>
                            <span className="detail-value">
                              {student.schoolType === 'MIDDLE' ? '중학교' : 
                               student.schoolType === 'HIGH' ? '고등학교' : 
                               '학교 정보 없음'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">학년:</span>
                            <span className="detail-value">
                              {student.grade ? `${student.grade}학년` : '학년 정보 없음'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">담임선생님:</span>
                            <span className="detail-value">
                              {student.teacherName || '담임 정보 없음'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">반:</span>
                            <span className="detail-value">
                              {student.className || '반 정보 없음'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-results">검색 결과가 없습니다.</div>
              )}
            </div>
          )}
        </div>

        {formData.invitedBy && (
          <div className="selected-student">
            <span className="label">선택된 학생:</span>
            <span className="student-info">
              {formData.invitedBy.name} 
              {formData.invitedBy.schoolType && ` (${formData.invitedBy.schoolType === 'MIDDLE' ? '중학교' : '고등학교'})`}
              {formData.invitedBy.grade && ` ${formData.invitedBy.grade}학년`}
              {formData.invitedBy.className && ` ${formData.invitedBy.className}`}
            </span>
            <button 
              type="button" 
              onClick={() => {
                setFormData(prev => ({ ...prev, invitedBy: null }));
                setSearchQuery('');
              }}
              className="remove-button"
            >
              ✕
            </button>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('성공') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? '등록 중...' : '초청 친구 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvitedFriendRegistration;
