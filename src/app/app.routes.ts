import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { AdminGuard } from './core/guards/admin-guard';
import { EmployeGuard } from './core/guards/employe-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },


  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout')
      .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./admin/clients/clients')
          .then(m => m.ClientsComponent)
      },
      {
        path: 'comptes',
        loadComponent: () => import('./admin/comptes/comptes')
          .then(m => m.ComptesComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'employe',
    canActivate: [AuthGuard, EmployeGuard],
    loadComponent: () => import('./employe/employe-layout/employe-layout')
      .then(m => m.EmployeLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./employe/dashboard/dashboard')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'gestion-clients',
        loadComponent: () => import('./employe/gestion-clients/gestion-clients')
          .then(m => m.GestionClientsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'gestion-comptes',
        loadComponent: () => import('./employe/gestion-comptes/gestion-comptes').then(m => m.GestionComptesComponent)
      },
      {
        path: 'gestion-operations',
        loadComponent: () => import('./employe/gestion-operations/gestion-operations').then(m => m.GestionOperationsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
