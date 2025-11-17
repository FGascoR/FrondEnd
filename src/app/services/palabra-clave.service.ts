import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PalabraClaveService {
  private apiUrl = 'http://localhost:8080/api/palabraclave';

  constructor(private http: HttpClient) { }

  getPalabrasClave(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}