'use client';

import { useState, useEffect } from 'react';
import styles from './profile.module.scss';

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    user_id: 0,
    username: '',
    email: '',
    phone: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleBasicInfoUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/users/put/${profile.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
          phone: profile.phone
        })
      });

      if (response.ok) {
        alert('Cập nhật thông tin thành công');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Mật khẩu mới không khớp');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        window.location.href = '/auth/login';
        return;
      }

      console.log('Token:', token); // Debug token

      const response = await fetch('http://localhost:4000/users/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: profile.email,
          password: passwords.newPassword
        })
      });

      console.log('Response status:', response.status); // Debug response status

      const data = await response.json();
      console.log('Response data:', data); // Debug response data

      if (response.ok) {
        alert('Đổi mật khẩu thành công');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu');
    }
  };


  return (
    <div className={styles.profileContainer}>
      <h1>Hồ Sơ Cá Nhân</h1>

      <div className={styles.section}>
        <h2>Thông tin cơ bản</h2>
        <div className={styles.formGroup}>
          <label>ID:</label>
          <span>{profile.user_id}</span>
        </div>
        <div className={styles.formGroup}>
          <label>Tên người dùng:</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Số điện thoại:</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <button className={styles.primaryButton} onClick={handleBasicInfoUpdate}>
          Cập nhật thông tin
        </button>
      </div>

      <div className={styles.section}>
        <h2>Đặt lại mật khẩu</h2>
        <div className={styles.formGroup}>
          <label>Mật khẩu hiện tại:</label>
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />
        </div>
        <button className={styles.primaryButton} onClick={handlePasswordChange}>
          Đổi mật khẩu
        </button>
      </div>

      
    </div>
  );
}
