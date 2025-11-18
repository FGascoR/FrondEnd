import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { PrestamoService } from '../../services/prestamo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { Subscription } from 'rxjs'; 
import { ClienteService } from '../../services/cliente.service';
import { DevolucionService } from '../../services/devolucion.service';

declare var bootstrap: any; 
@Component({
  selector: 'app-prestamos-admin',
  templateUrl: './prestamos-admin.component.html',
  styleUrls: ['./prestamos-admin.component.css']
})
export class PrestamosAdminComponent implements OnInit, OnDestroy { 

  prestamos: any[] = [];
  isLoading = true;
  filterForm: FormGroup;
  private filterSub: Subscription | undefined;

  devolucionModal: any;
  devolucionForm: FormGroup;
  clientes: any[] = [];
  filteredClientes: any[] = [];
  isLoadingClientes = false;
  prestamosDelCliente: any[] = []; 
  isLoadingPrestamosCliente = false;
  
  confirmationToast: any;
  toastMessage: string = '';

  constructor(
    private prestamoService: PrestamoService,
    private fb: FormBuilder,
    private clienteService: ClienteService, 
    private devolucionService: DevolucionService 
  ) {
    this.filterForm = this.fb.group({
      clienteNombre: [''],
      ejemplarInfo: [''],
      fechaPrestamo: [''],
      fechaDevolucion: ['']
    });

    this.devolucionForm = this.fb.group({
      clienteFilter: [''],
      clienteId: [null, Validators.required],
      prestamoId: [null, Validators.required],
      estadoEjemplar: ['Bueno', Validators.required], 
      observaciones: [''],
      addPenalidad: [false],
      montoPenalidad: [null],
      motivo: [''] 
    });
  }

  ngOnInit(): void {
    this.loadPrestamos(); 
    this.loadClientes(); 

    const modalEl = document.getElementById('devolucionModal');
    if (modalEl) this.devolucionModal = new bootstrap.Modal(modalEl);
    
    const toastEl = document.getElementById('confirmationToast');
    if (toastEl) this.confirmationToast = new bootstrap.Toast(toastEl);

    this.filterSub = this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(values => this.loadPrestamos(values));

    this.setupModalFormListeners();
  }

