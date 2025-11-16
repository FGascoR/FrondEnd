import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ importa esto
import { AppRoutingModule } from './app-routing.module'; // si usas rutas
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
import { InicioAdminComponent } from './pages/inicio-admin/inicio-admin.component'; // ✅ importa tu componente

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
    InicioAdminComponent // ✅ decláralo aquí
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // si tienes rutas
    ReactiveFormsModule // ✅ agrégalo aquí
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
