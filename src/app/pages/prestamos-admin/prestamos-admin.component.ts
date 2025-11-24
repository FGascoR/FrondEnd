import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { PrestamoService } from '../../services/prestamo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; 
import { Subscription } from 'rxjs'; 
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
  selectedPrestamo: any = null;
  confirmationToast: any;
  toastMessage: string = '';

  constructor(
    private prestamoService: PrestamoService,
    private fb: FormBuilder,
    private devolucionService: DevolucionService 
  ) {
    this.filterForm = this.fb.group({
      clienteNombre: [''],
      ejemplarInfo: [''],
      fechaPrestamo: [''],
      fechaDevolucion: ['']
    });

    this.devolucionForm = this.fb.group({
      estadoEjemplar: ['Bueno', Validators.required],
      observaciones: [''],
      addPenalidad: [false],
      tipoPenalidad: ['Monetaria'],
      montoPenalidad: [{ value: null, disabled: true }],
      motivo: ['']
    });
  }

  ngOnInit(): void {
    this.loadPrestamos(); 

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
    } else {
        cleanFilters = this.filterForm.value;
    }

    this.prestamoService.getAllPrestamos(cleanFilters).subscribe({
      next: (data) => {
        this.prestamos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }
  
  setupModalFormListeners() {
    
    this.devolucionForm.get('addPenalidad')?.valueChanges.subscribe(isActive => {
        this.updatePenalidadValidators(isActive, this.devolucionForm.get('tipoPenalidad')?.value);
    });

    this.devolucionForm.get('tipoPenalidad')?.valueChanges.subscribe(tipo => {
        this.updatePenalidadValidators(this.devolucionForm.get('addPenalidad')?.value, tipo);
    });
  }

  updatePenalidadValidators(isActive: boolean, tipo: string) {
      const montoControl = this.devolucionForm.get('montoPenalidad');
      const motivoControl = this.devolucionForm.get('motivo');

      if (isActive) {
        motivoControl?.setValidators([Validators.required]);
        
        if (tipo === 'Monetaria') {
          montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
          montoControl?.enable({ emitEvent: false });
        } else {
          montoControl?.clearValidators();
          montoControl?.setValue(null, { emitEvent: false });
          montoControl?.disable({ emitEvent: false }); 
        }
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue(null, { emitEvent: false });
        montoControl?.disable({ emitEvent: false });
        
        motivoControl?.clearValidators();
        motivoControl?.setValue('', { emitEvent: false });
      }

      montoControl?.updateValueAndValidity({ emitEvent: false });
      motivoControl?.updateValueAndValidity({ emitEvent: false });
  }
  
  openDevolucionModal(prestamo: any) {
    this.selectedPrestamo = prestamo;
    
    this.devolucionForm.reset({
      estadoEjemplar: 'Bueno',
      observaciones: '',
      addPenalidad: false,
      tipoPenalidad: 'Monetaria',
      montoPenalidad: null,
      motivo: ''
    });
    
    this.updatePenalidadValidators(false, 'Monetaria');

    this.devolucionModal.show();
  }

  onDevolucionSubmit() {
    if (this.devolucionForm.invalid || !this.selectedPrestamo) {
      this.devolucionForm.markAllAsTouched(); 
      return;
    }

    const form = this.devolucionForm.value;
    const prestamoId = this.selectedPrestamo.idPrestamo; 

    const devolucionPayload: any = {
      estadoEjemplar: form.estadoEjemplar,
      observaciones: form.observaciones,
      penalidad: null
    };

    if (form.addPenalidad) {
      devolucionPayload.penalidad = {
        tipo: form.tipoPenalidad,
        monto: form.tipoPenalidad === 'Monetaria' ? form.montoPenalidad : 0,
        motivo: form.motivo 
      };
    }

    this.devolucionService.registrarDevolucion(devolucionPayload, prestamoId).subscribe({
      next: () => {
        this.devolucionModal.hide();
        this.showToast('¡Devolución registrada con éxito!');
        this.loadPrestamos(); 
      },
      error: (err) => {
        console.error('Error al registrar devolución', err);
        alert('No se pudo registrar la devolución.');
      }
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    if (this.confirmationToast) {
      this.confirmationToast.show();
    }
  }

  getEstadoPrestamo(prestamo: any): string {
    if (prestamo.ejemplar?.estado === 'Prestado') {
      const hoy = new Date();
      const fechaDev = new Date(prestamo.fechaDevolucion);
      hoy.setHours(0, 0, 0, 0);
      fechaDev.setHours(0, 0, 0, 0);
      if (hoy > fechaDev) return 'Vencido';
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