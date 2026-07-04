class PaymentService {
    async createPayment(userId: string, orderId: string, amount: number) {
        return {
            message: "Payment created successfully",
            data: {
                userId,
                orderId,
                amount
            }
        }
    }

    async getPayment(userId: string, paymentId: string) {
        return {
            message: "Payment fetched successfully",
            data: {
                userId,
                paymentId
            }
        }
    }

    async updatePayment(userId: string, paymentId: string, status: string) {
        return {
            message: "Payment updated successfully",
            data: {
                userId,
                paymentId,
                status
            }
        }
    }

    async deletePayment(userId: string, paymentId: string) {
        return {
            message: "Payment deleted successfully",
            data: {
                userId,
                paymentId
            }
        }
    }
}

export default PaymentService;