'use client';

import { useState, useEffect } from 'react';
import styles from './airports.module.scss';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Airport {
  airport_id?: number; // Auto-incremented, optional for new airports
  code: string;
  name: string;
  city: string;
  country: string;
}

export default function AirportsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [newAirport, setNewAirport] = useState<Omit<Airport, 'airport_id'>>({
    code: '',
    name: '',
    city: '',
    country: '',
  });

  // Fetch airports data
  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await fetch('http://localhost:4000/airports');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Airport[] = await response.json();
      setAirports(data);
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const handleAddAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/airports/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAirport),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewAirport({
          code: '',
          name: '',
          city: '',
          country: '',
        });
        fetchAirports(); // Refresh the list
      } else {
        console.error('Failed to add airport', response.statusText);
      }
    } catch (error) {
      console.error('Error adding airport:', error);
    }
  };

  const handleEditAirport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAirport || selectedAirport.airport_id === undefined) return;

    try {
      const airportToUpdate = {
        code: selectedAirport.code,
        name: selectedAirport.name,
        city: selectedAirport.city,
        country: selectedAirport.country,
      };

      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:4000/airports/update/${selectedAirport.airport_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add token to headers
        },
        body: JSON.stringify(airportToUpdate),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedAirport(null);
        fetchAirports(); // Refresh the list
      } else {
        console.error('Failed to update airport', response.statusText);
      }
    } catch (error) {
      console.error('Error updating airport:', error);
    }
  };

  const handleDeleteAirport = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sân bay này?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/airports/del/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchAirports(); // Refresh the list
        } else {
          console.error('Failed to delete airport', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting airport:', error);
      }
    }
  };

  const filteredAirports = airports.filter(airport =>
    airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.airportsContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Sân Bay</h1>
      </div>
      <div className={styles.actions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm sân bay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
          <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <FaPlus /> THÊM SÂN BAY
          </button>
        </div>

      <div className={styles.tableContainer}>
        <table className={styles.airportsTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>MÃ SÂN BAY</th>
              <th>TÊN SÂN BAY</th>
              <th>THÀNH PHỐ</th>
              <th>QUỐC GIA</th>
              <th>TÙY CHỈNH</th>
            </tr>
          </thead>
          <tbody>
            {filteredAirports.map((airport) => (
              <tr key={airport.airport_id}>
                <td>{airport.airport_id}</td>
                <td>{airport.code}</td>
                <td>{airport.name}</td>
                <td>{airport.city}</td>
                <td>{airport.country}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedAirport({ ...airport }); // Create a copy
                      setShowEditModal(true);
                    }}
                    className={styles.editButton}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAirport(airport.airport_id!)}
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

      {/* Add Airport Modal */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm Sân Bay Mới</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddAirport}>
              <div className={styles.formGroup}>
                <label>Mã Sân Bay</label>
                <input
                  type="text"
                  value={newAirport.code}
                  onChange={(e) => setNewAirport({ ...newAirport, code: e.target.value })}
                  required
                  maxLength={10}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên Sân Bay</label>
                <input
                  type="text"
                  value={newAirport.name}
                  onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Thành Phố</label>
                <input
                  type="text"
                  value={newAirport.city}
                  onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Quốc Gia</label>
                <input
                  type="text"
                  value={newAirport.country}
                  onChange={(e) => setNewAirport({ ...newAirport, country: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>Lưu</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Airport Modal */}
      {showEditModal && selectedAirport && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Chỉnh sửa Sân Bay</h2>
              <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditAirport}>
              <div className={styles.formGroup}>
                <label>ID Sân Bay</label>
                <input
                  type="text"
                  value={selectedAirport.airport_id}
                  disabled // airport_id is primary key, should not be editable
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã Sân Bay</label>
                <input
                  type="text"
                  value={selectedAirport.code}
                  onChange={(e) => setSelectedAirport({ ...selectedAirport, code: e.target.value })}
                  required
                  maxLength={10}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tên Sân Bay</label>
                <input
                  type="text"
                  value={selectedAirport.name}
                  onChange={(e) => setSelectedAirport({ ...selectedAirport, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Thành Phố</label>
                <input
                  type="text"
                  value={selectedAirport.city}
                  onChange={(e) => setSelectedAirport({ ...selectedAirport, city: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Quốc Gia</label>
                <input
                  type="text"
                  value={selectedAirport.country}
                  onChange={(e) => setSelectedAirport({ ...selectedAirport, country: e.target.value })}
                  required
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