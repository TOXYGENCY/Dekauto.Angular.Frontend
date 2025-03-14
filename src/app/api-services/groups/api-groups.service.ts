import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backend_api_url } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ApiGroupsService {

  constructor(private http: HttpClient) { }
      private apiUrl = backend_api_url;
      
  public getGroupByIdAsync(groupId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups/${groupId}`);
  } 

  public getAllGroupsAsync(): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups`);
  }
}
