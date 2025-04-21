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
  private currentUser: BehaviorSubject<any>;

  // Observable для подписки на изменения состояния аутентификации
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient, private apiUsersService: ApiUsersService) {
    // Инициализация BehaviorSubject из localStorage
    this.currentUser = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') || "{}")
    );
    this.currentUser$ = this.currentUser.asObservable();
    
  }

  // для получения текущего значения вне подписки
  public get currentUserValue() {
    return this.currentUser.value;
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
    this.currentUser.next(tokens);
  }

  //  Метод для выхода пользователя
  //  Очищает хранилище и обновляет состояние
  public logout() {
    localStorage.removeItem('currentUser');
    this.currentUser.next(null);
  }

  //  Проверка статуса аутентификации
  public isAuthenticated(): boolean {
    return this.currentUserValue?.accessToken != null;
  }

  // Получение JWT токена текущего пользователя
  public getToken(): string | null {
    return this.currentUserValue?.accessToken || null;
  }

  getRole(): string {
    return this.currentUserValue?.role || '';
  }

  userHasRole(role: string): boolean {
    return this.getRole().includes(role);
  }

  userHasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.userHasRole(role));
  }
}