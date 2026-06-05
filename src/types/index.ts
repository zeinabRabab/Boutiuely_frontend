export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  tags?: string;
  color?: string;
  image_url?: string;
  alert_threshold: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  category?: string;
  stock: number;
  alert_threshold: number;
  status: 'out' | 'critical' | 'low';
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
  items: OrderItem[];
}

export interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_users: number;
  total_revenue: number;
  pending_orders: number;
  delivered_orders: number;
  low_stock_count: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  category?: string;
  total_sold: number;
  total_revenue: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  order_count: number;
  units_sold: number;
  revenue: number;
}

export interface UserGrowthPoint {
  date: string;
  new_users: number;
}

export interface InventorySummary {
  total_products: number;
  total_stock_value: number;
  out_of_stock: number;
  low_stock: number;
  healthy_stock: number;
  by_category: { category: string; count: number; total_stock: number }[];
}

export interface AnalysisReport {
  generated_at: string;
  summary: {
    total_revenue: number;
    total_orders: number;
    total_users: number;
    total_products: number;
    low_stock_items: number;
  };
  top_products: TopProduct[];
  revenue_trend: RevenuePoint[];
  order_status_breakdown: OrderStatusCount[];
  insights: string[];
  recommendations: string[];
}

export interface SystemReport {
  total_api_calls: number;
  error_rate_percent: number;
  avg_response_ms: number;
  top_endpoints: { endpoint: string; calls: number }[];
  recent_errors: { endpoint: string; status: number; time: string }[];
  login_attempts_24h: number;
  recommendation_requests: number;
}

export interface BulkImportRow {
  name: string;
  price: number;
  stock: number;
  category?: string;
  row_index: number;
  errors: string[];
  is_valid: boolean;
}

export interface BulkImportResult {
  total: number;
  valid: number;
  invalid: number;
  imported: number;
  rows: BulkImportRow[];
}

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'analytics'
  | 'recommendations'
  | 'reports'
  | 'monitoring'
  | 'users';
