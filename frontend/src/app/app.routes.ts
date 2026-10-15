import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const routes: Routes = [
  { path: '', component: Dashboard },
  {
    path: 'admin/mock-machine-reading',
    loadComponent: () => import('./mock-machine').then((m) => m.MockMachine),
    title: 'Mock machine',
  },
  { path: '**', redirectTo: '' },
];
