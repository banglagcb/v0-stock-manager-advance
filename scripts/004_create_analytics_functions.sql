-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  total_quantity BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    SUM(si.quantity) as total_quantity,
    SUM(si.total_price) as total_revenue
  FROM products p
  JOIN sale_items si ON p.id = si.product_id
  JOIN sales s ON si.sale_id = s.id
  WHERE s.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.id, p.name
  ORDER BY total_quantity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales analytics by date range
CREATE OR REPLACE FUNCTION get_sales_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  sale_date DATE,
  total_sales BIGINT,
  total_revenue NUMERIC,
  average_sale NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.created_at::DATE as sale_date,
    COUNT(s.id) as total_sales,
    SUM(s.total_amount) as total_revenue,
    AVG(s.total_amount) as average_sale
  FROM sales s
  WHERE s.created_at::DATE BETWEEN start_date AND end_date
  GROUP BY s.created_at::DATE
  ORDER BY sale_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get inventory status summary
CREATE OR REPLACE FUNCTION get_inventory_status()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN stock_quantity = 0 THEN 'out_of_stock'
      WHEN stock_quantity <= min_stock_level THEN 'low_stock'
      ELSE 'in_stock'
    END as status,
    COUNT(*) as count
  FROM products
  WHERE status = 'active'
  GROUP BY 
    CASE 
      WHEN stock_quantity = 0 THEN 'out_of_stock'
      WHEN stock_quantity <= min_stock_level THEN 'low_stock'
      ELSE 'in_stock'
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to get category performance
CREATE OR REPLACE FUNCTION get_category_performance(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  total_products BIGINT,
  total_sales BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(si.id) as total_sales,
    COALESCE(SUM(si.total_price), 0) as total_revenue
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
  LEFT JOIN sale_items si ON p.id = si.product_id
  LEFT JOIN sales s ON si.sale_id = s.id AND s.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY c.id, c.name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
