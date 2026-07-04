export interface ProductImage {
    image_id: string;
    product_id: string;
    image_url: string;
    is_primary: boolean;
    created_at: Date;
}

export interface Product {
    product_id: string;
    name: string;
    description: string | null;
    category: string | null;
    price: string;
    stock_quantity: number;
    is_active: boolean;
    sizes: string[] | null;
    // SEO fields
    meta_title: string | null;
    meta_description: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    keywords: string | null;
    created_at: Date;
    updated_at: Date;
    images?: ProductImage[];
}

export interface CreateProductImageInput {
    image_url: string;
    is_primary?: boolean;
}

export interface CreateProductInput {
    product_id: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    stock_quantity?: number;
    is_active?: boolean;
    sizes?: string[] | null;
    meta_title?: string | null;
    meta_description?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    keywords?: string | null;
    images?: CreateProductImageInput[];
}

export interface UpdateProductImageInput {
    image_id?: string;
    image_url: string;
    is_primary?: boolean;
}

export interface UpdateProductInput {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    stock_quantity?: number;
    is_active?: boolean;
    sizes?: string[] | null;
    meta_title?: string | null;
    meta_description?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    keywords?: string | null;
    images?: UpdateProductImageInput[];
}
