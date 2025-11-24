'use client';
import {useEffect, useState} from 'react';
import apiClient from '@/api/apiClient';
import {API_ENDPOINTS} from '@/constants/api';
import './ProductEdit.css';

interface Variant {
    id?: number;
    size?: string;
    color?: string;
    colorHex?: string;
    quantity?: number;
    additionalPrice?: number;
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: Category;
    images: string[];
    variants: Variant[];
    isActive: boolean;
}

interface Props {
    productId: number;
    onCancel: () => void;
    onSaveSuccess: () => void;
}

export default function ProductEdit({productId, onCancel, onSaveSuccess}: Props) {
    const [medicine, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch medicine + categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoryRes] = await Promise.all([
                    apiClient.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${productId}`),
                    apiClient.get(API_ENDPOINTS.CATEGORIES.BASE),
                ]);
                setProduct(productRes.data);
                setCategories(categoryRes.data);
            } catch (err) {
                setError('Failed to load medicine data.');
            }
        };
        fetchData();
    }, [productId]);

    // Handle image upload (multi)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const readers = Array.from(files).map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then(newImages => {
            setProduct(prev => prev ? {...prev, images: [...prev.images, ...newImages]} : prev);
        });
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
        if (!medicine) return;
        const updated = [...medicine.variants];
        console.log(updated)
        updated[index] = {...updated[index], [field]: value};
        setProduct({...medicine, variants: updated});
    };

    const handleSave = async () => {
        if (!medicine) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name: medicine.name,
                description: medicine.description,
                price: medicine.price,
                categoryId: medicine.category.id,
                images: medicine.images,
                variants: medicine.variants,
                isActive: medicine.isActive,
            };
            await apiClient.put(`${API_ENDPOINTS.PRODUCTS.ADMIN}/${medicine.id}`, payload);
            onSaveSuccess();
        } catch (err) {
            console.error(err);
            setError('Failed to update medicine.');
        } finally {
            setLoading(false);
        }
    };

    if (!medicine) return <p>Loading medicine...</p>;

    return (
        <div className="medicine-edit-container">
            <h2>Edit Product: {medicine.name}</h2>
            {error && <div className="error">{error}</div>}

            <div className="form-section">
                <label>Product Name</label>
                <input
                    value={medicine.name}
                    onChange={(e) => setProduct({...medicine, name: e.target.value})}
                />
            </div>

            <div className="form-section">
                <label>Description</label>
                <textarea
                    value={medicine.description ?? ''}
                    onChange={(e) => setProduct({...medicine, description: e.target.value})}
                />
            </div>

            <div className="form-section">
                <label>Price (VND)</label>
                <input
                    type="number"
                    value={medicine.price}
                    onChange={(e) => setProduct({...medicine, price: parseFloat(e.target.value)})}
                />
            </div>

            <div className="form-section">
                <label>Category</label>
                <select
                    value={medicine.category.id}
                    onChange={(e) => setProduct({
                        ...medicine,
                        category: {...medicine.category, id: Number(e.target.value)},
                    })}
                >
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-section">
                <label>Images</label>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload}/>
                <div className="image-preview-row">
                    {medicine.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`image-${idx}`} className="preview-thumb"/>
                    ))}
                </div>
            </div>

            <div className="form-section variants-section">
                <label>Variants</label>
                <div className="variant-list">
                    {medicine.variants.map((v, i) => (
                        <div key={i} className="variant-card">
                            <div className="variant-header">
                                <strong>Variant #{i + 1}</strong>
                                <button
                                    type="button"
                                    className="delete-variant-btn"
                                    onClick={() => {
                                        const updated = [...medicine.variants];
                                        updated.splice(i, 1);
                                        setProduct({...medicine, variants: updated});
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="variant-fields">
                                <div className="variant-field">
                                    <label>Size</label>
                                    <input
                                        placeholder="Size (e.g. S, M, L)"
                                        value={v.size ?? ''}
                                        onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                    />
                                </div>

                                <div className="variant-field color-field">
                                    <label>Color</label>
                                    <div className="color-inputs">
                                        <input
                                            placeholder="Color name"
                                            value={v.color ?? ''}
                                            onChange={(e) => handleVariantChange(i, 'color', e.target.value)}
                                        />
                                        <input
                                            type="color"
                                            value={v.colorHex ?? '#000000'}
                                            onChange={(e) => handleVariantChange(i, 'colorHex', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="variant-field">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={v.quantity ?? 0}
                                        onChange={(e) => handleVariantChange(i, 'quantity', Number(e.target.value))}
                                    />
                                </div>

                                <div className="variant-field">
                                    <label>Additional Price (VND)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={v.additionalPrice ?? 0}
                                        onChange={(e) => handleVariantChange(i, 'additionalPrice', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="add-variant-btn"
                    onClick={() =>
                        setProduct({
                            ...medicine,
                            variants: [
                                ...medicine.variants,
                                {size: '', color: '', quantity: 0, additionalPrice: 0},
                            ],
                        })
                    }
                >
                    + Add Variant
                </button>
            </div>

            <div className="form-section">
                <label>Status</label>
                <select
                    value={medicine.isActive ? 'true' : 'false'}
                    onChange={(e) => setProduct({...medicine, isActive: e.target.value === 'true'})}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <div className="action-buttons">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
