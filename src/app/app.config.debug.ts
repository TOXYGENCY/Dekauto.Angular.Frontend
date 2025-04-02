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
    providePrimeNG(
      // Это - динамическа подгрузка стилей PrimeNG (чтобы не загружать все стили разом), 
      // но она дает приоритет этим стандартным стилям, перезаписывая назначения классов - придется повышать приоритет
      {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-light' // назначаем светлую тему
        }
      }
    }
  )
  ]
};

// общая переменная пути подключения к бекенду
// export const backend_api_url = 'https://localhost:7238/api';

// Имя хоста - доменное имя для подключения к бекенду. 
const host = 'localhost';
const port = ':5501'; 
export const backend_api_url = `http://${host}${port}/api`;

// EXPORT
export const student_export_url = `${backend_api_url}/export/student`;
export const group_export_url = `${backend_api_url}/export/group`;
export const student_export_default_name = "Карточка студента";
export const group_export_default_name = "Карточки студентов группы";

// IMPORT
export const import_api_url = `${backend_api_url}/import`;
