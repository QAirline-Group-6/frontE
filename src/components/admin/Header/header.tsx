'use client';

import { useRouter } from 'next/navigation';
import styles from './hearder.module.scss';
import { FaUserCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/features/authSlice';
import { RootState } from '../../../store/store';

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.userInfo}>
          <FaUserCircle className={styles.userIcon} />
          <span className={styles.userName}>{user?.username || user?.email}</span>
          <div className={styles.userActions}>
            <button onClick={() => router.push('/admin/profile')}>
              Hồ sơ
            </button>
            <button onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
