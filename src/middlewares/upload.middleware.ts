import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
}

function makeUploader(subdir: string) {
  // process.cwd() = backend/ in dev, public_html/ in production (Passenger sets it)
  const dir = process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "uploads", subdir)
    : path.join(process.cwd(), "src", "uploads", subdir);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${uuidv4()}${ext}`);
    },
  });
  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single("image");
}

export const uploadProductImage   = makeUploader("Products");
export const uploadHeroImage      = makeUploader("Hero");
export const uploadPromoImage     = makeUploader("Promo");
export const uploadCategoryImage  = makeUploader("Categories");
export const uploadPageImage      = makeUploader("Pages");
export const uploadSpotlightImage = makeUploader("Spotlight");
