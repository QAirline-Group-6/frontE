// src/components/flight/flightList.tsx
import React, { useState, useEffect } from "react";
import styles from "./flightList.module.scss";
import { FaClock, FaPlane } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flight } from "@/types/flight";
import { GrPowerReset } from "react-icons/gr";
import { RiRefund2Line } from "react-icons/ri";
import { MdLuggage } from "react-icons/md";
import { BsFillHandbagFill } from "react-icons/bs";

interface FlightListProps {
  flights: Flight[];
  returnFlights?: Flight[]; // Thêm prop cho chuyến bay về
  isRoundTrip: boolean;
  passengers: number;
  onSelect?: (flight: Flight, fareType: 'economy' | 'business', fareDetails?: any) => void;
  selectedFlight?: Flight | null;
  selectedFare?: 'economy' | 'business' | null;
  onDone?: (selected: any) => void;
  currentStep: 'outbound' | 'return'; // Add currentStep prop
  onOutboundFlightSelected: (flightData: any) => void; // Add callback for outbound selection
  onBackToOutbound: () => void; // Add callback for going back
  initialSelectedOutboundFlight: {
    flight: Flight;
    fareType: 'economy' | 'business';
    fareDetail: any;
  } | null;
  // Add pagination props
  currentPage: number;
  totalPages: number;
  totalFlights: number;
  limit: number;
  onPageChange: (page: number) => void;
}

// Modal component
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

