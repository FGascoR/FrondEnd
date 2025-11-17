import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EjemplarService {

  private apiUrl = 'http://localhost:8080/api/ejemplares';

  constructor(private http: HttpClient) { }

  getEjemplares(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createEjemplar(ejemplar: any): Observable<any> {
    return this.http.post(this.apiUrl, ejemplar);
  }

  updateEjemplar(id: number, ejemplar: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, ejemplar);
  }
}