"use client";

import React from "react";
import styles from "./offer.module.scss";
import {
  MdFlight,
  MdAirlineSeatReclineExtra,
  MdLuggage,
  MdAirplanemodeActive,
} from "react-icons/md";
import { FaWifi, FaUtensils } from "react-icons/fa";
import { BsArrowRightShort } from "react-icons/bs";

// Import images
import Image from "next/image";
import img1 from "../../../../public/Assets/airlinevn.jpg";
import img2 from "../../../../public/Assets/bamboo.jpg";
import img3 from "../../../../public/Assets/vietjet.png";

const Offers = [
  {
    id: 1,
    imgSrc: img1,
    airline: "Vietnam Airlines",
    route: "Hà Nội - TP.HCM",
    departure: "08:00 AM",
    arrival: "10:10 AM",
    price: "1,200,000 VND",
    duration: "2h10m",
    stops: "Bay thẳng",
  },
  {
    id: 2,
    imgSrc: img2,
    airline: "Bamboo Airways",
    route: "Đà Nẵng - Hải Phòng",
    departure: "10:30 AM",
    arrival: "12:15 PM",
    price: "1,800,000 VND",
    duration: "1h45m",
    stops: "Bay thẳng",
  },
  {
    id: 3,
    imgSrc: img3,
    airline: "Vietjet Air",
    route: "Hà Nội - Đà Lạt",
    departure: "17:00 PM",
    arrival: "18:30 PM",
    price: "1,500,000 VND",
    duration: "1h30m",
    stops: "Bay thẳng",
  },
];

const Offer = () => {
  return (
    <section
      className={`${styles.offer} ${styles.container} ${styles.section}`}
    >
      <div className={styles.secContainer}>
        <div className={styles.secIntro}>
          <h2 className={styles.secTitle}>Ưu đãi chuyến bay</h2>
          <p>
            Khám phá các chuyến bay với giá tốt nhất đến nhiều điểm đến hấp dẫn
          </p>
        </div>

        <div className={`${styles.mainContent} ${styles.grid}`}>
          {Offers.map(
            ({
              id,
              imgSrc,
              airline,
              route,
              departure,
              arrival,
              price,
              duration,
              stops,
            }) => (
              <div className={styles.singleOffer} key={id}>
                <div className={styles.destImage}>
                  <Image src={imgSrc} alt={airline} />
                  <span className={styles.discount}>Giá tốt</span>
                </div>

                <div className={styles.offerBody}>
                  <div className={`${styles.price} ${styles.flex}`}>
                    <h4>{price}</h4>
                    <span className={styles.status}>{airline}</span>
                  </div>

                  <div className={styles.routeInfo}>
                    <h3>{route}</h3>
                    <div className={`${styles.timeInfo} ${styles.flex}`}>
                      <div>
                        <small>Khởi hành</small>
                        <p>{departure}</p>
                      </div>
                      <div>
                        <small>Đến nơi</small>
                        <p>{arrival}</p>
                      </div>
                      <div>
                        <small>Thời gian</small>
                        <p>{duration}</p>
                      </div>
                    </div>
                    {/* <small className="stops">{stops}</small> */}
                  </div>

                  <div className={`${styles.amenities} ${styles.flex}`}>
                    <div className={`${styles.singleAmenity} ${styles.flex}`}>
                      <MdAirlineSeatReclineExtra className={styles.icon} />
                      <small>Ghế thoải mái</small>
                    </div>
                    <div className={`${styles.singleAmenity} ${styles.flex}`}>
                      <MdLuggage className={styles.icon} />
                      <small>Hành lý 20kg</small>
                    </div>
                    <div className={`${styles.singleAmenity} ${styles.flex}`}>
                      <FaWifi className={styles.icon} />
                      <small>Wi-fi</small>
                    </div>
                    <div className={`${styles.singleAmenity} ${styles.flex}`}>
                      <FaUtensils className={styles.icon} />
                      <small>Đồ ăn</small>
                    </div>
                  </div>

                  <button className={`${styles.btn} ${styles.flex}`}>
                    Đặt ngay
                    <BsArrowRightShort className={styles.icon} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Offer;
