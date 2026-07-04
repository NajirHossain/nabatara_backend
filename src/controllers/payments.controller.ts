import type { Request, Response } from "express";

class PaymentController {
    async createPayment(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Payment created",
        });
    };

    async getAllPayments(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Payment",
        });
    };

    async getPaymentById(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Payment by id",
        });
    };

    async updatePaymentStatus(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Payment updated",
        });
    };

    async cancelPayment(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Payment deleted",
        });
    };
}

export const paymentController = new PaymentController();
