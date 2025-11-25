import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import searchIcon from './assets/search.png';
import './SelfCheckAttendance.css';

const CURRENT_YEAR = 2025;
const FALLBACK_MEMBERS = [
  { id: 1, classStudentId: 1, name: '김은혜 학생', team: '중1-A', teacherName: '장미령' },
  { id: 2, classStudentId: 2, name: '박요한 학생', team: '중1-B', teacherName: '장미령' },
  { id: 3, classStudentId: 3, name: '이사랑 학생', team: '중2-A', teacherName: '장미령' },
  { id: 4, classStudentId: 4, name: '최믿음 학생', team: '중2-B', teacherName: '장미령' },
  { id: 5, classStudentId: 5, name: '정소망 학생', team: '중3-A', teacherName: '안유빈' },
  { id: 6, classStudentId: 6, name: '한기쁨 학생', team: '중3-B', teacherName: '안유빈' },
  { id: 7, classStudentId: 7, name: '윤은총 학생', team: '고1-A', teacherName: '안유빈' },
  { id: 8, classStudentId: 8, name: '오다윗 학생', team: '고1-B', teacherName: '안유빈' },
];

const DEFAULT_ATTENDANCE_STATUS = 'LATE';

const SelfCheckAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedMemberId, setCheckedMemberId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [attendanceStatusCache, setAttendanceStatusCache] = useState({});
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const classRooms = await apiRequest(API_ENDPOINTS.classes.getBySchoolYear(CURRENT_YEAR));
        const normalizedStudents = classRooms.flatMap((classRoom) => {
          const prefix = classRoom.schoolType === 'MIDDLE' ? '중' : '고';
          const classLabel = `${prefix}${classRoom.grade}-${classRoom.classNumber}반`;
          return classRoom.students.map((student) => ({
            id: student.studentId,
            classStudentId: student.id,
            name: student.studentName,
            team: classLabel,
            teacherName: classRoom.teacherName || '담임 미정',
          }));
        });
        setStudents(
          normalizedStudents.sort((a, b) => a.name.localeCompare(b.name, 'ko', { sensitivity: 'base' }))
        );
        setError(null);
      } catch (err) {
        console.error(err);
        setError('학생 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredMembers = useMemo(() => {
    const baseList = students.length > 0 ? students : FALLBACK_MEMBERS;
    if (!searchTerm.trim()) {
      return [];
    }
    const normalized = searchTerm.replace(/\s+/g, '').toLowerCase();
    return baseList.filter((member) =>
      member.name.replace(/\s+/g, '').toLowerCase().includes(normalized)
    );
  }, [students, searchTerm]);

  const currentMember = filteredMembers.length === 1 ? filteredMembers[0] : null;
  const showList = filteredMembers.length > 1;

  const formatDateKST = () => {
    const now = new Date();
    const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = koreaTime.getFullYear();
    const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
    const day = String(koreaTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const ensureTodayStatus = useCallback(
    async (member) => {
      if (attendanceStatusCache[member.id] !== undefined) {
        return attendanceStatusCache[member.id];
      }

      const targetId = member.classStudentId ?? member.id;
      if (!targetId) {
        setAttendanceStatusCache((prev) => ({ ...prev, [member.id]: false }));
        return false;
      }

      try {
        const history = await apiRequest(API_ENDPOINTS.attendance.getHistoryByClassStudent(targetId));
        const today = formatDateKST();
        const hasTodayRecord =
          Array.isArray(history) &&
          history.some(
            (entry) =>
              entry.date === today && (entry.status === 'ATTEND' || entry.status === 'LATE')
          );

        setAttendanceStatusCache((prev) => ({ ...prev, [member.id]: hasTodayRecord }));
        if (hasTodayRecord) {
          setAttendanceMap((prev) => ({ ...prev, [member.id]: true }));
        }
        return hasTodayRecord;
      } catch (err) {
        console.error(err);
        setAttendanceStatusCache((prev) => ({ ...prev, [member.id]: false }));
        return false;
      }
    },
    [attendanceStatusCache]
  );

  useEffect(() => {
    const membersToCheck = filteredMembers.filter(
      (member) => attendanceStatusCache[member.id] === undefined
    );
    if (membersToCheck.length === 0) return;

    membersToCheck.forEach((member) => {
      ensureTodayStatus(member);
    });
  }, [filteredMembers, attendanceStatusCache, ensureTodayStatus]);

  const handleClickAttendance = async (member) => {
    if (submittingId) return;

    const targetId = member.classStudentId ?? member.id;
    if (!targetId) {
      setMessage('학생 ID가 없어 출석을 기록할 수 없습니다.');
      setTimeout(() => setMessage(''), 2500);
      return;
    }

    setSubmittingId(member.id);
    const today = formatDateKST();

    try {
      await apiRequest(API_ENDPOINTS.attendance.update(targetId, today), {
        method: 'PUT',
        body: JSON.stringify({ status: DEFAULT_ATTENDANCE_STATUS }),
      });
      setAttendanceMap((prev) => ({ ...prev, [member.id]: true }));
      setAttendanceStatusCache((prev) => ({ ...prev, [member.id]: true }));
      setCheckedMemberId(member.id);
      setMessage(`${member.name} (${member.team}) 출석이 기록되었습니다!`);
    } catch (err) {
      console.error(err);
      setMessage('출석 기록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTimeout(() => setMessage(''), 2500);
      setSubmittingId(null);
    }
  };

  const findMemberById = (id) =>
    (students.find((m) => m.id === id) || FALLBACK_MEMBERS.find((m) => m.id === id)) ?? null;

  return (
    <div className="self-check-container">
      <div className="self-check-header">
        <h1>학생 셀프 출석</h1>
        <p>검색 후 본인 이름을 눌러 출석을 기록하세요.</p>
      </div>

      <div className="self-check-search">
        <div className="search-input-wrapper">
          <input
            id="self-check-input"
            type="text"
            placeholder="이름을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
          <button className="search-button" aria-label="검색">
            <img src={searchIcon} alt="검색 아이콘" />
          </button>
        </div>
      </div>

      {message && <div className="self-check-toast">{message}</div>}

      {loading ? (
        <div className="empty-state">
          <p>학생 정보를 불러오는 중입니다...</p>
        </div>
      ) : error && students.length === 0 ? (
        <div className="empty-state">
          <p>{error}</p>
          <p>임시 데이터로 출석 버튼을 눌러볼 수 있어요.</p>
        </div>
      ) : showList ? (
        <div className="self-check-list-panel">
          <p className="duplicate-hint">검색 결과가 여러 명입니다. 본인 반을 눌러 출석하세요.</p>
          <ul className="student-list">
            {filteredMembers.map((member) => {
              const checked = Boolean(attendanceMap[member.id]);
              return (
                <li key={member.id} className={`student-row ${checked ? 'checked' : ''}`}>
                  <div className="student-info">
                    <span className="student-name">{member.name}</span>
                    <span className="student-meta">
                      {member.team} · 담임 {member.teacherName || '미정'}
                    </span>
                  </div>
                  <button
                    className={`check-btn ${checked ? 'done' : ''}`}
                    onClick={() => handleClickAttendance(member)}
                    disabled={submittingId === member.id}
                  >
                    {submittingId === member.id ? '기록 중...' : checked ? '출석 완료' : '출석'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : currentMember ? (
        <div className="self-check-hero">
          <div className={`hero-card ${attendanceMap[currentMember.id] ? 'checked' : ''}`}>
            <div className="hero-info">
              <div className="hero-team-badge">
                <span className="hero-team-label">소속 반</span>
                <span className="hero-team-name">{currentMember.team}</span>
              </div>
              <p className="hero-teacher">담임: {currentMember.teacherName || '미정'}</p>
              <h2>{currentMember.name}</h2>
              <p className="hero-instruction">학생 본인 이름이 맞으면 아래 버튼을 눌러 출석하세요.</p>
            </div>
            <button
              className={`hero-button ${attendanceMap[currentMember.id] ? 'done' : ''}`}
              onClick={() => handleClickAttendance(currentMember)}
              disabled={submittingId === currentMember.id}
            >
              {submittingId === currentMember.id
                ? '기록 중...'
                : attendanceMap[currentMember.id]
                ? '출석 완료'
                : '출석'}
            </button>
          </div>
        </div>
      ) : searchTerm.trim().length === 0 ? (
        <div className="empty-state">
          <p>이름을 입력하면 검색 결과가 표시됩니다.</p>
        </div>
      ) : (
        <div className="empty-state">
          <p>해당 이름을 찾을 수 없어요. 철자와 띄어쓰기를 확인해주세요.</p>
        </div>
      )}

      <div className="self-check-footer">
        {checkedMemberId ? (
          <p>
            마지막 출석: <strong>{findMemberById(checkedMemberId)?.name}</strong>
          </p>
        ) : (
          <p>화면을 크게 띄워 놓으면 학생들이 한 번에 한 명씩 눌러 출석할 수 있어요.</p>
        )}
      </div>
    </div>
  );
};

export default SelfCheckAttendance;
