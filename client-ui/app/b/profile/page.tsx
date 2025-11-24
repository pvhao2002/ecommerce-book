'use client';

import {useEffect, useState} from 'react';
import './profile.css';
import {useRouter} from "next/navigation";
import apiClient from "@/api/apiClient";
import {API_ENDPOINTS} from "@/constants/api";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('info');
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");
        router.push("/login");
    };

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) router.push('/login');
    }, []);

    return (
        <div className="profile-wrapper">
            <div className="profile-header-row">
                <h1 className="profile-title">👤 Hồ Sơ Của Tôi</h1>
                <button className="logout-btn" onClick={logout}>🚪 Đăng Xuất</button>
            </div>

            <p className="profile-subtitle">Quản lý thông tin cá nhân, bảo mật và đơn hàng</p>

            {/* ===== Tabs ===== */}
            <div className="profile-tabs">
                <button
                    className={activeTab === 'info' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('info')}
                >
                    Thông Tin Cá Nhân
                </button>

                <button
                    className={activeTab === 'password' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('password')}
                >
                    Đổi Mật Khẩu
                </button>

                <button
                    className={activeTab === 'orders' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('orders')}
                >
                    Lịch Sử Đơn Hàng
                </button>
            </div>

            {/* ===== Content ===== */}
            <div className="tab-content">
                {activeTab === 'info' && <PersonalInfo/>}
                {activeTab === 'password' && <ChangePassword/>}
                {activeTab === 'orders' && <OrderHistory/>}
            </div>
        </div>
    );
}

function PersonalInfo() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(API_ENDPOINTS.USERS.BASE + '/profile')
            .then(res => setProfile(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            await apiClient.put(API_ENDPOINTS.USERS.BASE + '/profile', {
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address
            });
            alert("Cập nhật thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi cập nhật.");
        }
    };

    if (loading || !profile) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="card">
            <h2 className="section-title">📌 Cập Nhật Thông Tin</h2>

            <form className="form-grid">
                <div>
                    <label>Họ và Tên</label>
                    <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input type="email" value={profile.email} disabled/>
                </div>

                <div>
                    <label>Số Điện Thoại</label>
                    <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                </div>

                <div>
                    <label>Địa Chỉ</label>
                    <input
                        type="text"
                        value={profile.address || ""}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                    />
                </div>
            </form>

            <button className="save-btn" onClick={handleSave}>Lưu Thay Đổi</button>
        </div>
    );
}

function ChangePassword() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (key: string, value: string) => {
        setForm({...form, [key]: value});
    };

    const handleSubmit = async () => {
        try {
            await apiClient.put(API_ENDPOINTS.USERS.BASE + '/change-password', form);
            alert("Đổi mật khẩu thành công!");
            setForm({currentPassword: "", newPassword: "", confirmPassword: ""});
        } catch (err: any) {
            alert(err.response?.data?.message || "Lỗi đổi mật khẩu");
        }
    };

    return (
        <div className="card">
            <h2 className="section-title">🔐 Thay Đổi Mật Khẩu</h2>

            <form className="form-grid">
                <div>
                    <label>Mật Khẩu Hiện Tại</label>
                    <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => handleChange("currentPassword", e.target.value)}
                    />
                </div>

                <div>
                    <label>Mật Khẩu Mới</label>
                    <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                    />
                </div>

                <div>
                    <label>Nhập Lại Mật Khẩu Mới</label>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                </div>
            </form>

            <button className="save-btn" onClick={handleSubmit}>Cập Nhật Mật Khẩu</button>
        </div>
    );
}

function OrderHistory() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        apiClient.get("/orders/my-orders")
            .then(res => setOrders(res.data))
            .catch(() => {
            });
    }, []);

    return (
        <div className="card">
            <h2 className="section-title">📚 Lịch Sử Đơn Hàng</h2>

            <table className="orders-table">
                <thead>
                <tr>
                    <th>Mã ĐH</th>
                    <th>Ngày Mua</th>
                    <th>Trạng Thái</th>
                    <th>Tổng Tiền</th>
                </tr>
                </thead>

                <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan={4}>Bạn chưa có đơn hàng nào.</td>
                    </tr>
                ) : (
                    orders.map((o: any) => (
                        <tr key={o.id}>
                            <td>{o.code}</td>
                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td>{o.status}</td>
                            <td>{o.total.toLocaleString("vi-VN")} ₫</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}
