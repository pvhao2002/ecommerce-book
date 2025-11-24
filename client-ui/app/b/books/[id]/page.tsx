'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/api/apiClient";
import { API_ENDPOINTS } from "@/constants/api";
import Image from "next/image";
import Link from "next/link";
import "./product-detail.css";

export default function ProductDetailPage() {
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [selectedImg, setSelectedImg] = useState("");
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
                setProduct(res.data);
                setSelectedImg(res.data.images?.[0] || "");

                const relatedRes = await apiClient.get(
                    `${API_ENDPOINTS.PRODUCTS.BASE}/newest`
                );
                setRelated(relatedRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading || !product) {
        return <div className="loading">Đang tải thông tin sách...</div>;
    }

    // --------- CART quantity handler ----------
    const increase = () => setQty(qty + 1);
    const decrease = () => setQty(qty > 1 ? qty - 1 : 1);

    return (
        <div className="product-detail-wrapper">

            {/* ======= IMAGE GALLERY ======= */}
            <div className="product-gallery">
                <div className="main-image">
                    <Image
                        src={selectedImg}
                        alt={product.name}
                        width={400}
                        height={500}
                    />
                </div>

                <div className="thumbnail-list">
                    {product.images?.map((img: string, i: number) => (
                        <div
                            key={i}
                            className={`thumb ${selectedImg === img ? "active" : ""}`}
                            onClick={() => setSelectedImg(img)}
                        >
                            <Image src={img} alt={`thumb-${i}`} width={70} height={90} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ======= INFO AREA ======= */}
            <div className="product-info">
                <h1>{product.name}</h1>
                <p className="category">Thể loại: {product.category?.name}</p>

                <div className="price">
                    {product.price.toLocaleString("vi-VN")} ₫
                </div>

                <p className="description">{product.description}</p>

                {/* QUANTITY SELECTOR */}
                <div className="qty-selector">
                    <button onClick={decrease}>−</button>
                    <span>{qty}</span>
                    <button onClick={increase}>+</button>
                </div>

                <button className="add-cart-btn">
                    🛒 Thêm {qty} vào giỏ hàng
                </button>

                <div className="extra-info">
                    <p><strong>Nhà xuất bản:</strong> {product.manufacturer || "Đang cập nhật"}</p>
                    <p><strong>Tình trạng:</strong> {product.isActive ? "Còn hàng" : "Hết hàng"}</p>
                </div>
            </div>

            {/* ======= RELATED PRODUCTS ======= */}
            <div className="related-section">
                <h2>📚 Sách Cùng Thể Loại</h2>

                {related.length === 0 ? (
                    <p>Không có sách liên quan.</p>
                ) : (
                    <div className="related-grid">
                        {related.map((b) => (
                            <Link href={`/b/books/${b.id}`} key={b.id} className="related-card">
                                <img src={b.images?.[0] || "/no-image.jpg"} />
                                <h3>{b.name}</h3>
                                <p>{b.price.toLocaleString("vi-VN")} ₫</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
