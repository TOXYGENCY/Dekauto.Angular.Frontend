import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { LoginAdapter } from '../../domain-models/Adapters/LoginAdapter';
import { CurrentCredentials } from '../../domain-models/Adapters/CurrentCredentials';
import { ApiUsersService } from '../../api-services/users/api-users.service';
import { User } from '../../domain-models/User';
import { DataManagerService } from '../data-manager.service';
import { CachedDataService } from '../cached-data.service';

@Injectable({
  providedIn: 'root' // Сервис предоставляется на уровне корневого модуля
})
export class AuthService {
  // BehaviorSubject для хранения текущего состояния пользователя
  // Хранит либо объект с данными пользователя и токеном, либо null
  private currentCredentials: BehaviorSubject<any>;

  // Observable для подписки на изменения состояния аутентификации
  public currentCredentials$: Observable<any>;

  constructor(private http: HttpClient, private apiUsersService: ApiUsersService,
    private dataManagerService: DataManagerService, private cachedDataService: CachedDataService
  ) {
    let initialValue: CurrentCredentials | null = null;
    try {
      const stored = localStorage.getItem('currentCredentials');
      if (stored) {
        initialValue = JSON.parse(stored);
        // Валидация структуры
        if (!initialValue?.user?.id || !initialValue.accessToken) {
          throw new Error('Установленные данные входа некорректны или их нет');
        }
      }
    } catch (error) {
      console.error('Ошибка данных входа:', error);
      localStorage.removeItem('currentCredentials');
      initialValue = null;
    }

    this.currentCredentials = new BehaviorSubject<any>(initialValue);
    this.currentCredentials$ = this.currentCredentials.asObservable();
  }

  public get currentCredentialsValue() {
    return this.currentCredentials.value;
  }

  // для получения текущего значения вне подписки
  public get currentUser(): User | null {
    return this.currentCredentialsValue?.user || null;
  }

  // Метод для входа пользователя
  public authenticateAndGetTokenAsync(loginAdapter: LoginAdapter): Observable<any> {
    return this.apiUsersService.AuthenticateAndGetTokenAsync(loginAdapter).pipe(
      tap((response: CurrentCredentials) => {
        if (response?.accessToken) {
          this.storeCredentials(response);
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  private storeCredentials(credentials: CurrentCredentials): void {
    localStorage.setItem('currentCredentials', JSON.stringify(credentials));
    this.currentCredentials.next(credentials);
  }

  //  Метод для выхода пользователя
  //  Очищает хранилище и обновляет состояние
  public logout() {
    this.cachedDataService.clearGroupsCache();
    this.cachedDataService.clearStudentsCache();
    this.dataManagerService.clearSelectedGroup();
    localStorage.removeItem('currentCredentials');
    this.currentCredentials.next(null);
  }

  public checkAuth() {
    if (!this.isAuthenticated()) {
      this.logout();
    }
  }

  //  Проверка статуса аутентификации
  public isAuthenticated(): boolean {
    return (this.currentCredentialsValue?.accessToken != null 
         && this.currentUser != null);
  }

  // Получение JWT токена текущего пользователя
  public getAccessToken(): string | null {
    return this.currentCredentialsValue?.accessToken || null;
  }

  public refreshTokens(): Observable<any> {
    if (this.isAuthenticated()) {
      // Cookie с refresh token отправится автоматически
      return this.apiUsersService.RefreshTokens(this.currentUser!.id).pipe(
        tap(response => this.storeCredentials(response))
      );
    } else {
      this.logout();
      return new Observable(observer => observer.complete());
    }
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