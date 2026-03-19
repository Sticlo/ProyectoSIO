import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';

// Flag para evitar bucles infinitos de refresh
let isRefreshing = false;

/**
 * Auth Interceptor
 * - Agrega el token JWT a todas las peticiones
 * - Si recibe 401, intenta renovar el token automáticamente y reintenta
 * - Si el refresh falla, hace logout
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthEndpoint && !isRefreshing && authService.isAuthenticated()) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((refreshed) => {
            isRefreshing = false;
            if (refreshed) {
              // Reintentar la petición original con el nuevo token
              const newToken = authService.getToken()!;
              const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
              return next(retryReq);
            }
            // Refresh falló → logout
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      if (error.status === 403 && !isAuthEndpoint && authService.isAuthenticated()) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
