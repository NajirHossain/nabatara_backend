import { reviewRepository } from "../repository/review.repository.js";

class ReviewService {
  async getReviews(productId: string) {
    const [reviews, { average, count }] = await Promise.all([
      reviewRepository.getReviewsByProduct(productId),
      reviewRepository.getAverageRating(productId),
    ]);
    return {
      success: true,
      data: { reviews, averageRating: average, count },
    };
  }

  async upsertReview(
    userId: string,
    productId: string,
    body: { rating?: number; title?: string; body?: string },
  ) {
    const { rating, title, body: reviewBody } = body;
    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    const review = await reviewRepository.upsertReview(
      userId,
      productId,
      rating,
      title?.trim() || null,
      reviewBody?.trim() || null,
    );
    return { success: true, data: review };
  }

  async deleteReview(userId: string, productId: string) {
    await reviewRepository.deleteReview(userId, productId);
    return { success: true };
  }
}

export const reviewService = new ReviewService();
