import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeFaro, LogLevel } from '@grafana/faro-web-sdk';
import { environment } from './environments/environment';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { getWebInstrumentations } from '@grafana/faro-web-sdk';

// Логгер для grafana loki
const faro = initializeFaro({
  // Прокси через Nginx
  url: environment.production ? '/api/loki' : 'http://localhost:3100', 
  app: {
    name: 'angular-dekauto-frontend',
    environment: environment.production ? 'prod' : 'dev'
  },
  instrumentations: [
    ...getWebInstrumentations({
      captureConsole: true, // интегрируем стандартные console.log
      captureConsoleDisabledLevels: [LogLevel.DEBUG]
    })
  ],
});
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
