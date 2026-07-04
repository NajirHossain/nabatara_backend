export interface SiteSetting {
  key: string;
  value: unknown;
  updated_at: Date;
}

export interface SeoSetting {
  page: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  updated_at: Date;
}

export interface StaticPageRow {
  page_key: string;
  content: Record<string, unknown>;
  updated_at: Date;
}

export interface UpsertSeoInput {
  title?: string;
  description?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}
