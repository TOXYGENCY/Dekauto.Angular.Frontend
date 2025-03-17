import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiImportService {

  constructor() { }

  // public importFileAsync(file: File): Observable<any> {
  //   return this.http.post(`${this.student_export_url}/${studentId}`, null, { responseType: 'blob', observe: 'response' });
  // }
}
