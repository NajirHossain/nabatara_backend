import { cartRepository } from "../repository/cart.repository.js";

class CartService {
  async getCart(userId: string) {
    const items = await cartRepository.getCartItems(userId);
    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );
    return { items, subtotal: subtotal.toFixed(2), count: items.length };
  }

  async addToCart(userId: string, productId: string, quantity: number, size?: string | null) {
    await cartRepository.addOrUpdateItem(userId, productId, quantity, size);
    return this.getCart(userId);
  }

  async updateCart(userId: string, productId: string, quantity: number, size?: string | null) {
    await cartRepository.updateItemQuantity(userId, productId, quantity, size);
    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    await cartRepository.removeItem(userId, productId);
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
