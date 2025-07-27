import React, { useState, useEffect } from 'react';
import './CampaignPrayer.css';

const API_BASE = 'https://pw3api.porogramr.site/pray/';

const CampaignPrayer = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    return koreaTime.toISOString().split('T')[0];
  });

  // 8월 1일을 기준으로 D-day를 계산하는 함수 (기준일을 인자로 받음)
  const calculateDDay = (baseDateStr) => {
    const baseDate = new Date(baseDateStr);
    const targetDate = new Date(baseDate.getFullYear(), 7, 1); // 8월은 0부터 시작하므로 7입니다.
    if (baseDate > targetDate) {
      targetDate.setFullYear(baseDate.getFullYear() + 1);
    }
    const timeDiff = targetDate.getTime() - baseDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (daysDiff == 365) {
      return "Day";
    }
    return daysDiff;
  };

  const [dDay, setDDay] = useState(() => calculateDDay(selectedDate));

  // API 데이터 상태
  const [prayerData, setPrayerData] = useState({
    prayer: '',
    prayContent: '',
    recitation: '',
    declaration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 날짜를 YYYY-MM-DD 문자열로 변환
  const toDateString = (dateStr) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  };

  // 날짜를 하루 더하거나 빼는 함수
  const addDays = (dateStr, diff) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  // API 요청 함수
  const fetchPrayerData = async (dateStr) => {
    setLoading(true);
    setError(null);
    const reqDate = toDateString(dateStr);
    try {
      const res = await fetch(`${API_BASE}${reqDate}`);
      if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.');
      const data = await res.json();
      setPrayerData({
        prayer: data.prayer || '',
        prayContent: data.prayContent || '',
        recitation: data.recitation || '',
        declaration: data.declaration || '',
      });
    } catch (err) {
      setError(err.message);
      setPrayerData({ prayer: '', prayContent: '', recitation: '', declaration: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerData(selectedDate);
    setDDay(calculateDDay(selectedDate));
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // 이전날/다음날 버튼 핸들러
  const handlePrevDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };
  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  return (
    <div className="campaign-prayer-container">
      <div className="campaign-header">
        <div className="date-arrow-group">
          <button className="date-arrow" onClick={handlePrevDay}>&#x25C0;</button>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
          <button className="date-arrow" onClick={handleNextDay}>&#x25B6;</button>
        </div>
        <div className="prayer-title-main">
          여름 수련회를 위한 <span>금식 기도</span>
        </div>
        <div className="d-day-display">
          D-{dDay}
        </div>
      </div>

      <div className="prayer-content">
        {loading ? (
          <div className="prayer-section"><p>로딩 중...</p></div>
        ) : error ? (
          <div className="prayer-section"><p style={{color:'#ef4444'}}>{error}</p></div>
        ) : (
          <>
            <div className="prayer-section">
              <h2>오늘의 기도자</h2>
              <div className="prayer-box">
                <p className="prayer-name">{prayerData.prayer}</p>
              </div>
            </div>

            <div className="prayer-section">
              <h2>오늘의 기도 제목</h2>
              <div className="prayer-box">
                <p className="prayer-title">{prayerData.prayContent}</p>
              </div>
            </div>

            <div className="prayer-section">
              <h2>암송 말씀</h2>
              <div className="prayer-box">
                <p className="prayer-description">{prayerData.recitation}</p>
              </div>
            </div>

            <div className="prayer-section">
              <h2>선포문</h2>
              <div className="prayer-box">
                <p className="prayer-description">{prayerData.declaration}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignPrayer; 