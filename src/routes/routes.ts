import express from "express";
import { UserController } from "../controllers/user.controller.js";
import { productController } from "../controllers/products.controller.js";
import { cartcontroller } from "../controllers/carts.controller.js";
import { orderController } from "../controllers/orders.controller.js";
import { paymentController } from "../controllers/payments.controller.js";
import { seedController } from "../controllers/seed.controller.js";
import { adminController } from "../controllers/admin.controller.js";
import { addressController } from "../controllers/address.controller.js";
import { wishlistController } from "../controllers/wishlist.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { uploadController } from "../controllers/upload.controller.js";
import { uploadProductImage, uploadHeroImage, uploadPromoImage, uploadCategoryImage, uploadPageImage, uploadSpotlightImage } from "../middlewares/upload.middleware.js";
import { categoriesController } from "../controllers/categories.controller.js";
import { settingsController } from "../controllers/settings.controller.js";
import { sectionsController } from "../controllers/sections.controller.js";
import * as otpController from "../controllers/otp.controller.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();
const router = express.Router();
const userController = new UserController();

// auth routes
authRouter.post("/signup", userController.signup);
authRouter.post("/login", userController.login);
authRouter.post("/logout", userController.logout);
authRouter.post("/refresh", userController.refresh);

// OTP routes (public)
authRouter.post("/send-verification-otp", otpController.sendVerificationOTP);
authRouter.post("/verify-email",          otpController.verifyEmail);
authRouter.post("/send-reset-otp",        otpController.sendPasswordResetOTP);
authRouter.post("/reset-password",        otpController.resetPassword);

// Admin invite accept (public — called from email link)
authRouter.get("/accept-invite", adminController.acceptInvite);

// public product routes (DB-backed, kept for future use)
router.get("/products", productController.getAllProducts.bind(productController));
router.get("/products/:product_id", productController.getProductById.bind(productController));

// admin-only product CRUD
router.post("/products", authenticateToken, requireAdmin, productController.createProduct.bind(productController));
router.put("/products/:product_id", authenticateToken, requireAdmin, productController.updateProduct.bind(productController));
router.delete("/products/:product_id", authenticateToken, requireAdmin, productController.deleteProduct.bind(productController));

// protected cart routes
router.post("/cart", authenticateToken, cartcontroller.addToCart.bind(cartcontroller));
router.get("/cart", authenticateToken, cartcontroller.getCart.bind(cartcontroller));
router.put("/cart", authenticateToken, cartcontroller.updateCart.bind(cartcontroller));
router.delete("/cart/:productId", authenticateToken, cartcontroller.deleteCart.bind(cartcontroller));

// profile routes
router.get("/profile", authenticateToken, userController.getProfile);
router.put("/profile", authenticateToken, userController.updateProfile);

// protected address routes
router.get("/addresses", authenticateToken, addressController.getAddresses.bind(addressController));
router.post("/addresses", authenticateToken, addressController.createAddress.bind(addressController));
router.delete("/addresses/:addressId", authenticateToken, addressController.deleteAddress.bind(addressController));

// protected wishlist routes
router.get("/wishlist", authenticateToken, wishlistController.getWishlist);
router.post("/wishlist/:productId", authenticateToken, wishlistController.toggleWishlist);
router.delete("/wishlist/:productId", authenticateToken, wishlistController.removeFromWishlist);

// review routes (public read, protected write)
router.get("/products/:productId/reviews", reviewController.getReviews);
router.post("/products/:productId/reviews", authenticateToken, reviewController.upsertReview);
router.delete("/products/:productId/reviews", authenticateToken, reviewController.deleteReview);

// product section routes (public read, admin write)
router.get("/products/:productId/sections", sectionsController.getSections);
router.post("/admin/products/:productId/sections", authenticateToken, requireAdmin, sectionsController.createSection);
router.put("/admin/products/:productId/sections/reorder", authenticateToken, requireAdmin, sectionsController.reorderSections);
router.put("/admin/sections/:sectionId", authenticateToken, requireAdmin, sectionsController.updateSection);
router.put("/admin/sections/:sectionId/items", authenticateToken, requireAdmin, sectionsController.updateItems);
router.delete("/admin/sections/:sectionId", authenticateToken, requireAdmin, sectionsController.deleteSection);

