import React, { useState, useEffect } from 'react';
import FlightList from '../FlightList/flightList';
import Passenger from '../../booking/Passenger/passenger';
import SeatSelectionModal from '../../booking/Seat/seat';
import Payment from '../../booking/Payment/payment';
import ReviewBooking from '../../booking/ReviewBooking/ReviewBooking';
import styles from './flightBooking.module.scss';
import bookingService from '@/api/services/bookingService';
import { BookingData } from '@/types/booking';

// Define Flight interface
interface Flight {
  id: string;
  flight_id: number;
  flight_number: string;
  departure: {
    airport: string;
    code: string;
    time: string;
  };
  arrival: {
    airport: string;
    code: string;
    time: string;
  };
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: {
    economy: number;
    business: number;
  };
  available_seats: number;
  status: string;
  route: {
    from: string;
    to: string;
  };
  departure_date: string;
  aircraft_type: string;
  airline: string;
}

interface PassengerData {
  idNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  address: string;
}

interface FlightDetails {
  flight_id: number;
  flightNumber: string;
  departure: {
    time: string;
    code: string;
  };
  arrival: {
    time: string;
    code: string;
  };
  date: string;
  duration: string;
  passengers: string;
  paymentMethod: string;
  price: number;
}

// Define component prop interfaces
interface PassengerInfoProps {
  flightDetails: FlightDetails;
  passengerCount: number;
  onSubmit: (passengers: PassengerData[]) => void;
  isRoundTrip?: boolean;
  returnFlightDetails?: FlightDetails;
}

interface SeatSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seats: string[]) => void;
  passengerCount: number;
  flightNumber: string;
  isRoundTrip?: boolean;
  returnFlightNumber?: string;
}

interface ReviewBookingProps {
  passengerData: PassengerData[];
  selectedSeats: string[];
  returnSelectedSeats: string[];
  flightDetails: FlightDetails;
  returnFlightDetails?: FlightDetails;
  isRoundTrip?: boolean;
  onConfirm: () => void;
}

interface PaymentSuccessProps {
  bookingCode: string;
  onReturnHome: () => void;
  isRoundTrip?: boolean;
}

// Cập nhật kiểu dữ liệu BookingStep với 3 bước riêng biệt
type BookingStep = 'passenger-seat' | 'review-booking' | 'payment' | 'payment-success';

// Add this function before the FlightBookingApp component
const generateBookingCode = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `B${timestamp}${random}`;
};

const FlightBookingApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('passenger-seat');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [passengerCount, setPassengerCount] = useState(1);
  
  // Selected flight data
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const [selectedFareType, setSelectedFareType] = useState<'economy' | 'business'>('economy');
  
  // Passenger data
  const [passengerData, setPassengerData] = useState<PassengerData[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Booking data
  const [bookingCode, setBookingCode] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');

  // State để lưu ngày chuyến bay
  const [flightDate, setFlightDate] = useState<string>('');

  // State để kiểm soát việc hiển thị popup chọn ghế
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  // State để kiểm soát trạng thái loading
  const [isLoading, setIsLoading] = useState(false);

  // State để lưu thông tin ghế đã chọn cho return flight
  const [returnSelectedSeats, setReturnSelectedSeats] = useState<string[]>([]);

  // Effect để tải dữ liệu booking từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bookingData = localStorage.getItem('selectedBooking');
      if (bookingData) {
        const data = JSON.parse(bookingData);
        console.log('Loaded booking data:', data);
        
        // Set outbound flight data
        setSelectedOutboundFlight(data.outboundFlight.flight);
        setSelectedFareType(data.outboundFlight.fareType);
        setPassengerCount(data.passengers);
        setTripType(data.isRoundTrip ? 'round-trip' : 'one-way');
        
        // Set return flight data if it's a round trip
        if (data.isRoundTrip && data.returnFlight) {
          setSelectedReturnFlight(data.returnFlight.flight);
        }
        
        // Set booking and customer IDs
        setBookingId(data.bookingId || '');
        setCustomerId(data.customerId || '');
        
        setCurrentStep('passenger-seat');
      } else {
        console.error("Error: No booking data found in localStorage.");
        // Redirect to flights page if no booking data
        window.location.href = '/flights';
      }
    }
  }, []);

  const handlePassengerSubmit = (passengers: PassengerData[]) => {
    setPassengerData(passengers);
    // Mở popup chọn ghế sau khi điền thông tin hành khách
    setIsSeatModalOpen(true);
  };

  const handleSeatConfirm = (selectedSeats: { outbound: string[], return: string[] }) => {
    // Lưu thông tin ghế đã chọn vào localStorage
    const bookingData = {
      ...JSON.parse(localStorage.getItem('bookingData') || '{}'),
      selectedSeats: selectedSeats.outbound,
      returnSelectedSeats: selectedSeats.return
    };
    localStorage.setItem('bookingData', JSON.stringify(bookingData));

    // Cập nhật state
    setSelectedSeats(selectedSeats.outbound);
    if (tripType === 'round-trip') {
      setReturnSelectedSeats(selectedSeats.return);
    }

    // Chuyển sang bước tiếp theo
    setCurrentStep('review-booking');
  };

  const handleOpenSeatModal = () => {
    if (passengerData.length > 0) {
      setIsSeatModalOpen(true);
    } else {
      alert('Vui lòng điền thông tin hành khách trước khi chọn ghế');
    }
  };

  // Hàm mới để xác nhận booking và chuyển sang thanh toán
  const handleReviewConfirm = async (bookingData: any) => {
    try {
      setIsLoading(true);
      
      if (!selectedOutboundFlight) {
        throw new Error('Không tìm thấy thông tin chuyến bay');
      }

      if (passengerData.length === 0) {
        throw new Error('Không tìm thấy thông tin hành khách');
      }

      if (selectedSeats.length === 0) {
        throw new Error('Vui lòng chọn ghế');
      }

      // Validate data before sending
      if (!bookingData.user_id || !bookingData.total_amount || !bookingData.bookings.length) {
        throw new Error('Dữ liệu booking không hợp lệ');
      }

      for (const booking of bookingData.bookings) {
        if (!booking.flight_id || !booking.tickets.length) {
          throw new Error('Dữ liệu chuyến bay không hợp lệ');
        }
        for (const ticket of booking.tickets) {
          if (!ticket.customer.first_name || !ticket.customer.last_name || !ticket.customer.id_card_number || !ticket.seat_id || !ticket.price) {
            throw new Error('Dữ liệu vé không hợp lệ');
          }
        }
      }

      console.log('Sending booking data:', JSON.stringify(bookingData, null, 2));

      try {
        // Make the API call using booking service
        const responseData = await bookingService.createBooking(bookingData);
        console.log('Booking response:', responseData);

        if (!responseData || !responseData.booking || !responseData.booking.booking_code) {
          throw new Error('Không nhận được mã đặt vé từ server');
        }

        // Clear booking data from localStorage
        localStorage.removeItem('selectedBooking');

        // Set booking code and move to payment step
        setBookingCode(responseData.booking.booking_code);
        setCurrentStep('payment-success');

      } catch (apiError: any) {
        console.error('API Error:', apiError);
        if (apiError.response) {
          console.error('Error response:', apiError.response.data);
          throw new Error(apiError.response.data.message || 'Có lỗi xảy ra khi đặt vé');
        } else if (apiError.request) {
          console.error('No response received:', apiError.request);
          throw new Error('Không nhận được phản hồi từ máy chủ');
        } else {
          console.error('Error setting up request:', apiError.message);
          throw new Error('Có lỗi xảy ra khi gửi yêu cầu đặt vé');
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt vé');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý quay lại bước trước (điều chỉnh cho 3 bước)
  const handleGoBack = () => {
    switch (currentStep) {
      case 'review-booking':
        setCurrentStep('passenger-seat'); // Quay lại bước Thông tin hành khách và chọn ghế
        break;
      case 'payment-success':
        setCurrentStep('review-booking'); // Quay lại bước Xem lại
        break;
      default:
        // Không làm gì ở bước đầu tiên
        break;
    }
  };

  const handleReturnHome = () => {
    localStorage.removeItem('selectedBooking');
    setCurrentStep('passenger-seat'); // Reset về bước đầu tiên của component này
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
    setPassengerData([]);
    setSelectedSeats([]);
    setBookingCode('');
    // Ví dụ: window.location.href = '/';
  };

  // Generate flight details
  const getFlightDetails = (): FlightDetails[] => {
    const details: FlightDetails[] = [];

    // Add outbound flight details
    if (selectedOutboundFlight) {
      const outboundPrice = selectedOutboundFlight.price[selectedFareType];
      details.push({
        flight_id: selectedOutboundFlight.flight_id,
        flightNumber: selectedOutboundFlight.flight_number,
        departure: {
          time: selectedOutboundFlight.departure.time,
          code: selectedOutboundFlight.departure.code
        },
        arrival: {
          time: selectedOutboundFlight.arrival.time,
          code: selectedOutboundFlight.arrival.code
        },
        date: selectedOutboundFlight.departure_date,
        duration: selectedOutboundFlight.duration,
        passengers: `${passengerCount} Người lớn/ Trẻ em`,
        paymentMethod: 'Chưa chọn',
        price: outboundPrice * passengerCount
      });
    }

    // Add return flight details if it's a round trip
    if (tripType === 'round-trip' && selectedReturnFlight) {
      const returnPrice = selectedReturnFlight.price[selectedFareType];
      details.push({
        flight_id: selectedReturnFlight.flight_id,
        flightNumber: selectedReturnFlight.flight_number,
        departure: {
          time: selectedReturnFlight.departure.time,
          code: selectedReturnFlight.departure.code
        },
        arrival: {
          time: selectedReturnFlight.arrival.time,
          code: selectedReturnFlight.arrival.code
        },
        date: selectedReturnFlight.departure_date,
        duration: selectedReturnFlight.duration,
        passengers: `${passengerCount} Người lớn/ Trẻ em`,
        paymentMethod: 'Chưa chọn',
        price: returnPrice * passengerCount
      });
    }

    return details;
  };

  // Render step hiện tại
  const renderCurrentStep = () => {
    // Hiển thị lỗi nếu không có thông tin chuyến bay (trừ bước cuối cùng)
    if (!selectedOutboundFlight && currentStep !== 'payment-success') {
      return <div className={styles.stepContainer}>Không tìm thấy thông tin chuyến bay. Vui lòng quay lại trang chọn chuyến bay.</div>;
    }

    const flightDetails = getFlightDetails();

    switch (currentStep) {
      case 'passenger-seat':
        if (!selectedOutboundFlight) return <div>Không tìm thấy thông tin chuyến bay. Vui lòng quay lại trang chọn chuyến bay.</div>;
        return (
          <div className={`${styles.stepContainer} ${styles.stepTransition}`}>
            <div className={styles.bookingHeader}>
              <h2>Thông tin hành khách và chọn ghế</h2>
            </div>
            <Passenger
              flightDetails={flightDetails[0]}
              passengerCount={passengerCount}
              onSubmit={handlePassengerSubmit}
              isRoundTrip={tripType === 'round-trip'}
              returnFlightDetails={flightDetails[1]}
            />
            {isSeatModalOpen && (
              <SeatSelectionModal
                isOpen={isSeatModalOpen}
                onClose={() => setIsSeatModalOpen(false)}
                onConfirm={handleSeatConfirm}
                passengerCount={passengerCount}
                flightNumber={selectedOutboundFlight.flight_number}
                isRoundTrip={tripType === 'round-trip'}
                returnFlightNumber={selectedReturnFlight?.flight_number}
                bookingId={bookingId}
                customerId={customerId}
              />
            )}
          </div>
        );
      
      case 'review-booking':
        return (
          <div className={`${styles.stepContainer} ${styles.stepTransition}`}>
            <ReviewBooking
              passengerData={passengerData}
              selectedSeats={selectedSeats}
              returnSelectedSeats={returnSelectedSeats}
              flightDetails={flightDetails[0]}
              returnFlightDetails={flightDetails[1]}
              isRoundTrip={tripType === 'round-trip'}
              onConfirm={handleReviewConfirm}
            />
            <button onClick={handleGoBack} className={`${styles.button} ${styles.secondary}`} style={{ marginTop: '20px' }}>Quay lại</button>
          </div>
        );
      
      case 'payment-success':
        return (
          <div className={`${styles.stepContainer} ${styles.stepTransition}`}>
            <Payment
              bookingCode={bookingCode}
              onReturnHome={handleReturnHome}
              isRoundTrip={tripType === 'round-trip'}
            />
          </div>
        );
      
      default:
        return <div>Có lỗi xảy ra hoặc đang tải dữ liệu...</div>;
    }
  };

  return (
    <div className={styles.flightBookingApp}>
      {/* Progress Bar với 3 bước */}
      <div className={styles.progressBar}>
        {/* Bước 1: Thông tin hành khách và chọn ghế */} 
        <div className={`${styles.step} ${currentStep === 'passenger-seat' ? styles.active : ''} ${(currentStep === 'review-booking' || currentStep === 'payment-success') ? styles.completed : ''}`}>
          <div className={styles.stepNumber}>1</div> 
          <div className={styles.stepLabel}>Thông tin hành khách và chọn ghế</div>
        </div>
        {/* Bước 2: Xem lại */} 
        <div className={`${styles.step} ${currentStep === 'review-booking' ? styles.active : ''} ${currentStep === 'payment-success' ? styles.completed : ''}`}>
          <div className={styles.stepNumber}>2</div> 
          <div className={styles.stepLabel}>Xem lại</div>
        </div>
        {/* Bước 3: Thanh toán */} 
        <div className={`${styles.step} ${currentStep === 'payment-success' ? styles.active : ''}`}>
          <div className={styles.stepNumber}>3</div> 
          <div className={styles.stepLabel}>Thanh toán</div>
        </div>
      </div>
      
      {/* Render nội dung step hiện tại */} 
      {renderCurrentStep()}
    </div>
  );
};

export default FlightBookingApp;