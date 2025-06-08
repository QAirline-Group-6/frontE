'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './chart.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FlightStatusChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:4000/dashboard/flight-status')
      .then((res) => res.json())
      .then((data) => {
        setChartData({
          labels: ['Chưa Cất Cánh', 'Đang Bay', 'Đã Hạ Cánh'],
          datasets: [
            {
              data: [data.chuaCatCanh, data.dangBay, data.daHaCanh],
              backgroundColor: '#15a3ef',
              barThickness: 40,
            },
          ],
        });
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Tình trạng các chuyến bay',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!chartData) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.chartContainer}>
      <Bar options={options} data={chartData} />
    </div>
  );
}
