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

  public importFileAsync(formData: FormData): Observable<any> {
    return this.http.post(`${this.import_api_url}`, formData);
  }
}
