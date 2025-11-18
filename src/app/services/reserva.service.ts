import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private apiUrl = 'http://localhost:8080/api/reservas';

  constructor(private http: HttpClient) { }

  getAllReservas(filtros?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (filtros) {
      if (filtros.clienteNombre) httpParams = httpParams.set('clienteNombre', filtros.clienteNombre);
      if (filtros.ejemplarInfo) httpParams = httpParams.set('ejemplarInfo', filtros.ejemplarInfo);
      if (filtros.fechaReserva) httpParams = httpParams.set('fechaReserva', filtros.fechaReserva);
      if (filtros.fechaExpiracion) httpParams = httpParams.set('fechaExpiracion', filtros.fechaExpiracion);
    }
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }
  
  getReservasCompletadas(filtros?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (filtros) {
      if (filtros.clienteNombre) httpParams = httpParams.set('clienteNombre', filtros.clienteNombre);
      if (filtros.ejemplarInfo) httpParams = httpParams.set('ejemplarInfo', filtros.ejemplarInfo);
      if (filtros.fechaReserva) httpParams = httpParams.set('fechaReserva', filtros.fechaReserva);
      if (filtros.fechaExpiracion) httpParams = httpParams.set('fechaExpiracion', filtros.fechaExpiracion);
    }
    return this.http.get<any[]>(`${this.apiUrl}/reporte-completadas`, { params: httpParams });
  }

  createReserva(reserva: any): Observable<any> {
    return this.http.post(this.apiUrl, reserva);
  }

  getMisReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-reservas`);
  }
}