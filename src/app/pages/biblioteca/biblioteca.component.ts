import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../services/libro.service'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { ReservaService } from '../../services/reserva.service'; 
import { PrestamoService } from '../../services/prestamo.service'; 

declare var bootstrap: any;

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.component.html',
})
export class BibliotecaComponent implements OnInit {

  libros: any[] = []; 
  page = 1;
  pageSize = 12; 
  private currentFilters: any = {};

  libroSeleccionado: any = null;
  reservaForm: FormGroup;
  prestamoForm: FormGroup;
  toastMessage: string = '';
  confirmationToast: any;
  reservaModal: any;
  prestamoModal: any;

  misReservas: any[] = [];
  misPrestamos: any[] = [];
  isLoadingHistorial = false;


  constructor(
    private libroService: LibroService,
    private fb: FormBuilder, 
    private reservaService: ReservaService, 
    private prestamoService: PrestamoService 
  ) {
    const today = new Date().toISOString().split('T')[0]; 

    this.reservaForm = this.fb.group({
      fechaExpiracion: [today, Validators.required]
    });

    this.prestamoForm = this.fb.group({
      fechaPrestamo: [today, Validators.required],
      fechaDevolucion: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarLibros(); 

    const toastEl = document.getElementById('confirmationToast');
    if (toastEl) this.confirmationToast = new bootstrap.Toast(toastEl);
    
    const reservaModalEl = document.getElementById('reservaModal');
    if (reservaModalEl) this.reservaModal = new bootstrap.Modal(reservaModalEl);

    const prestamoModalEl = document.getElementById('prestamoModal');
    if (prestamoModalEl) this.prestamoModal = new bootstrap.Modal(prestamoModalEl);
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
        alert('Error al cargar los libros.');
      }
    });
  }
  
  handleUniversalSearch(searchTerm: string) {
    let universalFilters: any = {};
    if (searchTerm && searchTerm.trim().length > 0) {
      universalFilters = {
        titulo: searchTerm,
        autor: 'UNIVERSAL_SEARCH_FLAG' 
      };
    } else {
        universalFilters = this.currentFilters; 
    }
    
    this.libroService.getLibros(universalFilters).subscribe({
        next: (data) => {
            this.libros = data;
            this.page = 1;
        },
        error: (err) => console.error('Error en búsqueda universal', err)
    });
  }

  openReservaModal(libro: any) {
    this.libroSeleccionado = libro;
    this.reservaForm.reset({
      fechaExpiracion: new Date().toISOString().split('T')[0]
    });
    this.reservaModal.show();
  }

  openPrestamoModal(libro: any) {
    this.libroSeleccionado = libro;
    this.prestamoForm.reset({
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion: ''
    });
    this.prestamoModal.show();
  }

  onReservarSubmit() {
    if (this.reservaForm.invalid || !this.libroSeleccionado) return;

    const payload = {
      fechaExpiracion: this.reservaForm.value.fechaExpiracion,
      ejemplar: {
        libro: this.libroSeleccionado 
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
                      || (err.status === 403 ? 'No tienes permiso para realizar esta acción' : 'Error al procesar la reserva. ¿No hay ejemplares disponibles?');
        
        alert(message);
      }
    });
  }

  onPrestamoSubmit() {
    if (this.prestamoForm.invalid || !this.libroSeleccionado) return;

    const payload = {
      fechaPrestamo: this.prestamoForm.value.fechaPrestamo,
      fechaDevolucion: this.prestamoForm.value.fechaDevolucion,
      ejemplar: {
        libro: this.libroSeleccionado
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
        alert(err.error.message || 'Error al procesar el préstamo. ¿No hay ejemplares disponibles?');
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
    if (!libro || !libro.ejemplares || libro.ejemplares.length === 0) {
      return ''; 
    }
    
    const hayReservados = libro.ejemplares.some((ej: any) => ej.estado === 'Reservado');
    if (hayReservados) {
      return 'Reservado';
    }

    const hayPrestados = libro.ejemplares.some((ej: any) => ej.estado === 'Prestado');
    if (hayPrestados) {
      return 'Prestado';
    }

    const hayDisponibles = libro.ejemplares.some((ej: any) => ej.estado === 'Disponible');
    if (hayDisponibles) {
      return 'Disponible';
    }

    return '';
  }

  getDisponibilidadClass(libro: any): string {
    const status = this.getDisponibilidadLibro(libro);
    switch (status) {
      case 'Disponible':
        return 'badge bg-success';
      case 'Reservado': 
        return 'badge bg-info text-dark';
      case 'Prestado':
        return 'badge bg-warning text-dark';
      default:
        return 'd-none'; 
    }
  }
  
  
  getAutor(libro: any): string {
    if (!libro || !libro.autorLibros || libro.autorLibros.length === 0) {
      return 'Autor Desconocido';
    }
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
    return Array(this.totalPages()).fill(0).map((x, i) => i + 1);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages()) {
      this.page = nuevaPagina;
    }
  }
}