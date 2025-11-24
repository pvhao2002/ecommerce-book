'use client';
import {useState, useEffect} from 'react';
import apiClient from '@/api/apiClient';
import {API_ENDPOINTS} from '@/constants/api';
import Modal from './Modal';
import CategoryForm from './CategoryForm';
import './CategoryTable.css';

export default function CategoryTable() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [editItem, setEditItem] = useState<Category | null>(null);

    const loadCategories = async () => {
        const res = await apiClient.get(API_ENDPOINTS.CATEGORIES.BASE);
        setCategories(res.data);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this book category?')) return;
        await apiClient.delete(`${API_ENDPOINTS.CATEGORIES.ADMIN}/${id}`);
        await loadCategories();
    };

    const handleSuccess = async () => {
        setOpenModal(false);
        setEditItem(null);
        await loadCategories();
    };

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <div className="book-category-wrapper">
            {/* ===== Toolbar ===== */}
            <div className="book-toolbar">
                <div>
                    <h2>📚 Book Category Management</h2>
                    <p>Manage categories for your bookstore</p>
                </div>
                <button className="add-btn" onClick={() => setOpenModal(true)}>
                    + Add Category
                </button>
            </div>

            {/* ===== Table Section ===== */}
            <div className="book-table-container">
                <table className="book-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Books</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {categories.length ? (
                        categories.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td>{cat.name}</td>
                                <td>{cat.description || '-'}</td>
                                <td>{cat.productCount ?? 0}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setEditItem(cat);
                                            setOpenModal(true);
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        🗑 Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="no-data">
                                No categories found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* ===== Modal ===== */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditItem(null);
                }}
                title={editItem ? 'Edit Category' : 'Add Category'}
            >
                <CategoryForm
                    category={editItem}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpenModal(false)}
                />
            </Modal>
        </div>
    );
}
