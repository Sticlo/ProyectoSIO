import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * AuthGuard
 * Protects routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // TODO: Implement actual authentication check
  // For now, always allow access
  const isAuthenticated = true;
  
  if (!isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};
