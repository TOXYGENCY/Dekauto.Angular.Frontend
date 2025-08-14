import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeFaro, LogLevel } from '@grafana/faro-web-sdk';
import { environment } from './environments/environment';
import { getWebInstrumentations } from '@grafana/faro-web-sdk';
import { LokiTransport } from './app/services/loki-transport.service';

// Логгер для grafana loki
try {
  const faro = initializeFaro({
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
    transports: [
      new LokiTransport()
    ],
  });
} catch (error) {
  console.error("Невозможно инициализировать faro. Журналы действий (логи) отправляться не будут", error);
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
