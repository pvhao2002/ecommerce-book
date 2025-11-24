'use client';
import {ChangeEvent, useCallback, useEffect, useState} from 'react';
import apiClient from '@/api/apiClient';
import {API_ENDPOINTS} from '@/constants/api';
import Modal from './Modal';
import ProductForm, {ProductResponseCreate} from './ProductForm';
import ImageModal from './ImageModal';
import './BookProductTable.css';

interface Product {
    id: number;
    name: string;
    description?: string;
    manufacturer?: string;
    price: number;
    images?: string[];
    category?: { id: number; name: string };
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    stock?: number;
}

export default function ProductTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [editItem, setEditItem] = useState<Product | null>(null);
    const [showImages, setShowImages] = useState<string[] | null>(null);
    const [propProduct, setPropProduct] = useState<ProductResponseCreate | null>(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadProducts = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            const res = await apiClient.get<PagedResponse<ProductResponse>>(API_ENDPOINTS.PRODUCTS.BASE, {
                params: {page: pageNum, size},
            });

            const data = res.data;
            setProducts(data.content ?? []);
            setFiltered(data.content ?? []);
            setPage(data.page ?? 0);
            setTotalPages(data.totalPages ?? 1);

        } catch (err) {
            console.error('Error loading books:', err);
        } finally {
            setLoading(false);
        }
    }, [size]);

    useEffect(() => {
        loadProducts(page);
    }, [page, loadProducts]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        setSearch(keyword);
        setFiltered(
            products.filter(p =>
                p.name.toLowerCase().includes(keyword) ||
                p.category?.name?.toLowerCase().includes(keyword)
            )
        );
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this book?')) return;
        await apiClient.delete(`${API_ENDPOINTS.PRODUCTS.ADMIN}/${id}`);
        await loadProducts(page);
    };

    const handleSuccess = async () => {
        setOpenModal(false);
        setEditItem(null);
        await loadProducts(page);
    };

    return (
        <div className="book-product-wrapper">
            {/* ===== Toolbar ===== */}
            <div className="book-toolbar">
                <div className="book-toolbar-left">
                    <h2>📘 Book Management</h2>

                    <input
                        type="text"
                        placeholder="Search book or category..."
                        value={search}
                        onChange={handleSearch}
                    />
                </div>

                <button
                    className="add-btn"
                    onClick={() => {
                        setEditItem(null);
                        setOpenModal(true);
                    }}
                >
                    + Add Book
                </button>
            </div>

            {/* ===== Table ===== */}
            {loading ? (
                <div className="loading">Loading books...</div>
            ) : (
                <>
                    <div className="book-table-container">
                        <table className="book-table">
                            <thead>
                            <tr>
                                <th>Cover</th>
                                <th>Book Title</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="no-data text-center">
                                        No books found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            {p.images?.length ? (
                                                <img
                                                    src={p.images[0]}
                                                    alt={p.name}
                                                    className="thumb"
                                                    onClick={() => setShowImages(p.images!)}
                                                />
                                            ) : (
                                                <span className="no-img">No cover</span>
                                            )}
                                        </td>

                                        <td>{p.name}</td>
                                        <td>{p.category?.name ?? '-'}</td>
                                        <td>{p.price.toLocaleString('vi-VN')} ₫</td>
                                        <td>{p.stock ?? 0}</td>

                                        <td>
                                            <span className={p.isActive ? 'status-active' : 'status-inactive'}>
                                                {p.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="edit-btn"
                                                onClick={() => {
                                                    setEditItem(p);
                                                    setOpenModal(true);

                                                    const productResponseCreate: ProductResponseCreate = {
                                                        categoryId: p.category?.id ?? 0,
                                                        category: {
                                                            cid: p.category?.id ?? 0,
                                                            name: p.category?.name ?? ''
                                                        },
                                                        createdAt: p.createdAt,
                                                        description: p.description,
                                                        id: p.id,
                                                        images: p?.images ?? [],
                                                        isActive: p.isActive,
                                                        name: p.name,
                                                        price: p.price,
                                                        stock: p?.stock ?? 0,
                                                        updatedAt: p.updatedAt
                                                    };

                                                    setPropProduct(productResponseCreate);
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* ===== Pagination ===== */}
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={page <= 0}
                            onClick={() => setPage(page - 1)}
                        >
                            ← Prev
                        </button>

                        <span className="page-info">
                            Page {page + 1} / {totalPages}
                        </span>

                        <button
                            className="page-btn"
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}

            {/* ===== Modals ===== */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditItem(null);
                }}
                title={editItem ? 'Edit Book' : 'Add Book'}
            >
                <ProductForm
                    product={editItem ? propProduct : null}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpenModal(false)}
                />
            </Modal>

            {showImages && (
                <ImageModal open images={showImages} onClose={() => setShowImages(null)}/>
            )}
        </div>
    );
}
