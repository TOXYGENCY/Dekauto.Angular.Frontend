import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { Student } from '../../domain-models/Student'; 
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common'; 
import { CachedDataService } from '../../api-services/cached-data.service';
import { Group } from '../../domain-models/Group';
import { Observable } from 'rxjs';
import { ApiExportService } from '../../api-services/export/api-export.service';
import { student_export_default_name } from '../../app.config';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-students-page',
  imports: [TableModule, CommonModule],
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.css'
})
export class StudentsPageComponent implements OnInit, OnDestroy {

  // Переменные подписки для того, чтобы можно было отписаться
  private studentsSub: any;
  private groupsSub: any;

  constructor(private apiStudentsService: ApiStudentsService, private cachedDataService: CachedDataService,
    private apiExportService: ApiExportService) { }

  students: Student[] = [];
  groups: Group[] = [];

  ngOnInit() {
    // Подписываемся на кэш
    this.studentsSub = this.cachedDataService.cachedStudents$.subscribe(cache => {
      this.students = cache;
      console.log("Из кэша студентов: ", this.students);
    });

    this.groupsSub = this.cachedDataService.cachedGroups$.subscribe(cache => {
      this.groups = cache;
      console.log("Из кэша групп: ", this.groups);
    });
  }

  // По уничтожении компонента отписываемся
  ngOnDestroy() {
    if (this.studentsSub) {
      this.studentsSub.unsubscribe();
    }
    if (this.groupsSub) {
      this.groupsSub.unsubscribe();
    }
  }

  getGroupName(groupId: string): string {
    return this.groups.find(g => g.id == groupId)?.name || '-';
  }

  exportStudent(studentId: string) {
    this.apiExportService.exportStudentCardAsync(studentId).subscribe({
        next: (response) => {
          this.saveFile(response.body as Blob, this.parseFileName(response, student_export_default_name));
        },
        error: (error) => {
          console.error(error);
        }
      });
    }

  exportGroup(groupId: string) {
    this.apiExportService.exportGroupCardsAsync(groupId).subscribe({
      next: (response) => {
        this.saveFile(response.body as Blob, this.parseFileName(response, student_export_default_name));
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

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