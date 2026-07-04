import type { Request, Response } from "express";
import { wishlistService } from "../services/wishlist.service.js";

class WishlistController {
  getWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await wishlistService.getWishlist(userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to get wishlist" });
    }
  };

  toggleWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const productId = req.params.productId as string;
      const result = await wishlistService.toggleWishlist(userId, productId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to update wishlist" });
    }
  };

  removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const productId = req.params.productId as string;
      const result = await wishlistService.removeFromWishlist(userId, productId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to remove from wishlist" });
    }
  };
}

export const wishlistController = new WishlistController();
