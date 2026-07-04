export interface Category {
  category_id:    string;
  name:           string;
  nav_label:      string;
  is_nav_visible: boolean;
  is_active:      boolean;
  is_featured:    boolean;
  is_showcase:    boolean;
  image_url:      string | null;
  sort_order:     number;
  created_at:     Date;
  updated_at:     Date;
}

export interface CreateCategoryInput {
  name:            string;
  nav_label:       string;
  is_nav_visible?: boolean;
  is_active?:      boolean;
  is_featured?:    boolean;
  is_showcase?:    boolean;
  image_url?:      string | null;
  sort_order?:     number;
}

export interface UpdateCategoryInput {
  name?:           string;
  nav_label?:      string;
  is_nav_visible?: boolean;
  is_active?:      boolean;
  is_featured?:    boolean;
  is_showcase?:    boolean;
  image_url?:      string | null;
  sort_order?:     number;
}
