import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { auth_api_url } from '../../app.config';
import { LoginAdapter } from '../../domain-models/Adapters/LoginAdapter';

@Injectable({
  providedIn: 'root'
})
export class ApiUsersService {

  constructor(private http: HttpClient) { }
  private apiUrl = auth_api_url;
  
  // вернет Jwt-токены
  public AuthenticateAndGetTokenAsync(loginAdapter: LoginAdapter): Observable<any> {
    return this.http.post(`${this.apiUrl}`, loginAdapter);
  }

  public ValidateTokenAsync(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate`, { headers: { Authorization: `Bearer ${token}` } });
  }

}