const FlightList: React.FC<FlightListProps> = ({
  flights,
  returnFlights = [],
  isRoundTrip,
  passengers,
  onSelect,
  selectedFlight: selectedFlightProp,
  selectedFare: selectedFareProp,
  onDone,
  currentStep, // Destructure currentStep prop
  onOutboundFlightSelected, // Destructure callback
  onBackToOutbound, // Destructure callback
  initialSelectedOutboundFlight, // Destructure initialSelectedOutboundFlight prop
  // Add pagination props
  currentPage,
  totalPages,
  totalFlights,
  limit,
  onPageChange,
}) => {
  
  // State to track which flight's details are open
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [selectedFlightForModal, setSelectedFlightForModal] = useState<Flight | null>(null);
  const [selectedFare, setSelectedFare] = useState<null | { flightId: string, classType: 'economy' | 'business' }>(null);
  const [selectedFareIndex, setSelectedFareIndex] = useState<number | null>(null);

  // State cho việc lưu trữ thông tin chuyến bay đã chọn (internal state)
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<{
    flight: Flight;
    fareType: 'economy' | 'business';
    fareDetail: any;
  } | null>(null);

  // Use useEffect to update internal state when initialSelectedOutboundFlight prop changes
  useEffect(() => {
    console.log('initialSelectedOutboundFlight changed:', initialSelectedOutboundFlight);
    if (initialSelectedOutboundFlight) {
      setSelectedOutboundFlight(initialSelectedOutboundFlight);
    }
  }, [initialSelectedOutboundFlight]);

  // State cho việc lưu trữ thông tin chuyến bay về đã chọn
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<{
    flight: Flight;
    fareType: 'economy' | 'business';
    fareDetail: any;
  } | null>(null);

  const router = useRouter();

  const handleToggleDetails = (flightId: string) => {
    setOpenDetailId((prev) => (prev === flightId ? null : flightId));
  };

  const handleOpenDetails = (flight: Flight) => {
    setSelectedFlightForModal(flight);
  };
  
  const handleCloseDetails = () => {
    setSelectedFlightForModal(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const handleSelectFare = (flight: Flight, classType: 'economy' | 'business') => {
    console.log('handleSelectFare called', { flight, classType });
    // Reset selectedFareIndex khi chuyển loại vé
    setSelectedFareIndex(null);
    
    // Toggle hiển thị chi tiết giá vé
    setSelectedFare(
      selectedFare && selectedFare.flightId === flight.id && selectedFare.classType === classType
        ? null
        : { flightId: flight.id, classType }
    );
  };

  // Xử lý khi chọn loại vé cụ thể (Standard/Flexible) cho chuyến đi
  const handleSelectOutboundFare = (flight: Flight, classType: 'economy' | 'business', fare: any) => {
    console.log('handleSelectOutboundFare called', { flight, classType, fare, isRoundTrip });
    const selectedData = {
      flight: flight,
      fareType: classType,
      fareDetail: fare
    };
    
    // Update internal state and call the parent callback
    setSelectedOutboundFlight(selectedData);
    onOutboundFlightSelected(selectedData);
    setSelectedFare(null);

    // Lưu vào localStorage để đảm bảo dữ liệu được giữ lại
    localStorage.setItem('selectedOutboundFlight', JSON.stringify(selectedData));

    // Nếu là one-way, chuyển đến trang booking ngay lập tức
    if (!isRoundTrip) {
      console.log('One-way trip detected, preparing to navigate to booking');
      const bookingData = {
        outboundFlight: selectedData,
        passengers: passengers,
        isRoundTrip: false,
        totalPrice: fare.price * passengers
      };
      console.log('Saving booking data:', bookingData);
      localStorage.setItem('selectedBooking', JSON.stringify(bookingData));
      console.log('Navigating to /booking');
      router.push('/booking');
    } else {
      console.log('Round-trip detected, waiting for return flight selection');
    }
  };

  // Xử lý khi chọn loại vé cụ thể cho chuyến về
  const handleSelectReturnFare = (flight: Flight, classType: 'economy' | 'business', fare: any) => {
    console.log('handleSelectReturnFare called', { 
      flight, 
      classType, 
      fare, 
      selectedOutboundFlight,
      currentStep 
    });

    try {
      const returnData = {
        flight: flight,
        fareType: classType,
        fareDetail: fare
      };

      setSelectedReturnFlight(returnData);

      // Lấy thông tin chuyến bay đi từ localStorage nếu không có trong state
      let outboundFlightData = selectedOutboundFlight;
      if (!outboundFlightData) {
        const storedOutbound = localStorage.getItem('selectedOutboundFlight');
        if (storedOutbound) {
          outboundFlightData = JSON.parse(storedOutbound);
          console.log('Retrieved outbound flight from localStorage:', outboundFlightData);
        }
      }

      // Kiểm tra selectedOutboundFlight
      if (!outboundFlightData) {
        console.error('No outbound flight selected. Current state:', {
          selectedOutboundFlight,
          storedOutbound: localStorage.getItem('selectedOutboundFlight'),
          currentStep,
          isRoundTrip
        });
        return;
      }

      console.log('Preparing to save round-trip booking data');
      const bookingData = {
        outboundFlight: outboundFlightData,
        returnFlight: returnData,
        passengers: passengers,
        isRoundTrip: true,
        totalPrice: (outboundFlightData.fareDetail.price + fare.price) * passengers
      };
      console.log('Saving booking data:', bookingData);
      localStorage.setItem('selectedBooking', JSON.stringify(bookingData));
      console.log('Navigating to /booking');
      router.push('/booking');
    } catch (error) {
      console.error('Error in handleSelectReturnFare:', error);
    }
  };

  // Xác định danh sách chuyến bay hiện tại
  const currentFlights = currentStep === 'outbound' ? flights : returnFlights;
  
  // Xác định hàm xử lý chọn vé phù hợp
  const handleSelectSpecificFare = (flight: Flight, classType: 'economy' | 'business', fare: any) => {
    console.log('handleSelectSpecificFare called', { flight, classType, fare, currentStep });
    if (currentStep === 'outbound') {
      handleSelectOutboundFare(flight, classType, fare);
    } else if (currentStep === 'return') {
      handleSelectReturnFare(flight, classType, fare);
    }
  };

  return (
    <div className={styles.flightListContainer}>
      <div className={styles.flightListHeader}>
        <h2 className={styles.listTitle}>
          {currentStep === 'outbound' ? 'Chọn chuyến bay đi' : 'Chọn chuyến bay về'}
          <span className={styles.subtitle}>
            {currentStep === 'outbound' 
              ? 'Vui lòng chọn chuyến bay đi của bạn.' 
              : 'Vui lòng chọn chuyến bay về của bạn.'
            }
          </span>
        </h2>
      </div>

      {currentFlights.map((flight) => {
        // Define fareDetails inside the map loop to access flight data
        const fareDetails = {
          economy: [
            {
              name: 'Phổ Thông Tiêu Chuẩn',
              price: flight.price.economy,
              change: 'Phí đổi vé tối đa 860.000 VND mỗi hành khách',
              refund: 'Phí hoàn vé tối đa 860.000 VND mỗi hành khách',
              baggage: '1 x 23 kg',
              carryon: 'Không quá 12kg',
            },
          ],
          business: [
            {
              name: 'Thương Gia Tiêu Chuẩn',
              price: flight.price.business,
              change: 'Miễn phí đổi vé',
              refund: 'Miễn phí hoàn vé',
              baggage: '2 x 32 kg',
              carryon: 'Không quá 18kg',
            },
          ],
        };

        return (
          <div key={flight.id} className={styles.flightCard}>
            <div className={styles.flightRow}>
              <div className={styles.flightInfo}>
                <div className={styles.timeRow}>
                  <div className={styles.timeInfo}>
                    <div className={styles.departureTime}>
                      {flight.departure.time}
                    </div>
                    <div className={styles.airportInfo}>
                      <div className={styles.airportCode}>({flight.departure.code})</div>
                    </div>
                  </div>
                  <div className={styles.flightPath}>
                    <div className={styles.durationInfo}>
                      <span className={styles.duration}>
                        <FaClock className={styles.icon} /> {flight.duration}
                      </span>
                      <div className={styles.flightLine}>
                        <div className={styles.dot}></div>
                        <div className={styles.line}></div>
                        <div className={styles.dot}></div>
                      </div>
                      <span className={styles.flightNumberInfo}>
                        <FaPlane className={styles.icon} /> {flight.flight_number}
                      </span>
                    </div>
                  </div>
                  <div className={styles.timeInfo}>
                    <div className={styles.arrivalTime}>{flight.arrival.time}</div>
                    <div className={styles.airportInfo}>
                      <div className={styles.airportCode}>({flight.arrival.code})</div>
                    </div>
                  </div>
                </div>
                <div className={styles.flightDetails}>
                  <button
                    className={styles.detailsBtn}
                    onClick={() => handleOpenDetails(flight)}
                    aria-expanded={selectedFlightForModal?.id === flight.id}
                  >
                    Chi tiết hành trình <FiInfo className={styles.icon} />
                  </button>
                </div>
              </div>
              <div className={styles.priceSection}>
                <div
                  className={`${styles.fareOption} ${styles.economy} ${
                    selectedFare && selectedFare.flightId === flight.id && selectedFare.classType === 'economy' 
                      ? styles.selected 
                      : ''
                  }`}
                  onClick={() => handleSelectFare(flight, 'economy')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.fareType}>Phổ thông</div>
                  <div className={styles.farePrice}>{formatPrice(flight.price.economy)}</div>
                  {/* <div className={styles.seatsLeft}>Còn {Math.floor(flight.available_seats * 0.7)} ghế</div> */}
                </div>
                <div
                  className={`${styles.fareOption} ${styles.business} ${
                    selectedFare && selectedFare.flightId === flight.id && selectedFare.classType === 'business' 
                      ? styles.selected 
                      : ''
                  }`}
                  onClick={() => handleSelectFare(flight, 'business')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.fareType}>Thương gia</div>
                  <div className={styles.farePrice}>{formatPrice(flight.price.business)}</div>
                  {/* <div className={styles.seatsLeft}>Còn {Math.floor(flight.available_seats * 0.3)} ghế</div> */}
                </div>
              </div>
            </div>
            
            {/* Hiển thị chi tiết giá vé khi đã chọn */}
            {selectedFare && selectedFare.flightId === flight.id && (
              <div className={styles.fareDetailSection}>
                <h3 className={styles.fareDetailTitle}>Chọn giá vé</h3>
                <div className={styles.fareDetailList}>
                  {fareDetails[selectedFare.classType].map((fare, idx) => (
                    <div key={idx} className={styles.fareDetailCard}>
                      <div className={styles.fareDetailName}>{fare.name}</div>
                      <div className={styles.fareDetailPrice}>{formatPrice(fare.price)}</div>
                      <ul className={styles.fareDetailInfo}>
                        <li><GrPowerReset /> Thay đổi vé<br /><span>{fare.change}</span></li>
                        <li><RiRefund2Line /> Hoàn vé<br /><span>{fare.refund}</span></li>
                        <li><MdLuggage /> Hành lý ký gửi<br /><span>{fare.baggage}</span></li>
                        <li><BsFillHandbagFill /> Hành lý xách tay<br /><span>{fare.carryon}</span></li>
                      </ul>
                      <button
                        className={styles.fareDetailSelectBtn}
                        onClick={() => handleSelectSpecificFare(flight, selectedFare.classType, fare)}
                      >
                        {currentStep === 'outbound' 
                          ? (isRoundTrip ? 'Tiếp tục chọn chuyến về' : 'Chọn') 
                          : 'Hoàn tất chọn vé'
                        }
                      </button>
                    </div>
                  ))}
                </div>
                <div className={styles.fareDetailNote}>
                  Vui lòng chọn loại vé để tiếp tục.
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination - hiển thị cho cả chuyến đi và chuyến về */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Hiển thị {((currentPage - 1) * limit) + 1} đến {Math.min(currentPage * limit, totalFlights)} trong tổng số {totalFlights} chuyến bay
        </div>
        <div className={styles.paginationControls}>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal popup for flight details */}
      <Modal open={!!selectedFlightForModal} onClose={handleCloseDetails}>
        {selectedFlightForModal && (
          <div className={styles.flightDetailCard}>
            <h3 className={styles.detailTitle}>Chi tiết hành trình</h3>
            <div className={styles.detailContent}>
              <div className={styles.routeInfo}>
                <div className={styles.airportInfo}>
                  <div className={styles.time}>{selectedFlightForModal.departure.time}</div>
                  <div className={styles.airportName}>{selectedFlightForModal.departure.airport}</div>
                </div>
                
                <div className={styles.flightDuration}>
                   <div className={styles.duration}>{selectedFlightForModal.duration}</div>
                   <div className={styles.pathLine}></div>
                </div>

                <div className={styles.airportInfo}>
                  <div className={styles.time}>{selectedFlightForModal.arrival.time}</div>
                  <div className={styles.airportName}>{selectedFlightForModal.arrival.airport}</div>
                </div>
              </div>

              <div className={styles.additionalDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Ngày khởi hành:</span>
                  <span className={styles.detailValue}>{selectedFlightForModal.departure_date }</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Số hiệu chuyến bay:</span>
                  <span className={styles.detailValue}>{selectedFlightForModal.flight_number}</span>
                </div>
                 <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Hãng hàng không:</span>
                  <span className={styles.detailValue}>{selectedFlightForModal.airline}</span>
                </div>
                 <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Loại máy bay:</span>
                  <span className={styles.detailValue}>{selectedFlightForModal.aircraft_type}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FlightList;