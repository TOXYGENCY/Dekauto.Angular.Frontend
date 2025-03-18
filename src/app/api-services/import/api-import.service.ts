import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { import_api_url } from '../../app.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiImportService {

  constructor(private http: HttpClient) { }

  private import_api_url = import_api_url;

  // ldFile: any = null; // Файл личного дела
  // logFile: any = null; // Файл журнала регистрации договоров
  // log2File: any = null; // Файл журнала выдачи зачеток

  public importFileAsync(ldFile: File, logFile: File, log2File: File): Observable<any> {

    return this.http.post(`${this.import_api_url}`, { ldFile, logFile, log2File }, { responseType: 'blob', observe: 'response' });
  }

  public importFileAsync2(formData: FormData): Observable<any> {

    return this.http.post(`${this.import_api_url}`, formData);
  }
}
