const ExpenseModel = require('../models/expense.model');

class ExpenseController {
  /**
   * Obtener todos los gastos
   */
  static getAll(req, res) {
    try {
      const { category, startDate, endDate } = req.query;
      
      let expenses;

      if (startDate && endDate) {
        expenses = ExpenseModel.findByDateRange(startDate, endDate);
      } else if (category) {
        expenses = ExpenseModel.findByCategory(category);
      } else {
        expenses = ExpenseModel.getAll();
      }

      res.json({ 
        count: expenses.length,
        expenses 
      });
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      res.status(500).json({ error: 'Error al obtener gastos' });
    }
  }

  /**
   * Obtener gasto por ID
   */
  static getById(req, res) {
    try {
      const { id } = req.params;
      const expense = ExpenseModel.findById(id);

      if (!expense) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
      }

      res.json({ expense });
    } catch (error) {
      console.error('Error al obtener gasto:', error);
      res.status(500).json({ error: 'Error al obtener gasto' });
    }
  }

  /**
   * Crear nuevo gasto
   */
  static create(req, res) {
    try {
      const expenseData = req.body;

      // Validar campos requeridos
      if (!expenseData.description || !expenseData.amount || !expenseData.category) {
        return res.status(400).json({ 
          error: 'Descripción, monto y categoría son requeridos' 
        });
      }

      const newExpense = ExpenseModel.create(expenseData);

      res.status(201).json({
        message: 'Gasto creado exitosamente',
        expense: newExpense
      });
    } catch (error) {
      console.error('Error al crear gasto:', error);
      res.status(500).json({ error: 'Error al crear gasto' });
    }
  }

  /**
   * Actualizar gasto
   */
  static update(req, res) {
    try {
      const { id } = req.params;
      const expenseData = req.body;

      const updatedExpense = ExpenseModel.update(id, expenseData);

      if (!updatedExpense) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
      }

      res.json({
        message: 'Gasto actualizado exitosamente',
        expense: updatedExpense
      });
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      res.status(500).json({ error: 'Error al actualizar gasto' });
    }
  }

  /**
   * Eliminar gasto
   */
  static delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = ExpenseModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
      }

      res.json({ message: 'Gasto eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      res.status(500).json({ error: 'Error al eliminar gasto' });
    }
  }

  /**
   * Obtener totales por categoría
   */
  static getTotalByCategory(req, res) {
    try {
      const totals = ExpenseModel.getTotalByCategory();
      res.json({ totals });
    } catch (error) {
      console.error('Error al obtener totales:', error);
      res.status(500).json({ error: 'Error al obtener totales' });
    }
  }

  /**
   * Obtener total por período
   */
  static getTotalByPeriod(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Fecha de inicio y fin son requeridas' 
        });
      }

      const total = ExpenseModel.getTotalByPeriod(startDate, endDate);
      res.json({ total });
    } catch (error) {
      console.error('Error al obtener total:', error);
      res.status(500).json({ error: 'Error al obtener total' });
    }
  }
}

module.exports = ExpenseController;
