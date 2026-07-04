import type { Request, Response } from "express";
import type { CreateProductInput, UpdateProductInput } from "../interfaces/product.interface.js";
import { productService } from "../services/products.service.js";


class ProductController {
    async createProduct(req: Request<{}, {}, CreateProductInput>, res: Response): Promise<Response> {
        try {
            const errors = productService.validateCreateInput(req.body);
            if (errors.length > 0) return res.status(400).json({ success: false, message: "Validation failed", errors });
            const product = await productService.createProduct(req.body);
            return res.status(201).json({ success: true, message: "Product created successfully", data: product });
        } catch (error) {
            if (error instanceof Error && error.message.includes("already exists")) {
                return res.status(409).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: "Failed to create product", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<Response> {
        try {
            const category = typeof req.query.category === "string" ? req.query.category : undefined;
            const search = typeof req.query.search === "string" ? req.query.search : undefined;
            const products = await productService.getAllProducts(category, search);
            return res.status(200).json({ success: true, message: "Products fetched successfully", count: products.length, data: products });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to fetch products", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async getProductById(req: Request<{ product_id: string }>, res: Response): Promise<Response> {
        try {
            const product = await productService.getProductById(req.params.product_id);
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            return res.status(200).json({ success: true, message: "Product fetched successfully", data: product });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to fetch product", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async updateProduct(req: Request<{ product_id: string }, {}, UpdateProductInput>, res: Response): Promise<Response> {
        try {
            const errors = productService.validateUpdateInput(req.body);
            if (errors.length > 0) return res.status(400).json({ success: false, message: "Validation failed", errors });
            const product = await productService.updateProduct(req.params.product_id, req.body);
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            return res.status(200).json({ success: true, message: "Product updated successfully", data: product });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to update product", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async deleteProduct(req: Request<{ product_id: string }>, res: Response): Promise<Response> {
        try {
            const product = await productService.deleteProduct(req.params.product_id);
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            return res.status(200).json({ success: true, message: "Product deleted successfully", data: product });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Failed to delete product", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
}

export const productController = new ProductController();
