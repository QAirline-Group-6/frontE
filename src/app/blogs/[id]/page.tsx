'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import styles from './detail.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarDays } from "react-icons/fa6";
import { FaArrowLeftLong } from "react-icons/fa6";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const response = await axios.get(`http://localhost:4000/blogs/${id}`);
          setPost(response.data.data);
          setLoading(false);
        } catch (err) {
          setError('Không thể tải bài viết. Vui lòng thử lại sau.');
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.errorContainer}>
        <p>Bài viết không tìm thấy.</p>
        <Link href="/blogs" className={styles.backButton}> <FaArrowLeftLong />Quay lại trang Blog</Link>
      </div>
    );
  }

  return (
    <div className={styles.detailPageWrapper}>
      <div className={styles.blogPostContent}>
        <Link href="/blogs" className={styles.backLink}><FaArrowLeftLong /> Quay lại trang trước</Link>
        <h1 className={styles.detailTitle}>{post.title}</h1>
        <div className={styles.metaInfo}>
          <span className={styles.date}>
            <FaCalendarDays /> {new Date(post.created_at).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            })}
          </span>
          
        </div>
        <div className={styles.imageWrapper}>
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            className={styles.detailImage}
            priority
          />
        </div>
        <div className={styles.contentBody}>
          <p>{post.content}</p>
        </div>
       
      </div>
    </div>
  );
} 