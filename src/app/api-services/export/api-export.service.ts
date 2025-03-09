import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend_api_url, group_export_url, student_export_url } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ApiExportService {

  constructor(private http: HttpClient) { }
  private apiUrl = backend_api_url;
  private student_export_url = student_export_url;
  private group_export_url = group_export_url;

  
  public exportStudentCardAsync(studentId: string): Observable<any> {
    return this.http.post(`${this.student_export_url}/${studentId}`, null, { responseType: 'blob', observe: 'response' });
  }

  public exportGroupCardsAsync(groupId: string): Observable<any> {
    return this.http.post(`${this.group_export_url}/${groupId}`, null, { responseType: 'blob', observe: 'response' });
  }
}
