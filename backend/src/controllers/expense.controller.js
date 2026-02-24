const ExpenseModel = require('../models/expense.model');

class ExpenseController {
  /**
   * Obtener todos los gastos
   */
  static async getAll(req, res) {
    try {
      const { category, startDate, endDate } = req.query;
      
      let expenses;

      if (startDate && endDate) {
        expenses = await ExpenseModel.findByDateRange(startDate, endDate);
      } else if (category) {
        expenses = await ExpenseModel.findByCategory(category);
      } else {
        expenses = await ExpenseModel.getAll();
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
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const expense = await ExpenseModel.findById(id);

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
   * Recibe category_id (FK → categorias) y created_by del token
   */
  static async create(req, res) {
    try {
      const expenseData = req.body;

      // Validar campos requeridos
      if (!expenseData.description || !expenseData.amount) {
        return res.status(400).json({ 
          error: 'Descripción y monto son requeridos' 
        });
      }

      // Asignar usuario que crea el gasto (del token JWT)
      if (req.user && req.user.id) {
        expenseData.created_by = req.user.id;
      }

      const newExpense = await ExpenseModel.create(expenseData);

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
  static async update(req, res) {
    try {
      const { id } = req.params;
      const expenseData = req.body;

      const updatedExpense = await ExpenseModel.update(id, expenseData);

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
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ExpenseModel.delete(id);

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
  static async getTotalByCategory(req, res) {
    try {
      const totals = await ExpenseModel.getTotalByCategory();
      res.json({ totals });
    } catch (error) {
      console.error('Error al obtener totales:', error);
      res.status(500).json({ error: 'Error al obtener totales' });
    }
  }

  /**
   * Obtener total por período
   */
  static async getTotalByPeriod(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Fecha de inicio y fin son requeridas' 
        });
      }

      const total = await ExpenseModel.getTotalByPeriod(startDate, endDate);
      res.json({ total });
    } catch (error) {
      console.error('Error al obtener total:', error);
      res.status(500).json({ error: 'Error al obtener total' });
    }
  }
}

module.exports = ExpenseController;
