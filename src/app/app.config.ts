import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-light' // назначаем светлую тему
        }
      }
    })
  ]
};

// общая переменная пути подключения к бекенду
export const backend_api_url = 'https://localhost:7238/api';
export const student_export_url = `${backend_api_url}/export/student`;
export const group_export_url = `${backend_api_url}/export/group`;
export const student_export_default_name = "Карточка студента";
export const group_export_default_name = "Карточки студентов группы";