import type { Request, Response } from "express";
import { cartService } from "../services/cart.service.js";

class CartController {
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await cartService.getCart(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get cart",
      });
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { product_id, quantity = 1, size } = req.body as { product_id?: string; quantity?: number; size?: string };
      if (!product_id) {
        res.status(400).json({ success: false, message: "product_id is required" });
        return;
      }
      const result = await cartService.addToCart(userId, product_id, quantity, size ?? null);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to add to cart",
      });
    }
  }

  async updateCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { product_id, quantity, size } = req.body as { product_id?: string; quantity?: number; size?: string | null };
      if (!product_id || quantity === undefined) {
        res.status(400).json({ success: false, message: "product_id and quantity are required" });
        return;
      }
      const result = await cartService.updateCart(userId, product_id, quantity, size);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update cart",
      });
    }
  }

  async deleteCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const productId = req.params["productId"] as string;
      const result = await cartService.removeFromCart(userId, productId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove from cart",
      });
    }
  }
}

export const cartcontroller = new CartController();
