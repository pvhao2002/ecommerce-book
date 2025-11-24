'use client';
import {CategoryDTO} from "../model/CategoryDTO";
import {ProductDTO} from "../model/ProductDTO";
import './home.css'
import {API_ENDPOINTS} from '@/constants/api';
import apiClient from '@/api/apiClient';

import {useState, useEffect} from "react";
import Link from "next/link";

export default function Page() {
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newProducts, setNewProducts] = useState<ProductDTO[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<ProductDTO[]>([]);


    // Load categories khi vừa vào trang
    const loadCategories = async () => {
        try {
            const res = await apiClient.get<CategoryDTO[]>(API_ENDPOINTS.CATEGORIES.BASE);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to load categories:", err);
        } finally {
            setLoading(false);
        }
    };
    const loadNewProducts = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.PRODUCTS.BASE + '/newest');
            setNewProducts(res.data);
        } catch (err) {
            console.error("Failed to load new products:", err);
        }
    };

    const loadTrendingProducts = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.PRODUCTS.BASE + '/trending');
            setTrendingProducts(res.data);
        } catch (err) {
            console.error("Failed to load trending products:", err);
        }
    };


    useEffect(() => {
        loadCategories();
        loadNewProducts();
        loadTrendingProducts();
    }, []);


    return (
        <div className="home-wrapper">
            {/* ====== Banner ====== */}
            <section className="home-banner">
                <div className="banner-content">
                    <h1>Khám Phá Cuốn Sách Yêu Thích Tiếp Theo Của Bạn 📚</h1>
                    <p>Hàng ngàn tựa sách chất lượng cao thuộc mọi thể loại đang chờ bạn.</p>
                    <a className="banner-btn" href="/b/books">Khám Phá Sách</a>
                </div>
            </section>

            {/* ====== Categories ====== */}
            <section className="section">
                <h2 className="section-title">📖 Thể Loại Sách</h2>

                {loading ? (
                    <p>Đang tải thể loại...</p>
                ) : (
                    <div className="category-grid">
                        {categories.length === 0 ? (
                            <p>Không có thể loại nào.</p>
                        ) : (
                            categories.map((c) => (
                                <div key={c.id} className="category-card">
                                    <span>{c.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>

            {/* ====== New Arrivals ====== */}
            <section className="section">
                <h2 className="section-title">🆕 Sách Mới Phát Hành</h2>

                <div className="product-grid">
                    {newProducts.length === 0 ? (
                        <p>Chưa có sách mới.</p>
                    ) : (
                        newProducts.map((p) => (
                            <Link
                                key={p.id}
                                href={`/b/books/${p.id}`}
                                className="product-card product-link"
                            >
                                <img
                                    src={p.images?.[0] || "/no-image.jpg"}
                                    className="product-img"
                                    alt={p.name}
                                />
                                <h3 className="product-name">{p.name}</h3>
                                <p className="product-price">
                                    {p.price.toLocaleString("vi-VN")} ₫
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </section>


            {/* ====== Best Sellers ====== */}
            <section className="section">
                <h2 className="section-title">🔥 Bán Chạy Nhất</h2>

                <div className="product-carousel">
                    {trendingProducts.length === 0 ? (
                        <p>Chưa có sách bán chạy.</p>
                    ) : (
                        trendingProducts.map((p) => (
                            <Link
                                key={p.id}
                                href={`/b/books/${p.id}`}
                                className="product-card carousel-item product-link"
                            >
                                <img
                                    src={p.images?.[0] || "/no-image.jpg"}
                                    className="product-img"
                                    alt={p.name}
                                />
                                <h3 className="product-name">{p.name}</h3>
                                <p className="product-price">
                                    {p.price.toLocaleString("vi-VN")} ₫
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* ====== Call To Action ====== */}
            <section className="cta-section">
                <h2>Tham Gia Cộng Đồng Đam Mê Sách</h2>
                <p>Nhận gợi ý sách hay, ưu đãi độc quyền và cập nhật sách mới sớm nhất.</p>
                <a href="/signup" className="cta-btn">Đăng Ký Ngay</a>
            </section>
        </div>
    );
}
