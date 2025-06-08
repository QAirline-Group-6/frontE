import React, { useState, useEffect, useMemo } from 'react';
import styles from './seat.module.scss';
import axios from 'axios';

interface Seat {
  id: string;
  seat_number: string;
  type: 'economy' | 'business' | 'premium';
  status: 'available' | 'occupied' | 'selected';
}

interface SeatSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSeats: { outbound: string[], return: string[] }) => void;
  passengerCount: number;
  flightNumber: string;
  isRoundTrip?: boolean;
  returnFlightNumber?: string;
  bookingId: string;
  customerId: string;
}

const SeatSelectionModal: React.FC<SeatSelectionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  passengerCount,
  flightNumber,
  isRoundTrip,
  returnFlightNumber,
  bookingId,
  customerId,
}) => {
  const [outboundSeats, setOutboundSeats] = useState<Seat[]>([]);
  const [returnSeats, setReturnSeats] = useState<Seat[]>([]);
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState<string[]>([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFlight, setCurrentFlight] = useState<'outbound' | 'return'>('outbound');

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        // Fetch outbound flight seats
        const outboundResponse = await axios.get(`http://localhost:4000/seats/flight/${flightNumber}`);
        const outboundSeatsData = outboundResponse.data.map((seat: any) => ({
          id: seat.seat_id?.toString() || '',
          seat_number: seat.seat_number || '',
          type: seat.seat_class?.toLowerCase().includes('business') 
            ? 'business' 
            : seat.seat_class?.toLowerCase().includes('premium')
            ? 'premium'
            : 'economy',
          status: seat.status === 'booked' ? 'occupied' : 'available',
        }));
        setOutboundSeats(outboundSeatsData);

        // Fetch return flight seats if it's a round trip
        if (isRoundTrip && returnFlightNumber) {
          const returnResponse = await axios.get(`http://localhost:4000/seats/flight/${returnFlightNumber}`);
          const returnSeatsData = returnResponse.data.map((seat: any) => ({
            id: seat.seat_id?.toString() || '',
            seat_number: seat.seat_number || '',
            type: seat.seat_class?.toLowerCase().includes('business') 
              ? 'business' 
              : seat.seat_class?.toLowerCase().includes('premium')
              ? 'premium'
              : 'economy',
            status: seat.status === 'booked' ? 'occupied' : 'available',
          }));
          setReturnSeats(returnSeatsData);
        }
      } catch (err) {
        setError('Không thể tải thông tin ghế. Vui lòng thử lại sau.');
        console.error('Error fetching seats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSeats();
    }
  }, [isOpen, flightNumber, returnFlightNumber, isRoundTrip]);

  const handleSeatClick = (seatId: string, flightType: 'outbound' | 'return') => {
    const seats = flightType === 'outbound' ? outboundSeats : returnSeats;
    const selectedSeats = flightType === 'outbound' ? selectedOutboundSeats : selectedReturnSeats;
    const setSelectedSeats = flightType === 'outbound' ? setSelectedOutboundSeats : setSelectedReturnSeats;
    const setSeats = flightType === 'outbound' ? setOutboundSeats : setReturnSeats;

    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'available' } : s));
    } else if (selectedSeats.length < passengerCount) {
      setSelectedSeats(prev => [...prev, seatId]);
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'selected' } : s));
    }
  };

  const handleConfirm = async () => {
    if (selectedOutboundSeats.length !== passengerCount || 
        (isRoundTrip && selectedReturnSeats.length !== passengerCount)) {
      setError(`Bạn cần chọn đủ ${passengerCount} ghế cho ${isRoundTrip ? 'cả hai chuyến bay' : 'chuyến bay'} trước khi xác nhận.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Lock outbound seats
      for (const seatId of selectedOutboundSeats) {
        const response = await axios.post(`http://localhost:4000/seats/flight/${flightNumber}/seat/${seatId}/lock`, {
          booking_id: bookingId,
          customer_id: customerId,
          price: 0,
        });

        if (response.status !== 200) {
          throw new Error('Không thể khóa ghế chuyến đi');
        }
      }

      // Lock return seats if it's a round trip
      if (isRoundTrip && returnFlightNumber) {
        for (const seatId of selectedReturnSeats) {
          const response = await axios.post(`http://localhost:4000/seats/flight/${returnFlightNumber}/seat/${seatId}/lock`, {
            booking_id: bookingId,
            customer_id: customerId,
            price: 0,
          });

          if (response.status !== 200) {
            throw new Error('Không thể khóa ghế chuyến về');
          }
        }
      }

      onConfirm({
        outbound: selectedOutboundSeats,
        return: selectedReturnSeats
      });
      onClose();
    } catch (err) {
      setError('Không thể xác nhận ghế. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Process seats data for both flights
  const { outboundBusinessSeats, outboundEconomySeats } = useMemo(() => {
    const business: { [key: string]: Seat[] } = {};
    const economy: { [key: string]: Seat[] } = {};
    
    outboundSeats.forEach(seat => {
      const rowNumber = seat.seat_number.match(/\d+/)?.[0] || '0';
      if (seat.type === 'business') {
        if (!business[rowNumber]) {
          business[rowNumber] = [];
        }
        business[rowNumber].push(seat);
      } else {
        if (!economy[rowNumber]) {
          economy[rowNumber] = [];
        }
        economy[rowNumber].push(seat);
      }
    });

    Object.keys(business).forEach(row => {
      business[row].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
    });
    
    Object.keys(economy).forEach(row => {
      economy[row].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
    });

    return { 
      outboundBusinessSeats: business, 
      outboundEconomySeats: economy 
    };
  }, [outboundSeats]);

  const { returnBusinessSeats, returnEconomySeats } = useMemo(() => {
    const business: { [key: string]: Seat[] } = {};
    const economy: { [key: string]: Seat[] } = {};
    
    returnSeats.forEach(seat => {
      const rowNumber = seat.seat_number.match(/\d+/)?.[0] || '0';
      if (seat.type === 'business') {
        if (!business[rowNumber]) {
          business[rowNumber] = [];
        }
        business[rowNumber].push(seat);
      } else {
        if (!economy[rowNumber]) {
          economy[rowNumber] = [];
        }
        economy[rowNumber].push(seat);
      }
    });

    Object.keys(business).forEach(row => {
      business[row].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
    });
    
    Object.keys(economy).forEach(row => {
      economy[row].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
    });

    return { 
      returnBusinessSeats: business, 
      returnEconomySeats: economy 
    };
  }, [returnSeats]);

  // Tạo ghế trống cho các vị trí không có trong dữ liệu
  const createEmptySeat = (rowNumber: string, seatNumber: string) => ({
    id: `empty-${rowNumber}${seatNumber}`,
    seat_number: seatNumber,
    type: 'economy' as const,
    status: 'available' as const,
    isEmpty: true
  });

  const renderFlightTabs = () => {
    if (!isRoundTrip) return null;

    return (
      <div className={styles.flightTabs}>
        <button
          className={`${styles.tab} ${currentFlight === 'outbound' ? styles.active : ''}`}
          onClick={() => setCurrentFlight('outbound')}
        >
          Chuyến đi ({flightNumber})
        </button>
        <button
          className={`${styles.tab} ${currentFlight === 'return' ? styles.active : ''}`}
          onClick={() => setCurrentFlight('return')}
        >
          Chuyến về ({returnFlightNumber})
        </button>
      </div>
    );
  };

  const renderSeatMap = (seats: Seat[], flightType: 'outbound' | 'return') => {
    const { businessSeats, economySeats } = useMemo(() => {
      const business: { [key: string]: Seat[] } = {};
      const economy: { [key: string]: Seat[] } = {};
      
      seats.forEach(seat => {
        const rowNumber = seat.seat_number.match(/\d+/)?.[0] || '0';
        if (seat.type === 'business') {
          if (!business[rowNumber]) {
            business[rowNumber] = [];
          }
          business[rowNumber].push(seat);
        } else {
          if (!economy[rowNumber]) {
            economy[rowNumber] = [];
          }
          economy[rowNumber].push(seat);
        }
      });

      Object.keys(business).forEach(row => {
        business[row].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
      });
      
      Object.keys(economy).forEach(row => {
        economy[row].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
      });

      return { businessSeats: business, economySeats: economy };
    }, [seats]);

    return (
      <>
        {renderBusinessSection(businessSeats, flightType)}
        {renderEconomySection(economySeats, flightType)}
      </>
    );
  };

  const renderBusinessSection = (seatsByRow: { [key: string]: Seat[] }, flightType: 'outbound' | 'return') => {
    const sortedRows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);
    
    if (sortedRows.length === 0) return null;

    return (
      <div className={styles.seatSection}>
        <div className={styles.sectionHeader}>
          <h4>Business Class</h4>
        </div>
        <div className={`${styles.seatGrid} ${styles.business}`}>
          {sortedRows.map(rowNum => {
            const rowSeats = seatsByRow[rowNum.toString()];
            return rowSeats.map(seat => (
              <button
                key={seat.id}
                className={`${styles.seat} ${styles[seat.type]} ${styles[seat.status]}`}
                onClick={() => handleSeatClick(seat.id, flightType)}
                disabled={seat.status === 'occupied'}
                title={`${seat.seat_number} - ${seat.type}`}
              >
                {seat.seat_number}
              </button>
            ));
          })}
        </div>
      </div>
    );
  };

  const renderEconomySection = (seatsByRow: { [key: string]: Seat[] }, flightType: 'outbound' | 'return') => {
    const sortedRows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);
    
    if (sortedRows.length === 0) return null;

    return (
      <div className={styles.seatSection}>
        <div className={styles.sectionHeader}>
          <h4>Economy Class</h4>
        </div>
        <div className={`${styles.seatGrid} ${styles.economy}`}>
          {sortedRows.map(rowNum => {
            const rowSeats = seatsByRow[rowNum.toString()];
            return rowSeats.map(seat => (
              <button
                key={seat.id}
                className={`${styles.seat} ${styles[seat.type]} ${styles[seat.status]}`}
                onClick={() => handleSeatClick(seat.id, flightType)}
                disabled={seat.status === 'occupied'}
                title={`${seat.seat_number} - ${seat.type}`}
              >
                {seat.seat_number}
              </button>
            ));
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Chọn ghế</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Đang tải thông tin ghế...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              <div className={styles.seatMapSection}>
                <div className={styles.seatMapHeader}>
                  <h3>Chọn ghế ngồi</h3>
                  <p>Chọn {passengerCount} ghế cho {isRoundTrip ? 'mỗi chuyến bay' : `chuyến bay ${flightNumber}`}</p>
                </div>

                {renderFlightTabs()}

                <div className={styles.legend}>
                  <div className={styles.legendItem}>
                    <div className={`${styles.seatExample} ${styles.available}`}></div>
                    {/* <span>Ghế trống</span> */}
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.seatExample} ${styles.occupied}`}></div>
                    {/* <span>Đã được đặt</span> */}
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.seatExample} ${styles.selected}`}></div>
                    {/* <span>Ghế bạn chọn</span> */}
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.seatExample} ${styles.business}`}></div>
                    {/* <span>Business Class</span> */}
                  </div>
                  <div className={styles.legendItem}>
                    <div className={`${styles.seatExample} ${styles.economy}`}></div>
                    {/* <span>Economy Class</span> */}
                  </div>
                </div>

                <div className={styles.aircraft}>
                  <div className={styles.aircraftBody}>
                    {currentFlight === 'outbound' ? (
                      <>
                        {renderBusinessSection(outboundBusinessSeats, 'outbound')}
                        {renderEconomySection(outboundEconomySeats, 'outbound')}
                      </>
                    ) : (
                      <>
                        {renderBusinessSection(returnBusinessSeats, 'return')}
                        {renderEconomySection(returnEconomySeats, 'return')}
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.selectedInfo}>
                  <h4>
                    Ghế đã chọn: {
                      currentFlight === 'outbound'
                        ? selectedOutboundSeats.length > 0 
                          ? selectedOutboundSeats.map(seatId => {
                              const seat = outboundSeats.find(s => s.id === seatId);
                              return seat ? seat.seat_number : seatId;
                            }).join(', ')
                          : 'Chưa chọn ghế nào'
                        : selectedReturnSeats.length > 0
                          ? selectedReturnSeats.map(seatId => {
                              const seat = returnSeats.find(s => s.id === seatId);
                              return seat ? seat.seat_number : seatId;
                            }).join(', ')
                          : 'Chưa chọn ghế nào'
                    }
                  </h4>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.saveBtn}
            onClick={handleConfirm}
            disabled={
              selectedOutboundSeats.length !== passengerCount || 
              (isRoundTrip && selectedReturnSeats.length !== passengerCount) || 
              loading
            }
          >
            Xác nhận ({currentFlight === 'outbound' ? selectedOutboundSeats.length : selectedReturnSeats.length}/{passengerCount})
          </button>
        </div>
      </div>

      {loading && <div className={styles.loadingOverlay}>Đang xử lý đặt ghế...</div>}
    </div>
  );
};

export default SeatSelectionModal;