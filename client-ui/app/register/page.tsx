'use client';

import './signup.css';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import apiClient from '@/api/apiClient';
import {API_ENDPOINTS} from '@/constants/api';

export default function SignupPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirm) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            setLoading(true);

            await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                fullName,
                email,
                password,
                phone,
                address,
            });

            setSuccess('Đăng ký thành công! Chuyển hướng sau 2 giây...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-wrapper">

            {/* ===== Banner ===== */}
            <div className="signup-banner">
                <a href="/b"><h1>📚 Tham Gia BookNest</h1></a>
                <p>Nơi những người yêu sách kết nối và chia sẻ tri thức.</p>
                <img src="/assets/signup_books.svg" alt="Books Signup"/>
            </div>

            {/* ===== Form ===== */}
            <div className="signup-form-container">
                <form className="signup-form" onSubmit={handleSignup}>
                    <h2>Tạo Tài Khoản</h2>
                    <p className="signup-sub">Chỉ mất vài giây để bắt đầu hành trình đọc sách của bạn!</p>

                    {error && <div className="signup-error">{error}</div>}
                    {success && <div className="signup-success">{success}</div>}

                    <label>Họ và Tên</label>
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Nhập họ tên..."
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Nhập email..."
                    />

                    <label>Phone</label>
                    <input
                        type="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="Nhập sdt..."
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Tạo mật khẩu..."
                    />

                    <label>Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        placeholder="Nhập lại mật khẩu..."
                    />

                    <label>Địa chỉ</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ..."
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Đang tạo..." : "Đăng Ký"}
                    </button>

                    <p className="login-text">
                        Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
                    </p>
                    <p className="login-text">
                        Về <a href="/b">trang chủ</a>
                    </p>
                </form>
            </div>

        </div>
    );
}
