"use client"; // Bắt buộc vì sử dụng hooks và event listeners

import React, { useState, useEffect } from "react"; // Nhập React và các hook cần thiết
import { SiChinaeasternairlines } from "react-icons/si"; // Nhập icon hãng hàng không
import { AiFillCloseCircle } from "react-icons/ai"; // Nhập icon đóng
import { TbGridDots } from "react-icons/tb"; // Nhập icon menu
import styles from "./navbar.module.scss"; // Nhập CSS module cho style riêng
import Link from "next/link"; // Nhập component Link của Next.js để chuyển trang
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/features/authSlice';
import { authService } from "@/api/services/authService";

// Dynamic import Avatar component with no SSR
const Avatar = dynamic(() => import('@/components/Avatar'), { ssr: false });

const Navbar = () => {
  // State quản lý class cho thanh nav (ẩn/hiện)
  const [active, setActive] = useState(styles.navBar);
  const [transparent, setTransparent] = useState(styles.header);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Hàm hiện nav (menu)
  const showNav = () => {
    setActive(`${styles.navBar} ${styles.activeNavbar}`);
  };

  // Hàm ẩn nav (menu)
  const removeNav = () => {
    setActive(styles.navBar);
  };
   // useEffect để lắng nghe sự kiện cuộn trang và đổi nền header
  useEffect(() => {
    const addBg = () => {
      if (window.scrollY >= 10) {
        setTransparent(`${styles.header} ${styles.activeHeader}`);
      } else {
        setTransparent(styles.header);
      }
    };

    window.addEventListener("scroll", addBg); // Thêm event listener khi cuộn trang

    // Cleanup function: xóa event listener khi component unmount
    return () => {
      window.removeEventListener("scroll", addBg);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <section className={styles.navBarSection}> {/* Khung tổng của navbar */}
      <div className={transparent}> {/* Header, đổi nền khi cuộn */}
        <div className={styles.logoDiv}> {/* Khung logo */}
          <Link href="/" className={styles.logo}> {/* Link về trang chủ */}
            <h1 className={styles.flex}> {/* Tiêu đề logo */}
              <SiChinaeasternairlines className={styles.icon} /> {/* Icon hãng hàng không */}
              QAirline {/* Tên hãng */}
            </h1>
          </Link>
        </div>

        <div className={active}> {/* Menu nav, có thể ẩn/hiện */}
          <ul className={`${styles.navLists} ${styles.flex}`}> {/* Danh sách các mục nav */}
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink}>
                Trang chủ
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link href="/flights" className={styles.navLink}>
                Chuyến bay
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link href="/booking_management" className={styles.navLink}>
                Quản lý vé
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/blogs" className={styles.navLink}>
                Tin tức
              </Link>
            </li>

            <li className={styles.navItem}>
              <Link href="/contact" className={styles.navLink}>
                Liên hệ
              </Link>
            </li>

            <div className={`${styles.headerBtns} ${styles.flex}`}> {/* Các nút đăng nhập/đăng ký */}
              {isAuthenticated ? (
                <div className={styles.avatarWrapper}>
                  <Avatar onLogout={handleLogout} />
                </div>
              ) : (
                <>
                  <button className={`${styles.btn} ${styles.loginBtn}`}>
                    <Link href="/auth/login">Đăng nhập</Link>
                  </button>
                  <button className={styles.btn}>
                    <Link href="/auth/signup">Đăng ký</Link>
                  </button>
                </>
              )}
            </div>
          </ul>

          <div onClick={removeNav} className={styles.closeNavbar}> {/* Nút đóng menu nav */}
            <AiFillCloseCircle className={styles.icon} />
          </div>
        </div>

        <div onClick={showNav} className={styles.toggleNavbar}> {/* Nút mở menu nav (icon 3 chấm) */}
          <TbGridDots className={styles.icon} />
        </div>
      </div>
    </section>
  );
};

export default Navbar; // Xuất component Navbar để sử dụng ở nơi khác
