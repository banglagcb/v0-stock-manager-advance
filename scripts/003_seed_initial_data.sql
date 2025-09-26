-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Food & Beverages', 'Food items and drinks'),
('Home & Garden', 'Home improvement and garden supplies'),
('Books & Media', 'Books, magazines, and media content'),
('Sports & Outdoors', 'Sports equipment and outdoor gear'),
('Health & Beauty', 'Health and beauty products'),
('Automotive', 'Car parts and automotive supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address) VALUES
('TechCorp Supplies', 'John Smith', 'john@techcorp.com', '+1-555-0101', '123 Tech Street, Silicon Valley, CA'),
('Fashion Forward Ltd', 'Sarah Johnson', 'sarah@fashionforward.com', '+1-555-0102', '456 Fashion Ave, New York, NY'),
('Fresh Foods Wholesale', 'Mike Chen', 'mike@freshfoods.com', '+1-555-0103', '789 Market Street, Chicago, IL'),
('Home Essentials Co', 'Lisa Brown', 'lisa@homeessentials.com', '+1-555-0104', '321 Home Blvd, Austin, TX'),
('Sports Gear Direct', 'Tom Wilson', 'tom@sportsgear.com', '+1-555-0105', '654 Sports Way, Denver, CO')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, cost_price, selling_price, stock_quantity, min_stock_level, max_stock_level, unit) 
SELECT 
  'Wireless Bluetooth Headphones',
  'High-quality wireless headphones with noise cancellation',
  'WBH-001',
  '1234567890123',
  c.id,
  s.id,
  45.00,
  89.99,
  25,
  5,
  100,
  'pcs'
FROM public.categories c, public.suppliers s 
WHERE c.name = 'Electronics' AND s.name = 'TechCorp Supplies'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, cost_price, selling_price, stock_quantity, min_stock_level, max_stock_level, unit) 
SELECT 
  'Cotton T-Shirt',
  'Comfortable 100% cotton t-shirt in various colors',
  'CTS-001',
  '1234567890124',
  c.id,
  s.id,
  8.00,
  19.99,
  50,
  10,
  200,
  'pcs'
FROM public.categories c, public.suppliers s 
WHERE c.name = 'Clothing' AND s.name = 'Fashion Forward Ltd'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, cost_price, selling_price, stock_quantity, min_stock_level, max_stock_level, unit) 
SELECT 
  'Organic Coffee Beans',
  'Premium organic coffee beans - 1lb bag',
  'OCB-001',
  '1234567890125',
  c.id,
  s.id,
  6.50,
  14.99,
  30,
  5,
  150,
  'lbs'
FROM public.categories c, public.suppliers s 
WHERE c.name = 'Food & Beverages' AND s.name = 'Fresh Foods Wholesale'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, cost_price, selling_price, stock_quantity, min_stock_level, max_stock_level, unit) 
SELECT 
  'LED Desk Lamp',
  'Adjustable LED desk lamp with USB charging port',
  'LDL-001',
  '1234567890126',
  c.id,
  s.id,
  15.00,
  34.99,
  20,
  3,
  80,
  'pcs'
FROM public.categories c, public.suppliers s 
WHERE c.name = 'Home & Garden' AND s.name = 'Home Essentials Co'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (name, description, sku, barcode, category_id, supplier_id, cost_price, selling_price, stock_quantity, min_stock_level, max_stock_level, unit) 
SELECT 
  'Yoga Mat',
  'Non-slip yoga mat with carrying strap',
  'YM-001',
  '1234567890127',
  c.id,
  s.id,
  12.00,
  29.99,
  15,
  5,
  60,
  'pcs'
FROM public.categories c, public.suppliers s 
WHERE c.name = 'Sports & Outdoors' AND s.name = 'Sports Gear Direct'
ON CONFLICT (sku) DO NOTHING;
