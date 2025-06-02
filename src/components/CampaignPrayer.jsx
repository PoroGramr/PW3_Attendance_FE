import React, { useState, useEffect } from 'react';
import './CampaignPrayer.css';

const CampaignPrayer = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  });

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="campaign-prayer-container">
      <div className="campaign-header">
        <input 
          type="date" 
          value={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
        />
      </div>

      <div className="prayer-content">
        <div className="prayer-section">
          <h2>오늘의 기도자</h2>
          <div className="prayer-box">
            <p className="prayer-name">홍길동</p>
            <p className="prayer-class">중2-1</p>
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