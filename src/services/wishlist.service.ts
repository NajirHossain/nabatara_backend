import { wishlistRepository } from "../repository/wishlist.repository.js";

class WishlistService {
  async getWishlist(userId: string) {
    const items = await wishlistRepository.getWishlist(userId);
    const count = items.length;
    return { success: true, data: { items, count } };
  }

  async toggleWishlist(userId: string, productId: string) {
    const wishlisted = await wishlistRepository.isWishlisted(userId, productId);
    if (wishlisted) {
      await wishlistRepository.removeFromWishlist(userId, productId);
    } else {
      await wishlistRepository.addToWishlist(userId, productId);
    }
    const count = await wishlistRepository.getCount(userId);
    return { success: true, data: { wishlisted: !wishlisted, count } };
  }

  async removeFromWishlist(userId: string, productId: string) {
    await wishlistRepository.removeFromWishlist(userId, productId);
    const count = await wishlistRepository.getCount(userId);
    return { success: true, data: { count } };
  }
}

export const wishlistService = new WishlistService();
