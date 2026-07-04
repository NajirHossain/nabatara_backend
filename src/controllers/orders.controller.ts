import type { Request, Response } from "express";
import { orderService } from "../services/orders.service.js";

class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await orderService.createOrder(userId, req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to create order" });
    }
  }

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await orderService.getOrders(userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to fetch orders" });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await orderService.getOrders(userId);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err instanceof Error ? err.message : "Failed to fetch order" });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId as string;
      const { status } = req.body as { status?: string };
      if (!status) { res.status(400).json({ success: false, message: "Status is required" }); return; }
      await orderService.updateStatus(orderId, status);
      res.status(200).json({ success: true, data: { order_id: orderId, status } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order";
      res.status(400).json({ success: false, message: msg });
    }
  }

  async requestCancellation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.orderId as string;
      await orderService.requestCancellation(userId, orderId);
      res.status(200).json({ success: true, message: "Cancellation requested" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to request cancellation";
      res.status(400).json({ success: false, message: msg });
    }
  }

  async deleteOrder(_req: Request, res: Response): Promise<void> {
    res.status(501).json({ success: false, message: "Not implemented" });
  }
}

export const orderController = new OrderController();
