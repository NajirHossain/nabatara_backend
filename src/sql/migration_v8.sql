-- migration_v8.sql: CMS tables — categories, site_settings, seo_settings, static_pages

-- ─── 1. Categories ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  category_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  nav_label      TEXT NOT NULL,
  is_nav_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, nav_label, is_nav_visible, is_active, sort_order) VALUES
  ('Rudraksha',            'RUDRAKSHA',            TRUE,  TRUE, 1),
  ('Temple & Consecrated', 'TEMPLE & CONSECRATED', TRUE,  TRUE, 2),
  ('Yoga Store',           'YOGA STORE',           TRUE,  TRUE, 3),
  ('Natural Foods',        'NATURAL FOOD',         TRUE,  TRUE, 4),
  ('Health & Immunity',    'HEALTH & IMMUNITY',    TRUE,  TRUE, 5),
  ('Clothing',             'CLOTHING',             TRUE,  TRUE, 6),
  ('Body Care',            'BODY CARE',            TRUE,  TRUE, 7),
  ('Home Decor',           'HOME DECOR',           TRUE,  TRUE, 8),
  ('Books',                'BOOKS',                TRUE,  TRUE, 9),
  ('Jewellery',            'JEWELLERY',            FALSE, TRUE, 10)
ON CONFLICT DO NOTHING;

