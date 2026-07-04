import type { CreateProductInput, UpdateProductInput, Product } from "../interfaces/product.interface.js";
import { productRepository } from "../repository/product.repository.js";


class ProductService {
    validateCreateInput(input: CreateProductInput): string[] {
        const errors: string[] = [];
        if (!input.product_id || typeof input.product_id !== "string") errors.push("product_id is required and must be a string");
        if (!input.name || typeof input.name !== "string") errors.push("name is required and must be a string");
        if (typeof input.price !== "number" || Number.isNaN(input.price) || input.price < 0) errors.push("price is required and must be a non-negative number");
        if (input.stock_quantity !== undefined && (!Number.isInteger(input.stock_quantity) || input.stock_quantity < 0)) errors.push("stock_quantity must be a non-negative integer");
        if (input.is_active !== undefined && typeof input.is_active !== "boolean") errors.push("is_active must be a boolean");
        if (input.images !== undefined) {
            if (!Array.isArray(input.images)) {
                errors.push("images must be an array");
            } else {
                input.images.forEach((image, index) => {
                    if (!image.image_url || typeof image.image_url !== "string") errors.push(`images[${index}].image_url is required`);
                    if (image.is_primary !== undefined && typeof image.is_primary !== "boolean") errors.push(`images[${index}].is_primary must be a boolean`);
                });
            }
        }
        return errors;
    }

    validateUpdateInput(input: UpdateProductInput): string[] {
        const errors: string[] = [];
        if (input.name !== undefined && typeof input.name !== "string") errors.push("name must be a string");
        if (input.description !== undefined && typeof input.description !== "string") errors.push("description must be a string");
        if (input.category !== undefined && typeof input.category !== "string") errors.push("category must be a string");
        if (input.price !== undefined && (typeof input.price !== "number" || Number.isNaN(input.price) || input.price < 0)) errors.push("price must be a non-negative number");
        if (input.stock_quantity !== undefined && (!Number.isInteger(input.stock_quantity) || input.stock_quantity < 0)) errors.push("stock_quantity must be a non-negative integer");
        if (input.is_active !== undefined && typeof input.is_active !== "boolean") errors.push("is_active must be a boolean");
        return errors;
    }

    async createProduct(input: CreateProductInput): Promise<Product> {
        const exists = await productRepository.exists(input.product_id);
        if (exists) throw new Error("Product with this product_id already exists");
        return productRepository.create(input);
    }

    async getAllProducts(category?: string, search?: string): Promise<Product[]> {
        return productRepository.findAll(category, search);
    }

    async getProductById(productId: string): Promise<Product | null> {
        return productRepository.findById(productId);
    }

    async updateProduct(productId: string, input: UpdateProductInput): Promise<Product | null> {
        return productRepository.update(productId, input);
    }

    async deleteProduct(productId: string): Promise<Product | null> {
        return productRepository.delete(productId);
    }

    async countProducts(): Promise<number> {
        return productRepository.countAll();
    }
}

export const productService = new ProductService();
