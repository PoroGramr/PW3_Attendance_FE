import React, { useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS } from '../api/api';
import './InvitedFriendList.css';

const InvitedFriendList = () => {
  const [invitedFriends, setInvitedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [editingFriend, setEditingFriend] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    birth: '',
    phone: '',
    studentId: null,
    studentName: ''
  });

  // 초청 친구 목록 가져오기
  const fetchInvitedFriends = async () => {
    try {
      setIsLoading(true);
      setError('');
      const friends = await apiRequest(API_ENDPOINTS.invitedFriends.getAll);
      setInvitedFriends(friends);
      setFilteredFriends(friends);
    } catch (error) {
      console.error('초청 친구 목록 조회 중 오류:', error);
      setError('초청 친구 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 초청 친구 삭제
  const handleDelete = async (friendId, friendName) => {
    if (!window.confirm(`${friendName}님을 초청 친구 목록에서 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.invitedFriends.delete(friendId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('삭제 응답 상태:', response.status); // 디버깅용

      if (response.ok || response.status === 204) {
        setMessage(`${friendName}님이 삭제되었습니다.`);
        fetchInvitedFriends(); // 목록 새로고침
      } else {
        console.error('삭제 API 응답 오류:', response.status);
        setError('초청 친구 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('초청 친구 삭제 중 오류:', error);
      setError('초청 친구 삭제 중 오류가 발생했습니다.');
    }
  };

  // 수정 모드 시작
  const handleEdit = (friend) => {
    setEditingFriend(friend.id);
    setEditForm({
      name: friend.name,
      birth: friend.birth,
      phone: friend.phone,
      studentId: friend.studentId,
      studentName: friend.studentName
    });
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingFriend(null);
    setEditForm({
      name: '',
      birth: '',
      phone: '',
      studentId: null,
      studentName: ''
    });
  };

  // 수정 폼 입력 변경
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.birth || !editForm.phone) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      // API 스펙에 맞게 studentName 제거하고 studentId만 전송
      const updateData = {
        name: editForm.name,
        birth: editForm.birth,
        phone: editForm.phone,
        studentId: editForm.studentId
      };

      const response = await fetch(API_ENDPOINTS.invitedFriends.update(editingFriend), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setMessage('초청 친구 정보가 수정되었습니다.');
        setEditingFriend(null);
        fetchInvitedFriends(); // 목록 새로고침
      } else {
        console.error('수정 API 응답 오류:', response.status);
        setError('초청 친구 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('초청 친구 수정 중 오류:', error);
      setError('초청 친구 수정 중 오류가 발생했습니다.');
    }
  };

  // 검색 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(invitedFriends);
    } else {
      const filtered = invitedFriends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (friend.studentName && friend.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFriends(filtered);
    }
  }, [searchQuery, invitedFriends]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchInvitedFriends();
  }, []);

  // 메시지 자동 사라짐
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="invited-friend-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>초청 친구 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invited-friend-list">
      <div className="header">
        <h1>초청 친구 목록</h1>
        <p>등록된 초청 친구들의 목록을 확인할 수 있습니다.</p>
      </div>

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
        <button 
          onClick={fetchInvitedFriends}
          className="refresh-button"
        >
          새로고침
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="friends-container">
        {filteredFriends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>초청 친구가 없습니다</h3>
            <p>
              {searchQuery ? '검색 결과가 없습니다.' : '아직 등록된 초청 친구가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="friends-grid">
            {filteredFriends.map(friend => (
              <div key={friend.id} className="friend-card">
                <div className="friend-header">
                  <div className="friend-name">{friend.name}</div>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(friend)}
                      className="edit-button"
                      title="수정"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(friend.id, friend.name)}
                      className="delete-button"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {editingFriend === friend.id ? (
                  <div className="edit-form">
                    <div className="edit-field">
                      <label>이름:</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditInputChange}
                        className="edit-input"
                      />
                    </div>
                    <div className="edit-field">
                      <label>생일:</label>
                      <input
                        type="date"
                        name="birth"
                        value={editForm.birth}
                        onChange={handleEditInputChange}
                        className="edit-input"
                      />
                    </div>
                    <div className="edit-field">
                      <label>전화번호:</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditInputChange}
                        className="edit-input"
                      />
                    </div>
                    <div className="edit-field">
                      <label>데려온 친구:</label>
                      <span className="edit-readonly">{editForm.studentName}</span>
                    </div>
                    <div className="edit-actions">
                      <button
                        onClick={handleSaveEdit}
                        className="save-button"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="cancel-button"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="friend-details">
                    <div className="detail-row">
                      <span className="label">생일:</span>
                      <span className="value">{formatDate(friend.birth)}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="label">전화번호:</span>
                      <span className="value">
                        {friend.phone || '전화번호 없음'}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="label">데려온 친구:</span>
                      <span className="value">
                        {friend.studentName || '정보 없음'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="summary">
        <p>총 {filteredFriends.length}명의 초청 친구</p>
        {searchQuery && (
          <p className="search-info">
            "{searchQuery}" 검색 결과: {filteredFriends.length}명
          </p>
        )}
      </div>
    </div>
  );
};

export default InvitedFriendList;
