'use client';
import './cart.css';
import {useEffect, useState} from 'react';
import Image from 'next/image';
import {useRouter} from "next/navigation";
import {getCart, saveCart} from "@/utils/cart";
import apiClient from "@/api/apiClient";
import {API_ENDPOINTS} from "@/constants/api";
import Link from "next/link";

export default function CartPage() {
    const router = useRouter();
    const [items, setItems] = useState<any[]>([]);
    const [related, setRelated] = useState<any[]>([]);
    useEffect(() => {
        const load = async () => {
            try {
                const relatedRes = await apiClient.get(
                    `${API_ENDPOINTS.PRODUCTS.BASE}/flash-sale`
                );
                setRelated(relatedRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        load();
        const cart = getCart();
        setItems(cart);
    }, []);

    const updateQty = (id: number, delta: number) => {
        setItems(prev => {
            const updated = prev.map(item =>
                item.id === id ? {...item, qty: Math.max(1, item.qty + delta)} : item
            );
            saveCart(updated);
            return updated;
        });
    };


    const removeItem = (id: number) => {
        setItems(prev => {
            const updated = prev.filter(i => i.id !== id);
            saveCart(updated);
            return updated;
        });
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

                        <button className="checkout-btn" onClick={() => {
                            const token = localStorage.getItem('auth_token');
                            if (!token) router.push('/login');
                            router.push('/b/checkout');
                        }}>Tiến hành thanh
                            toán
                        </button>
                    </div>

                </div>
            )}

            {/* ===== Recommended Books ===== */}
            <section className="section">
                <h2 className="section-title">📚 Có Thể Bạn Sẽ Thích</h2>
                {related.length === 0 ? (
                    <p>Không có sách liên quan.</p>
                ) : (
                    <div className="recommend-grid">
                        {related.map((b) => (
                            <Link href={`/b/books/${b.id}`} key={b.id} className="related-card">
                                <img src={b.images?.[0] || "/no-image.jpg"}/>
                                <h3>{b.name}</h3>
                                <p>{b.price.toLocaleString("vi-VN")} ₫</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
