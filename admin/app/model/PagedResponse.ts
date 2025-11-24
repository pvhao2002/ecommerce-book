interface ProductResponse {
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

interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}
