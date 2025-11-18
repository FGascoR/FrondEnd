import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private apiUrl = 'http://localhost:8080/api/prestamos';

  constructor(private http: HttpClient) { }

  getAllPrestamos(filtros?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (filtros) {
      if (filtros.clienteNombre) httpParams = httpParams.set('clienteNombre', filtros.clienteNombre);
      if (filtros.ejemplarInfo) httpParams = httpParams.set('ejemplarInfo', filtros.ejemplarInfo);
      if (filtros.fechaPrestamo) httpParams = httpParams.set('fechaPrestamo', filtros.fechaPrestamo);
      if (filtros.fechaDevolucion) httpParams = httpParams.set('fechaDevolucion', filtros.fechaDevolucion);
    }
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }

  getPrestamosActivosByCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activos-por-cliente/${clienteId}`);
  }
  
  convertFromReserva(prestamo: any, reservaId: number): Observable<any> {
    const params = new HttpParams()
      .set('reservaId', reservaId.toString());
      
    return this.http.post(`${this.apiUrl}/convert-from-reserva`, prestamo, { params });
  }

  createPrestamo(prestamo: any): Observable<any> {
    return this.http.post(this.apiUrl, prestamo);
  }

  getMisPrestamos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-prestamos`);
  }
}