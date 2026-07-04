import type { Request, Response } from "express";
import { sectionsRepository } from "../repository/sections.repository.js";

const pid = (req: Request) => req.params.productId as string;
const sid = (req: Request) => req.params.sectionId as string;

export const sectionsController = {
  getSections: async (req: Request, res: Response) => {
    const sections = await sectionsRepository.getByProduct(pid(req));
    res.json({ data: sections });
  },

  createSection: async (req: Request, res: Response) => {
    const { label, layout_type, sort_order } = req.body;
    if (!label || !layout_type) {
      res.status(400).json({ message: "label and layout_type are required" });
      return;
    }
    const section = await sectionsRepository.create({ product_id: pid(req), label, layout_type, sort_order });
    res.status(201).json({ data: section });
  },

  updateSection: async (req: Request, res: Response) => {
    const updated = await sectionsRepository.update(sid(req), req.body);
    if (!updated) { res.status(404).json({ message: "Section not found" }); return; }
    res.json({ data: updated });
  },

  deleteSection: async (req: Request, res: Response) => {
    const deleted = await sectionsRepository.delete(sid(req));
    if (!deleted) { res.status(404).json({ message: "Section not found" }); return; }
    res.json({ message: "Deleted" });
  },

  updateItems: async (req: Request, res: Response) => {
    const { items } = req.body;
    if (!Array.isArray(items)) { res.status(400).json({ message: "items array required" }); return; }
    const updated = await sectionsRepository.upsertItems(sid(req), items);
    if (!updated) { res.status(404).json({ message: "Section not found" }); return; }
    res.json({ data: updated });
  },

  reorderSections: async (req: Request, res: Response) => {
    const { items } = req.body as { items: { section_id: string; sort_order: number }[] };
    if (!Array.isArray(items)) { res.status(400).json({ message: "items array required" }); return; }
    await sectionsRepository.reorder(items);
    res.json({ message: "Reordered" });
  },
};
