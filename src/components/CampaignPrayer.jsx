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
      <div className="campaign-header">
        {/* D-day 표시 */}

        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
        />

        {/* 메인 타이틀 */}
        <div className="prayer-title-main">
          여름 수련회를 위한 <span>금식 기도</span>
        </div>

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

        {/* 암송 말씀 섹션 */}
        <div className="prayer-section">
          <h2>암송 말씀</h2>
          <div className="prayer-box">
            <p className="prayer-title">[창39:23, 개역개정]</p>
            <p className="prayer-description">
              간수장은 그의 손에 맡긴 것을 무엇이든지 살펴보지 아니하였으니<br/>
              이는 여호와께서 요셉과 함께 하심이라<br/>
              여호와께서 그를 범사에 형통하게 하셨더라
            </p>
          </div>
        </div>

        {/* 선포문 섹션 */}
        <div className="prayer-section">
          <h2>선포문</h2>
          <div className="prayer-box">
            <p className="prayer-description">
              나는 형통한 자입니다<br/>
              하나님과 함께 함으로 오늘도 나는 모든 일에 형통합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPrayer; 