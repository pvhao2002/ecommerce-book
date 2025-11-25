'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import apiClient from '@/api/apiClient';
import {API_ENDPOINTS} from '@/constants/api';
import './login.css';
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {email, password});

            localStorage.setItem('auth_token', res.data.token);
            router.push('/b/profile');
        } catch (err: any) {
            setError('Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">

            {/* ===== Left banner ===== */}
            <div className="login-banner">
                <a href="/b"><h1>📚 BookNest</h1></a>
                <p>Nơi những cuốn sách mở ra cả thế giới mới cho bạn.</p>
                <Image src={'/assets/login_books.svg'} alt={'Books'}
                       width={300}
                       height={300}/>
            </div>

            {/* ===== Login form ===== */}
            <div className="login-form-container">
                <form className="login-form" onSubmit={handleLogin}>
                    <h2>Đăng Nhập</h2>
                    <p className="login-sub">Chào mừng bạn quay trở lại!</p>

                    {error && <div className="login-error">{error}</div>}

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Nhập email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>

                    <p className="signup-text">
                        Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                    </p>
                    <p className="signup-text">
                        Về <a href="/b">trang chủ</a>
                    </p>
                </form>
            </div>

        </div>
    );
}
