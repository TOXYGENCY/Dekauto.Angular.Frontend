import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Получаем токен из AuthService
  const token = authService.getToken();

  // Клонируем запрос и добавляем заголовок
  let authReq = request;

  if (token) {
    authReq = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // Пропускаем запрос и обрабатываем ошибки
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status == 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};