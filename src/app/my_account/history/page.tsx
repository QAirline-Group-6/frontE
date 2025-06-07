'use client';

import { useState, useEffect } from 'react';
import styles from './history.module.scss';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Assuming useRouter is needed for potential navigation

interface BookingHistoryItem {
  date: string;
  transaction_type: string;
  booking_code: string;
}

export default function HistoryPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [historyData, setHistoryData] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter(); // Initialize useRouter

  // Placeholder for userId. In a real app, this would come from auth context/local storage.
  // For demonstration, using 11 as per your backend API example: /users/11/bookings/detail
  const userId = '11'; 

  const fetchHistory = async (start?: string, end?: string) => {
    setLoading(true);
    setError('');
    try {
      // Get the authentication token from localStorage or your auth context
      const token = localStorage.getItem('token'); // Replace with your actual token retrieval logic
      if (!token) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử.');
        setLoading(false);
        // Optionally redirect to login page
        // router.push('/login'); 
        return;
      }

      // Construct URL with optional date parameters
      const params = new URLSearchParams();
      if (start) {
        params.append('startDate', start);
      }
      if (end) {
        params.append('endDate', end);
      }
      
      // Use the correct API endpoint and user ID
      const response = await axios.get(`http://localhost:4000/users/${userId}/bookings/detail?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.bookings) {
        const formattedData = response.data.bookings.map((booking: any) => ({
          date: new Date(booking.booking_time).toLocaleDateString('vi-VN'),
          transaction_type: 'Đặt vé',
          booking_code: booking.booking_code,
        }));
        setHistoryData(formattedData);
      } else {
        setHistoryData([]);
        setError('Không tìm thấy dữ liệu lịch sử đặt chỗ.');
      }
    } catch (err: any) {
      console.error('Error fetching booking history:', err);
      if (err.response && err.response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
        // Optionally redirect to login page
        // router.push('/login');
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải lịch sử đặt chỗ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(); // Fetch data on initial load
  }, []); // Empty dependency array means it runs once on mount

  const handleSearch = () => {
    fetchHistory(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    fetchHistory(); // Fetch all data after resetting filters
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải lịch sử hoạt động...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={handleReset} className={styles.backButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          Lịch sử hoạt động
        </h2>

        {/* Filter Section */}
        {/* <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Từ ngày:
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={styles.dateInput}
            />
          </div> */}

          {/* <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Đến ngày:
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={handleSearch} className={styles.searchButton}>
              TÌM KIẾM
            </button>
            <button onClick={handleReset} className={styles.resetButton}>
              RESET
            </button>
          </div>
        </div> */}

        {/* History Table */}
        <div className={styles.tableContainer}>
          <table className={styles.historyTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableCell}>Ngày</th>
                <th className={styles.tableCell}>Loại giao dịch</th>
                <th className={styles.tableCell}>Mã đặt chỗ</th>
              </tr>
            </thead>
            <tbody>
              {historyData.length > 0 ? (
                historyData.map((item, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.tableCell}>{item.date}</td>
                    <td className={styles.tableCell}>{item.transaction_type}</td>
                    <td className={styles.tableCell}>{item.booking_code}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.emptyState}>
                    Không có dữ liệu hoạt động
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}