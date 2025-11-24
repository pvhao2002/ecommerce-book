'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import './ProductForm.css';

interface Category {
    id: number;
    name: string;
}

interface CreateProductRequest {
    name: string;
    description?: string;
    stock: number;
    price: number;
    categoryId: number;
    images: string[];
    category?: { cid: number; name: string };
}

interface Props {
    product?: ProductResponseCreate | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export interface ProductResponseCreate extends CreateProductRequest {
    id: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function ProductForm({ product, onSuccess, onCancel }: Props) {
    const [form, setForm] = useState<CreateProductRequest>({
        name: product?.name || '',
        description: product?.description || '',
        stock: product?.stock || 0,
        price: product?.price || 0,
        categoryId: product?.categoryId || 0,
        images: product?.images || [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        apiClient.get(API_ENDPOINTS.CATEGORIES.BASE)
            .then((res) => setCategories(res.data))
            .catch((err) => console.error('Load categories failed:', err));
    }, []);

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                description: product.description || '',
                stock: product.stock || 0,
                price: product.price || 0,
                categoryId: product.categoryId || 0,
                images: product.images || [],
            });
        }
    }, [product]);


    const handleChange = (key: keyof CreateProductRequest, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // Upload image → Convert to base64
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const readers = Array.from(files).map((file) =>
            new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            })
        );

        Promise.all(readers).then((base64List) => {
            setForm((prev) => ({ ...prev, images: [...prev.images, ...base64List] }));
        });
    };

    const handleRemoveImage = (index: number) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.name || form.name.length < 2) newErrors.name = 'Title must be at least 2 characters';
        if (form.price <= 0) newErrors.price = 'Price must be greater than 0';
        if (!form.categoryId) newErrors.categoryId = 'Please select a category';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (product?.id) {
                await apiClient.put(`${API_ENDPOINTS.PRODUCTS.ADMIN}/${product.id}`, JSON.parse(JSON.stringify(form)));
            } else {
                await apiClient.post(API_ENDPOINTS.PRODUCTS.ADMIN, {...form});
            }
            onSuccess();
        } catch (err) {
            console.error('Error saving book:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="book-product-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                <div>
                    <label>Book Title *</label>
                    <input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., The Great Gatsby"
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div>
                    <label>Category *</label>
                    <select
                        value={form.categoryId || ''}
                        onChange={(e) => handleChange('categoryId', Number(e.target.value))}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
                </div>

                <div>
                    <label>Price (VND) *</label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={(e) => handleChange('price', Number(e.target.value))}
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                </div>

                <div>
                    <label>Stock</label>
                    <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => handleChange('stock', Number(e.target.value))}
                    />
                </div>
            </div>

            <div>
                <label>Description</label>
                <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Short summary about the book..."
                />
            </div>

            <div>
                <label>Book Cover (Images)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <div className="image-grid">
                    {form.images.map((img, i) => (
                        <div key={i} className="image-preview-wrapper">
                            <img src={img} alt={`preview-${i}`} className="preview-img" />
                            <button type="button" className="remove-img" onClick={() => handleRemoveImage(i)}>
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : product ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
