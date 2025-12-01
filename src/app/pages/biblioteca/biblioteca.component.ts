import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../services/libro.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservaService } from '../../services/reserva.service';
import { PrestamoService } from '../../services/prestamo.service';
import { AuthService } from '../../auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.css'] 
})
export class BibliotecaComponent implements OnInit {

  isLoggedIn: boolean = false; 
  libros: any[] = [];
  page = 1;
  pageSize = 12;
  private currentFilters: any = {};

  libroSeleccionado: any = null;
  ejemplarSeleccionado: any = null;

  reservaForm: FormGroup;
  prestamoForm: FormGroup;
  toastMessage: string = '';
  confirmationToast: any;

  reservaModal: any;
  prestamoModal: any;
  seleccionModal: any;
  
  ejemplaresDelLibro: any[] = [];
  accionPendiente: string = '';

  misReservas: any[] = [];
  misPrestamos: any[] = [];
  isLoadingHistorial = false;

  isAdmin: boolean = false;

  constructor(
    private libroService: LibroService,
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private prestamoService: PrestamoService,
    private authService: AuthService
  ) {
    const today = new Date().toISOString().split('T')[0];

    this.reservaForm = this.fb.group({
      fechaReserva: [today, Validators.required], 
      fechaExpiracion: [today, Validators.required]
    });

    this.prestamoForm = this.fb.group({
      fechaPrestamo: [today, Validators.required],
      fechaDevolucion: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.cargarLibros();

    const toastEl = document.getElementById('confirmationToast');
    if (toastEl) this.confirmationToast = new bootstrap.Toast(toastEl);

    const reservaModalEl = document.getElementById('reservaModal');
    if (reservaModalEl) this.reservaModal = new bootstrap.Modal(reservaModalEl);

    const prestamoModalEl = document.getElementById('prestamoModal');
    if (prestamoModalEl) this.prestamoModal = new bootstrap.Modal(prestamoModalEl);

    const seleccionModalEl = document.getElementById('seleccionModal');
    if (seleccionModalEl) this.seleccionModal = new bootstrap.Modal(seleccionModalEl);
  }

  cargarLibros(filtros: any = {}) {
    this.currentFilters = filtros;

    this.libroService.getLibros(filtros).subscribe({
      next: (data) => {
        this.libros = data;
        this.page = 1;
      },
      error: (err) => {
        console.error('Error al cargar libros:', err);
      }
    });
  }

  verificarDisponibilidad(libro: any, accion: string) {
    this.libroSeleccionado = libro;
    this.accionPendiente = accion;

    this.ejemplaresDelLibro = libro.ejemplares ?? [];

    if (this.ejemplaresDelLibro.length > 1) {
      this.seleccionModal.show();
    } else if (this.ejemplaresDelLibro.length === 1) {
      const unico = this.ejemplaresDelLibro[0];
      if (unico.estado === 'Disponible') {
        this.seleccionarEjemplar(unico);
      } else {
        this.seleccionModal.show();
      }
    } else {
      alert('No hay ejemplares registrados para este libro.');
    }
  }

  seleccionarEjemplar(ejemplar: any) {
    this.ejemplarSeleccionado = ejemplar;
    if (this.seleccionModal) this.seleccionModal.hide();

    if (this.accionPendiente === 'reserva') {
      this.openReservaModal();
    } else if (this.accionPendiente === 'prestamo') {
      this.openPrestamoModal();
    }
  }

  openReservaModal() {
    const today = new Date().toISOString().split('T')[0];
    this.reservaForm.reset({
      fechaReserva: today,
      fechaExpiracion: today
    });
    this.reservaModal.show();
  }

  openPrestamoModal() {
    const today = new Date().toISOString().split('T')[0];
    this.prestamoForm.reset({
      fechaPrestamo: today,
      fechaDevolucion: ''
    });
    this.prestamoModal.show();
  }

  onReservarSubmit() {
    if (this.reservaForm.invalid || !this.ejemplarSeleccionado) return;

    const payload = {
      fechaReserva: this.reservaForm.value.fechaReserva, 
      fechaExpiracion: this.reservaForm.value.fechaExpiracion,
      ejemplar: {
        idEjemplar: this.ejemplarSeleccionado.idEjemplar 
      }
    };

    this.reservaService.createReserva(payload).subscribe({
      next: () => {
        this.reservaModal.hide();
        this.showToast('¡Reserva realizada con éxito!');
        this.cargarLibros(this.currentFilters);
      },
      error: (err) => {
        console.error('Error al reservar', err);
        const message = err.error?.message
          || (err.status === 403 ? 'No tienes permiso para realizar esta acción' : 'Error al procesar la reserva.');
        alert(message);
      }
    });
  }

  onPrestamoSubmit() {
    if (this.prestamoForm.invalid || !this.ejemplarSeleccionado) return;

    const payload = {
      fechaPrestamo: this.prestamoForm.value.fechaPrestamo,
      fechaDevolucion: this.prestamoForm.value.fechaDevolucion,
      ejemplar: {
        idEjemplar: this.ejemplarSeleccionado.idEjemplar
      }
    };

    this.prestamoService.createPrestamo(payload).subscribe({
      next: () => {
        this.prestamoModal.hide();
        this.showToast('¡Préstamo registrado con éxito!');
        this.cargarLibros(this.currentFilters);
      },
      error: (err) => {
        console.error('Error al prestar', err);
        alert(err.error?.message || 'Error al procesar el préstamo.');
      }
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.confirmationToast.show();
  }

  cargarHistorialUsuario() {
    this.isLoadingHistorial = true;
    this.misReservas = [];
    this.misPrestamos = [];

    this.reservaService.getMisReservas().subscribe({
      next: (data) => {
        this.misReservas = data;
        this.isLoadingHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar mis reservas', err);
        this.isLoadingHistorial = false;
      }
    });

    this.prestamoService.getMisPrestamos().subscribe({
      next: (data) => {
        this.misPrestamos = data;
      },
      error: (err) => console.error('Error al cargar mis préstamos', err)
    });
  }

  getDisponibilidadLibro(libro: any): string {
    if (!libro?.ejemplares?.length) return '';
    
    if (libro.ejemplares.length > 1) return '';
    
    return libro.ejemplares[0].estado;
  }

  getDisponibilidadClass(libro: any): string {
    const status = this.getDisponibilidadLibro(libro);
    switch (status) {
      case 'Disponible': return 'badge bg-success';
      case 'Reservado':  return 'badge bg-info text-dark';
      case 'Prestado':   return 'badge bg-warning text-dark';
      default: return 'd-none';
    }
  }

  getBadgeClassForModal(estado: string): string {
    switch (estado) {
      case 'Disponible': return 'badge bg-success rounded-pill';
      case 'Reservado': return 'badge bg-info text-dark rounded-pill';
      case 'Prestado': return 'badge bg-warning text-dark rounded-pill';
      case 'En reparación': return 'badge bg-danger rounded-pill';
      default: return 'badge bg-secondary rounded-pill';
    }
  }

  getAutor(libro: any): string {
    if (!libro?.autorLibros?.length) return 'Autor Desconocido';
    const autor = libro.autorLibros[0].autor;
    return `${autor.nombres} ${autor.apellidos}`;
  }

  get librosPaginados() {
    const start = (this.page - 1) * this.pageSize;
    return this.libros.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.libros.length / this.pageSize);
  }

  get paginas(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages()) {
      this.page = nuevaPagina;
    }
  }
}