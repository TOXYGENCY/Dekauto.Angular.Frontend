import { Injectable } from '@angular/core';
import { BaseTransport, LogEvent, Transport, TransportItem, TransportItemType } from '@grafana/faro-core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LokiTransport extends BaseTransport implements Transport {
  name: string = 'Dekauto-Loki-Transport';
  version: string = 'Dekauto-Custom';
  private lokiUrl: string;

  constructor() {
    super();
    this.lokiUrl = environment.logs.url;
  }

  override isBatched(): boolean {
    return true;
  }

  override send(items: TransportItem[]): void | Promise<void> {
    if (items.length === 0) return;

    try {
      const streams: any[] = [];

      items.forEach(item => {
        // Скип НЕ логов
        if (item.type !== TransportItemType.LOG) {
          return
        }

        // обработка объектов для последующей передачи в loki
        const logItem = item;
        /* так как logItem может быть не только LogEvent, нужно явно преобразовать 
          и далее при использовании проверять */
        const payload: LogEvent | undefined = logItem.payload as LogEvent;
        const logLabels = {
          app: String(environment.logs.logAppName),
          env: environment.production ? 'prod' : 'dev',
          level: String(payload.level) ?? 'unknown',
          session: String(logItem.meta.session?.id) || 'unknown'
        }

        // поиск существующего потока
        const logLabelsString = JSON.stringify(logLabels);
        let stream = streams.find(stream => JSON.stringify(stream) == logLabelsString);

        // если потока нет, то создаем его по образу и подобию данных для loki
        if (!stream) {
          stream = { stream: logLabels, values: [] };
          streams.push(stream);
        }

        // наполняем поток
        var timestampString = Date.parse(payload.timestamp) ?? Date.now();
        var timestamp = String(timestampString * 1000000); // потому что loki использует наносекунды, а faro - секунды
        stream.values.push([timestamp, String(payload.message ?? 'unknown')]);
      });

      // если ничего не добавилось, то и отправлять не будем
      if (streams.length === 0) {
        return;
      }

      // отправка логов (стрима) в loki
      fetch(this.lokiUrl, {
        method: 'POST',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify({ streams: streams })
      })

    } catch (error) {
      console.error(error);
      this.internalLogger?.error('Ошибка передачи логов в Loki:', error);
    }
  }
}

