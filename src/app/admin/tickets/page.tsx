'use client';

import { useState, useEffect } from 'react';
import styles from './tickets.module.scss';
import { FaSearch } from 'react-icons/fa';

interface Ticket {
  ticket_id: number;
  booking_id: number;
  flight_id: number;
  seat_id: number;
  customer_id: number;
  price: number;
  status: 'booked' | 'cancelled' | 'checked_in';
}

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets data
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:4000/bookings/ticket', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Ticket[] = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticket_id.toString().includes(searchTerm) ||
    ticket.booking_id.toString().includes(searchTerm) ||
    ticket.flight_id.toString().includes(searchTerm)
  );

  return (
    <div className={styles.ticketsContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Đặt Vé</h1>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm theo ID vé, mã đặt chỗ hoặc mã chuyến bay..."
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
        <table className={styles.ticketsTable}>
          <thead>
            <tr>
              <th>ID VÉ</th>
              <th>MÃ ĐẶT CHỖ </th>
              <th>MÃ CHUYẾN BAY</th>
              <th>MÃ GHẾ</th>
              <th>MÃ KHÁCH HÀNG</th>
              <th>GÍA VÉ</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.ticket_id}>
                <td>{ticket.ticket_id}</td>
                <td>{ticket.booking_id}</td>
                <td>{ticket.flight_id}</td>
                <td>{ticket.seat_id}</td>
                <td>{ticket.customer_id}</td>
                <td>{ticket.price.toLocaleString('vi-VN')} VNĐ</td>
                <td>
                  <span className={`${styles.status} ${styles[ticket.status]}`}>
                    {ticket.status === 'booked' ? 'Đã đặt' : 
                     ticket.status === 'cancelled' ? 'Đã hủy' : 
                     'Đã check-in'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
