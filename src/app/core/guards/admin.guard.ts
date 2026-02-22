import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * AdminGuard
 * Protects routes that require admin role
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  
  if (!authService.hasRole(UserRole.ADMIN)) {
    router.navigate(['/productos']);
    return false;
  }
  
  return true;
};
