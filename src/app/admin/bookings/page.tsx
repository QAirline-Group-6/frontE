'use client';

import { useState, useEffect } from 'react';
import styles from './bookings.module.scss';
import { FaSearch } from 'react-icons/fa';

interface Booking {
  booking_id: number;
  user_id: number;
  booking_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch bookings data
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:4000/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.booking_id.toString().includes(searchTerm) ||
    booking.user_id.toString().includes(searchTerm)
  );

  // Format date to Vietnamese locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={styles.bookingsContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Đặt Chỗ</h1>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm theo ID đặt chỗ hoặc ID người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>ID ĐẶT CHỖ</th>
              <th>MÃ NGƯỜI DÙNG</th>
              <th>THỜI GIAN ĐẶT</th>
              <th>TRẠNG THÁI</th>
              <th>TỔNG TIỀN</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.user_id}</td>
                <td>{formatDate(booking.booking_time)}</td>
                <td>
                  <span className={`${styles.status} ${styles[booking.status]}`}>
                    {booking.status === 'confirmed' ? 'Đã xác nhận' : 
                     booking.status === 'cancelled' ? 'Đã hủy' : 
                     'Hoàn thành'}
                  </span>
                </td>
                <td>{booking.total_amount.toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
