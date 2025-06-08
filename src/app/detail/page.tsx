'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './detail.module.scss';
import { FaCalendarAlt } from "react-icons/fa";
import { FaClock } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

interface Airport {
  name: string;
  city: string;
}

interface Flight {
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  departure_airport: Airport;
  destination_airport: Airport;
}

interface Seat {
  seat_number: string;
  seat_class: string;
}

interface Ticket {
  ticket_id: number;
  status: string;
  price: string;
  flight: Flight;
  seat: Seat;
}

interface BookingInfo {
  booking_code: string;
  booking_time: string;
  status: string;
  total_amount: string;
  customer: {
    first_name: string;
    last_name: string;
    id_card_number: string;
  };
  tickets: Ticket[];
}

export default function BookingDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingTicketId, setCancellingTicketId] = useState<number | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      router.push('/booking_management');
      return;
    }

    const fetchBookingInfo = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get<{ success: boolean; data: BookingInfo }>(
          `http://localhost:4000/tickets/search`,
          {
            params: {
              booking_code: code,
              email: email
            },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setBookingInfo(response.data.data);
        } else {
          setError('Không tìm thấy thông tin đặt chỗ');
        }
      } catch (err: any) {
        console.error('Error fetching booking info:', err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(err.response.data?.message || 'Có lỗi xảy ra khi tìm kiếm vé');
        } else if (err.request) {
          // The request was made but no response was received
          setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingInfo();
  }, [searchParams, router]);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(amount));
  };

  const calculateFlightDuration = (departureTime: string, arrivalTime: string) => {
    const dep = new Date(departureTime).getTime();
    const arr = new Date(arrivalTime).getTime();
    const diff = arr - dep;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${remainingMinutes} phút`;
  };

  const handleCancelTicket = async (ticketId: number) => {
    try {
      setCancellingTicketId(ticketId);
      const response = await axios.put(`http://localhost:4000/tickets/${ticketId}/cancel`);
      
      if (response.data.success) {
        // Refresh booking info after successful cancellation
        const code = searchParams.get('code');
        const email = searchParams.get('email');
        if (code && email) {
          const refreshResponse = await axios.get<{ success: boolean; data: BookingInfo }>(
            `http://localhost:4000/tickets/search`,
            {
              params: {
                booking_code: code,
                email: email
              },
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          if (refreshResponse.data.success) {
            setBookingInfo(refreshResponse.data.data);
          }
        }
      }
    } catch (err: any) {
      console.error('Error cancelling ticket:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi hủy vé');
    } finally {
      setCancellingTicketId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.error}>{error}</div>
          <button onClick={() => router.push('/booking_management')} className={styles.backButton}>
            Quay lại trang tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  if (!bookingInfo) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.bookingDetailsContainer}>
        <h2 className={styles.mainHeader}>Chi tiết đặt chỗ</h2>
        <div className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <strong>Mã đặt chỗ:</strong> {bookingInfo.booking_code}
          </div>
          <div className={styles.summaryItem}>
            <strong>Ngày đặt:</strong> {new Date(bookingInfo.booking_time).toLocaleString('vi-VN')}
          </div>
          <div className={styles.summaryItem}>
            <strong>Trạng thái:</strong> {bookingInfo.status}
          </div>
          <div className={styles.summaryItem}>
            <strong>Tổng tiền:</strong> {formatCurrency(bookingInfo.total_amount)}
          </div>
        </div>

        {bookingInfo.customer && (
          <>
            <h2 className={styles.mainHeader}>Thông tin hành khách</h2>
            <div className={styles.summaryCard}>
              <div className={styles.summaryItem}>
                <strong>Họ và tên:</strong> {bookingInfo.customer.last_name} {bookingInfo.customer.first_name}
              </div>
              <div className={styles.summaryItem}>
                <strong>Số CMND/CCCD:</strong> {bookingInfo.customer.id_card_number}
              </div>
            </div>
          </>
        )}

        <h2 className={styles.mainHeader}>Chi tiết chuyến bay</h2>
        <div className={styles.ticketsList}>
          {bookingInfo.tickets.map((ticket) => (
            <div key={ticket.ticket_id} className={styles.flightDetailCard}>
              <div className={styles.flightHeader}>
                <p>Chi tiết chuyến đi</p>
                <span>{ticket.flight.flight_number}</span>
              </div>
              <div className={styles.routeSection}>
                <div className={styles.airportBlock}>
                  <h3>{new Date(ticket.flight.departure_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</h3>
                  <p>{ticket.flight.departure_airport.city.toUpperCase()}</p>
                </div>
                <div className={styles.planeIcon}>✈</div>
                <div className={styles.airportBlock}>
                  <h3>{new Date(ticket.flight.arrival_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</h3>
                  <p>{ticket.flight.destination_airport.city.toUpperCase()}</p>
                </div>
              </div>
              <div className={styles.flightMetaDetails}>
                <div className={styles.metaItem}>
                  <span><FaCalendarAlt /> Ngày khởi hành</span>
                  <p>{new Date(ticket.flight.departure_time).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className={styles.metaItem}>
                  <span><FaClock /> Thời gian bay</span>
                  <p>{calculateFlightDuration(ticket.flight.departure_time, ticket.flight.arrival_time)}</p>
                </div>
                <div className={styles.metaItem}>
                  <span><FaUser /> Hành khách</span>
                  <p>1</p>
                </div>
              </div>
              <div className={styles.ticketDetails}>
                <p><strong>Mã vé:</strong> {ticket.ticket_id}</p>
                <p><strong>Trạng thái:</strong> {ticket.status}</p>
                <p><strong>Giá vé:</strong> {formatCurrency(ticket.price)}</p>
                <p><strong>Ghế:</strong> {ticket.seat.seat_number} ({ticket.seat.seat_class})</p>
                {ticket.status === 'booked' && (
                  <div className={styles.cancelButtonContainer}>
                    <button
                      onClick={() => handleCancelTicket(ticket.ticket_id)}
                      disabled={cancellingTicketId === ticket.ticket_id}
                      className={styles.cancelButton}
                    >
                      {cancellingTicketId === ticket.ticket_id ? 'Đang hủy...' : 'Hủy vé'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => router.push('/booking_management')} className={styles.backButton}>
          Quay lại trang tìm kiếm
        </button>
      </div>
    </div>
  );
}
