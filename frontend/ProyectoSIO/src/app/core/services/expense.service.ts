import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { ApiService } from './api.service';
import { Expense, ExpenseCategory, FinancialStats } from '../models/expense.model';

//  Mapper: respuesta API  Expense del frontend 
function fromApi(raw: any): Expense {
  return {
    id: String(raw.id),
    type: (raw.type || 'operational') as Expense['type'],
    category: raw.category_name || raw.category || '',
    description: raw.description || '',
    amount: Number(raw.amount),
    date: new Date(raw.date || raw.created_at),
    productId: raw.product_id ? String(raw.product_id) : undefined,
    productName: raw.product_name || undefined,
    quantity: raw.quantity ?? undefined,
    notes: raw.notes || undefined,
    status: (raw.status || 'paid') as Expense['status']
  };
}

//  Mapper: Expense del frontend  payload para la API 
function toApi(e: Omit<Expense, 'id'>): Record<string, unknown> {
  const date = new Date(e.date);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return {
    description: e.description,
    amount: e.amount,
    category_name: e.category,
    type: e.type,
    status: e.status,
    product_name: e.productName || null,
    quantity: e.quantity || null,
    date: `${yyyy}-${mm}-${dd}`,
    notes: e.notes || null
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private api = inject(ApiService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  private _expenses = signal<Expense[]>([]);
  readonly isLoading = signal(false);

  expenses = computed(() => this._expenses());

  private _categories = signal<ExpenseCategory[]>([
    { id: '1',  name: 'Alquiler/Renta',        type: 'operational', icon: '' },
    { id: '2',  name: 'Servicios Públicos',     type: 'operational', icon: '' },
    { id: '3',  name: 'Salarios',               type: 'operational', icon: '' },
    { id: '4',  name: 'Marketing',              type: 'operational', icon: '' },
    { id: '5',  name: 'Transporte',             type: 'operational', icon: '' },
    { id: '6',  name: 'Mantenimiento',          type: 'operational', icon: '' },
    { id: '7',  name: 'Suministros de Oficina', type: 'operational', icon: '' },
    { id: '8',  name: 'Telecomunicaciones',     type: 'operational', icon: '' },
    { id: '9',  name: 'Compra de Inventario',   type: 'inventory',   icon: '' },
    { id: '10', name: 'Materia Prima',          type: 'product',     icon: '' },
    { id: '11', name: 'Empaque',                type: 'product',     icon: '' },
    { id: '12', name: 'Impuestos',              type: 'other',       icon: '' },
    { id: '13', name: 'Seguros',                type: 'other',       icon: '' },
    { id: '14', name: 'Capacitación',           type: 'other',       icon: '' },
    { id: '15', name: 'Otros',                  type: 'other',       icon: '' },
  ]);

  categories = computed(() => this._categories());

  totalExpenses = computed(() =>
    this._expenses().filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
  );

  pendingExpenses = computed(() => this._expenses().filter(e => e.status === 'pending'));

  financialStats = computed(() => this.calculateFinancialStats());

  constructor() {
    this.loadExpenses();
  }

  //  Cargar desde API 

  loadExpenses(): void {
    this.isLoading.set(true);
    this.api.get<{ count: number; expenses: any[] }>('/expenses').subscribe({
      next: res => {
        this._expenses.set(res.expenses.map(fromApi));
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Error al cargar gastos:', err);
        this.isLoading.set(false);
      }
    });
  }

  //  CRUD 

  addExpense(expense: Omit<Expense, 'id'>): Observable<Expense> {
    return this.api.post<{ expense: any }>('/expenses', toApi(expense)).pipe(
      map(res => fromApi(res.expense)),
      tap(created => this._expenses.update(list => [created, ...list]))
    );
  }

  updateExpense(id: string, updates: Partial<Expense>): Observable<Expense> {
    const payload: Record<string, unknown> = {};
    if (updates.description !== undefined) payload['description']   = updates.description;
    if (updates.amount      !== undefined) payload['amount']        = updates.amount;
    if (updates.category    !== undefined) payload['category_name'] = updates.category;
    if (updates.type        !== undefined) payload['type']          = updates.type;
    if (updates.status      !== undefined) payload['status']        = updates.status;
    if (updates.notes       !== undefined) payload['notes']         = updates.notes;
    if (updates.productName !== undefined) payload['product_name']  = updates.productName;
    if (updates.quantity    !== undefined) payload['quantity']      = updates.quantity;
    if (updates.date !== undefined) {
      const d = new Date(updates.date);
      payload['date'] = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    return this.api.put<{ expense: any }>(`/expenses/${id}`, payload).pipe(
      map(res => fromApi(res.expense)),
      tap(updated => this._expenses.update(list => list.map(e => e.id === id ? updated : e)))
    );
  }

  deleteExpense(id: string): Observable<void> {
    return this.api.delete<void>(`/expenses/${id}`).pipe(
      tap(() => this._expenses.update(list => list.filter(e => e.id !== id)))
    );
  }

  //  Lectura local 

  getExpenseById(id: string): Expense | undefined {
    return this._expenses().find(e => e.id === id);
  }

  getExpensesByCategory(category: string): Expense[] {
    return this._expenses().filter(e => e.category === category);
  }

  getExpensesByPeriod(startDate: Date, endDate: Date): Expense[] {
    return this._expenses().filter(e => {
      const d = new Date(e.date);
      return d >= startDate && d <= endDate;
    });
  }

  addCategory(category: Omit<ExpenseCategory, 'id'>): void {
    this._categories.update(list => [...list, { ...category, id: Date.now().toString(36) }]);
  }

  getMonthlyReport(year: number, month: number): { revenue: number; expenses: number; profit: number } {
    const startDate = new Date(year, month, 1);
    const endDate   = new Date(year, month + 1, 0);
    const monthExpenses = this.getExpensesByPeriod(startDate, endDate)
      .filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const monthRevenue = this.orderService.orders()
      .filter(o => { const d = new Date(o.date); return o.status === 'completed' && d >= startDate && d <= endDate; })
      .reduce((sum, o) => sum + o.total, 0);
    return { revenue: monthRevenue, expenses: monthExpenses, profit: monthRevenue - monthExpenses };
  }

  //  Cálculos financieros 

  private calculateFinancialStats(): FinancialStats {
    const orders   = this.orderService.orders();
    const products = this.productService.allProducts();
    const expenses = this._expenses().filter(e => e.status === 'paid');

    const totalRevenue  = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit     = totalRevenue - totalExpenses;
    const profitMargin  = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const expensesByCategory   = this.calcExpensesByCategory(expenses);
    const { revenueByPeriod, expensesByPeriod } = this.calcByPeriod(orders, expenses);
    const topProfitableProducts = this.calcTopProducts(orders, products);

    const productsWithCost  = products.filter(p => p.cost && p.cost > 0);
    const averageProductCost   = productsWithCost.length ? productsWithCost.reduce((s, p) => s + (p.cost || 0), 0) / productsWithCost.length : 0;
    const averageProductProfit = productsWithCost.length ? productsWithCost.reduce((s, p) => s + (p.price - (p.cost || 0)), 0) / productsWithCost.length : 0;
    const alerts = this.generateAlerts(netProfit, profitMargin, expenses, totalRevenue);

    return { totalRevenue, revenueByPeriod, totalExpenses, expensesByCategory, expensesByPeriod, netProfit, profitMargin, averageProductCost, averageProductProfit, topProfitableProducts, alerts };
  }

  private calcExpensesByCategory(expenses: Expense[]): { category: string; amount: number; percentage: number }[] {
    const map = new Map<string, number>();
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    expenses.forEach(e => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount, percentage: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calcByPeriod(orders: any[], expenses: Expense[]): { revenueByPeriod: { period: string; amount: number }[]; expensesByPeriod: { period: string; amount: number }[] } {
    const periods: string[] = [];
    const rMap = new Map<string, number>();
    const eMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const p = d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      periods.push(p); rMap.set(p, 0); eMap.set(p, 0);
    }
    orders.filter(o => o.status === 'completed').forEach(o => {
      const p = new Date(o.date).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      if (rMap.has(p)) rMap.set(p, rMap.get(p)! + o.total);
    });
    expenses.forEach(e => {
      const p = new Date(e.date).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
      if (eMap.has(p)) eMap.set(p, eMap.get(p)! + e.amount);
    });
    return { revenueByPeriod: periods.map(p => ({ period: p, amount: rMap.get(p) || 0 })), expensesByPeriod: periods.map(p => ({ period: p, amount: eMap.get(p) || 0 })) };
  }

  private calcTopProducts(orders: any[], products: any[]): any[] {
    const stats = new Map<string, { name: string; unitsSold: number; revenue: number; cost: number }>();
    orders.filter(o => o.status === 'completed').forEach(o =>
      o.items.forEach((item: any) => {
        const product = products.find((p: any) => p.id === item.id);
        const cur = stats.get(item.id) || { name: item.name, unitsSold: 0, revenue: 0, cost: 0 };
        cur.unitsSold += item.quantity; cur.revenue += item.price * item.quantity;
        if (product?.cost) cur.cost += product.cost * item.quantity;
        stats.set(item.id, cur);
      })
    );
    return Array.from(stats.entries())
      .map(([productId, s]) => ({ productId, name: s.name, unitsSold: s.unitsSold, revenue: s.revenue, cost: s.cost, profit: s.revenue - s.cost, margin: s.revenue > 0 ? ((s.revenue - s.cost) / s.revenue) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit).slice(0, 10);
  }

  private generateAlerts(netProfit: number, profitMargin: number, expenses: Expense[], totalRevenue: number): { type: 'warning' | 'danger' | 'info'; message: string }[] {
    const alerts: { type: 'warning' | 'danger' | 'info'; message: string }[] = [];
    if (netProfit < 0) alerts.push({ type: 'danger', message: `Pérdidas de ${this.fmt(Math.abs(netProfit))}. Es urgente reducir gastos o aumentar ventas.` });
    if (profitMargin > 0 && profitMargin < 10) alerts.push({ type: 'warning', message: `Margen de ganancia bajo (${profitMargin.toFixed(1)}%). Considera optimizar costos.` });
    const pendingAmt = this.pendingExpenses().reduce((s, e) => s + e.amount, 0);
    if (pendingAmt > 0) alerts.push({ type: 'warning', message: `Tienes ${this.fmt(pendingAmt)} en gastos pendientes de pago.` });
    if (totalRevenue > 0) {
      const ratio = (expenses.reduce((s, e) => s + e.amount, 0) / totalRevenue) * 100;
      if (ratio > 80) alerts.push({ type: 'danger', message: `Los gastos representan el ${ratio.toFixed(0)}% de los ingresos. Margen muy ajustado.` });
    }
    if (profitMargin >= 20) alerts.push({ type: 'info', message: `¡Excelente! Tienes un margen de ganancia saludable del ${profitMargin.toFixed(1)}%.` });
    return alerts;
  }

  private fmt(amount: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  }
}
