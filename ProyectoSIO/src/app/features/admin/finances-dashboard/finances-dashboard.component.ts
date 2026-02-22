import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { ReportService } from '../../../core/services/report.service';
import { Expense, ExpenseCategory } from '../../../core/models/expense.model';

@Component({
  selector: 'app-finances-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finances-dashboard.component.html',
  styleUrls: ['./finances-dashboard.component.scss']
})
export class FinancesDashboardComponent {
  private expenseService = inject(ExpenseService);
  private reportService = inject(ReportService);
  
  // State
  isOpen = signal(false);
  activeTab = signal<'overview' | 'expenses' | 'add-expense'>('overview');
  filterCategory = signal<string>('all');
  filterStatus = signal<'all' | Expense['status']>('all');
  filterPeriod = signal<'all' | 'month' | 'week'>('month');
  
  // Form state
  expenseForm = signal<Partial<Expense>>({
    type: 'operational',
    category: '',
    description: '',
    amount: 0,
    date: new Date(),
    status: 'paid',
    notes: ''
  });
  
  // Data from service
  stats = this.expenseService.financialStats;
  expenses = this.expenseService.expenses;
  categories = this.expenseService.categories;
  
  // Filtered expenses
  filteredExpenses = computed(() => {
    let filtered = this.expenses();
    
    // Filter by category
    const category = this.filterCategory();
    if (category !== 'all') {
      filtered = filtered.filter(e => e.category === category);
    }
    
    // Filter by status
    const status = this.filterStatus();
    if (status !== 'all') {
      filtered = filtered.filter(e => e.status === status);
    }
    
    // Filter by period
    const period = this.filterPeriod();
    if (period !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(e => new Date(e.date) >= startDate);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  // Categories by type
  categoriesByType = computed(() => {
    const selected = this.expenseForm().type || 'operational';
    return this.categories().filter(c => c.type === selected);
  });
  
  open(): void {
    this.isOpen.set(true);
  }
  
  close(): void {
    this.isOpen.set(false);
    this.activeTab.set('overview');
  }
  
  setTab(tab: 'overview' | 'expenses' | 'add-expense'): void {
    this.activeTab.set(tab);
  }
  
  submitExpense(): void {
    const form = this.expenseForm();
    
    if (!form.category || !form.description || !form.amount || form.amount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    // Get category name
    const category = this.categories().find(c => c.id === form.category);
    
    this.expenseService.addExpense({
      type: form.type as any,
      category: category?.name || form.category,
      description: form.description,
      amount: form.amount,
      date: form.date || new Date(),
      status: form.status as any,
      notes: form.notes,
      productId: form.productId,
      productName: form.productName,
      quantity: form.quantity
    });
    
    // Reset form
    this.expenseForm.set({
      type: 'operational',
      category: '',
      description: '',
      amount: 0,
      date: new Date(),
      status: 'paid',
      notes: ''
    });
    
    this.activeTab.set('expenses');
  }
  
  deleteExpense(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      this.expenseService.deleteExpense(id);
    }
  }
  
  updateExpenseStatus(id: string, status: Expense['status']): void {
    this.expenseService.updateExpense(id, { status });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  formatPercent(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }
  
  getStatusColor(status: Expense['status']): string {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
  
  getStatusLabel(status: Expense['status']): string {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }
  
  getAlertClass(type: 'warning' | 'danger' | 'info'): string {
    return `alert-${type}`;
  }
  
  updateFormType(type: string): void {
    this.expenseForm.set({
      ...this.expenseForm(),
      type: type as any,
      category: ''
    });
  }
  
  updateFormCategory(category: string): void {
    this.expenseForm.set({
      ...this.expenseForm(),
      category
    });
  }
  
  updateFormDescription(description: string): void {
    this.expenseForm.set({
      ...this.expenseForm(),
      description
    });
  }
  
  updateFormAmount(amount: string): void {
    this.expenseForm.set({
      ...this.expenseForm(),
      amount: Number(amount)
    });
  }
  
  updateFormDate(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.expenseForm.set({
      ...this.expenseForm(),
      date: new Date(value)
    });
  }
  
  updateFormStatus(status: string): void {
    this.expenseForm.set({
      ...this.expenseForm(),
      status: status as any
    });
  }
  
  updateFormNotes(notes: string): void {
    this.expenseForm.set({
      ...this.expenseForm(),
      notes
    });
  }
  
  getFormDateValue(): string {
    const date = this.expenseForm().date;
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
  
  downloadReport(): void {
    this.reportService.generateFinancialReport();
  }
  
  downloadCompleteReport(): void {
    this.reportService.generateCompleteReport();
  }
}
