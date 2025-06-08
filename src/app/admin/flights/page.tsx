'use client';

import { useState, useEffect } from 'react';
import styles from './flights.module.scss';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Flight {
  flight_id: number;
  aircraft_id: number;
  flight_number: string;
  departure_airport_id: number;
  destination_airport_id: number;
  departure_time: string; // Use string for datetime input
  arrival_time: string; // Use string for datetime input
  available_seats: number;
  price_economy: number;
  price_business: number;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'in_air' | 'landed';
}

export default function FlightsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [newFlight, setNewFlight] = useState({
    aircraft_id: 0,
    flight_number: '',
    departure_airport_id: 0,
    destination_airport_id: 0,
    departure_time: '',
    arrival_time: '',
    available_seats: 0,
    price_economy: 0,
    price_business: 0,
    status: 'scheduled' as Flight['status'],
  });

  // Fetch flights data
  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:4000/flights/searchAll', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:4000/flights/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newFlight),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewFlight({
          aircraft_id: 0,
          flight_number: '',
          departure_airport_id: 0,
          destination_airport_id: 0,
          departure_time: '',
          arrival_time: '',
          available_seats: 0,
          price_economy: 0,
          price_business: 0,
          status: 'scheduled',
        });
        fetchFlights();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      alert(`Error adding flight: ${error}`);
    }
  };

  const handleEditFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:4000/flights/update/${selectedFlight.flight_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedFlight),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedFlight(null);
        fetchFlights();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      alert(`Error updating flight: ${error}`);
    }
  };

  const handleDeleteFlight = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuyến bay này?')) {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:4000/flights/del/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchFlights();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting flight:', error);
        alert(`Error deleting flight: ${error}`);
      }
    }
  };

  const filteredFlights = flights.filter(flight =>
    flight.flight_number.toLowerCase().includes(searchTerm.toLowerCase())
    // Add more filtering options if needed, e.g., by airport or aircraft_id
  );

  return (
    <div className={styles.flightsContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Chuyến Bay</h1>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm chuyến bay theo số hiệu chuyến bay"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
          <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <FaPlus /> CHUYẾN BAY MỚI
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.flightsTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>MÃ TÀU BAY</th>
              <th>SỐ HIỆU</th>
              <th>ĐIỂM ĐI</th>
              <th>ĐIỂM ĐẾN</th>
              <th>GIỜ CẤT CÁNH</th>
              <th>GIỜ HẠ CÁNH</th>
              <th>GHẾ TRỐNG</th>
              <th>PHỔ THÔNG</th>
              <th>THƯƠNG GIA</th>
              <th>TRẠNG THÁI</th>
              <th>TÙY CHỈNH</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlights.map((flight) => (
              <tr key={flight.flight_id}>
                <td>{flight.flight_id}</td>
                <td>{flight.aircraft_id}</td>
                <td>{flight.flight_number}</td>
                <td>{flight.departure_airport_id}</td>
                <td>{flight.destination_airport_id}</td>
                <td>{new Date(flight.departure_time).toLocaleString()}</td>
                <td>{new Date(flight.arrival_time).toLocaleString()}</td>
                <td>{flight.available_seats}</td>
                <td>{flight.price_economy}</td>
                <td>{flight.price_business}</td>
                <td>{flight.status}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedFlight(flight);
                      setShowEditModal(true);
                    }}
                    className={styles.editButton}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteFlight(flight.flight_id)}
                    className={styles.deleteButton}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Flight Modal */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm chuyến bay mới</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddFlight}>
              <div className={styles.formGroup}>
                
              </div>
              <div className={styles.formGroup}>
                <label>Loại tàu bay</label>
                <input
                  type="number"
                  value={newFlight.aircraft_id}
                  onChange={(e) => setNewFlight({ ...newFlight, aircraft_id: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Số hiệu chuyến</label>
                <input
                  type="text"
                  value={newFlight.flight_number}
                  onChange={(e) => setNewFlight({ ...newFlight, flight_number: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sân bay cất cánh</label>
                <input
                  type="number"
                  value={newFlight.departure_airport_id}
                  onChange={(e) => setNewFlight({ ...newFlight, departure_airport_id: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sân bay hạ cánh</label>
                <input
                  type="number"
                  value={newFlight.destination_airport_id}
                  onChange={(e) => setNewFlight({ ...newFlight, destination_airport_id: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Thời gian cất cánh</label>
                <input
                  type="datetime-local"
                  value={newFlight.departure_time}
                  onChange={(e) => setNewFlight({ ...newFlight, departure_time: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Thời gian hạ cánh</label>
                <input
                  type="datetime-local"
                  value={newFlight.arrival_time}
                  onChange={(e) => setNewFlight({ ...newFlight, arrival_time: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ghế trống</label>
                <input
                  type="number"
                  value={newFlight.available_seats}
                  onChange={(e) => setNewFlight({ ...newFlight, available_seats: parseInt(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Giá phổ thông</label>
                <input
                  type="number"
                  value={newFlight.price_economy}
                  onChange={(e) => setNewFlight({ ...newFlight, price_economy: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Giá thương gia</label>
                <input
                  type="number"
                  value={newFlight.price_business}
                  onChange={(e) => setNewFlight({ ...newFlight, price_business: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select
                  value={newFlight.status}
                  onChange={(e) => setNewFlight({ ...newFlight, status: e.target.value as Flight['status'] })}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="in_air">In Air</option>
                  <option value="landed">Landed</option>
                </select>
              </div>
              <button type="submit" className={styles.submitButton}>Lưu</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Flight Modal */}
      {showEditModal && selectedFlight && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Chỉnh sửa chuyến bay</h2>
              <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditFlight}>
              <div className={styles.formGroup}>
                <label>ID Chuyến bay</label>
                <input
                  type="text"
                  value={selectedFlight.flight_id}
                  disabled // flight_id is primary key, should not be editable
                />
              </div>
              <div className={styles.formGroup}>
                <label>Loại tàu bay</label>
                <input
                  type="number"
                  value={selectedFlight.aircraft_id}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, aircraft_id: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Số hiệu chuyến</label>
                <input
                  type="text"
                  value={selectedFlight.flight_number}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, flight_number: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sân bay cất cánh</label>
                <input
                  type="number"
                  value={selectedFlight.departure_airport_id}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, departure_airport_id: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sân bay hạ cánh</label>
                <input
                  type="number"
                  value={selectedFlight.destination_airport_id}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, destination_airport_id: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Thời gian cất cánh</label>
                <input
                  type="datetime-local"
                  value={selectedFlight.departure_time}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, departure_time: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Thời gian hạ cánh</label>
                <input
                  type="datetime-local"
                  value={selectedFlight.arrival_time}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, arrival_time: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ghế trống</label>
                <input
                  type="number"
                  value={selectedFlight.available_seats}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, available_seats: parseInt(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Giá phổ thông</label>
                <input
                  type="number"
                  value={selectedFlight.price_economy}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, price_economy: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Giá thương gia</label>
                <input
                  type="number"
                  value={selectedFlight.price_business}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, price_business: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select
                  value={selectedFlight.status}
                  onChange={(e) => setSelectedFlight({ ...selectedFlight, status: e.target.value as Flight['status'] })}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="in_air">In Air</option>
                  <option value="landed">Landed</option>
                </select>
              </div>
              <button type="submit" className={styles.submitButton}>Cập nhật</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
