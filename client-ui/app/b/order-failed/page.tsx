'use client';

import '../order-success/[id]/result.css';
import Link from 'next/link';

export default function OrderFailedPage() {

    return (
        <div className="result-wrapper">
            <div className="result-card failed">

                <img src="/assets/failed_payment.svg" alt="failed" className="result-icon"/>

                <h1>Thanh Toán Thất Bại!</h1>
                <p className="result-text">
                    Rất tiếc, đã có lỗi xảy ra trong quá trình đặt hàng.
                    Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>

                <div className="result-actions">
                    <Link href="/b/checkout" className="btn-primary">Thử lại</Link>
                    <Link href="/b/books" className="btn-secondary">Quay lại trang chủ</Link>
                </div>
            </div>
        </div>
    );
}
