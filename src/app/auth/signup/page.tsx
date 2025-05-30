"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./signup.module.scss";
import img from "../../../../public/Assets/image3.jpg";
import { authService } from "@/api/services/authService";

export default function DangKyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    matKhau: "",
    nhapLaiMatKhau: "",
    soDienThoai: "",
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.hoTen.trim()) newErrors.hoTen = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại phải có 10 chữ số";
    }
    if (!formData.matKhau) {
      newErrors.matKhau = "Vui lòng nhập mật khẩu";
    } else if (formData.matKhau.length < 6) {
      newErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (formData.matKhau !== formData.nhapLaiMatKhau) {
      newErrors.nhapLaiMatKhau = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      // Gọi API đăng ký
      const registerData = {
        username: formData.hoTen,
        email: formData.email,
        password: formData.matKhau, 
        phone: formData.soDienThoai
      };

      await authService.register(registerData);
      
      setSuccessMessage("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      console.error("Đăng ký thất bại:", error);
      setApiError(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gridContainer}>
        {/* Cột hình ảnh */}
        <div className={styles.imageColumn}>
          <Image
            src={img}
            alt="Hình ảnh đăng ký"
            fill
            className={styles.authImage}
            priority
            quality={80}
          />
          <div className={styles.imageOverlay}>
            <h2 className={styles.imageTitle}>
              Chào mừng đến với hệ thống đặt vé QAirline
            </h2>
            <p className={styles.imageSubtitle}>
              Hãy đăng ký để bắt đầu hành trình ngay hôm nay!
            </p>
          </div>
        </div>

        {/* Cột form đăng ký */}
        <div className={styles.formColumn}>
          <div className={styles.signupCard}>
            <h1 className={styles.title}>Đăng Ký Tài Khoản</h1>

            {successMessage ? (
              <div className={styles.successMessage}>{successMessage}</div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                {apiError && (
                  <div className={styles.apiError}>{apiError}</div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor="hoTen" className={styles.label}>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="hoTen"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.hoTen ? styles.errorInput : ""
                    }`}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                  {errors.hoTen && (
                    <span className={styles.error}>{errors.hoTen}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.email ? styles.errorInput : ""
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <span className={styles.error}>{errors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="soDienThoai" className={styles.label}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="soDienThoai"
                    name="soDienThoai"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.soDienThoai ? styles.errorInput : ""
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.soDienThoai && (
                    <span className={styles.error}>{errors.soDienThoai}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="matKhau" className={styles.label}>
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="matKhau"
                    name="matKhau"
                    value={formData.matKhau}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.matKhau ? styles.errorInput : ""
                    }`}
                    placeholder="Ít nhất 6 ký tự"
                  />
                  {errors.matKhau && (
                    <span className={styles.error}>{errors.matKhau}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="nhapLaiMatKhau" className={styles.label}>
                    Nhập lại mật khẩu
                  </label>
                  <input
                    type="password"
                    id="nhapLaiMatKhau"
                    name="nhapLaiMatKhau"
                    value={formData.nhapLaiMatKhau}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.nhapLaiMatKhau ? styles.errorInput : ""
                    }`}
                    placeholder="Xác nhận mật khẩu"
                  />
                  {errors.nhapLaiMatKhau && (
                    <span className={styles.error}>
                      {errors.nhapLaiMatKhau}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className={styles.buttonLoading}>
                      <span className={styles.spinner}></span>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Đăng Ký"
                  )}
                </button>
              </form>
            )}

            <div className={styles.loginLink}>
              Đã có tài khoản?{" "}
              <a href="/auth/login" className={styles.loginLinkText}>
                Đăng nhập ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
