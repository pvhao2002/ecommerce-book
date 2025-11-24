'use client';

import { useState, FormEvent } from 'react';
import './CategoryForm.css';
import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/api';

interface Category {
    id?: number;
    name: string;
    description?: string;
}

interface CategoryFormProps {
    category?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (category?.id) {
                await apiClient.put(`${API_ENDPOINTS.CATEGORIES.ADMIN}/${category.id}`, { name, description });
            } else {
                await apiClient.post(API_ENDPOINTS.CATEGORIES.ADMIN, { name, description });
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving category:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="book-form" onSubmit={handleSubmit}>
            <h3 className="form-title">
                {category ? '✏️ Update Book Category' : '📚 Create New Book Category'}
            </h3>

            <div className="form-group">
                <label>Category Name</label>
                <input
                    type="text"
                    placeholder="Enter book category (e.g., Fiction, Romance...)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    placeholder="Brief description about this book category"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : category ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
