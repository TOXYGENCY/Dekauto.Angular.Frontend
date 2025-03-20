import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileSavingService {

  constructor() { }

  saveFile(fileBlob: Blob, fileName: string) {
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(fileBlob);

    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  }

  parseFileName(response: HttpResponse<Blob>, defaultName: string = 'file'): string {
    const contentDisposition = response.headers.get('Content-Disposition') || '';

    // Вариант 1: Обработка стандартного filename
    const standardMatch = contentDisposition.match(/filename="(.*?)"/);

    // Вариант 2: Обработка UTF-8 filename* - предпочтительнее
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.*?)(;|$)/);

    let fileName = defaultName;

    if (utf8Match) {
      fileName = decodeURIComponent(utf8Match[1]);
    } else if (standardMatch) {
      fileName = standardMatch[1];
    }

    // Удаляем кавычки если есть
    return fileName.replace(/^"(.*)"$/, '$1');
  }
}
