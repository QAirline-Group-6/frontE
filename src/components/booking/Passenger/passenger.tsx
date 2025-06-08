import React, { useState } from 'react';
import styles from './passenger.module.scss';
import { FaArrowRight } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { MdPayment } from "react-icons/md";

export interface PassengerData {
  idNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
  address: string;
}

export interface FlightDetails {
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

interface PassengerInfoProps {
  flightDetails: FlightDetails;
  passengerCount: number;
  onSubmit: (passengers: PassengerData[]) => void;
  isRoundTrip?: boolean;
  returnFlightDetails?: FlightDetails;
}

const Passenger: React.FC<PassengerInfoProps> = ({
  flightDetails,
  passengerCount,
  onSubmit,
  isRoundTrip,
  returnFlightDetails,
}) => {
  const [passengers, setPassengers] = useState<PassengerData[]>(
    Array.from({ length: passengerCount }, () => ({
      idNumber: '',
      firstName: '',
      lastName: '',
      phone: '',
      birthDate: '',
      gender: 'male',
      address: '',
    }))
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateIdNumber = (idNumber: string) => {
    if (!/^\d{12}$/.test(idNumber)) {
      return 'CCCD phải có đúng 12 số';
    }
    return '';
  };

  const validatePhoneNumber = (phone: string) => {
    if (!/^\d{10}$/.test(phone)) {
      return 'Số điện thoại phải có đúng 10 số';
    }
    return '';
  };

  const handleInputChange = (
    passengerIndex: number,
    field: keyof PassengerData,
    value: string
  ) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[passengerIndex] = {
      ...updatedPassengers[passengerIndex],
      [field]: value,
    };
    setPassengers(updatedPassengers);

    // Validate khi người dùng nhập
    if (field === 'idNumber') {
      const error = validateIdNumber(value);
      setErrors(prev => ({
        ...prev,
        [`idNumber_${passengerIndex}`]: error
      }));
    } else if (field === 'phone') {
      const error = validatePhoneNumber(value);
      setErrors(prev => ({
        ...prev,
        [`phone_${passengerIndex}`]: error
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tất cả các trường trước khi submit
    const newErrors: { [key: string]: string } = {};
    let hasError = false;

    passengers.forEach((passenger, index) => {
      const idError = validateIdNumber(passenger.idNumber);
      const phoneError = validatePhoneNumber(passenger.phone);

      if (idError) {
        newErrors[`idNumber_${index}`] = idError;
        hasError = true;
      }
      if (phoneError) {
        newErrors[`phone_${index}`] = phoneError;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (!hasError) {
      onSubmit(passengers);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lựa chọn của quý hành khách</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.flightSummary}>
            <div className={styles.flightHeader}>
              <h2 className={styles.flightTitle}>Chi tiết chuyến bay đi</h2>
              <span className={styles.flightNumber}>{flightDetails.flightNumber}</span>
            </div>

            <div className={styles.flightTimes}>
              <div className={styles.timeSection}>
                <div className={styles.time}>{flightDetails.departure.time}</div>
                <div className={styles.code}>{flightDetails.departure.code}</div>
              </div>
              
              <div className={styles.flightIcon}>
                <FaArrowRight  />
              </div>
              
              <div className={styles.timeSection}>
                <div className={styles.time}>{flightDetails.arrival.time}</div>
                <div className={styles.code}>{flightDetails.arrival.code}</div>
              </div>
            </div>

            <div className={styles.flightDetails}>
              <div className={styles.detail}>
                <span className={styles.detailIcon}><FaRegCalendarAlt /></span>
                <div>
                  <div className={styles.detailLabel}>Ngày khởi hành</div>
                  <div className={styles.detailValue}>{flightDetails.date}</div>
                </div>
              </div>
              
              <div className={styles.detail}>
                <span className={styles.detailIcon}><MdAccessTime /></span>
                <div>
                  <div className={styles.detailLabel}>Thời gian bay</div>
                  <div className={styles.detailValue}>{flightDetails.duration}</div>
                </div>
              </div>
              
              <div className={styles.detail}>
                <span className={styles.detailIcon}><IoPeople /></span>
                <div>
                  <div className={styles.detailLabel}>Hành khách</div>
                  <div className={styles.detailValue}>{flightDetails.passengers}</div>
                </div>
              </div>
              
              <div className={styles.detail}>
                <span className={styles.detailIcon}><MdPayment /></span>
                <div>
                  <div className={styles.detailLabel}>Phương thức thanh toán</div>
                  <div className={styles.detailValue}>{flightDetails.paymentMethod}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hiển thị thông tin chuyến bay về nếu là chuyến khứ hồi */}
          {isRoundTrip && returnFlightDetails && (
            <div className={styles.flightSummary} style={{ marginTop: '20px' }}>
              <div className={styles.flightHeader}>
                <h2 className={styles.flightTitle}>Chi tiết chuyến bay về</h2>
                <span className={styles.flightNumber}>{returnFlightDetails.flightNumber}</span>
              </div>

              <div className={styles.flightTimes}>
                <div className={styles.timeSection}>
                  <div className={styles.time}>{returnFlightDetails.departure.time}</div>
                  <div className={styles.code}>{returnFlightDetails.departure.code}</div>
                </div>
                
                <div className={styles.flightIcon}>
                  <FaArrowRight  />
                </div>
                
                <div className={styles.timeSection}>
                  <div className={styles.time}>{returnFlightDetails.arrival.time}</div>
                  <div className={styles.code}>{returnFlightDetails.arrival.code}</div>
                </div>
              </div>

              <div className={styles.flightDetails}>
                <div className={styles.detail}>
                  <span className={styles.detailIcon}><FaRegCalendarAlt /></span>
                  <div>
                    <div className={styles.detailLabel}>Ngày khởi hành</div>
                    <div className={styles.detailValue}>{returnFlightDetails.date}</div>
                  </div>
                </div>
                
                <div className={styles.detail}>
                  <span className={styles.detailIcon}><MdAccessTime /></span>
                  <div>
                    <div className={styles.detailLabel}>Thời gian bay</div>
                    <div className={styles.detailValue}>{returnFlightDetails.duration}</div>
                  </div>
                </div>
                
                <div className={styles.detail}>
                  <span className={styles.detailIcon}><IoPeople /></span>
                  <div>
                    <div className={styles.detailLabel}>Hành khách</div>
                    <div className={styles.detailValue}>{returnFlightDetails.passengers}</div>
                  </div>
                </div>
                
                <div className={styles.detail}>
                  <span className={styles.detailIcon}><MdPayment /></span>
                  <div>
                    <div className={styles.detailLabel}>Phương thức thanh toán</div>
                    <div className={styles.detailValue}>{returnFlightDetails.paymentMethod}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.totalSection}>
            <div className={styles.totalLabel}>
              Tổng cộng<br />
              <span className={styles.totalSubtext}>Đã bao gồm thuế và phí</span>
            </div>
            <div className={styles.totalPrice}>
              {formatPrice(isRoundTrip && returnFlightDetails 
                ? flightDetails.price + returnFlightDetails.price 
                : flightDetails.price)}
            </div>
          </div>

          <div className={styles.actionButtons}>
            {/* <button type="button" className={styles.editButton}>
              Nhập thông tin hành khách
            </button> */}
            <button type="submit" form="passenger-form" className={styles.continueButton}>
              Chọn ghế 
            </button>
          </div>
        </div>

        <div className={styles.rightSection}>
          <form id="passenger-form" onSubmit={handleSubmit} className={styles.passengerForm}>
            {passengers.map((passenger, index) => (
              <div key={index} className={styles.passengerCard}>
                <h3 className={styles.passengerTitle}>Hành khách {index + 1}</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số CCCD</label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors[`idNumber_${index}`] ? styles.inputError : ''}`}
                      value={passenger.idNumber}
                      onChange={(e) => handleInputChange(index, 'idNumber', e.target.value)}
                      placeholder="123456789012"
                      required
                      maxLength={12}
                    />
                    {errors[`idNumber_${index}`] && (
                      <span className={styles.errorMessage}>{errors[`idNumber_${index}`]}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Họ</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={passenger.lastName}
                      onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                      placeholder="Nguyen"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tên</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={passenger.firstName}
                      onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                      placeholder="Van A"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại</label>
                    <input
                      type="tel"
                      className={`${styles.input} ${errors[`phone_${index}`] ? styles.inputError : ''}`}
                      value={passenger.phone}
                      onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                      placeholder="0987654321"
                      required
                      maxLength={10}
                    />
                    {errors[`phone_${index}`] && (
                      <span className={styles.errorMessage}>{errors[`phone_${index}`]}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ngày sinh (MM/dd/yyyy)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={passenger.birthDate}
                      onChange={(e) => handleInputChange(index, 'birthDate', e.target.value)}
                      placeholder="01/29/1990"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Giới tính</label>
                    <select
                      className={styles.select}
                      value={passenger.gender}
                      onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                      required
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Địa chỉ</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={passenger.address}
                    onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    placeholder="123 Nguyen Trai, Ha Noi"
                    required
                  />
                </div>
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Passenger;