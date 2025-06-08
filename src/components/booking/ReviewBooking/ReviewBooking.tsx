import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import styles from './reviewBooking.module.scss'; // Import styles từ FlightBooking
import { PassengerData, FlightDetails } from '../Passenger/passenger'; // Import types PassengerData và FlightDetails từ Passenger.tsx
import { FaPlane, FaUser, FaChair, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';

interface Seat {
  id: string;
  seat_number: string;
  type: 'economy' | 'business' | 'premium';
  status: 'available' | 'occupied' | 'selected';
}

interface ReviewBookingProps {
  passengerData: PassengerData[];
  selectedSeats: string[];
  returnSelectedSeats?: string[];
  flightDetails: FlightDetails;
  returnFlightDetails?: FlightDetails;
  isRoundTrip?: boolean;
  onConfirm: (bookingData: any) => void;
}

const ReviewBooking: React.FC<ReviewBookingProps> = ({
  passengerData,
  selectedSeats,
  returnSelectedSeats = [],
  flightDetails,
  returnFlightDetails,
  isRoundTrip,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outboundSeatDetails, setOutboundSeatDetails] = useState<Seat[]>([]);
  const [returnSeatDetails, setReturnSeatDetails] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchSeatDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch outbound flight seats
        const outboundResponse = await axios.get(`http://localhost:4000/seats/flight/${flightDetails.flightNumber}`);
        const outboundSeats = outboundResponse.data;
        const selectedOutboundSeats = outboundSeats
          .filter((seat: any) => selectedSeats.includes(seat.seat_id.toString()))
          .map((seat: any) => ({
            id: seat.seat_id.toString(),
            seat_number: seat.seat_number,
            type: seat.seat_class?.toLowerCase().includes('business') ? 'business' : 'economy',
            status: 'selected'
          }));
        
        setOutboundSeatDetails(selectedOutboundSeats);

        // Fetch return flight seats if it's a round trip
        if (isRoundTrip && returnFlightDetails) {
          const returnResponse = await axios.get(`http://localhost:4000/seats/flight/${returnFlightDetails.flightNumber}`);
          const returnSeats = returnResponse.data;
          const selectedReturnSeats = returnSeats
            .filter((seat: any) => returnSelectedSeats.includes(seat.seat_id.toString()))
            .map((seat: any) => ({
              id: seat.seat_id.toString(),
              seat_number: seat.seat_number,
              type: seat.seat_class?.toLowerCase().includes('business') ? 'business' : 'economy',
              status: 'selected'
            }));
          
          setReturnSeatDetails(selectedReturnSeats);
        } else {
          setReturnSeatDetails([]);
        }
      } catch (err) {
        console.error('Error fetching seat details:', err);
        setError('Không thể tải thông tin ghế. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeatDetails();
  }, [flightDetails.flightNumber, returnFlightDetails?.flightNumber, selectedSeats, returnSelectedSeats, isRoundTrip]);

  const validateBooking = () => {
    if (passengerData.length === 0) {
      setError('Vui lòng nhập thông tin hành khách');
      return false;
    }
    if (selectedSeats.length === 0) {
      setError('Vui lòng chọn ghế cho chuyến đi');
      return false;
    }
    if (isRoundTrip && returnSelectedSeats.length === 0) {
      setError('Vui lòng chọn ghế cho chuyến về');
      return false;
    }
    if (selectedSeats.length !== passengerData.length) {
      setError('Số lượng ghế chuyến đi phải bằng số lượng hành khách');
      return false;
    }
    if (isRoundTrip && returnSelectedSeats.length !== passengerData.length) {
      setError('Số lượng ghế chuyến về phải bằng số lượng hành khách');
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateBooking()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!user || !user.id) {
        throw new Error('Vui lòng đăng nhập để đặt vé');
      }

      // Generate booking code based on timestamp
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 1000);
      const bookingCode = `B${timestamp}${random}`;

      // Format date from dd/MM/yyyy to yyyy-MM-dd
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return '';
        return `${year}-${month}-${day}`;
      };

      // Validate passenger data
      const validatePassengerData = (passenger: PassengerData) => {
        if (!passenger.firstName || !passenger.lastName || !passenger.idNumber || !passenger.birthDate) {
          throw new Error('Thông tin hành khách không đầy đủ');
        }
        const formattedDate = formatDate(passenger.birthDate);
        if (!formattedDate) {
          throw new Error('Định dạng ngày sinh không hợp lệ');
        }
        return true;
      };

      // Validate all passengers
      passengerData.forEach(validatePassengerData);

      // Prepare booking data
      const bookingData = {
        booking_code: bookingCode,
        user_id: user.id,
        total_amount: getTotalPrice(),
        status: "confirmed",
        bookings: [
          {
            flight_id: flightDetails.flight_id,
            tickets: passengerData.map((passenger, index) => {
              const formattedDate = formatDate(passenger.birthDate);
              return {
                customer: {
                  first_name: passenger.firstName,
                  last_name: passenger.lastName,
                  address: passenger.address || '',
                  gender: passenger.gender,
                  date_of_birth: formattedDate,
                  id_card_number: passenger.idNumber,
                  status: "confirmed"
                },
                seat_id: parseInt(selectedSeats[index]),
                price: Math.floor(flightDetails.price / passengerData.length)
              };
            })
          }
        ]
      };

      // Add return flight if it's a round trip
      if (isRoundTrip && returnFlightDetails) {
        bookingData.bookings.push({
          flight_id: returnFlightDetails.flight_id,
          tickets: passengerData.map((passenger, index) => {
            const formattedDate = formatDate(passenger.birthDate);
            return {
              customer: {
                first_name: passenger.firstName,
                last_name: passenger.lastName,
                address: passenger.address || '',
                gender: passenger.gender,
                date_of_birth: formattedDate,
                id_card_number: passenger.idNumber,
                status: "confirmed"
              },
              seat_id: parseInt(returnSelectedSeats[index]),
              price: Math.floor(returnFlightDetails.price / passengerData.length)
            };
          })
        });
      }

      // Validate the booking data
      if (!bookingData.bookings.every(booking => 
        booking.flight_id > 0 && 
        booking.tickets.every(ticket => 
          ticket.seat_id > 0 && 
          ticket.price > 0 &&
          ticket.customer.first_name &&
          ticket.customer.last_name &&
          ticket.customer.id_card_number &&
          ticket.customer.date_of_birth
        )
      )) {
        throw new Error('Dữ liệu booking không hợp lệ');
      }

      console.log('Sending booking data:', JSON.stringify(bookingData, null, 2));

      // Call onConfirm with booking data
      await onConfirm(bookingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận đặt vé. Vui lòng thử lại.');
      console.error('Error confirming booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const getTotalPrice = () => {
    const outboundPrice = flightDetails.price;
    const returnPrice = returnFlightDetails?.price || 0;
    return outboundPrice + returnPrice;
  };

  const renderSeatInfo = (seats: Seat[], flightType: 'outbound' | 'return') => {
    if (loading) {
      return <div className={styles.loading}>Đang tải thông tin ghế...</div>;
    }

    if (seats.length === 0) {
      return <div className={styles.error}>Chưa chọn ghế</div>;
    }

    return (
      <div className={styles.seatList}>
        {seats.map((seat, index) => (
          <div key={seat.id} className={styles.seatItem}>
            <span className={styles.passengerLabel}>Hành khách {index + 1}:</span>
            <span className={styles.seatNumber}>
              {seat.seat_number}
              <span className={styles.seatType}>
                ({seat.type === 'business' ? 'Business' : 'Economy'})
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.bookingHeader}>
        <h2>Xem lại thông tin đặt vé</h2>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <FaUser className={styles.icon} />
          <h3>Thông tin hành khách</h3>
        </div>
        {passengerData.map((passenger, index) => (
          <div key={index} className={styles.passengerInfoItem}>
            <h4>Hành khách {index + 1}</h4>
            <div className={styles.passengerDetails}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Họ và tên:</span>
                <span className={styles.value}>{`${passenger.firstName} ${passenger.lastName}`}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>CMND/CCCD:</span>
                <span className={styles.value}>{passenger.idNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Số điện thoại:</span>
                <span className={styles.value}>{passenger.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Ngày sinh:</span>
                <span className={styles.value}>{passenger.birthDate}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Giới tính:</span>
                <span className={styles.value}>{passenger.gender === 'male' ? 'Nam' : 'Nữ'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Địa chỉ:</span>
                <span className={styles.value}>{passenger.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <FaChair className={styles.icon} />
          <h3>Ghế đã chọn</h3>
        </div>
        <div className={styles.seatInfo}>
          <div className={styles.flightSeats}>
            <h4>Chuyến bay đi</h4>
            {renderSeatInfo(outboundSeatDetails, 'outbound')}
          </div>
          
          {isRoundTrip && returnFlightDetails && (
            <div className={styles.flightSeats}>
              <h4>Chuyến bay về</h4>
              {renderSeatInfo(returnSeatDetails, 'return')}
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <FaPlane className={styles.icon} />
          <h3>Thông tin chuyến bay</h3>
        </div>
        
        <div className={styles.flightInfo}>
          <div className={styles.flightDetails}>
            <h4>Chuyến bay đi</h4>
            <div className={styles.flightRoute}>
              <div className={styles.airport}>
                <span className={styles.code}>{flightDetails.departure.code}</span>
                <span className={styles.time}>{flightDetails.departure.time}</span>
              </div>
              <div className={styles.flightLine}>
                <div className={styles.duration}>{flightDetails.duration}</div>
                {/* <div className={styles.planeIcon}>✈</div> */}
              </div>
              <div className={styles.airport}>
                <span className={styles.code}>{flightDetails.arrival.code}</span>
                <span className={styles.time}>{flightDetails.arrival.time}</span>
              </div>
            </div>
            <div className={styles.flightMeta}>
              <span>Chuyến bay: {flightDetails.flightNumber}</span>
              <span>Ngày: {flightDetails.date}</span>
            </div>
          </div>

          {isRoundTrip && returnFlightDetails && (
            <div className={styles.flightDetails}>
              <h4>Chuyến bay về</h4>
              <div className={styles.flightRoute}>
                <div className={styles.airport}>
                  <span className={styles.code}>{returnFlightDetails.departure.code}</span>
                  <span className={styles.time}>{returnFlightDetails.departure.time}</span>
                </div>
                <div className={styles.flightLine}>
                  <div className={styles.duration}>{returnFlightDetails.duration}</div>
                  {/* <div className={styles.planeIcon}>✈</div> */}
                </div>
                <div className={styles.airport}>
                  <span className={styles.code}>{returnFlightDetails.arrival.code}</span>
                  <span className={styles.time}>{returnFlightDetails.arrival.time}</span>
                </div>
              </div>
              <div className={styles.flightMeta}>
                <span>Chuyến bay: {returnFlightDetails.flightNumber}</span>
                <span>Ngày: {returnFlightDetails.date}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <FaMoneyBillWave className={styles.icon} />
          <h3>Tổng tiền</h3>
        </div>
        <div className={styles.priceDetails}>
          <div className={styles.priceRow}>
            <span>Giá vé chuyến đi:</span>
            <span>{formatPrice(flightDetails.price)}</span>
          </div>
          {isRoundTrip && returnFlightDetails && (
            <div className={styles.priceRow}>
              <span>Giá vé chuyến về:</span>
              <span>{formatPrice(returnFlightDetails.price)}</span>
            </div>
          )}
          <div className={styles.totalPrice}>
            <span>Tổng cộng:</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={`${styles.button} ${styles.primary}`}
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận và thanh toán'}
        </button>
      </div>
    </div>
  );
};

export default ReviewBooking; 