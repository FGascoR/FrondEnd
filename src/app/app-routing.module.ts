import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { BibliotecaComponent } from './pages/biblioteca/biblioteca.component';
import { PanelAdminComponent } from './pages/panel-admin/panel-admin.component';
import { LibrosAdminComponent } from './pages/libros-admin/libros-admin.component';
import { ReservasAdminComponent } from './pages/reservas-admin/reservas-admin.component';
import { PrestamosAdminComponent } from './pages/prestamos-admin/prestamos-admin.component';
import { ReportesAdminComponent } from './pages/reportes-admin/reportes-admin.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'biblioteca', component: BibliotecaComponent },

  // 🔹 Rutas del panel con sus hijos
  {
    path: 'paneladmin',
    component: PanelAdminComponent,
    children: [
      { path: 'libros-admin', component: LibrosAdminComponent },
      { path: 'reservas-admin', component: ReservasAdminComponent },
      { path: 'prestamos-admin', component: PrestamosAdminComponent },
      { path: 'reportes-admin', component: ReportesAdminComponent },
      // { path: 'prestados', component: PrestadosComponent },
    ],
  },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
