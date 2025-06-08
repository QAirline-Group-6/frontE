import React, { useState } from 'react';
import styles from './payment.module.scss';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface PaymentSuccessProps {
  bookingCode: string;
  onReturnHome: () => void;
  isRoundTrip?: boolean;
}

const Payment: React.FC<PaymentSuccessProps> = ({
  bookingCode = "ABC123",
  onReturnHome,
  isRoundTrip,
}) => {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successIcon}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="#4CAF50"/>
            <path 
              d="M25 40L35 50L55 30" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h1 className={styles.title}>Thanh toán thành công</h1>
        
        <div className={styles.bookingInfo}>
          <p className={styles.bookingLabel}>Mã đặt vé của bạn là:</p>
          <div className={styles.bookingCodeContainer}>
            <div className={styles.bookingCode}>{bookingCode}</div>
            <button 
              className={styles.copyButton}
              onClick={handleCopyCode}
              title="Sao chép mã đặt vé"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          <p className={styles.bookingNote}>
            Mã đặt vé này sẽ hết hạn sau 24 giờ. Vui lòng lưu lại để sử dụng khi cần thiết.
          </p>
        </div>
        
        <div className={styles.message}>
          <p>Cảm ơn quý khách đã đặt vé. Chúc quý khách có chuyến bay vui vẻ!</p>
          <p className={styles.instruction}>
            Vui lòng sử dụng mã đặt vé này khi làm thủ tục check-in tại sân bay.
          </p>
        </div>
        
        <button 
          className={styles.homeButton}
          onClick={handleReturnHome}
        >
          Quay về trang chủ
        </button>
      </div>
      
      <div className={styles.notification}>
        <div className={styles.notificationContent}>
          <h2>Thanh toán thành công</h2>
          <p>Cảm ơn quý khách đã đặt vé. Chúc quý khách có chuyến bay vui vẻ!</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