// protected order routes
router.post("/orders", authenticateToken, orderController.createOrder.bind(orderController));
router.get("/orders", authenticateToken, orderController.getAllOrders.bind(orderController));
router.get("/orders/:orderId", authenticateToken, orderController.getOrderById.bind(orderController));
router.put("/orders/:orderId/status",  authenticateToken, requireAdmin, orderController.updateOrderStatus.bind(orderController));
router.post("/orders/:orderId/cancel", authenticateToken, orderController.requestCancellation.bind(orderController));

// admin routes
router.get("/admin/stats",                  authenticateToken, requireAdmin, adminController.getStats);
router.get("/admin/orders",                 authenticateToken, requireAdmin, adminController.getOrders);
router.get("/admin/users",                  authenticateToken, requireAdmin, adminController.listUsers);
router.patch("/admin/users/:userId/role",   authenticateToken, requireAdmin, adminController.updateUserRole);
router.post("/admin/invite",                authenticateToken, requireAdmin, adminController.inviteAdmin);

// public CMS routes (categories, settings, seo, static pages)
router.get("/categories", categoriesController.getCategories);
router.get("/settings/:key", settingsController.getSetting);
router.get("/seo/:page", settingsController.getSeo);
router.get("/pages/:page_key", settingsController.getStaticPage);

// admin CMS routes
router.get("/admin/categories", authenticateToken, requireAdmin, categoriesController.getAllCategories);
router.post("/admin/categories", authenticateToken, requireAdmin, categoriesController.createCategory);
router.put("/admin/categories/reorder", authenticateToken, requireAdmin, categoriesController.reorderCategories);
router.put("/admin/categories/:id", authenticateToken, requireAdmin, categoriesController.updateCategory);
router.delete("/admin/categories/:id", authenticateToken, requireAdmin, categoriesController.deleteCategory);

router.get("/admin/seo", authenticateToken, requireAdmin, settingsController.getAllSeo);
router.put("/admin/seo/:page", authenticateToken, requireAdmin, settingsController.updateSeo);
router.get("/admin/pages", authenticateToken, requireAdmin, settingsController.getAllStaticPageKeys);
router.put("/admin/pages/:page_key", authenticateToken, requireAdmin, settingsController.updateStaticPage);
router.put("/admin/settings/:key", authenticateToken, requireAdmin, settingsController.updateSetting);

// file upload
router.post("/upload/product-image",        authenticateToken, requireAdmin, uploadProductImage,  uploadController.uploadProductImage);
router.post("/admin/upload/hero-image",     authenticateToken, requireAdmin, uploadHeroImage,     uploadController.uploadHeroImage);
router.post("/admin/upload/promo-image",    authenticateToken, requireAdmin, uploadPromoImage,    uploadController.uploadPromoImage);
router.post("/admin/upload/category-image", authenticateToken, requireAdmin, uploadCategoryImage, uploadController.uploadCategoryImage);
router.post("/admin/upload/page-image",      authenticateToken, requireAdmin, uploadPageImage,      uploadController.uploadPageImage);
router.post("/admin/upload/spotlight-image", authenticateToken, requireAdmin, uploadSpotlightImage, uploadController.uploadSpotlightImage);

// dev seed routes — development only
if (process.env.NODE_ENV !== "production") {
  router.post("/dev/seed", seedController.seedProducts.bind(seedController));
  router.delete("/dev/seed", seedController.clearProducts.bind(seedController));
}

// protected payment routes
router.post("/payments", authenticateToken, paymentController.createPayment.bind(paymentController));
router.get("/payments", authenticateToken, paymentController.getAllPayments.bind(paymentController));
router.get("/payments/:paymentId", authenticateToken, paymentController.getPaymentById.bind(paymentController));
router.put("/payments/:paymentId/status", authenticateToken, requireAdmin, paymentController.updatePaymentStatus.bind(paymentController));
router.delete("/payments/:paymentId", authenticateToken, paymentController.cancelPayment.bind(paymentController));

export { authRouter, router };
