import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeweyService {

  private apiUrl = 'http://localhost:8080/api/dewey';

  constructor(private http: HttpClient) { }

  getDeweys(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}