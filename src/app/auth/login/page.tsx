"use client"; // Chỉ định đây là Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import styles from "./login.module.scss";
import { authService } from "@/api/services/authService";
import { toast } from "react-toastify";
import { loginSuccess } from "@/store/features/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  
  const router = useRouter();
  const dispatch = useDispatch();

  // Hàm validate form
  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: ""
    };

    // Kiểm tra email
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Kiểm tra password
    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset lỗi trước khi validate
    setErrors({ email: "", password: "", general: "" });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.token) {
        // Lưu vào localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Cập nhật Redux store
        dispatch(loginSuccess({ user: response.user, token: response.token }));
        
        toast.success('Đăng nhập thành công!');
        
        if (response.user.role === 'admin') {
            router.push("/admin/dashboard");
        } else {
            router.push("/");
        }
      }
    } catch (err: any) {
      // Xử lý các loại lỗi khác nhau
      if (err.response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          general: "Email hoặc mật khẩu không chính xác"
        }));
      } else if (err.response?.status === 404) {
        setErrors(prev => ({
          ...prev,
          general: "Tài khoản không tồn tại"
        }));
      } else if (err.response?.status === 422) {
        // Lỗi validation từ server
        const serverErrors = err.response.data.errors;
        if (serverErrors) {
          setErrors(prev => ({
            ...prev,
            email: serverErrors.email?.[0] || "",
            password: serverErrors.password?.[0] || ""
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          general: err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập"
        }));
      }
      
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa lỗi khi user bắt đầu nhập lại
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>Đăng Nhập</h1>

        {/* Hiển thị lỗi chung */}
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              required
            />
            {/* Hiển thị lỗi email */}
            {errors.email && (
              <span className={styles.fieldError}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              required
            />
            {/* Hiển thị lỗi password */}
            {errors.password && (
              <span className={styles.fieldError}>
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>Hoặc</span>
        </div>

        <button
          className={styles.googleButton}
          disabled={isLoading}
          type="button"
        >
          <span className={styles.googleIcon}></span>
          Đăng nhập với Google
        </button>

        <div className={styles.links}>
          <a href="/auth/forgot-password" className={styles.link}>
            Quên mật khẩu?
          </a>
          <a href="/auth/signup" className={styles.link}>
            Đăng ký tài khoản
          </a>
        </div>
      </div>
    </div>
  );
}