'use client';

import { useEffect, useState } from 'react';
import styles from './topCard.module.scss';
import { FaPlane, FaTicketAlt, FaDollarSign } from 'react-icons/fa';

export default function TopCards() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:4000/dashboard/summary')
      .then((res) => res.json())
      .then((data) => setSummary(data));
  }, []);

  if (!summary) return <div>Đang tải dữ liệu...</div>;

  const cards = [
    {
      title: 'Tổng số máy bay',
      value: summary.tongSoMayBay,
      description: 'Hiện có trong đội bay',
      icon: <FaPlane />,
      color: '#4CAF50'
    },
    {
      title: 'Tổng số chuyến bay',
      value: summary.tongSoChuyenBay,
      // description: 'Hoàn thành trong tuần này',
      icon: <FaPlane />,
      color: '#2196F3'
    },
    {
      title: 'Số vé đã được đặt',
      value: summary.soVeDaDat,
      // description: 'Trong tuần này',
      icon: <FaTicketAlt />,
      color: '#9C27B0'
    },
    {
      title: 'Tổng doanh thu',
      value: `${Number(summary.tongDoanhThu).toFixed(2)} VND`,
      // description: 'Tổ vé máy bay trong tháng',
      icon: <FaDollarSign />,
      color: '#F44336'
    }
  ];

  return (
    <div className={styles.topCards}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.cardIcon} style={{ backgroundColor: card.color }}>
            {card.icon}
          </div>
          <div className={styles.cardContent}>
            <h3>{card.title}</h3>
            <div className={styles.value}>{card.value}</div>
            <div className={styles.description}>{card.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
