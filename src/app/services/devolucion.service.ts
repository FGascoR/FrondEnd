import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {

  private apiUrl = 'http://localhost:8080/api/devoluciones';

  constructor(private http: HttpClient) { }

  registrarDevolucion(devolucion: any, prestamoId: number): Observable<any> {
    const params = new HttpParams().set('prestamoId', prestamoId.toString());
    return this.http.post(this.apiUrl, devolucion, { params });
  }
}