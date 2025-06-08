'use client';

import { useState, useEffect } from 'react';
import styles from './members.module.scss';
import { FaPlus, FaSearch } from 'react-icons/fa';

interface Admin {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export default function AdminsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Fetch admins data
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:4000/users/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Admin[] = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    (admin.user_id?.toString() || '').includes(searchTerm) ||
    (admin.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (admin.phone || '').includes(searchTerm)
  );

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực.');
      }

      const response = await fetch('http://localhost:4000/users/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newAdmin.username,
          email: newAdmin.email,
          password: newAdmin.password,
          phone: newAdmin.phone,
          role: 'admin' // Assuming new users created here are always admins
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP! status: ${response.status}`);
      }

      alert('Thêm admin thành công!');
      setNewAdmin({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
      });
      setShowAddModal(false);
      fetchAdmins(); // Refresh the list of admins
    } catch (error: any) {
      console.error('Lỗi khi thêm admin:', error);
      alert(`Lỗi khi thêm admin: ${error.message}`);
    }
  };

  return (
    <div className={styles.membersContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Admin</h1>
        <div className={styles.actions}>
          <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <FaPlus /> THÊM ADMIN MỚI
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.membersTable}>
          <thead>
            <tr>
              <th>ID ADMIN</th>
              <th>TÊN ĐĂNG NHẬP</th>
              <th>EMAIL</th>
              <th>SỐ ĐIỆN THOẠI</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin, index) => (
              <tr key={`${admin.user_id}-${admin.email}-${index}`}>
                <td>{admin.user_id}</td>
                <td>{admin.username}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm Admin Mới</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className={styles.formGroup}>
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={newAdmin.confirmPassword}
                  onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>Thêm Admin</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
