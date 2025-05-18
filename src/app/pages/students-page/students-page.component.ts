import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { Student } from '../../domain-models/Student';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CachedDataService } from '../../services/cached-data.service';
import { Group } from '../../domain-models/Group';
import { ApiExportService } from '../../api-services/export/api-export.service';
import { student_export_default_name } from '../../app.config';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileSavingService } from '../../services/file-saving.service';
import { DataManagerService } from '../../services/data-manager.service';
import { GroupByOptionsWithElement } from 'rxjs'; 

@Component({
  selector: 'app-students-page',
  imports: [TableModule, CommonModule, ButtonModule,
  ],
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.css'
})
export class StudentsPageComponent implements OnInit, OnDestroy {

  constructor(private apiStudentsService: ApiStudentsService, private cachedDataService: CachedDataService,
    private apiExportService: ApiExportService, private messageService: MessageService,
    private fileSavingService: FileSavingService, private dataManagerService: DataManagerService) { }

  // Переменные подписки для того, чтобы можно было отписаться
  private studentsSub: any;
  private groupsSub: any;
  private selectedGroupSub: any;

  exportLoading: boolean = false;

  students: Student[] = [];
  studentsInTable: Student[] = [];

  groups: Group[] = [];
  groupsInTable: Group[] = [];
  selectedGroup: Group | undefined = undefined;

  // TODO: если students или studentsCache обновляется, то обновлять и studentsInTable 
  ngOnInit() {
    // Подписываемся на кэш
    this.studentsSub = this.cachedDataService.cachedStudents$.subscribe(cache => {
      this.students = cache;
      console.log("Из кэша студентов: ", this.students);
      this.updateStudentsInTable();
    });

    this.groupsSub = this.cachedDataService.cachedGroups$.subscribe(cache => {
      this.groups = cache;
      console.log("Из кэша групп: ", this.groups);
    });

    this.selectedGroupSub = this.dataManagerService.selectedGroup$.subscribe(selectedGroup => {
      this.selectedGroup = selectedGroup;
      console.log("Выбранная группа: ", this.selectedGroup);
      this.updateStudentsInTable();
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
    if (this.selectedGroupSub) {
      this.selectedGroupSub.unsubscribe();
    }
  }

  private updateStudentsInTable(): void {
    if (!this.students) {
      this.studentsInTable = [];
      return;
    }

    if (this.selectedGroup) {
      this.studentsInTable = this.students.filter(s => s.groupId == this.selectedGroup?.id);
    } else {
      this.studentsInTable = this.students;
    }

    console.log("Обновлен список студентов в таблице");
  }

  getGroupName(groupId: string): string {
    return this.groups.find(g => g.id == groupId)?.name || '-';
  }

  exportStudent(studentId: string, event: any) {
    let btn = event.target.closest('button');
    btn.disabled = true;
    // this.exportLoading = true;
    this.apiExportService.exportStudentCardAsync(studentId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        btn.disabled = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, student_export_default_name));
      },
      error: (error) => {
        this.showError(error, "Экспорт: Ошибка экспорта файлов");
        this.exportLoading = false;
        btn.disabled = false;
      }
    });
  }

  exportGroup(groupId: string, event: any) {
    let btn = event.target.closest('button');
    btn.disabled = true;

    this.exportLoading = true;
    this.apiExportService.exportGroupCardsAsync(groupId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        btn.disabled = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, student_export_default_name));
      },
      error: (error) => {
        this.showError(error, "Экспорт: Ошибка экспорта файлов");
        this.exportLoading = false;
        btn.disabled = false;
      }
    });
  }

  deleteStudent(studentId: string, event: any) {
    let btn = event.target.closest('button');
    let tr = event.target.closest('tr');
    btn.disabled = true;
    tr.style.opacity = "0.3";
    tr.querySelectorAll('*').forEach((el: { disabled: boolean; }) => el.disabled = true);
    
    this.apiStudentsService.deleteStudent(studentId).subscribe({
      next: () => {
        this.updateStudentsInTable();
      },
      error: (error: any) => {
        this.showError(error, "Студенты: Ошибка удаления студента");
      }
    });
  }

  showError(error: any, summary: string, detail?: string) {
    summary = summary ? summary : "Ошибка";

    if (error) {
      console.error(error.status, error.error, error.message, error);
    } else {
      console.error(summary, detail);
    }

    if (!detail) {
      if (typeof error.error == 'string') {
        detail = error.error;
      } else {
        detail = "Возникла непредвиденная ошибка. Повторите попытку или свяжитесь с администратором";
      }
    }
    this.messageService.add({ severity: 'error', summary: summary, detail: detail, life: 7000 });
  }
}