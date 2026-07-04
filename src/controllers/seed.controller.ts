import type { Request, Response } from "express";
import pool from "../config/dbconnect.js";
import { productService } from "../services/products.service.js";

const SEED_PRODUCTS = [
  {
    product_id: "rudraksha-001",
    name: "Five Mukhi Rudraksha Mala",
    description: "Traditional 108-bead Panchamukhi Rudraksha mala, energized and blessed. Promotes clarity, health, and spiritual progress. Each bead is carefully selected for quality and authenticity.",
    category: "Rudraksha",
    price: 1299,
    stock_quantity: 45,
    images: [
      { image_url: "https://images.unsplash.com/photo-1527999230720-768828d2d0a3?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "rudraksha-002",
    name: "Panchamukhi Rudraksha Bracelet",
    description: "Elegant Rudraksha bracelet with five-faced beads. Ideal for daily wear, brings positive energy and protection. Strung on durable elastic cord.",
    category: "Rudraksha",
    price: 599,
    stock_quantity: 80,
    images: [
      { image_url: "https://images.unsplash.com/photo-1763046198959-5a8da3d52987?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "rudraksha-003",
    name: "Eleven Mukhi Rudraksha",
    description: "Rare eleven-faced Rudraksha bead representing Lord Hanuman. Believed to bestow strength, wisdom, and protection. Comes with authenticity certificate.",
    category: "Rudraksha",
    price: 3499,
    stock_quantity: 12,
    images: [
      { image_url: "https://images.unsplash.com/photo-1614350292382-c448d0110dfa?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "health-001",
    name: "Ashwagandha Gold Capsules",
    description: "Premium KSM-66 Ashwagandha root extract. Supports stress relief, energy, and cognitive function. 60 vegetarian capsules, 300mg each.",
    category: "Health & Immunity",
    price: 849,
    stock_quantity: 120,
    images: [
      { image_url: "https://images.unsplash.com/photo-1627394376504-24507bf9f7eb?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "health-002",
    name: "Triphala Churna",
    description: "Classic Ayurvedic blend of Amalaki, Bibhitaki, and Haritaki. Supports digestion, detoxification, and overall vitality. 200g of pure herbal powder.",
    category: "Health & Immunity",
    price: 299,
    stock_quantity: 200,
    images: [
      { image_url: "https://images.unsplash.com/photo-1610643625267-aee6dae3ca22?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "health-003",
    name: "Jeeva Legium Chyawanprash",
    description: "Traditional Chyawanprash fortified with rare Himalayan herbs. Boosts immunity, enhances lung capacity, and revitalizes the body. 500g jar.",
    category: "Health & Immunity",
    price: 649,
    stock_quantity: 75,
    images: [
      { image_url: "https://images.unsplash.com/photo-1699380551375-733084e3a437?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "food-001",
    name: "Wild Forest Honey – 500g",
    description: "Pure, unprocessed honey sourced from wild forest beehives. Rich in antioxidants and enzymes. No additives or preservatives. Raw and natural.",
    category: "Natural Foods",
    price: 799,
    stock_quantity: 60,
    images: [
      { image_url: "https://images.unsplash.com/photo-1692797178143-659c48c34135?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "food-002",
    name: "Organic Turmeric Powder – 200g",
    description: "High-curcumin turmeric grown without pesticides. Deep golden colour and intense flavour. Ideal for cooking and golden milk. Lab-tested for purity.",
    category: "Natural Foods",
    price: 249,
    stock_quantity: 150,
    images: [
      { image_url: "https://images.unsplash.com/photo-1576038374613-3a1f1f1f2e36?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "food-003",
    name: "Cold-Pressed Coconut Oil – 500ml",
    description: "Wood-pressed virgin coconut oil, cold-processed to retain all nutrients. Perfect for cooking, hair, and skin care. Zero trans fats.",
    category: "Natural Foods",
    price: 549,
    stock_quantity: 90,
    images: [
      { image_url: "https://images.unsplash.com/photo-1578929048068-fb3a30a2e1fd?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "clothing-001",
    name: "Adiyogi Graphic Hoodie",
    description: "Soft-touch fleece hoodie with Adiyogi print. Available in sizes S–XXL. 100% cotton blend, pre-shrunk fabric. Unisex fit.",
    category: "Clothing",
    price: 1899,
    stock_quantity: 35,
    images: [
      { image_url: "https://images.unsplash.com/photo-1611508136829-662b626c8aa7?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "clothing-002",
    name: "Yogic Living Cotton Kurta",
    description: "Handwoven organic cotton kurta, perfect for yoga and meditation. Breathable, relaxed fit. Available in white and earthy tones.",
    category: "Clothing",
    price: 1199,
    stock_quantity: 48,
    images: [
      { image_url: "https://images.unsplash.com/photo-1732257119942-a19648e482f2?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "jewellery-001",
    name: "Silver Devi Pendant",
    description: "92.5 sterling silver pendant featuring the Devi motif. Includes a silver chain. Handcrafted by artisans. Comes in a gift box.",
    category: "Jewellery",
    price: 2199,
    stock_quantity: 20,
    images: [
      { image_url: "https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "jewellery-002",
    name: "Om Bracelet – Sterling Silver",
    description: "Delicate silver bracelet engraved with the Om symbol. Adjustable fit, suitable for men and women. Symbolizes peace and divinity.",
    category: "Jewellery",
    price: 1499,
    stock_quantity: 30,
    images: [
      { image_url: "https://images.unsplash.com/photo-1725368844213-c167fe556f98?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "yoga-001",
    name: "Organic Cotton Yoga Mat",
    description: "Eco-friendly yoga mat made from organic cotton and natural rubber base. Non-slip surface, 4mm thick. Includes carry strap. 72 x 24 inches.",
    category: "Yoga Store",
    price: 2499,
    stock_quantity: 25,
    images: [
      { image_url: "https://images.unsplash.com/photo-1646239646963-b0b9be56d6b5?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "yoga-002",
    name: "Copper Water Bottle – 1L",
    description: "Pure copper bottle for storing and drinking water. Ayurvedic tradition recommends drinking copper-charged water for digestive health. BPA-free, leak-proof lid.",
    category: "Yoga Store",
    price: 899,
    stock_quantity: 65,
    images: [
      { image_url: "https://images.unsplash.com/photo-1614350292382-c448d0110dfa?w=800&q=80", is_primary: true },
    ],
  },
  {
    product_id: "gift-001",
    name: "Bathing Bars Gift Set",
    description: "A curated set of 4 handcrafted bathing bars infused with natural ingredients: turmeric, neem, rose, and sandalwood. Perfect as a gift or personal indulgence.",
    category: "Natural Foods",
    price: 1035,
    stock_quantity: 40,
    images: [
      { image_url: "https://images.unsplash.com/photo-1576038374613-3a1f1f1f2e36?w=800&q=80", is_primary: true },
    ],
  },
];

class SeedController {
  async seedProducts(_req: Request, res: Response): Promise<Response> {
    try {
      const count = await productService.countProducts();
      if (count > 0) {
        return res.status(200).json({
          success: true,
          message: `Database already has ${count} products. Skipping seed.`,
          count,
        });
      }

      const results: string[] = [];
      for (const product of SEED_PRODUCTS) {
        try {
          await productService.createProduct(product);
          results.push(`✓ ${product.name}`);
        } catch (err) {
          results.push(`✗ ${product.name}: ${err instanceof Error ? err.message : "error"}`);
        }
      }

      const finalCount = await productService.countProducts();
      return res.status(201).json({
        success: true,
        message: "Seed complete",
        count: finalCount,
        results,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Seed failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async clearProducts(_req: Request, res: Response): Promise<Response> {
    try {
      await pool.query("DELETE FROM products");
      return res.status(200).json({ success: true, message: "All products cleared" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Clear failed" });
    }
  }
}

export const seedController = new SeedController();
