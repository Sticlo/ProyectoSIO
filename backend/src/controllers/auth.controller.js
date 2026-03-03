const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

class AuthController {
  /**
   * Registro de nuevo usuario
   * Por defecto, todos los usuarios registrados son administradores
   */
  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validar campos requeridos
      if (!email || !password || !name) {
        return res.status(400).json({ 
          error: 'Email, contraseña y nombre son requeridos' 
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'El usuario ya existe' 
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario (todos son administradores)
      const newUser = await UserModel.create({
        email,
        password: hashedPassword,
        name,
        role: 'admin'
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  /**
   * Login de usuario
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Intento de login:', { email, passwordLength: password?.length });

      // Validar campos
      if (!email || !password) {
        console.log('❌ Campos faltantes');
        return res.status(400).json({ 
          error: 'Email y contraseña son requeridos' 
        });
      }

      // Buscar usuario
      const user = await UserModel.findByEmail(email);
      if (!user) {
        console.log('❌ Usuario no encontrado:', email);
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }
      
      console.log('✅ Usuario encontrado:', { id: user.id, email: user.email, role: user.role });

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔑 Contraseña válida:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Contraseña incorrecta para:', email);
        return res.status(401).json({ 
          error: 'Credenciales inválidas' 
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remover password del objeto usuario
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('✅ Login exitoso para:', email);

      res.json({
        message: 'Login exitoso',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(req, res) {
    try {
      const { name, email, password } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await UserModel.update(req.user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  }
}

module.exports = AuthController;
