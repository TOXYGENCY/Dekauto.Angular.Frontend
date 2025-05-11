import { Injectable } from '@angular/core';
import { backend_api_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../../domain-models/Student';

@Injectable({
  providedIn: 'root'
})
export class ApiStudentsService {

  constructor(private http: HttpClient) { }
    private apiUrl = backend_api_url;

    public getAllStudentsAsync(): Observable<any> {
      return this.http.get(`${this.apiUrl}/students`);
    }

    
}
