'use client';

import { useState, useEffect } from 'react';
import styles from './customers.module.scss';
import { FaSearch } from 'react-icons/fa';

interface Customer {
  user_id: number;
  username: string;
  email: string;
  phone: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Fetch customers data
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:4000/users/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.user_id?.toString() || '').includes(searchTerm) ||
    (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.phone || '').includes(searchTerm) ||
    `${customer.username || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to Vietnamese locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className={styles.customersContainer}>
      <div className={styles.header}>
        <h1>Quản Lý Khách Hàng</h1>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.searchButton}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.customersTable}>
          <thead>
            <tr>
              <th>ID KHÁCH HÀNG</th>
              <th>HỌ VÀ TÊN</th>
              <th>EMAIL</th>
              <th>SỐ ĐIỆN THOẠI</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => (
              <tr key={`${customer.user_id}-${customer.email}-${index}`}>
                <td>{customer.user_id}</td>
                <td>{customer.username}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 