import React, { useState, useCallback, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { API_ENDPOINTS, apiRequest } from '../api/api';
import './QrAttendance.css';

const QrAttendance = () => {
  const [message, setMessage] = useState('QR 코드를 스캔해주세요.');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const [showScanner, setShowScanner] = useState(true);

  // 🔹 onScan: detectedCodes 배열에서 rawValue 추출
  const handleScan = useCallback(
    (detectedCodes) => {
      if (!isScanning) return;
      if (!detectedCodes || detectedCodes.length === 0) return;

      const text = detectedCodes[0]?.rawValue;
      if (!text) return;

      setIsScanning(false);    // 중복 스캔 방지
      setShowScanner(false);   // 스캔 성공 시 스캐너 숨김
      setScannedData(text);    // 백엔드로 보낼 qrPayload
    },
    [isScanning]
  );

  const handleError = (error) => {
    console.error('QR 스캔 오류:', error?.message || error);
  };

  useEffect(() => {
    if (!scannedData) return;

    const processQrData = async () => {
      setMessage('QR 코드를 확인 중입니다...');
      setMessageType('info');

      try {
        const response = await apiRequest(
          API_ENDPOINTS.attendance.checkByQr(),
          {
            method: 'POST',
            body: JSON.stringify({
              qrPayload: scannedData,
              status: 'ATTEND', // 기본 출석 상태
            }),
          }
        );

        setMessage(`${response.student.name} 학생, 출석 처리되었습니다.`);
        setMessageType('success');
      } catch (err) {
        setMessage(err?.message || '출석 처리 중 오류가 발생했습니다.');
        setMessageType('error');
      } finally {
        setTimeout(() => {
          setMessage('QR 코드를 스캔해주세요.');
          setMessageType('info');
          setIsScanning(true);
          setShowScanner(true);
          setScannedData(null);
        }, 1500); // 3초에서 1.5초로 변경
      }
    };

    processQrData();
  }, [scannedData]);

  return (
    <div className="qr-attendance-container">
      <div className="qr-header">
        <h1>QR 출석 체크</h1>
      </div>

      <div className={`qr-reader-wrapper mirror ${!showScanner ? 'hidden' : ''}`}>
  {showScanner && (
    <Scanner
      onScan={handleScan}
      onError={handleError}
      constraints={{ facingMode: 'user' }}
      videoStyle={{ 
        transform: 'scaleX(-1)' // 비디오 요소를 직접 좌우 반전
      }}
    />
  )}
</div>

      <div className={`qr-message ${messageType}`}>
        {message}
      </div>
    </div>
  );
};

export default QrAttendance;
