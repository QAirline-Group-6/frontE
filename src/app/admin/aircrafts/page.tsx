'use client';

import { useState, useEffect } from 'react';
import styles from './aircrafts.module.scss';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Aircraft {
  aircraft_id: number;
  manufacturer: string;
  model: string;
  total_seats: number;
}

export default function AircraftsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [newAircraft, setNewAircraft] = useState({
    manufacturer: '',
    model: '',
    total_seats: 0
  });

  // Fetch aircrafts data
  useEffect(() => {
    fetchAircrafts();
  }, []);

  const fetchAircrafts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/aircrafts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAircrafts(data);
    } catch (error) {
      console.error('Error fetching aircrafts:', error);
    }
  };

  const handleAddAircraft = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thực hiện thao tác này');
        return;
      }

      const response = await fetch('http://localhost:4000/aircrafts/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAircraft),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewAircraft({ manufacturer: '', model: '', total_seats: 0 });
        fetchAircrafts();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Có lỗi xảy ra khi thêm tàu bay');
      }
    } catch (error) {
      console.error('Error adding aircraft:', error);
      alert('Có lỗi xảy ra khi thêm tàu bay');
    }
  };

  const handleEditAircraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAircraft) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/aircrafts/update/${selectedAircraft.aircraft_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedAircraft),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedAircraft(null);
        fetchAircrafts();
      }
    } catch (error) {
      console.error('Error updating aircraft:', error);
    }
  };

  const handleDeleteAircraft = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tàu bay này?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/aircrafts/del/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchAircrafts();
        }
      } catch (error) {
        console.error('Error deleting aircraft:', error);
      }
    }
  };

  const filteredAircrafts = aircrafts.filter(aircraft =>
    aircraft.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aircraft.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.aircraftsContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Tàu Bay</h1> 
      </div>
      <div className={styles.actions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm tàu bay theo nhà sản xuất hoặc model"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
          <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <FaPlus /> TÀU BAY MỚI
          </button>
        </div>
      <div className={styles.tableContainer}>
        <table className={styles.aircraftsTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>NHÀ SẢN XUẤT</th>
              <th>MODEL</th>
              <th>TỔNG SỐ GHẾ</th>
              <th>TÙY CHỈNH</th>
            </tr>
          </thead>
          <tbody>
            {filteredAircrafts.map((aircraft) => (
              <tr key={aircraft.aircraft_id}>
                <td>{aircraft.aircraft_id}</td>
                <td>{aircraft.manufacturer}</td>
                <td>{aircraft.model}</td>
                <td>{aircraft.total_seats}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedAircraft(aircraft);
                      setShowEditModal(true);
                    }}
                    className={styles.editButton}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAircraft(aircraft.aircraft_id)}
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

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm tàu bay mới</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddAircraft}>
              <div className={styles.formGroup}>
                <label>Nhà sản xuất</label>
                <input
                  type="text"
                  value={newAircraft.manufacturer}
                  onChange={(e) => setNewAircraft({ ...newAircraft, manufacturer: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Model</label>
                <input
                  type="text"
                  value={newAircraft.model}
                  onChange={(e) => setNewAircraft({ ...newAircraft, model: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tổng số ghế</label>
                <input
                  type="number"
                  value={newAircraft.total_seats}
                  onChange={(e) => setNewAircraft({ ...newAircraft, total_seats: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <button type="submit" className={styles.submitButton}>Lưu</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedAircraft && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Chỉnh sửa tàu bay</h2>
              <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditAircraft}>
              <div className={styles.formGroup}>
                <label>Nhà sản xuất</label>
                <input
                  type="text"
                  value={selectedAircraft.manufacturer}
                  onChange={(e) => setSelectedAircraft({ ...selectedAircraft, manufacturer: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Model</label>
                <input
                  type="text"
                  value={selectedAircraft.model}
                  onChange={(e) => setSelectedAircraft({ ...selectedAircraft, model: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tổng số ghế</label>
                <input
                  type="number"
                  value={selectedAircraft.total_seats}
                  onChange={(e) => setSelectedAircraft({ ...selectedAircraft, total_seats: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <button type="submit" className={styles.submitButton}>Cập nhật</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 