import React, { useState, useEffect } from 'react';
import './CampaignPrayer.css';

const CampaignPrayer = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  });

  // 8월 1일을 기준으로 D-day를 계산하는 함수
  const calculateDDay = () => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), 7, 1); // 8월은 0부터 시작하므로 7입니다.

    // 이미 8월 1일이 지났다면, 다음 해 8월 1일을 목표로 설정
    if (today > targetDate) {
      targetDate.setFullYear(today.getFullYear() + 1);
    }

    const timeDiff = targetDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const [dDay, setDDay] = useState(calculateDDay());

  // 날짜가 변경될 때마다 D-day를 다시 계산할 필요는 없으므로 useEffect는 사용하지 않습니다.
  // 만약 날짜 선택에 따라 D-day 기준일이 바뀌어야 한다면 useEffect나 다른 로직이 필요합니다.
  

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="campaign-prayer-container">
      {/* 로고 이미지 */}
      <img src="/logo.jpg" alt="교회 로고" className="logo-image" />

      <div className="campaign-header">
        {/* D-day 표시 */}

        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
        />

        {/* D-day 표시 */}
        <div className="d-day-display">
          D-{dDay}
        </div>
      </div>

      <div className="prayer-content">
        <div className="prayer-section">
          <h2>오늘의 기도자</h2>
          <div className="prayer-box">
            <p className="prayer-name">홍길동</p>
          </div>
        </div>

        <div className="prayer-section">
          <h2>오늘의 기도 제목</h2>
          <div className="prayer-box">
            <p className="prayer-title">1. 교회를 위한 기도</p>
            <p className="prayer-description">
              - 교회의 부흥을 위해<br/>
              - 목사님과 교역자님들의 건강을 위해<br/>
              - 청년부의 성장을 위해
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPrayer; 