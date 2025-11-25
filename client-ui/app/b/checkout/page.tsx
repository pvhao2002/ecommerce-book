'use client';

import './checkout.css';
import Image from 'next/image';
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {API_ENDPOINTS} from "@/constants/api";
import apiClient from "@/api/apiClient";
import {getCart} from "@/utils/cart";

export default function CheckoutPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [payment, setPayment] = useState<"COD" | "VNPAY">("COD");
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    useEffect(() => {
        apiClient.get(API_ENDPOINTS.USERS.BASE + '/profile')
            .then(res => {
                setProfile(res.data);
                setPhone(res.data?.phone);
                setAddress(res.data?.address);
            })
            .finally(() => {
                setLoading(false);
            });

        setItems(getCart());
    }, []);

    const handleCreateOrder = async () => {
        if (!profile) {
            alert("Bạn cần đăng nhập để đặt hàng.");
            router.push("/login?redirect=/b/checkout");
            return;
        }

        if (items.length === 0) {
            alert("Giỏ hàng trống!");
            return;
        }

        const payload = {
            phone,
            shippingAddress: address,
            paymentMethod: payment,
            items: items.map(item => ({
                productId: item.id,
                quantity: item.qty
            }))
        };

        try {
            const res = await apiClient.post(API_ENDPOINTS.ORDERS.BASE, payload);
            // ==== TRƯỜNG HỢP COD ====
            if (payment === "COD") {
                localStorage.removeItem("bookstore_cart");
                router.push(`/b/order-success/${res.data.id}`);
                return;
            }

            // ==== TRƯỜNG HỢP VNPAY ====
            if (payment === "VNPAY") {
                const paymentRes = await apiClient.post("/payment/process", {
                    orderId: res.data.id,
                    amount: res.data.total,
                    paymentMethod: "VNPAY"
                });

                const data = paymentRes.data.data || paymentRes.data;

                if (!data.paymentUrl) {
                    // Payment không tạo được → chuyển trang báo lỗi
                    router.push("/b/order-failed");
                    return;
                }
                // 🔥 Redirect người dùng sang trang thanh toán VNPay
                window.location.href = data.paymentUrl;
                return;
            }
        } catch (e: any) {
            router.push(`/b/order-failed`);
        }
    };


    if (loading || !profile) return <p>Đang tải dữ liệu...</p>;


    return (
        <div className="checkout-wrapper">

            <h1 className="checkout-title">Thanh Toán Đơn Hàng</h1>

            <div className="checkout-container">

                {/* ================= LEFT: SHIPPING ================= */}
                <div className="checkout-left">

                    {/* Thông tin giao hàng */}
                    <section className="checkout-section">
                        <h2>📦 Thông Tin Giao Hàng</h2>

                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input type="text" name="fullName" placeholder="Nguyễn Văn A" value={profile.fullName}
                                   readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại *</label>
                            <input type="text" placeholder="0123 456 789" name="phone" value={phone}
                                   onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="email@example.com" name="email" value={profile.email}
                                   readOnly/>
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ *</label>
                            <input type="text" placeholder="Số nhà, đường..." name="address" value={address}
                                   onChange={e => setAddress(e.target.value)}/>
                        </div>
                    </section>


                    {/* Thanh toán */}
                    <section className="checkout-section">
                        <h2>💳 Phương Thức Thanh Toán</h2>

                        <label className="payment-option">
                            <input
                                type="radio"
                                name="payment"
                                value="COD"
                                checked={payment === "COD"}
                                onChange={() => setPayment("COD")}
                            />
                            <span>Thanh toán khi nhận hàng (COD)</span>
                        </label>

                        <label className="payment-option">
                            <input
                                type="radio"
                                name="payment"
                                value="VNPAY"
                                checked={payment === "VNPAY"}
                                onChange={() => setPayment("VNPAY")}
                            />
                            <span>Ví điện tử / Chuyển khoản VNPAY</span>
                        </label>
                    </section>

                </div>


                {/* ================= RIGHT: ORDER SUMMARY ================= */}
                <div className="checkout-right">
                    <section className="checkout-summary">
                        <h2>🧾 Tóm Tắt Đơn Hàng</h2>

                        <div className="summary-items">
                            {items.map(item => (
                                <div key={item.id} className="summary-item">
                                    <img src={item.image} alt="" className={"summary-img"} width={60} height={80}/>

                                    <div>
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-qty">Số lượng: {item.qty}</p>
                                    </div>
                                    <p className="item-price">
                                        {(item.price * item.qty).toLocaleString()} ₫
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="summary-line">
                            <span>Tạm tính</span>
                            <span>{subtotal.toLocaleString()} ₫</span>
                        </div>

                        <div className="summary-line">
                            <span>Phí vận chuyển</span>
                            <span>{shipping.toLocaleString()} ₫</span>
                        </div>

                        <div className="summary-total">
                            <span>Tổng cộng</span>
                            <span>{total.toLocaleString()} ₫</span>
                        </div>

                        <button className="checkout-btn" onClick={handleCreateOrder}>
                            Xác Nhận Đặt Hàng
                        </button>

                    </section>
                </div>

            </div>
        </div>
    );
}