  loadClientes() {
    this.isLoadingClientes = true;
    this.clienteService.getAllClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = data; 
        this.isLoadingClientes = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
        this.isLoadingClientes = false;
      }
    });
  }

  setupModalFormListeners() {
    this.devolucionForm.get('clienteFilter')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => this.filterClientes(value));

    this.devolucionForm.get('clienteId')?.valueChanges.subscribe(clienteId => {
      if (clienteId) {
        this.isLoadingPrestamosCliente = true;
        this.prestamoService.getPrestamosActivosByCliente(clienteId).subscribe(data => {
          this.prestamosDelCliente = data;
          this.isLoadingPrestamosCliente = false;
        });
      } else {
        this.prestamosDelCliente = [];
      }
    });

    this.devolucionForm.get('addPenalidad')?.valueChanges.subscribe(checked => {
      const montoControl = this.devolucionForm.get('montoPenalidad');
      const motivoControl = this.devolucionForm.get('motivo');
      if (checked) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
        motivoControl?.setValidators([Validators.required]);
      } else {
        montoControl?.clearValidators();
        motivoControl?.clearValidators();
      }
      montoControl?.updateValueAndValidity();
      motivoControl?.updateValueAndValidity();
    });
  }

  filterClientes(query: string) {
    if (!query || query.trim() === '') {
      this.filteredClientes = this.clientes;
      return;
    }
    const lowerQuery = query.toLowerCase().trim();
    
    this.filteredClientes = this.clientes.filter(c => {
      const nombres = c.nombres?.toLowerCase() || '';
      const apellidoPaterno = c.apellidoPaterno?.toLowerCase() || '';
      const apellidoMaterno = c.apellidoMaterno?.toLowerCase() || ''; 
      const email = c.email?.toLowerCase() || '';

      return nombres.includes(lowerQuery) ||
             apellidoPaterno.includes(lowerQuery) ||
             apellidoMaterno.includes(lowerQuery) ||
             email.includes(lowerQuery);
    });
  }

  openDevolucionModal() {
    this.devolucionForm.reset({
      clienteFilter: '',
      clienteId: null,
      prestamoId: null,
      estadoEjemplar: 'Bueno',
      observaciones: '',
      addPenalidad: false,
      montoPenalidad: null,
      motivoPenalidad: ''
    });
    this.prestamosDelCliente = [];
    this.filteredClientes = this.clientes;
    this.devolucionModal.show();
  }

  onDevolucionSubmit() {
    if (this.devolucionForm.invalid) {
      this.devolucionForm.markAllAsTouched();
      return;
    }

    const form = this.devolucionForm.value;
    const prestamoId = form.prestamoId;

    const devolucionPayload: any = {
      estadoEjemplar: form.estadoEjemplar,
      observaciones: form.observaciones,
      penalidad: null
    };

    if (form.addPenalidad) {
      devolucionPayload.penalidad = {
        monto: form.montoPenalidad,
        motivo: form.motivo 
      };
    }

    this.devolucionService.registrarDevolucion(devolucionPayload, prestamoId).subscribe({
      next: (data) => {
        this.devolucionModal.hide();
        this.showToast('¡Devolución registrada con éxito!');
        this.loadPrestamos(); 
      },
      error: (err) => {
        console.error('Error al registrar devolución', err);
        alert(err.error?.message || 'No se pudo registrar la devolución.');
      }
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    if (this.confirmationToast) {
      this.confirmationToast.show();
    }
  }

  ngOnDestroy(): void {
    if (this.filterSub) this.filterSub.unsubscribe();
  }

  loadPrestamos(filtros: any = null) {
    this.isLoading = true;

    let cleanFilters: any = {};
    if (filtros) {
        if (filtros.clienteNombre) cleanFilters.clienteNombre = filtros.clienteNombre;
        if (filtros.ejemplarInfo) cleanFilters.ejemplarInfo = filtros.ejemplarInfo;
        if (filtros.fechaPrestamo) cleanFilters.fechaPrestamo = filtros.fechaPrestamo;
        if (filtros.fechaDevolucion) cleanFilters.fechaDevolucion = filtros.fechaDevolucion;
    }

    this.prestamoService.getAllPrestamos(cleanFilters).subscribe({
      next: (data) => {
        this.prestamos = data;
        this.isLoading = false;
        console.log('Préstamos cargados en admin:', data);
      },
      error: (err) => {
        console.error('Error al cargar préstamos en admin', err);
        this.isLoading = false;
        alert('No se pudieron cargar los préstamos.');
      }
    });
  }
  
  getEstadoPrestamo(prestamo: any): string {
    if (prestamo.ejemplar?.estado === 'Prestado') {
      const hoy = new Date();
      const fechaDev = new Date(prestamo.fechaDevolucion);
      hoy.setHours(0, 0, 0, 0);
      fechaDev.setHours(0, 0, 0, 0);
      
      if (hoy > fechaDev) {
        return 'Vencido';
      }
      return 'Activo (Prestado)';
    }
    if (prestamo.ejemplar?.estado === 'Disponible' || prestamo.ejemplar?.estado === 'En reparación') {
        return 'Devuelto';
    }
    return prestamo.ejemplar?.estado || 'Desconocido';
  }

  getEstadoClass(prestamo: any): string {
    const estado = this.getEstadoPrestamo(prestamo);
    if (estado === 'Vencido') return 'badge bg-danger';
    if (estado === 'Activo (Prestado)') return 'badge bg-warning text-dark';
    if (estado === 'Devuelto') return 'badge bg-success'; 
    return 'badge bg-secondary';
  }
}