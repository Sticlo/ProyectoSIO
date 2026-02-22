import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/productos/productos').then(m => m.Productos)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./features/servicios/servicios').then(m => m.Servicios)
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./features/nosotros/nosotros').then(m => m.Nosotros)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contacto/contacto').then(m => m.Contacto)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
    canActivate: [adminGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound)
  }
];
