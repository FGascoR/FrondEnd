import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app-routing.module'; 
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { AuthInterceptor } from './auth.interceptor';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FiltrosComponent } from './components/filtros/filtros.component';
import { LibrosComponent } from './components/libros/libros.component';
import { FooterComponent } from './components/footer/footer.component';
import { BibliotecaComponent } from './pages/biblioteca/biblioteca.component';
import { HeaderComponent } from './components-admin/header/header.component';
import { SidebarComponent } from './components-admin/sidebar/sidebar.component';
import { BookCardComponent } from './components-admin/book-card/book-card.component';
import { PanelAdminComponent } from './pages/panel-admin/panel-admin.component';
import { LibrosAdminComponent } from './pages/libros-admin/libros-admin.component';
import { ReservasAdminComponent } from './pages/reservas-admin/reservas-admin.component';
import { PrestamosAdminComponent } from './pages/prestamos-admin/prestamos-admin.component';
import { ReportesAdminComponent } from './pages/reportes-admin/reportes-admin.component';
import { InicioAdminComponent } from './pages/inicio-admin/inicio-admin.component'; 
import { PenalidadesAdminComponent } from './pages/penalidades-admin/penalidades-admin.component'; 

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    FiltrosComponent,
    LibrosComponent,
    FooterComponent,
    BibliotecaComponent,
    HeaderComponent,
    SidebarComponent,
    BookCardComponent,
    PanelAdminComponent,
    LibrosAdminComponent,
    ReservasAdminComponent,
    PrestamosAdminComponent,
    ReportesAdminComponent,
    InicioAdminComponent,
    PenalidadesAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    ReactiveFormsModule, 
    FormsModule, 
    HttpClientModule
  ],
  providers: [{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }