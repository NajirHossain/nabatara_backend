import type { Request, Response } from "express";
import { settingsRepository } from "../repository/settings.repository.js";

const p = (req: Request, key: string): string => req.params[key] as string;

export const settingsController = {
  getSetting: async (req: Request, res: Response) => {
    const value = await settingsRepository.getSetting(p(req, "key"));
    if (value === null) { res.status(404).json({ message: "Setting not found" }); return; }
    res.json({ data: value });
  },

  updateSetting: async (req: Request, res: Response) => {
    const { value } = req.body;
    if (value === undefined) { res.status(400).json({ message: "value is required" }); return; }
    await settingsRepository.upsertSetting(p(req, "key"), value);
    res.json({ message: "Saved" });
  },

  getSeo: async (req: Request, res: Response) => {
    const seo = await settingsRepository.getSeo(p(req, "page"));
    if (!seo) { res.status(404).json({ message: "SEO settings not found" }); return; }
    res.json({ data: seo });
  },

  getAllSeo: async (_req: Request, res: Response) => {
    const rows = await settingsRepository.getAllSeo();
    res.json({ data: rows });
  },

  updateSeo: async (req: Request, res: Response) => {
    const updated = await settingsRepository.upsertSeo(p(req, "page"), req.body);
    res.json({ data: updated });
  },

  getStaticPage: async (req: Request, res: Response) => {
    const page = await settingsRepository.getStaticPage(p(req, "page_key"));
    if (!page) { res.status(404).json({ message: "Page not found" }); return; }
    res.json({ data: page.content });
  },

  updateStaticPage: async (req: Request, res: Response) => {
    const content = req.body;
    if (!content || typeof content !== "object") { res.status(400).json({ message: "content body required" }); return; }
    const updated = await settingsRepository.upsertStaticPage(p(req, "page_key"), content);
    res.json({ data: updated.content });
  },

  getAllStaticPageKeys: async (_req: Request, res: Response) => {
    const pages = await settingsRepository.getAllStaticPages();
    res.json({ data: pages });
  },
};
