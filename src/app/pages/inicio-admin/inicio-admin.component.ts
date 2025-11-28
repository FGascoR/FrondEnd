import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { PrestamoService } from '../../services/prestamo.service';
import { DevolucionService } from '../../services/devolucion.service'; 
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-inicio-admin',
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css']
})
export class InicioAdminComponent implements OnInit {

  totalReservasHoy: number = 0;
  totalPrestamosVencenHoy: number = 0;
  
  reservasHoy: any[] = [];
  prestamosVencenHoy: any[] = [];
  isLoading = true;

  fechaReservaControl = new FormControl('');
  fechaPrestamoControl = new FormControl('');

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
    private devolucionService: DevolucionService,
    private fb: FormBuilder
  ) {
    const today = this.getFechaLocal();

    this.fechaReservaControl.setValue(today);
    this.fechaPrestamoControl.setValue(today);

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

    this.fechaReservaControl.valueChanges.subscribe(() => {
      this.cargarReservas();
    });

    this.fechaPrestamoControl.valueChanges.subscribe(() => {
      this.cargarPrestamos();
    });
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
    
    this.cargarReservas();
    this.cargarPrestamos();
  }

  cargarReservas() {
    const fecha = this.fechaReservaControl.value || this.getFechaLocal();
    this.reservaService.getAllReservas({ fechaExpiracion: fecha }).subscribe(data => {
      this.reservasHoy = data;
      this.totalReservasHoy = data.length; 
      this.checkLoading();
    });
  }

  cargarPrestamos() {
    const fecha = this.fechaPrestamoControl.value || this.getFechaLocal();
    this.prestamoService.getAllPrestamos({ fechaDevolucion: fecha }).subscribe(data => {
      this.prestamosVencenHoy = data;
      this.totalPrestamosVencenHoy = data.length; 
      this.checkLoading();
    });
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
         montoControl?.setValue(null, { emitEvent: false });
         motivoControl?.setValue('', { emitEvent: false });
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
        this.showToast('¡Reserva convertida a préstamo con éxito!');
        this.cargarReservas(); 
        this.cargarPrestamos();
        if(this.detalleModal) this.detalleModal.hide(); 
      },
      error: (err) => {
        console.error(err);
        alert('Error al convertir reserva');
      }
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
        this.showToast('¡Devolución registrada con éxito!');
        this.cargarPrestamos(); 
        if(this.detalleModal) this.detalleModal.hide();
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar devolución');
      }
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