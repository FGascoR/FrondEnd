import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { PrestamoService } from '../../services/prestamo.service';
import { LibroService } from '../../services/libro.service'; 
import { EjemplarService } from '../../services/ejemplar.service';
import { DevolucionService } from '../../services/devolucion.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-inicio-admin',
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css']
})
export class InicioAdminComponent implements OnInit {

  totalLibros: number = 0;
  totalEjemplares: number = 0;
  totalReservasHoy: number = 0;
  totalPrestamosVencenHoy: number = 0;

  reservasHoy: any[] = [];
  prestamosVencenHoy: any[] = [];
  isLoading = true;
  
  detalleModal: any;
  itemDetalle: any = null;
  tipoDetalle: string = ''; 

  registrarPrestamoModal: any;
  registrarPrestamoForm: FormGroup;
  selectedReserva: any = null;

  devolucionModal: any;
  devolucionForm: FormGroup;
  selectedPrestamo: any = null;

  confirmationToast: any;
  toastMessage: string = '';

  constructor(
    private reservaService: ReservaService,
    private prestamoService: PrestamoService,
    private libroService: LibroService,
    private ejemplarService: EjemplarService,
    private devolucionService: DevolucionService,
    private fb: FormBuilder
  ) {
    const today = this.getFechaLocal();

    this.registrarPrestamoForm = this.fb.group({
      fechaPrestamo: [today, Validators.required],
      fechaDevolucion: ['', Validators.required]
    });

    this.devolucionForm = this.fb.group({
      estadoEjemplar: ['Bueno', Validators.required],
      observaciones: [''],
      addPenalidad: [false],
      tipoPenalidad: ['Monetaria'],
      montoPenalidad: [null],
      motivo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.setupModales();
    this.setupFormListeners();
  }

  getFechaLocal(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarDatosDashboard() {
    this.isLoading = true;
    const today = this.getFechaLocal();

    this.reservaService.getAllReservas({ fechaExpiracion: today }).subscribe(data => {
      this.reservasHoy = data;
      this.totalReservasHoy = data.length;
      this.checkLoading();
    });

    this.prestamoService.getAllPrestamos({ fechaDevolucion: today }).subscribe(data => {
      this.prestamosVencenHoy = data;
      this.totalPrestamosVencenHoy = data.length;
      this.checkLoading();
    });

    this.libroService.getLibros().subscribe(data => this.totalLibros = data.length);
    this.ejemplarService.getEjemplares().subscribe(data => this.totalEjemplares = data.length);
  }

  checkLoading() {
    if (this.reservasHoy && this.prestamosVencenHoy) {
      this.isLoading = false;
    }
  }

  setupModales() {
    const detalleEl = document.getElementById('detalleModal');
    if (detalleEl) this.detalleModal = new bootstrap.Modal(detalleEl);

    const prestamoEl = document.getElementById('registrarPrestamoModal');
    if (prestamoEl) this.registrarPrestamoModal = new bootstrap.Modal(prestamoEl);

    const devolucionEl = document.getElementById('devolucionModal');
    if (devolucionEl) this.devolucionModal = new bootstrap.Modal(devolucionEl);

    const toastEl = document.getElementById('confirmationToast');
    if (toastEl) this.confirmationToast = new bootstrap.Toast(toastEl);
  }
  
  setupFormListeners() {
    this.devolucionForm.valueChanges.subscribe(val => {
       const montoControl = this.devolucionForm.get('montoPenalidad');
       const motivoControl = this.devolucionForm.get('motivo');
       if (val.addPenalidad) {
         motivoControl?.setValidators([Validators.required]);
         if (val.tipoPenalidad === 'Monetaria') {
           montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
           montoControl?.enable({ emitEvent: false });
         } else {
           montoControl?.clearValidators();
           montoControl?.disable({ emitEvent: false });
           montoControl?.setValue(null, { emitEvent: false });
         }
       } else {
         montoControl?.clearValidators();
         motivoControl?.clearValidators();
       }
       montoControl?.updateValueAndValidity({ emitEvent: false });
       motivoControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  verDetalle(item: any, tipo: string) {
    this.itemDetalle = item;
    this.tipoDetalle = tipo;
    this.detalleModal.show();
  }

  openRegistrarPrestamoModal(reserva: any) {
    this.selectedReserva = reserva;
    const today = this.getFechaLocal();

    this.registrarPrestamoForm.reset({
      fechaPrestamo: today,
      fechaDevolucion: ''
    });

    this.registrarPrestamoModal.show();
  }

  onRegistrarPrestamoSubmit() {
    if (this.registrarPrestamoForm.invalid) return;
    
    const payload = this.registrarPrestamoForm.value;
    this.prestamoService.convertFromReserva(payload, this.selectedReserva.idReserva).subscribe({
      next: () => {
        this.registrarPrestamoModal.hide();
        this.showToast('Reserva convertida a préstamo exitosamente');
        this.cargarDatosDashboard();
      },
      error: () => alert('Error al convertir reserva')
    });
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
    this.devolucionModal.show();
  }

  onDevolucionSubmit() {
    if (this.devolucionForm.invalid) return;
    
    const form = this.devolucionForm.value;
    const payload: any = {
      estadoEjemplar: form.estadoEjemplar,
      observaciones: form.observaciones,
      penalidad: null
    };
    if (form.addPenalidad) {
      payload.penalidad = {
        tipo: form.tipoPenalidad,
        monto: form.tipoPenalidad === 'Monetaria' ? form.montoPenalidad : 0,
        motivo: form.motivo
      };
    }

    this.devolucionService.registrarDevolucion(payload, this.selectedPrestamo.idPrestamo).subscribe({
      next: () => {
        this.devolucionModal.hide();
        this.showToast('Devolución registrada exitosamente');
        this.cargarDatosDashboard();
      },
      error: () => alert('Error al registrar devolución')
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.confirmationToast.show();
  }
  
  getEstadoClass(estado: string): string {
      if (estado === 'Activo' || estado === 'Pendiente') return 'badge bg-warning text-dark';
      if (estado === 'Pagada' || estado === 'Disponible') return 'badge bg-success';
      return 'badge bg-secondary';
  }
}
