import type { Request, Response } from "express";

function respond(req: Request, res: Response, subfolder: string): void {
  if (!req.file) { res.status(400).json({ success: false, message: "No image file provided" }); return; }
  res.status(200).json({ success: true, data: { url: `/uploads/${subfolder}/${req.file.filename}` } });
}

class UploadController {
  uploadProductImage   = (req: Request, res: Response) => respond(req, res, "Products");
  uploadHeroImage      = (req: Request, res: Response) => respond(req, res, "Hero");
  uploadPromoImage     = (req: Request, res: Response) => respond(req, res, "Promo");
  uploadCategoryImage  = (req: Request, res: Response) => respond(req, res, "Categories");
  uploadPageImage      = (req: Request, res: Response) => respond(req, res, "Pages");
  uploadSpotlightImage = (req: Request, res: Response) => respond(req, res, "Spotlight");
}

export const uploadController = new UploadController();
