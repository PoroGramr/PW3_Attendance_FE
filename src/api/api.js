// API 기본 URL 설정
const BASE_URL = 'https://pw3api.porogramr.site';
// const BASE_URL = 'http://localhost:8080';

// API 엔드포인트 객체
const API_ENDPOINTS = {
  // 학생 관련 API
  students: {
    getAll: `${BASE_URL}/students`,
    getAllWithClassInfo: (year) => `${BASE_URL}/students/studentsWithClassInfo?schoolYear=${year}`,
    getByYear: (year) => `${BASE_URL}/students/year?year=${year}`,
    getByClass: (classId) => `${BASE_URL}/student-classes/classroom/${classId}?schoolYear=2025`,
    getById: (id) => `${BASE_URL}/students/${id}`,
    create: `${BASE_URL}/students`,
    update: (id) => `${BASE_URL}/students/${id}`,
    delete: (id) => `${BASE_URL}/students/${id}`,
    getRegistrationsByYear: (year) => `${BASE_URL}/students/registrations/by-year/${year}`,
  },

  // 교사 관련 API
  teachers: {
    getAll: () => `${BASE_URL}/teacher`,
    getById: (id) => `${BASE_URL}/teachers/${id}`,
    create: () => `${BASE_URL}/teacher`,
    update: (id) => `${BASE_URL}/teacher/${id}`,
    delete: (id) => `${BASE_URL}/teacher/${id}`,
  },

  // 선생님 출석 관련 API
  teacherAttendance: {
    getByDate: (date) => `${BASE_URL}/attendance/teachers/status?date=${date}`,
    update: (teacherId, status, date) => `${BASE_URL}/attendance/teacher/mark?teacherId=${teacherId}&status=${status}&date=${date}`,
  },

  // 출석 관련 API
  attendance: {
    getAll: `${BASE_URL}/attendance`,
    getByDate: (year, date) => `${BASE_URL}/attendances/year/${year}/date/${date}`,
    getByClass: (classId, year, date) => `${BASE_URL}/attendances/class/${classId}/year/${year}/date/${date}`,
    getByStudent: (studentId) => `${BASE_URL}/attendance/student/${studentId}`,
    create: `${BASE_URL}/attendance`,
    update: (studentId, date) => `${BASE_URL}/attendances/${studentId}/${date}`,
    getHistoryByClassStudent: (classStudentId) => `${BASE_URL}/attendances/${classStudentId}`,
  },

  // 반 관련 API
  classes: {
    getAll: (year) => `${BASE_URL}/student-classes/year/${year}/class-rooms`,
    getBySchoolYear: (year) => `${BASE_URL}/student-classes/school-year/${year}`,
    getById: (id) => `${BASE_URL}/student-classes/classroom/${id}?schoolYear=2025`,
    create: `${BASE_URL}/student-classes`,
    update: (id) => `${BASE_URL}/student-classes/${id}`,
    delete: (id) => `${BASE_URL}/student-classes/${id}`,
  },

  // 교사-반 배정 API
  teacherClasses: {
    assign: () => `${BASE_URL}/teacher-classes`,
  },

  // 출석 통계 관련 API
  attendanceStats: {
    getClassrooms: `${BASE_URL}/classrooms`,
    getClassAttendance: (classroomId) => `${BASE_URL}/attendances/classrooms/${classroomId}/sundays/summary`,
    getTotalAttendance: `${BASE_URL}/attendances/summary/sundays`,
  },

  // 초청 친구 관련 API
  invitedFriends: {
    getAll: `${BASE_URL}/new-friends`,
    getById: (id) => `${BASE_URL}/new-friends/${id}`,
    create: `${BASE_URL}/new-friends`,
    update: (id) => `${BASE_URL}/new-friends/${id}`,
    delete: (id) => `${BASE_URL}/new-friends/${id}`,
    searchStudents: (query) => `${BASE_URL}/students/search?query=${encodeURIComponent(query)}`,
  },
};

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}) => {
  try {
    console.log('API 요청:', endpoint, options); // 디버깅용 로그
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API 응답 에러:', response.status, errorData); // 디버깅용 로그
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || 'Unknown error'}`);
    }

    // 204 No Content 응답은 본문이 없으므로 null 반환
    if (response.status === 204) {
      return null; 
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API 응답 (JSON):', data); // 디버깅용 로그
      return data;
    }
    
    const data = await response.text();
    console.log('API 응답 (Text):', data); // 디버깅용 로그
    return data;
  } catch (error) {
    console.error('API 요청 중 에러 발생:', error);
    throw error;
  }
};

export { API_ENDPOINTS, apiRequest }; 