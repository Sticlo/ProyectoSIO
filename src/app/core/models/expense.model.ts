export interface Expense {
  id: string;
  type: 'operational' | 'product' | 'inventory' | 'other';
  category: string;
  description: string;
  amount: number;
  date: Date;
  productId?: string; // Si el gasto está asociado a un producto específico
  productName?: string;
  quantity?: number; // Para gastos de inventario
  notes?: string;
  status: 'paid' | 'pending' | 'cancelled';
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'operational' | 'product' | 'inventory' | 'other';
  icon?: string;
}

export interface FinancialStats {
  // Ingresos
  totalRevenue: number;
  revenueByPeriod: { period: string; amount: number }[];
  
  // Gastos
  totalExpenses: number;
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  expensesByPeriod: { period: string; amount: number }[];
  
  // Rentabilidad
  netProfit: number;
  profitMargin: number; // Porcentaje
  averageProductCost: number;
  averageProductProfit: number;
  
  // Productos más rentables
  topProfitableProducts: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }[];
  
  // Alertas
  alerts: {
    type: 'warning' | 'danger' | 'info';
    message: string;
  }[];
}
