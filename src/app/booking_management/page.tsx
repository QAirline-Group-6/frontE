'use client';

import { useState } from 'react';
import styles from './bm_page.module.scss';
import { useRouter } from 'next/navigation';

export default function BookingSearchPage() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to detail page with search parameters
    router.push(`/detail?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Mã đặt chỗ/Số vé điện tử"
          value={code}
          onChange={e => setCode(e.target.value)}
          className={styles.searchInput}
          required
        />
        <input
          type="email"
          placeholder="Hòm thư điện tử"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={styles.searchInput}
          required
        />
        <button
          type="submit"
          className={styles.searchButton}
        >
          TÌM KIẾM
        </button>
      </form>
    </div>
  );
}