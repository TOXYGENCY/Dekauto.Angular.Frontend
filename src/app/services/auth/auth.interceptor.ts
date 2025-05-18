import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, delay, finalize, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';

// Общее состояние для всех запросов (сохраняется между вызовами интерцептора)
let isRefreshing = false; // Флаг процесса обновления токена
let refreshToken$: Observable<any> | null = null; // Observable для обновления токена
// Очередь запросов, ожидающих обновления токена (для предотвращения гонки запросов)
const pendingRequests: ((token: string) => void)[] = [];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log(`[Interceptor] Обработка запроса: ${request.method} ${request.url}`);

  // Пропускаем запросы на обновление токена (чтобы избежать рекурсии)
  if (request.url.includes('/auth/refresh')) {
    console.log('[Interceptor] Пропускаем запрос на обновление токена');
    return next(request);
  }

  // Добавляем токен к запросу (если имеется)
  const authReq = addTokenToRequest(request, authService.getAccessToken());

  console.log('[Interceptor] Отправка запроса с токеном', request);
  return next(authReq).pipe(
    catchError(error => {
      console.log(`[Interceptor] Ошибка запроса: ${error.status}`, error);
      return handle401Error(error, request, next, authService, router);
    })
  );
};

function addTokenToRequest(request: HttpRequest<any>, token: string | null) {
  if (!token) {
    console.warn('[Interceptor] Токен доступа отсутствует');
  }
  return token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
}

function handle401Error(
  error: HttpErrorResponse,
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<any> {
  // Обрабатываем только 401 ошибки (Unauthorized)
  if (error.status !== 401) {
    // console.log('[Interceptor] Пропускаем не-401 ошибку');
    return throwError(() => error);
  }

  console.warn('[Interceptor] Обнаружена 401 ошибка - токен недействителен');

  // Если уже идет процесс обновления токена
  if (isRefreshing) {
    console.log('[Interceptor] Токен уже обновляется, добавляем запрос в очередь');
    return new Observable(observer => {
      pendingRequests.push(newToken => {
        console.log('[Interceptor] Выполняем отложенный запрос с новым токеном');
        const newReq = addTokenToRequest(request, newToken);
        next(newReq).subscribe(observer);
      });
    });
  }

  // Начинаем процесс обновления токена
  console.log('[Interceptor] Начинаем обновление токена...');
  isRefreshing = true;
  refreshToken$ = authService.refreshTokens().pipe(
    tap(() => console.log('[Interceptor] Токены успешно обновлены')),
    shareReplay(1), // Для многократного использования
    finalize(() => {
      console.log('[Interceptor] Завершение процесса обновления токена');
      isRefreshing = false;
      refreshToken$ = null;
    })
  );
  // TODO: при истечении токена и ошибке 500 в другом сервисе выкидывает пользователя
  return refreshToken$.pipe(
    switchMap(tokens => {
      console.log(`[Interceptor] Обновление успешно. Выполняем ${pendingRequests.length} ожидающих запросов`);
      // Выполняем все запросы из очереди с новым токеном
      pendingRequests.forEach(cb => cb(tokens.accessToken));
      pendingRequests.length = 0; // Очищаем очередь

      // Повторяем текущий запрос с новым токеном
      console.log('[Interceptor] Повторяем оригинальный запрос с новым токеном');
      return next(addTokenToRequest(request, tokens.accessToken));
    }),
    catchError(err => {
      console.error('[Interceptor] Ошибка обновления токена:', err);
      console.warn('[Interceptor] Очищаем очередь запросов и разлогиниваем');
      pendingRequests.length = 0; // Очищаем очередь при ошибке
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => err);
    })
  );
}
