import { Injectable } from '@angular/core';
import { faro } from '@grafana/faro-web-sdk';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() {
   }

  public logInfo(message: string) {
    // faro.api.pushLog();
  }
}
