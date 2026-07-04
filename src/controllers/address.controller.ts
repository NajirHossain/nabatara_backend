import type { Request, Response } from "express";
import { addressService } from "../services/address.service.js";

class AddressController {
  async getAddresses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await addressService.getAddresses(userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await addressService.createAddress(userId, req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const addressId = req.params.addressId as string;
      const result = await addressService.deleteAddress(addressId, userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const addressController = new AddressController();
