'use client';

import {useEffect, useState} from "react";
import apiClient from "@/api/apiClient";
import {API_ENDPOINTS} from "@/constants/api";
import "./books.css";

import type {ProductDTO, CategoryDTO} from "@/types/product";

export default function BooksPage() {
    const [books, setBooks] = useState<ProductDTO[]>([]);
    const [filtered, setFiltered] = useState<ProductDTO[]>([]);

    const [categories, setCategories] = useState<CategoryDTO[]>([]);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<number | null>(null);
    const [minPrice, setMinPrice] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [sort, setSort] = useState<string>("none");

    const loadBooks = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.PRODUCTS.BASE, {
                params: {
                    page: 0,
                    size: 200,
                }
            });
            setBooks(res.data.content);
            setFiltered(res.data.content);
        } catch (err) {
            console.error("Load books error:", err);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE);
            setCategories(res.data);
        } catch (err) {
            console.error("Load categories error:", err);
        }
    };

    useEffect(() => {
        loadBooks();
        loadCategories();
    }, []);

    // ===== Filter & Sort =====
    useEffect(() => {
        let result = [...books];

        // Search
        if (search.trim()) {
            result = result.filter((b) =>
                b.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Category
        if (category) {
            result = result.filter((b) => b.category?.id === category);
        }

        // Min price
        if (minPrice !== null) {
            result = result.filter((b) => Number(b.price) >= minPrice);
        }

        // Max price
        if (maxPrice !== null) {
            result = result.filter((b) => Number(b.price) <= maxPrice);
        }

        // Sorting
        if (sort === "price-asc")
            result.sort((a, b) => Number(a.price) - Number(b.price));

        if (sort === "price-desc")
            result.sort((a, b) => Number(b.price) - Number(a.price));

        if (sort === "newest")
            result.sort((a, b) =>
                new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
            );

        if (sort === "oldest")
            result.sort((a, b) =>
                new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
            );

        setFiltered(result);
    }, [books, search, category, minPrice, maxPrice, sort]);

    return (
        <div className="book-list-wrapper">

            {/* ===== FILTER BAR ===== */}
            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select onChange={(e) => setCategory(Number(e.target.value) || null)}>
                    <option value="">Tất cả thể loại</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Giá từ"
                    onChange={(e) => setMinPrice(Number(e.target.value) || null)}
                />
                <input
                    type="number"
                    placeholder="Đến"
                    onChange={(e) => setMaxPrice(Number(e.target.value) || null)}
                />

                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="none">Sắp xếp</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>
            </div>

            {/* ===== BOOK GRID ===== */}
            <div className="books-grid">
                {filtered.length === 0 ? (
                    <p className="no-data">Không tìm thấy sách.</p>
                ) : (
                    filtered.map((b) => (
                        <div key={b.id} className="book-card">
                            <img
                                src={b.images?.[0] || "/no-image.jpg"}
                                alt={b.name}
                                className="book-img"
                            />
                            <h3>{b.name}</h3>
                            <p className="price">{Number(b.price).toLocaleString("vi-VN")} ₫</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
