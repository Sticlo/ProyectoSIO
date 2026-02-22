// Almacenamiento en memoria para usuarios (simulación de BD)
let users = [
  {
    id: '1',
    email: 'admin@tienda.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

class UserModel {
  /**
   * Obtener todos los usuarios
   */
  static getAll() {
    return users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
  }

  /**
   * Buscar usuario por ID
   */
  static findById(id) {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Buscar usuario por email (incluye password para autenticación)
   */
  static findByEmail(email) {
    return users.find(u => u.email === email);
  }

  /**
   * Crear nuevo usuario
   */
  static create(userData) {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Actualizar usuario
   */
  static update(id, userData) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date()
    };
    
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }

  /**
   * Eliminar usuario
   */
  static delete(id) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }
}

module.exports = UserModel;
