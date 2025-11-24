'use client';
import './cart.css';
import {useState} from 'react';
import Image from 'next/image';
import {useRouter} from "next/navigation";

export default function CartPage() {
    const router = useRouter();
    const [items, setItems] = useState([
        {
            id: 1,
            name: "Đắc Nhân Tâm",
            price: 89000,
            qty: 1,
            image: "/assets/book1.jpg",
        },
        {
            id: 2,
            name: "7 Thói Quen Hiệu Quả",
            price: 120000,
            qty: 2,
            image: "/assets/book2.jpg",
        },
    ]);

    const updateQty = (id: number, delta: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? {...item, qty: Math.max(1, item.qty + delta)} : item
            )
        );
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    return (
        <div className="cart-wrapper">

            <h1 className="cart-title">🛒 Giỏ Hàng Của Bạn</h1>

            {items.length === 0 ? (
                <div className="cart-empty">
                    <Image
                        src="/assets/empty_cart.svg"
                        alt="empty"
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{width: "100%", height: "300px"}}
                    />
                    <p>Giỏ hàng của bạn đang trống</p>
                    <a href="/b/books" className="btn-browse">Tiếp tục mua sắm</a>
                </div>
            ) : (
                <div className="cart-container">

                    {/* ===== Product List ===== */}
                    <div className="cart-items">
                        {items.map(item => (
                            <div key={item.id} className="cart-item">

                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={80}
                                    height={110}
                                    className="cart-img"
                                />

                                <div className="cart-info">
                                    <h3>{item.name}</h3>
                                    <p className="price">{item.price.toLocaleString()} ₫</p>

                                    <div className="qty-control">
                                        <button onClick={() => updateQty(item.id, -1)}>-</button>
                                        <span>{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                                    </div>
                                </div>

                                <button className="remove-btn" onClick={() => removeItem(item.id)}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ===== Summary ===== */}
                    <div className="cart-summary">
                        <h2>Tổng kết</h2>

                        <div className="summary-row">
                            <span>Tạm tính</span>
                            <span>{total.toLocaleString()} ₫</span>
                        </div>

                        <div className="summary-row">
                            <span>Phí vận chuyển</span>
                            <span>Miễn phí</span>
                        </div>

                        <hr/>

                        <div className="summary-total">
                            <span>Tổng tiền</span>
                            <span>{total.toLocaleString()} ₫</span>
                        </div>

                        <button className="checkout-btn" onClick={() => router.push('/b/checkout')}>Tiến hành thanh
                            toán
                        </button>
                    </div>

                </div>
            )}

            {/* ===== Recommended Books ===== */}
            <section className="section">
                <h2 className="section-title">📚 Có Thể Bạn Sẽ Thích</h2>

                <div className="recommend-grid">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="recommend-card">
                            <div className="recommend-img skeleton"></div>
                            <h3>Sách hay #{i + 1}</h3>
                            <p className="recommend-price">95.000 ₫</p>
                            <button className="add-small-btn">Thêm vào giỏ</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
