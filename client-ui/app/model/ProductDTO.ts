export interface ProductDTO {
    id: number;
    name: string;
    description?: string;
    manufacturer?: string;
    price: number;
    images: string[];
    category?: CategoryDTO;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    stock?: number;
}
