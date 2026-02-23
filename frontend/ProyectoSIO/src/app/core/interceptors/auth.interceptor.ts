import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor
 * Agrega el header de autenticación a las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.user();
  
  // Si el usuario está autenticado, agregar header de autorización
  if (user) {
    // Crear un token simple basado en el email del usuario
    // En producción, esto debería ser un JWT real del backend
    const token = btoa(`${user.email}:${user.id}:${user.role}`);
    
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedRequest);
  }
  
  return next(req);
};
