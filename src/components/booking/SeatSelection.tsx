import React, { useState } from 'react';
import styles from './SeatSelection.module.scss';

interface SeatSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seats: string[]) => void;
  passengerCount: number;
  flightNumber: string;
  isRoundTrip?: boolean;
  returnFlightNumber?: string;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  passengerCount,
  flightNumber,
  isRoundTrip,
  returnFlightNumber
}) => {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    // Tạo mảng các cột cho business class
    const businessColumns = ['A', 'B', 'C', 'D'];
    // Tạo mảng các cột cho economy class
    const economyColumns = ['A', 'B', 'C', 'D', 'E', 'F'];
    // Số hàng cho mỗi class
    const businessRows = 9;
    const economyRows = 20;

    const handleSeatClick = (seatId: string) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    const renderBusinessClass = () => {
        const seats = [];
        for (let row = 1; row <= businessRows; row++) {
            for (let col of businessColumns) {
                const seatId = `B${row}${col}`;
                seats.push(
                    <div
                        key={seatId}
                        className={`${styles.seat} ${selectedSeats.includes(seatId) ? styles.selected : ''}`}
                        onClick={() => handleSeatClick(seatId)}
                    >
                        {seatId}
                    </div>
                );
            }
        }
        return seats;
    };

    const renderEconomyClass = () => {
        const seats = [];
        for (let row = 1; row <= economyRows; row++) {
            for (let col of economyColumns) {
                const seatId = `E${row}${col}`;
                seats.push(
                    <div
                        key={seatId}
                        className={`${styles.seat} ${selectedSeats.includes(seatId) ? styles.selected : ''}`}
                        onClick={() => handleSeatClick(seatId)}
                    >
                        {seatId}
                    </div>
                );
            }
        }
        return seats;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.seatSelectionContainer}>
            <h2 className={styles.title}>Chọn Ghế Ngồi</h2>

            <div className={styles.classSection}>
                <h3 className={styles.subtitle}>Business Class</h3>
                <div className={`${styles.seatGrid} ${styles.business}`}>
                    {renderBusinessClass()}
                </div>
            </div>

            <div className={styles.classSection}>
                <h3 className={styles.subtitle}>Economy Class</h3>
                <div className={`${styles.seatGrid} ${styles.economy}`}>
                    {renderEconomyClass()}
                </div>
            </div>

            <div className={styles.selectedSeats}>
                <h3 className={styles.subtitle}>Ghế đã chọn:</h3>
                <div className={styles.selectedSeatsList}>
                    {selectedSeats.map(seat => (
                        <span key={seat} className={styles.selectedSeatTag}>
                            {seat}
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.actions}>
                <button 
                    className={styles.button} 
                    onClick={onClose}
                >
                    Hủy
                </button>
                <button 
                    className={`${styles.button} ${styles.primary}`}
                    onClick={() => onConfirm(selectedSeats)}
                    disabled={selectedSeats.length !== passengerCount}
                >
                    Xác nhận ({selectedSeats.length}/{passengerCount})
                </button>
            </div>
        </div>
    );
};

export default SeatSelection; 