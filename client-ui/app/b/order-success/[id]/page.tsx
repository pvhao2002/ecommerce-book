'use client';

import './result.css';
import Link from 'next/link';
import { useParams } from "next/navigation";

export default function OrderSuccessPage() {
    const { id } = useParams();

    return (
        <div className="result-wrapper">

            <div className="result-card success">
                <img src="/assets/success_order.svg" alt="success" className="result-icon" />

                <h1>Đặt Hàng Thành Công!</h1>
                <p className="result-text">
                    Cảm ơn bạn đã mua sắm tại cửa hàng 👋
                    Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.
                </p>

                <p className="result-order-code">
                    Mã đơn hàng: <span>#{id}</span>
                </p>

                <div className="result-actions">
                    <Link href="/b/profile" className="btn-primary">Xem lịch sử đơn hàng</Link>
                    <Link href="/b/books" className="btn-secondary">Tiếp tục mua sắm</Link>
                </div>
            </div>

        </div>
    );
}
