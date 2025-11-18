import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { BibliotecaComponent } from './pages/biblioteca/biblioteca.component';
import { PanelAdminComponent } from './pages/panel-admin/panel-admin.component';
import { LibrosAdminComponent } from './pages/libros-admin/libros-admin.component';
import { ReservasAdminComponent } from './pages/reservas-admin/reservas-admin.component';
import { PrestamosAdminComponent } from './pages/prestamos-admin/prestamos-admin.component';
import { ReportesAdminComponent } from './pages/reportes-admin/reportes-admin.component';
import { PenalidadesAdminComponent } from './pages/penalidades-admin/penalidades-admin.component'; 
import { InicioAdminComponent } from './pages/inicio-admin/inicio-admin.component';
import { AdminGuard } from './admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'biblioteca', component: BibliotecaComponent }, 

  {
    path: 'paneladmin',
    component: PanelAdminComponent,
    canActivate: [AdminGuard], 
    children: [
      { path: 'libros-admin', component: LibrosAdminComponent },
      { path: 'inicio', component: InicioAdminComponent },
      { path: 'reservas-admin', component: ReservasAdminComponent },
      { path: 'prestamos-admin', component: PrestamosAdminComponent },
      { path: 'reportes-admin', component: ReportesAdminComponent },
      { path: 'penalidades', component: PenalidadesAdminComponent } 
    ],
  },

  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}