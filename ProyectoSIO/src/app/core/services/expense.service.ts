import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { Expense, ExpenseCategory, FinancialStats } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly STORAGE_KEY = 'business_expenses';
  private readonly CATEGORIES_KEY = 'expense_categories';
  
  private storageService = inject(StorageService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  
  private expensesSignal = signal<Expense[]>([]);
  private categoriesSignal = signal<ExpenseCategory[]>([]);

  // Computed values
  expenses = computed(() => this.expensesSignal());
  categories = computed(() => this.categoriesSignal());
  
  totalExpenses = computed(() => 
    this.expensesSignal()
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0)
  );
  
  pendingExpenses = computed(() => 
    this.expensesSignal().filter(e => e.status === 'pending')
  );
  
  financialStats = computed(() => this.calculateFinancialStats());

  constructor() {
    this.initializeCategories();
    this.loadExpenses();
  }

  private initializeCategories(): void {
    const defaultCategories: ExpenseCategory[] = [
      // Operacionales
      { id: '1', name: 'Alquiler/Renta', type: 'operational', icon: '🏢' },
      { id: '2', name: 'Servicios Públicos', type: 'operational', icon: '💡' },
      { id: '3', name: 'Salarios', type: 'operational', icon: '💰' },
      { id: '4', name: 'Marketing', type: 'operational', icon: '📢' },
      { id: '5', name: 'Transporte', type: 'operational', icon: '🚚' },
      { id: '6', name: 'Mantenimiento', type: 'operational', icon: '🔧' },
      { id: '7', name: 'Suministros de Oficina', type: 'operational', icon: '📎' },
      { id: '8', name: 'Telecomunicaciones', type: 'operational', icon: '📞' },
      // Productos
      { id: '9', name: 'Compra de Inventario', type: 'inventory', icon: '📦' },
      { id: '10', name: 'Materia Prima', type: 'product', icon: '🏭' },
      { id: '11', name: 'Empaque', type: 'product', icon: '📦' },
      // Otros
      { id: '12', name: 'Impuestos', type: 'other', icon: '🏛️' },
      { id: '13', name: 'Seguros', type: 'other', icon: '🛡️' },
      { id: '14', name: 'Capacitación', type: 'other', icon: '📚' },
      { id: '15', name: 'Otros', type: 'other', icon: '📋' },
    ];

    const stored = this.storageService.getLocal(this.CATEGORIES_KEY);
    this.categoriesSignal.set(stored || defaultCategories);
    
    if (!stored) {
      this.storageService.setLocal(this.CATEGORIES_KEY, defaultCategories);
    }
  }

  private loadExpenses(): void {
    const expenses = this.storageService.getLocal(this.STORAGE_KEY) || [];
    // Convertir strings de fecha a objetos Date
    const parsedExpenses = expenses.map((exp: Expense) => ({
      ...exp,
      date: new Date(exp.date)
    }));
    this.expensesSignal.set(parsedExpenses);
  }

  private saveExpenses(): void {
    this.storageService.setLocal(this.STORAGE_KEY, this.expensesSignal());
  }

  // CRUD Operations
  addExpense(expense: Omit<Expense, 'id'>): string {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      date: new Date(expense.date)
    };
    
    this.expensesSignal.update(expenses => [...expenses, newExpense]);
    this.saveExpenses();
    return newExpense.id;
  }

  updateExpense(id: string, updates: Partial<Expense>): void {
    this.expensesSignal.update(expenses =>
      expenses.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
    );
    this.saveExpenses();
  }

  deleteExpense(id: string): void {
    this.expensesSignal.update(expenses => 
      expenses.filter(exp => exp.id !== id)
    );
    this.saveExpenses();
  }

  getExpenseById(id: string): Expense | undefined {
    return this.expensesSignal().find(exp => exp.id === id);
  }

  getExpensesByCategory(category: string): Expense[] {
    return this.expensesSignal().filter(exp => exp.category === category);
  }

  getExpensesByPeriod(startDate: Date, endDate: Date): Expense[] {
    return this.expensesSignal().filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });
  }

  // Category management
  addCategory(category: Omit<ExpenseCategory, 'id'>): void {
    const newCategory: ExpenseCategory = {
      ...category,
      id: this.generateId()
    };
    this.categoriesSignal.update(cats => [...cats, newCategory]);
    this.storageService.setLocal(this.CATEGORIES_KEY, this.categoriesSignal());
  }

  // Financial calculations
  private calculateFinancialStats(): FinancialStats {
    const orders = this.orderService.orders();
    const products = this.productService.allProducts();
    const expenses = this.expensesSignal().filter(e => e.status === 'paid');
    
    // Calcular ingresos totales
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
    
    // Calcular gastos totales
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Ganancia neta
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Gastos por categoría
    const expensesByCategory = this.calculateExpensesByCategory(expenses);
    
    // Gastos e ingresos por período (últimos 6 meses)
    const { revenueByPeriod, expensesByPeriod } = this.calculateByPeriod(orders, expenses);
    
    // Productos más rentables
    const topProfitableProducts = this.calculateTopProfitableProducts(orders, products);
    
    // Promedios
    const productsWithCost = products.filter(p => p.cost && p.cost > 0);
    const averageProductCost = productsWithCost.length > 0
      ? productsWithCost.reduce((sum, p) => sum + (p.cost || 0), 0) / productsWithCost.length
      : 0;
    
    const averageProductProfit = productsWithCost.length > 0
      ? productsWithCost.reduce((sum, p) => sum + (p.price - (p.cost || 0)), 0) / productsWithCost.length
      : 0;
    
    // Generar alertas
    const alerts = this.generateAlerts(netProfit, profitMargin, expenses, totalRevenue);
    
    return {
      totalRevenue,
      revenueByPeriod,
      totalExpenses,
      expensesByCategory,
      expensesByPeriod,
      netProfit,
      profitMargin,
      averageProductCost,
      averageProductProfit,
      topProfitableProducts,
      alerts
    };
  }

  private calculateExpensesByCategory(expenses: Expense[]): { category: string; amount: number; percentage: number }[] {
    const categoryTotals = new Map<string, number>();
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    expenses.forEach(exp => {
      const current = categoryTotals.get(exp.category) || 0;
      categoryTotals.set(exp.category, current + exp.amount);
    });
    
    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateByPeriod(orders: any[], expenses: Expense[]): {
    revenueByPeriod: { period: string; amount: number }[];
    expensesByPeriod: { period: string; amount: number }[];
  } {
    const periods: string[] = [];
    const revenueMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();
    
    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      periods.push(period);
      revenueMap.set(period, 0);
      expenseMap.set(period, 0);
    }
    
    // Agrupar ingresos
    orders.filter(o => o.status === 'completed').forEach(order => {
      const date = new Date(order.date);
      const period = date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      if (revenueMap.has(period)) {
        revenueMap.set(period, revenueMap.get(period)! + order.total);
      }
    });
    
    // Agrupar gastos
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const period = date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      if (expenseMap.has(period)) {
        expenseMap.set(period, expenseMap.get(period)! + exp.amount);
      }
    });
    
    return {
      revenueByPeriod: periods.map(p => ({ period: p, amount: revenueMap.get(p) || 0 })),
      expensesByPeriod: periods.map(p => ({ period: p, amount: expenseMap.get(p) || 0 }))
    };
  }

  private calculateTopProfitableProducts(orders: any[], products: any[]): any[] {
    const productStats = new Map<string, {
      name: string;
      unitsSold: number;
      revenue: number;
      cost: number;
    }>();
    
    // Contar ventas por producto
    orders.filter(o => o.status === 'completed').forEach(order => {
      order.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.id);
        const current = productStats.get(item.id) || {
          name: item.name,
          unitsSold: 0,
          revenue: 0,
          cost: 0
        };
        
        current.unitsSold += item.quantity;
        current.revenue += item.price * item.quantity;
        
        if (product?.cost) {
          current.cost += product.cost * item.quantity;
        }
        
        productStats.set(item.id, current);
      });
    });
    
    // Calcular beneficios y ordenar
    return Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        name: stats.name,
        unitsSold: stats.unitsSold,
        revenue: stats.revenue,
        cost: stats.cost,
        profit: stats.revenue - stats.cost,
        margin: stats.revenue > 0 ? ((stats.revenue - stats.cost) / stats.revenue) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
  }

  private generateAlerts(
    netProfit: number, 
    profitMargin: number, 
    expenses: Expense[],
    totalRevenue: number
  ): { type: 'warning' | 'danger' | 'info'; message: string }[] {
    const alerts: { type: 'warning' | 'danger' | 'info'; message: string }[] = [];
    
    // Alerta de pérdidas
    if (netProfit < 0) {
      alerts.push({
        type: 'danger',
        message: `Pérdidas de ${this.formatCurrency(Math.abs(netProfit))}. Es urgente reducir gastos o aumentar ventas.`
      });
    }
    
    // Alerta de margen bajo
    if (profitMargin > 0 && profitMargin < 10) {
      alerts.push({
        type: 'warning',
        message: `Margen de ganancia bajo (${profitMargin.toFixed(1)}%). Considera optimizar costos.`
      });
    }
    
    // Gastos pendientes
    const pendingAmount = this.pendingExpenses().reduce((sum, e) => sum + e.amount, 0);
    if (pendingAmount > 0) {
      alerts.push({
        type: 'warning',
        message: `Tienes ${this.formatCurrency(pendingAmount)} en gastos pendientes de pago.`
      });
    }
    
    // Gastos altos en relación a ingresos
    if (totalRevenue > 0) {
      const expenseRatio = (expenses.reduce((sum, e) => sum + e.amount, 0) / totalRevenue) * 100;
      if (expenseRatio > 80) {
        alerts.push({
          type: 'danger',
          message: `Los gastos representan el ${expenseRatio.toFixed(0)}% de los ingresos. Margen muy ajustado.`
        });
      }
    }
    
    // Mensaje positivo
    if (profitMargin >= 20) {
      alerts.push({
        type: 'info',
        message: `¡Excelente! Tienes un margen de ganancia saludable del ${profitMargin.toFixed(1)}%.`
      });
    }
    
    return alerts;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Métodos de utilidad para reportes
  getMonthlyReport(year: number, month: number): {
    revenue: number;
    expenses: number;
    profit: number;
  } {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const monthExpenses = this.getExpensesByPeriod(startDate, endDate)
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const monthOrders = this.orderService.orders()
      .filter(o => {
        const orderDate = new Date(o.date);
        return o.status === 'completed' && 
               orderDate >= startDate && 
               orderDate <= endDate;
      });
    
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
    
    return {
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses
    };
  }

  clearAllExpenses(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todos los gastos? Esta acción no se puede deshacer.')) {
      this.expensesSignal.set([]);
      this.saveExpenses();
    }
  }
}