-- ─── 2. Site settings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('announcement', '"Pay On Delivery Available Now"'),
  ('hero_slides', $json$[
    {"id":1,"title":"Linga Bhairavi Gudi","subtitle":"Bring Devi's Grace into your life","cta":"Shop Now","href":"/products?category=Temple+%26+Consecrated","image_url":null},
    {"id":2,"title":"Sacred Rudraksha","subtitle":"Embrace divine energy and protection","cta":"Explore Collection","href":"/products?category=Rudraksha","image_url":null},
    {"id":3,"title":"Yogic Wellness","subtitle":"Transform your body and mind","cta":"Discover More","href":"/products?category=Yoga+Store","image_url":null}
  ]$json$),
  ('promo_grid', $json$[
    {"id":1,"title":"Gifts Of Transformation","subtitle":"Devi Gudi","cta":"EXPLORE NOW","href":"/products","image_url":null,"gradient":"from-purple-900 to-purple-800","size":"large"},
    {"id":2,"title":"Jeeva Legium","subtitle":"Chyawanprash","cta":"Explore Now","href":"/products?category=Health+%26+Immunity","image_url":"https://images.unsplash.com/photo-1627394376504-24507bf9f7eb?w=800&q=80","gradient":"from-amber-900 to-amber-800","size":"small"},
    {"id":3,"title":"Winter","subtitle":"Wellness","subtitle2":"OFFERINGS","cta":"Shop Now","href":"/products","image_url":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80","gradient":"from-slate-900 to-slate-800","size":"small"},
    {"id":4,"title":"Adiyogi Hoodie","subtitle":"","cta":"Shop Now","href":"/products?category=Clothing","image_url":"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80","gradient":"from-slate-600 to-slate-700","size":"medium"}
  ]$json$),
  ('featured_categories', $json$[
    {"id":1,"title":"Consecrated Offerings","image_url":"https://images.unsplash.com/photo-1764416995436-e5f9ebef52f7?w=800&q=80","category_name":"Temple & Consecrated"},
    {"id":2,"title":"Rudraksha","image_url":"https://images.unsplash.com/photo-1527999230720-768828d2d0a3?w=800&q=80","category_name":"Rudraksha"},
    {"id":3,"title":"Health & Immunity","image_url":"https://images.unsplash.com/photo-1627394376504-24507bf9f7eb?w=800&q=80","category_name":"Health & Immunity"},
    {"id":4,"title":"Natural Foods","image_url":"https://images.unsplash.com/photo-1692797178143-659c48c34135?w=800&q=80","category_name":"Natural Foods"}
  ]$json$)
ON CONFLICT DO NOTHING;

-- ─── 3. SEO settings ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  page           TEXT PRIMARY KEY,
  title          TEXT,
  description    TEXT,
  og_title       TEXT,
  og_description TEXT,
  og_image       TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO seo_settings (page, title, description, og_title, og_description) VALUES
  ('home',     'Nabatara Life | Sacred & Wellness Products',           'Shop consecrated offerings, Rudraksha, natural foods, and wellness products at Nabatara Life.', 'Nabatara Life | Sacred & Wellness Products',  'Authentic sacred products for conscious living.'),
  ('products', 'All Products | Nabatara Life',                         'Browse our full collection of sacred and wellness products.',                                    'All Products | Nabatara Life',                'Explore the Nabatara Life collection.'),
  ('about',    'About Us | Nabatara Life',                             'Learn about the Nabatara Life mission and story.',                                               'About Us | Nabatara Life',                    'Our story, mission, and values.'),
  ('contact',  'Contact Us | Nabatara Life',                           'Get in touch with the Nabatara Life team.',                                                      'Contact Us | Nabatara Life',                  'We are here to help.'),
  ('faq',      'FAQ | Nabatara Life',                                  'Frequently asked questions about orders, shipping, and products.',                               'FAQ | Nabatara Life',                         'Find answers to common questions.'),
  ('shipping', 'Shipping Policy | Nabatara Life',                      'Shipping and delivery information for Nabatara Life orders.',                                    'Shipping Policy | Nabatara Life',             'Free shipping on orders above Rs. 999.'),
  ('returns',  'Returns & Exchanges | Nabatara Life',                  '7-day hassle-free return policy for all eligible products.',                                     'Returns & Exchanges | Nabatara Life',         'Shop with confidence — easy returns.'),
  ('privacy',  'Privacy Policy | Nabatara Life',                       'How Nabatara Life handles your personal data.',                                                  'Privacy Policy | Nabatara Life',              'Your trust is our most valued possession.'),
  ('terms',    'Terms of Service | Nabatara Life',                     'Terms and conditions for using the Nabatara Life platform.',                                     'Terms of Service | Nabatara Life',            'Transparency and integrity in every transaction.'),
  ('cookies',  'Cookie Policy | Nabatara Life',                        'How Nabatara Life uses cookies to improve your experience.',                                     'Cookie Policy | Nabatara Life',               'A better experience, built on honesty.')
ON CONFLICT DO NOTHING;

-- ─── 4. Static pages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS static_pages (
  page_key   TEXT PRIMARY KEY,
  content    JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO static_pages (page_key, content) VALUES

('about', $json${
  "title": "About Us",
  "heroImage": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1600&q=85",
  "intro": "Envisioned as a space for cultural exuberance, NabataraLife draws you into the enchanting world of Indian tradition. It celebrates and offers India's profound knowledge and rich history of Yoga, cuisine and craftsmanship in a manner relevant to our times.",
  "sections": [
    {"heading": "Our Story", "body": "NabataraLife was born from a deep reverence for India's timeless spiritual traditions. Founded with the vision of making authentic sacred products accessible to every home, we source and curate items that carry genuine energetic intention — from hand-strung Rudraksha malas sourced directly from Nepal to consecrated temple offerings and handwoven organic textiles.\n\nEvery product on our platform has been carefully selected to honour the lineage of the craft and the integrity of the materials."},
    {"heading": "Our Mission", "body": "Our mission is simple: to serve as a trusted bridge between seekers and the sacred. In a market flooded with imitations, we hold ourselves to an uncompromising standard of authenticity. We work directly with artisans, temples, and trusted suppliers to ensure that what you receive carries the energy and quality it promises."},
    {"heading": "What We Offer", "body": "From Rudraksha beads and consecrated jewellery to Ayurvedic wellness products, natural foods, yoga accessories, and handwoven clothing — NabataraLife is a one-stop destination for conscious living. Each category is curated with intention, not volume."},
    {"heading": "Our Values", "body": "Authenticity — every product is genuine.\nSustainability — we prefer natural, organic, and handcrafted over mass-produced.\nIntegrity — transparent sourcing, honest pricing, no markup on faith.\nService — your wellbeing is our purpose, not just your purchase."}
  ]
}$json$),

('contact', $json${
  "title": "Contact Us",
  "heroImage": "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1600&q=85",
  "intro": "Whether you have a question about an order, need guidance choosing the right product, or simply want to connect — our team is always happy to help.",
  "type": "contact",
  "contactInfo": {
    "address": "Nabatara Headquarters\nKolkata — 700055\nWest Bengal, India",
    "phone": "+91 844 844 7788",
    "phoneHours": "Mon – Sat, 10 AM – 6 PM IST",
    "email": "support@nabataralife.com",
    "emailNote": "We reply within 1 business day"
  }
}$json$),

('faq', $json${
  "title": "Frequently Asked\nQuestions",
  "heroImage": "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1600&q=85",
  "intro": "Here are the answers to the questions we hear most often. If you don't find what you're looking for, write to us at support@nabataralife.com.",
  "type": "faq",
  "items": [
    {"q": "Are the Rudraksha beads authentic?", "a": "Yes. All Rudraksha beads on NabataraLife are sourced directly from certified suppliers in Nepal and India. Each bead is hand-inspected for mukhi count and authenticity before being listed."},
    {"q": "Do you offer Cash on Delivery (COD)?", "a": "Yes, Pay on Delivery is available across India for all orders. You can select COD at checkout — no advance payment required."},
    {"q": "How long does delivery take?", "a": "Standard delivery takes 5–7 business days. Express delivery (3–4 business days) is available for select pin codes. You will receive a tracking link once your order is dispatched."},
    {"q": "What is your free shipping threshold?", "a": "Orders above Rs. 999 qualify for free shipping. Orders below Rs. 999 attract a flat Rs. 60 shipping fee."},
    {"q": "Can I return a product if I'm not satisfied?", "a": "Yes. We offer a 7-day hassle-free return window from the date of delivery. Products must be unused, in original packaging, and in the same condition as received. Perishables (foods, oils) are non-returnable once opened."},
    {"q": "How do I track my order?", "a": "Once your order is shipped, you'll receive an SMS and email with the courier tracking number. You can also view your order history and status in your Profile page after logging in."},
    {"q": "Are clothing items available in all sizes?", "a": "Size availability varies by product. Available sizes are shown on each product page. If your size is not listed, feel free to contact us — we may be able to arrange a custom order."},
    {"q": "How do I contact support?", "a": "You can email us at support@nabataralife.com or call +91 844 844 7788 (Mon–Sat, 10 AM – 6 PM IST). We typically respond within one business day."}
  ]
}$json$),

('shipping', $json${
  "title": "Shipping Policy",
  "heroImage": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=85",
  "intro": "We ship across India with free delivery on orders above Rs. 999. Here's everything you need to know about how your order gets to you.",
  "sections": [
    {"heading": "Free Shipping", "body": "Orders totalling Rs. 999 or above qualify for free standard shipping anywhere in India. Orders below Rs. 999 are charged a flat Rs. 60 delivery fee, calculated at checkout."},
    {"heading": "Delivery Timelines", "body": "Standard Delivery: 5–7 business days from order confirmation.\nExpress Delivery: 3–4 business days (available for select pin codes; additional charge applies).\nRemote/Hill Areas: 7–10 business days.\n\nOrders placed before 12:00 PM IST on a business day are typically processed the same day."},
    {"heading": "Cash on Delivery (COD)", "body": "COD is available across India with no extra charge. Simply select \"Pay on Delivery\" at checkout. Please ensure someone is available to receive and pay for the order at the delivery address."},
    {"heading": "Order Tracking", "body": "Once your order is dispatched, you will receive a tracking number via SMS and email. You can use this to track your shipment directly on the courier's website. Order status is also visible in your Profile > Orders section."},
    {"heading": "Packaging", "body": "We use eco-friendly packaging wherever possible. Fragile or sensitive items (glass bottles, Rudraksha malas) are securely bubble-wrapped to ensure safe transit. Sacred items are wrapped with cloth before packaging, out of respect for their nature."},
    {"heading": "International Shipping", "body": "We currently ship only within India. International shipping is on our roadmap — subscribe to our newsletter to be notified when it becomes available."}
  ]
}$json$),

('returns', $json${
  "title": "Returns & Exchanges",
  "heroImage": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=85",
  "intro": "We want you to be completely satisfied with every purchase. Our 7-day return policy is designed to give you peace of mind.",
  "sections": [
    {"heading": "Return Window", "body": "You may return most products within 7 days of delivery. The return window starts from the date your order is marked as delivered."},
    {"heading": "Eligible Items", "body": "The following items are eligible for return:\n• Rudraksha beads and malas (if defective or not as described)\n• Clothing and accessories (unused, tags intact)\n• Yoga accessories and home décor (unused, original packaging)\n• Books (unopened, in original condition)"},
    {"heading": "Non-Returnable Items", "body": "Due to hygiene and consumable nature, the following cannot be returned:\n• Natural foods, honey, oils, powders (once opened)\n• Personalised or custom-order items\n• Products that have been used, washed, or altered\n• Items without original packaging"},
    {"heading": "How to Initiate a Return", "body": "1. Email support@nabataralife.com with your Order ID and reason for return.\n2. Our team will review your request within 2 business days.\n3. If approved, we'll arrange a reverse pickup at no cost to you.\n4. Once we receive and inspect the item, a refund is processed within 5–7 business days to your original payment method (or as store credit for COD orders)."},
    {"heading": "Damaged or Wrong Items", "body": "If you receive a damaged or incorrect item, please photograph it and email us within 48 hours of delivery. We will prioritise a replacement or full refund at no extra cost."}
  ]
}$json$),

('privacy', $json${
  "title": "Privacy Policy",
  "heroImage": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=85",
  "intro": "We take your privacy seriously. This policy explains what data we collect, how we use it, and how we keep it safe. Last updated: May 2026.",
  "sections": [
    {"heading": "Information We Collect", "body": "When you create an account or place an order, we collect:\n• Name, email address, and phone number\n• Delivery address\n• Order history and preferences\n\nWe do not store payment card details. All payments are processed through secure, PCI-compliant gateways."},
    {"heading": "How We Use Your Information", "body": "Your information is used to:\n• Process and fulfil your orders\n• Send order confirmations and delivery updates\n• Respond to your queries and support requests\n• Improve our products and services\n• Send promotional communications (only if you opt in)"},
    {"heading": "Data Sharing", "body": "We do not sell, rent, or trade your personal information. We share data only with:\n• Logistics partners (for delivery — your name and address only)\n• Payment processors (for transaction processing)\n• Legal authorities (only when required by law)"},
    {"heading": "Data Retention & Your Rights", "body": "We retain your account data for as long as your account is active. You may request access, correction, or deletion of your data by emailing support@nabataralife.com. We will respond within 30 days. Order records are retained for 7 years as required by Indian tax law."}
  ]
}$json$),

('terms', $json${
  "title": "Terms of Service",
  "heroImage": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=85",
  "intro": "By using NabataraLife, you agree to the following terms. Please read them carefully. Last updated: May 2026.",
  "sections": [
    {"heading": "Acceptance of Terms", "body": "By accessing or using NabataraLife (nabataralife.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform."},
    {"heading": "Use of the Platform", "body": "You agree to use NabataraLife only for lawful purposes. You may not:\n• Use the platform for fraudulent transactions\n• Reproduce or distribute our content without permission\n• Attempt to gain unauthorised access to any part of the platform"},
    {"heading": "Orders & Payment", "body": "All orders are subject to acceptance and availability. We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraud. You will be notified and fully refunded in such cases."},
    {"heading": "Intellectual Property", "body": "All content on this platform — including text, images, logos, and product descriptions — is the property of NabataraLife or its content suppliers and is protected by applicable intellectual property laws."},
    {"heading": "Governing Law", "body": "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kolkata, West Bengal."}
  ]
}$json$),

('cookies', $json${
  "title": "Cookie Policy",
  "heroImage": "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1600&q=85",
  "intro": "We use cookies to keep the site working smoothly and to understand how it's being used. Here's a plain-language explanation. Last updated: May 2026.",
  "sections": [
    {"heading": "What Are Cookies?", "body": "Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience."},
    {"heading": "Cookies We Use", "body": "Essential Cookies — Required for the site to function. These include session authentication (keeping you logged in) and your shopping cart state. These cannot be disabled.\n\nAnalytics Cookies — Help us understand how visitors use the site (pages visited, time spent). This data is aggregated and anonymous.\n\nPreference Cookies — Remember your settings such as language or display preferences."},
    {"heading": "Managing Cookies", "body": "You can control or delete cookies through your browser settings. Disabling essential cookies will affect site functionality (e.g., you may not be able to stay logged in or use your cart).\n\nChrome: Settings > Privacy and Security > Cookies.\nFirefox: Settings > Privacy & Security > Cookies and Site Data."},
    {"heading": "Contact", "body": "Questions about our use of cookies? Write to: support@nabataralife.com"}
  ]
}$json$)

ON CONFLICT DO NOTHING;
