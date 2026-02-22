// Almacenamiento en memoria para gastos
let expenses = [];

class ExpenseModel {
  /**
   * Obtener todos los gastos
   */
  static getAll() {
    return expenses.sort((a, b) => b.date - a.date);
  }

  /**
   * Buscar gasto por ID
   */
  static findById(id) {
    return expenses.find(e => e.id === id);
  }

  /**
   * Buscar gastos por categoría
   */
  static findByCategory(category) {
    return expenses.filter(e => e.category === category);
  }

  /**
   * Buscar gastos por rango de fechas
   */
  static findByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  /**
   * Crear nuevo gasto
   */
  static create(expenseData) {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      date: expenseData.date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    expenses.push(newExpense);
    return newExpense;
  }

  /**
   * Actualizar gasto
   */
  static update(id, expenseData) {
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    expenses[index] = {
      ...expenses[index],
      ...expenseData,
      updatedAt: new Date()
    };
    
    return expenses[index];
  }

  /**
   * Eliminar gasto
   */
  static delete(id) {
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return false;
    expenses.splice(index, 1);
    return true;
  }

  /**
   * Obtener total de gastos por categoría
   */
  static getTotalByCategory() {
    const totals = {};
    expenses.forEach(e => {
      if (!totals[e.category]) {
        totals[e.category] = 0;
      }
      totals[e.category] += e.amount;
    });
    return totals;
  }

  /**
   * Obtener total de gastos en un período
   */
  static getTotalByPeriod(startDate, endDate) {
    const expensesInPeriod = this.findByDateRange(startDate, endDate);
    return expensesInPeriod.reduce((sum, e) => sum + e.amount, 0);
  }
}

module.exports = ExpenseModel;
