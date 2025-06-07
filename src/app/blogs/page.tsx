'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './blog.module.scss';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/blogs');
        // Sử dụng trực tiếp đường dẫn ảnh từ dữ liệu API
        setPosts(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  return (
    <div className={styles.blogContainer}>
      <h1 className={styles.blogTitle}>Blog Du Lịch</h1>
      <div className={styles.blogGrid}>
        {posts.map((post) => (
          <article key={post.id} className={styles.blogCard}>
            <div className={styles.imageContainer}>
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                style={{ objectFit: 'cover' }}
                className={styles.blogImage}
                priority={post.id <= 3} // Ưu tiên tải ảnh cho 3 bài viết đầu tiên
              />
            </div>
            <div className={styles.blogContent}>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postDate}>
                {new Date(post.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className={styles.postExcerpt}>
                {post.content.length > 150
                  ? `${post.content.substring(0, 150)}...`
                  : post.content}
              </p>
              <Link href={`/blogs/${post.id}`} className={styles.readMoreBtn}>
                Đọc thêm
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
