import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PenalidadService {

  private apiUrl = 'http://localhost:8080/api/penalidades';

  constructor(private http: HttpClient) { }

  getAllPenalidades(filtros?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (filtros) {
      if (filtros.clienteNombre) httpParams = httpParams.set('clienteNombre', filtros.clienteNombre);
      if (filtros.estado) httpParams = httpParams.set('estado', filtros.estado);
      if (filtros.fecha) httpParams = httpParams.set('fecha', filtros.fecha);
    }
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }
  pagarPenalidad(idPenalidad: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idPenalidad}/pagar`, {});  }
}