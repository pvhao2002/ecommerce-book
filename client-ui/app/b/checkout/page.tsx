'use client';

import './checkout.css';
import Image from 'next/image';
import {useRouter} from "next/navigation";

export default function CheckoutPage() {
    const router = useRouter();

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
                            <input type="text" placeholder="Nguyễn Văn A"/>
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại *</label>
                            <input type="text" placeholder="0123 456 789"/>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="email@example.com"/>
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ *</label>
                            <input type="text" placeholder="Số nhà, đường..."/>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tỉnh / Thành phố *</label>
                                <input type="text" placeholder="TP. Hồ Chí Minh"/>
                            </div>
                            <div className="form-group">
                                <label>Quận / Huyện *</label>
                                <input type="text" placeholder="Quận 1"/>
                            </div>
                        </div>
                    </section>


                    {/* Thanh toán */}
                    <section className="checkout-section">
                        <h2>💳 Phương Thức Thanh Toán</h2>

                        <label className="payment-option">
                            <input type="radio" name="payment" defaultChecked/>
                            <span>Thanh toán khi nhận hàng (COD)</span>
                        </label>

                        <label className="payment-option">
                            <input type="radio" name="payment"/>
                            <span>Chuyển khoản ngân hàng</span>
                        </label>

                        <label className="payment-option">
                            <input type="radio" name="payment"/>
                            <span>Ví điện tử Momo / ZaloPay</span>
                        </label>
                    </section>

                </div>


                {/* ================= RIGHT: ORDER SUMMARY ================= */}
                <div className="checkout-right">
                    <section className="checkout-summary">
                        <h2>🧾 Tóm Tắt Đơn Hàng</h2>

                        <div className="summary-items">

                            {[1, 2].map((i) => (
                                <div key={i} className="summary-item">
                                    <Image
                                        src="/assets/book_thumb.svg"
                                        width={60}
                                        height={80}
                                        alt="book"
                                        className="summary-img"
                                    />
                                    <div>
                                        <p className="item-name">Tên Sách {i}</p>
                                        <p className="item-qty">Số lượng: 1</p>
                                    </div>
                                    <p className="item-price">120.000 ₫</p>
                                </div>
                            ))}

                        </div>

                        <div className="summary-line">
                            <span>Tạm tính</span>
                            <span>240.000 ₫</span>
                        </div>

                        <div className="summary-line">
                            <span>Phí vận chuyển</span>
                            <span>20.000 ₫</span>
                        </div>

                        <div className="summary-total">
                            <span>Tổng cộng</span>
                            <span>260.000 ₫</span>
                        </div>

                        <button className="checkout-btn">Xác Nhận Đặt Hàng
                        </button>
                    </section>
                </div>

            </div>
        </div>
    );
}
