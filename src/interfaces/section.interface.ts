export interface ProductSection {
  section_id: string;
  product_id: string;
  label: string;
  layout_type: "alternating" | "steps" | "carousel";
  sort_order: number;
  items: Record<string, unknown>[];
  created_at: Date;
}

export interface CreateSectionInput {
  product_id: string;
  label: string;
  layout_type: "alternating" | "steps" | "carousel";
  sort_order?: number;
}

export interface UpdateSectionInput {
  label?: string;
  layout_type?: "alternating" | "steps" | "carousel";
  sort_order?: number;
}
