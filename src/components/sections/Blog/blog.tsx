import React from "react";
import styles from "./blog.module.scss";
import { BsArrowRightShort } from "react-icons/bs";
import Link from 'next/link';

// Import images
import img1 from "../../../../public/Assets/vietnam.jpg";
import img2 from "../../../../public/Assets/seoul.jpg";
import img3 from "../../../../public/Assets/berlin.jpg";
import img4 from "../../../../public/Assets/paris.jpg";

interface BlogPost {
  id: number;
  imgSrc: string;
  title: string;
  desc: string;
}

const Post: BlogPost[] = [
  {
    id: 9,
    imgSrc: img1.src,
    title: "Hà Nội – Ngàn năm văn hiến",
    desc: "Hà Nội gây ấn tượng với nét đẹp cổ kính, những con phố nhỏ, hồ Hoàn Kiếm thơ mộng, và nền ẩm thực phong phú như phở, bún chả, cốm làng Vòng.",
  },
  {
    id: 10,
    imgSrc: img2.src,
    title: "Seoul – Trái tim năng động",
    desc: "Seoul kết hợp hoàn hảo giữa hiện đại và truyền thống, từ những cung điện cổ kính như Gyeongbokgung đến những khu phố sôi động như Myeongdong và Gangnam.",
  },
  {
    id: 11,
    imgSrc: img3.src,
    title: "Berlin – Thành phố lịch sử",
    desc: "Berlin là thủ đô của Đức, nổi bật với bức tường Berlin lịch sử, bảo tàng Pergamon và đời sống văn hóa, nghệ thuật sôi động hàng đầu châu Âu.",
  },
  {
    id: 12,
    imgSrc: img4.src,
    title: "Paris – Thành phố của ánh sáng",
    desc: "Paris là biểu tượng của sự lãng mạn và nghệ thuật. Với tháp Eiffel, bảo tàng Louvre, và dòng sông Seine thơ mộng, đây là một trong những điểm đến hấp dẫn nhất Châu Âu.",
  },
];

const Blog: React.FC = () => {
  return (
    <div>
      <section className={styles.blog}>
        <div className={styles.secContainer}>
          <div className={styles.secIntro}>
            <h2 className={styles.secTitle}>Blog du lịch</h2>
            <p>Khám phá những trải nghiệm trên thế giới</p>
          </div>

          <div className={styles.mainContainer}>
            {Post.map((post) => (
              <div className={styles.singlePost} key={post.id}>
                <div className={styles.imgDiv}>
                  <img src={post.imgSrc} alt={post.title} />
                </div>

                <div className={styles.postDetails}>
                  <h3>{post.title}</h3>
                  <p>{post.desc}</p>
                </div>

                <Link href={`/blogs/${post.id}`} className={styles.readMore}>
                  Đọc thêm <BsArrowRightShort className={styles.icon} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
