import { Injectable } from '@angular/core';
import { BaseTransport, LogEvent, LogLevel, Transport, TransportItem, TransportItemType } from '@grafana/faro-core';
import { environment } from '../../environments/environment';
import { last } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LokiTransport extends BaseTransport implements Transport {
  name: string = 'Dekauto-Loki-Transport';
  version: string = 'Dekauto-Custom';
  private lokiUrl: string;
  private batchInterval: number = 5000; // интервал запуска обработки логов (заменяется конфиговским значением)
  private queuedLogItems: TransportItem[] = []; // очередь новых логов для обработки
  private lastProcessedTimestamp: string | undefined; // временной маркер последнего обработанного лога

  constructor() {
    super();
    this.batchInterval = environment.logs.batchInterval;
    this.lokiUrl = environment.logs.url;
    // Автоматическая интервальная отправка логов (пачками). 
    var interval = setInterval(() => this.batchSend(), this.batchInterval);
  }

  override isBatched(): boolean {
    return true;
  }

  // Пакетная отправка логов
  private batchSend() {
    try {
      if (this.queuedLogItems.length === 0) return; // Если новых логов нет - ничего не делаем
      this.processAndSend(this.queuedLogItems)
      this.queuedLogItems = []; // После отправки очищаем очередь
    } catch (error) {
      console.error(error);
      this.internalLogger?.error('Ошибка передачи логов в Loki:', error);
    }
  }

  // Обработка объектов для последующей отправки в loki
  private processAndSend(items: TransportItem[]) {
    const streams: any[] = [];

    items.forEach(item => {
      const logItem = item;
      /* так как logItem может быть не только LogEvent, нужно явно преобразовать 
        и далее при использовании проверять */
      const payload: LogEvent | undefined = logItem.payload as LogEvent;

      // Формируем лейблы для loki, по которым grafana будет отображать логи
      const logLabels = {
        service_name: String(environment.logs.logAppName),
        app: "dekauto_full",
        env: environment.production ? 'prod' : 'dev',
        level: String(payload.level) ?? 'unknown',
        frontend_session: String(logItem.meta.session?.id) || 'unknown'
      }

      // поиск существующего потока с логами
      const logLabelsString = JSON.stringify(logLabels);
      let stream = streams.find(stream => JSON.stringify(stream) == logLabelsString);

      // если потока нет, то создаем его по образу и подобию данных для loki
      if (!stream) {
        stream = { stream: logLabels, values: [] };
        streams.push(stream);
      }

      // Временная метка текущего лога
      const ts = this.convertTimestamp(payload.timestamp);
      // наполняем поток
      stream.values.push([ts, String(payload.message ?? 'unknown')]);
      this.lastProcessedTimestamp = ts; // обновляем маркер последнего обработанного лога (по времени)
    });

    // отправка логов (стрима) в loki
    fetch(this.lokiUrl, {
      method: 'POST',
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({ streams: streams })
    });
  }

  /* Этот метод обязателен (интерфейс) и вызывается извне.
  Сюда могут прийти не только логи,а также логи придут ВСЕ (новые+старые).
  Здесь, этот метод ничего не отправляет, а только обновляет внутреннюю очередь логов.*/
  override send(items: TransportItem[]): void | Promise<void> {
    if (items.length === 0) return;
    // оставляем только логи
    const logItems = items.filter(item => item.type === 'log');
    if (logItems.length === 0) return;

    var lastIndex = -1; // заглушка, переопределяется далее
    if (this.lastProcessedTimestamp) {
      // если знаем какой лог был последним (по timestamp), то ищем его индекс
      lastIndex = logItems.findIndex(item =>
        (item.payload as LogEvent).timestamp == this.lastProcessedTimestamp);
    }

    // обрезаем массив логов, оставляя только новые логи
    const newItems = logItems.slice(lastIndex > 0 ? lastIndex : 0, items.length);
    // Наполняем общий массив скопленных логов новыми пришедшими логами (вместо отправки)
    newItems.forEach(item => {
      this.queuedLogItems.push(item);
    });
  }

  private convertTimestamp(timestamp: string) {
    var timestampString = Date.parse(timestamp) ?? Date.now();
    var timestampNano = String(timestampString * 1000000); // потому что loki использует наносекунды, а faro - секунды
    return timestampNano;
  }
}

