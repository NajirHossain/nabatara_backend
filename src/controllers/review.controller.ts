import type { Request, Response } from "express";
import { reviewService } from "../services/review.service.js";

class ReviewController {
  getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = req.params.productId as string;
      const result = await reviewService.getReviews(productId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to get reviews" });
    }
  };

  upsertReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const productId = req.params.productId as string;
      const result = await reviewService.upsertReview(userId, productId, req.body as { rating?: number; title?: string; body?: string });
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to save review" });
    }
  };

  deleteReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const productId = req.params.productId as string;
      const result = await reviewService.deleteReview(userId, productId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to delete review" });
    }
  };
}

export const reviewController = new ReviewController();
