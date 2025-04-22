import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { LoginAdapter } from '../../domain-models/Adapters/LoginAdapter';
import { AuthTokensAdapter } from '../../domain-models/Adapters/AuthTokensAdapter';
import { ApiUsersService } from '../../api-services/users/api-users.service';
import { User } from '../../domain-models/User';

@Injectable({
  providedIn: 'root' // Сервис предоставляется на уровне корневого модуля
})
export class AuthService {
  // BehaviorSubject для хранения текущего состояния пользователя
  // Хранит либо объект с данными пользователя и токеном, либо null
  private currentCredentials: BehaviorSubject<any>;

  // Observable для подписки на изменения состояния аутентификации
  public currentCredentials$: Observable<any>;

  constructor(private http: HttpClient, private apiUsersService: ApiUsersService) {
    // Инициализация BehaviorSubject из localStorage
    this.currentCredentials = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || "{}")
    );
    this.currentCredentials$ = this.currentCredentials.asObservable();
    
  }

  public get currentCredentialsValue() {
    return this.currentCredentials.value;
  }

  // для получения текущего значения вне подписки
  public get currentUser() {
    return this.currentCredentialsValue.user;
  }

  // Метод для входа пользователя
  public authenticateAndGetTokenAsync(loginAdapter: LoginAdapter): Observable<any> {
    return this.apiUsersService.AuthenticateAndGetTokenAsync(loginAdapter).pipe(
      tap((response: AuthTokensAdapter) => {
        if (response?.accessToken) {
          this.saveAuthData(response);
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  private saveAuthData(tokens: AuthTokensAdapter): void {
    localStorage.setItem('currentUser', JSON.stringify(tokens));
    this.currentCredentials.next(tokens);
  }

  //  Метод для выхода пользователя
  //  Очищает хранилище и обновляет состояние
  public logout() {
    localStorage.removeItem('currentUser');
    this.currentCredentials.next(null);
  }

  //  Проверка статуса аутентификации
  public isAuthenticated(): boolean {
    return this.currentCredentialsValue?.accessToken != null;
  }

  // Получение JWT токена текущего пользователя
  public getToken(): string | null {
    return this.currentCredentialsValue?.accessToken || null;
  }

  getRole(): string {
    return this.currentUser?.roleName || '';
  }

  userHasRole(role: string): boolean {
    return this.getRole().includes(role);
  }

  userHasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.userHasRole(role));
  }
}