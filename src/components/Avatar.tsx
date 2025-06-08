"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { RxAvatar } from "react-icons/rx";
import { LuTicket } from "react-icons/lu";
import { LuLogOut } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import styles from './Avatar.module.scss';

interface AvatarProps {
  onLogout: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className={styles.avatarContainer} ref={dropdownRef}>
            <div 
        className={styles.avatar} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {user ? getInitials(user.email) : '?'}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.email}>{user?.email}</div>
            <div className={styles.role}>{user?.role}</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.menuItems}>
            <button 
              className={styles.menuItem}
              onClick={() => {
                router.push('/my_account');
                setIsOpen(false);
              }}
            >
              <RxAvatar className={styles.icon} />
              <span>Thông tin tài khoản</span>
            </button>
            
            <button onClick={onLogout} className={styles.menuItem}>
              <LuLogOut className={styles.icon} />
              <span>Đăng xuất</span>
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};
export default Avatar;