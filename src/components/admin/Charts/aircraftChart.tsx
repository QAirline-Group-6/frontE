'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './chart.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AircraftChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:4000/dashboard/aircraft-statistics')
      .then((res) => res.json())
      .then((data) => {
        const labels = Object.keys(data);
        const values = Object.values(data);
        setChartData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: [
                '#4285F4',
                '#EA4335',
                '#34A853',
                '#00BCD4',
                '#FF9800',
                '#9C27B0',
                '#607D8B',
              ],
            },
          ],
        });
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Các loại máy bay hiện có',
      },
    },
  };

  if (!chartData) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.chartContainer}>
      <Pie options={options} data={chartData} />
    </div>
  );
}
