import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private apiUrl = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) { }

  getReportes(filtros?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (filtros) {
      if (filtros.clienteNombre) httpParams = httpParams.set('clienteNombre', filtros.clienteNombre);
      if (filtros.ejemplarInfo) httpParams = httpParams.set('ejemplarInfo', filtros.ejemplarInfo);
      if (filtros.fechaInicio) httpParams = httpParams.set('fechaInicio', filtros.fechaInicio);
    }
    return this.http.get<any[]>(this.apiUrl, { params: httpParams });
  }
}