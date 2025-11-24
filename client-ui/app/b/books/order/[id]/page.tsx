'use client';

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import apiClient from "@/api/apiClient";
import Image from "next/image";
import "./order-detail.css";

export default function OrderDetailPage() {
    const {id} = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const res = await apiClient.get(`/orders/${id}`);
                setOrder(res.data);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id]);


    if (loading) return <div className="loading">Đang tải đơn hàng...</div>;
    if (!order) return <div className="error">Không tìm thấy đơn hàng.</div>;

    return (
        <div className="order-detail-wrapper">

            <h1 className="order-title">📦 Chi Tiết Đơn Hàng #{order.code}</h1>

            <div className="grid-container">
                {/* ====== LEFT SIDE ====== */}
                <div className="left">

                    {/* === ORDER STATUS === */}
                    <div className="card">
                        <h2 className="section-title">📝 Trạng Thái Đơn Hàng</h2>

                        <p>
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                            </span>
                        </p>

                        <p>Ngày đặt: <strong>{new Date(order.createdAt).toLocaleString()}</strong></p>
                        {order.completedAt && (
                            <p>Hoàn thành: <strong>{new Date(order.completedAt).toLocaleString()}</strong></p>
                        )}
                    </div>

                    {/* === SHIPPING INFO === */}
                    <div className="card">
                        <h2 className="section-title">📍 Thông Tin Giao Hàng</h2>

                        <p><strong>Người nhận:</strong> {order.customerName}</p>
                        <p><strong>Số điện thoại:</strong> {order.phone}</p>
                        <p><strong>Địa chỉ:</strong> {order.address}</p>
                    </div>

                </div>

                {/* ====== RIGHT SIDE ====== */}
                <div className="right">
                    <div className="card">
                        <h2 className="section-title">📚 Sản Phẩm</h2>

                        {order.items.map((item: any) => (
                            <div key={item.id} className="item-row">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={70}
                                    height={90}
                                    className="item-img"
                                />

                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <p className="price">
                                        {item.price.toLocaleString("vi-VN")} ₫
                                    </p>
                                    <p>Số lượng: {item.quantity}</p>
                                </div>

                                <div className="item-total">
                                    {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                                </div>
                            </div>
                        ))}

                        {/* === SUMMARY === */}
                        <div className="summary">
                            <p>Tạm tính: <span>{order.subTotal.toLocaleString("vi-VN")} ₫</span></p>
                            <p>Phí vận chuyển: <span>{order.shippingFee.toLocaleString("vi-VN")} ₫</span></p>
                            <h3>Tổng cộng: <span className="total">{order.total.toLocaleString("vi-VN")} ₫</span></h3>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
