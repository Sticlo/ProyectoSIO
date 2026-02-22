// Almacenamiento en memoria para órdenes
let orders = [];

class OrderModel {
  /**
   * Obtener todas las órdenes
   */
  static getAll() {
    return orders.sort((a, b) => b.date - a.date);
  }

  /**
   * Buscar orden por ID
   */
  static findById(id) {
    return orders.find(o => o.id === id);
  }

  /**
   * Buscar órdenes por estado
   */
  static findByStatus(status) {
    return orders.filter(o => o.status === status);
  }

  /**
   * Buscar órdenes por número de teléfono
   */
  static findByPhone(phoneNumber) {
    return orders.filter(o => o.phoneNumber === phoneNumber);
  }

  /**
   * Crear nueva orden
   */
  static create(orderData) {
    const newOrder = {
      id: Date.now().toString(),
      ...orderData,
      date: new Date(),
      status: orderData.status || 'pending',
      viewed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    orders.push(newOrder);
    return newOrder;
  }

  /**
   * Actualizar orden
   */
  static update(id, orderData) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    orders[index] = {
      ...orders[index],
      ...orderData,
      updatedAt: new Date()
    };
    
    return orders[index];
  }

  /**
   * Actualizar estado de la orden
   */
  static updateStatus(id, status) {
    return this.update(id, { status });
  }

  /**
   * Marcar orden como vista
   */
  static markAsViewed(id) {
    return this.update(id, { viewed: true });
  }

  /**
   * Eliminar orden
   */
  static delete(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return false;
    orders.splice(index, 1);
    return true;
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static getStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
    
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    
    // Clientes únicos
    const uniquePhones = new Set(orders.map(o => o.phoneNumber));
    const uniqueCustomers = uniquePhones.size;
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      uniqueCustomers
    };
  }
}

module.exports = OrderModel;
