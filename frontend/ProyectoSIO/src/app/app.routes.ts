import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
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
    loadComponent: () => import('./features/about/about').then(m => m.About)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then(m => m.About)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing').then(m => m.Pricing)
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq').then(m => m.FAQ)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio').then(m => m.Portfolio)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contacto/contacto').then(m => m.Contacto)
  },
  {
    path: 'testimonios',
    loadComponent: () => import('./features/testimonios/testimonios').then(m => m.Testimonios)
  },
  {
    path: 'terminos',
    loadComponent: () => import('./features/terminos/terminos').then(m => m.Terminos)
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./features/privacidad/privacidad').then(m => m.Privacidad)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
    canActivate: [adminGuard]
  },
  {
    path: 'mesa/:mesaId',
    loadComponent: () => import('./features/mesa/mesa').then(m => m.MesaComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound)
  }
];
