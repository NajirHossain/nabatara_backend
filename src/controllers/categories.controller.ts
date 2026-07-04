import type { Request, Response } from "express";
import { categoriesRepository } from "../repository/categories.repository.js";

const p = (req: Request, key: string): string => req.params[key] as string;

export const categoriesController = {
  getCategories: async (_req: Request, res: Response) => {
    const categories = await categoriesRepository.getActive();
    res.json({ data: categories });
  },

  createCategory: async (req: Request, res: Response) => {
    const { name, nav_label, is_nav_visible, is_active, is_featured, is_showcase, image_url, sort_order } = req.body;
    if (!name || !nav_label) {
      res.status(400).json({ message: "name and nav_label are required" });
      return;
    }
    const category = await categoriesRepository.create({ name, nav_label, is_nav_visible, is_active, is_featured, is_showcase, image_url, sort_order });
    res.status(201).json({ data: category });
  },

  updateCategory: async (req: Request, res: Response) => {
    const updated = await categoriesRepository.update(p(req, "id"), req.body);
    if (!updated) { res.status(404).json({ message: "Category not found" }); return; }
    res.json({ data: updated });
  },

  deleteCategory: async (req: Request, res: Response) => {
    const deleted = await categoriesRepository.delete(p(req, "id"));
    if (!deleted) { res.status(404).json({ message: "Category not found" }); return; }
    res.json({ message: "Deleted" });
  },

  reorderCategories: async (req: Request, res: Response) => {
    const { items } = req.body as { items: { category_id: string; sort_order: number }[] };
    if (!Array.isArray(items)) { res.status(400).json({ message: "items array required" }); return; }
    await categoriesRepository.reorder(items);
    res.json({ message: "Reordered" });
  },

  getAllCategories: async (_req: Request, res: Response) => {
    const categories = await categoriesRepository.getAll();
    res.json({ data: categories });
  },
};
