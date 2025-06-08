'use client';

import { usePathname } from 'next/navigation';
import styles from './bm_layout.module.scss';

export default function BookingManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.layoutContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            Quản lý vé
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className={styles.contentWrapper}>
        <div className={styles.contentContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}