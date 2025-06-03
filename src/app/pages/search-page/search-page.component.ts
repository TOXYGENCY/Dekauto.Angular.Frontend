import { Component, inject, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Student } from '../../domain-models/Student';
import { Group } from '../../domain-models/Group';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ApiExportService } from '../../api-services/export/api-export.service';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { ApiGroupsService } from '../../api-services/groups/api-groups.service';
import { CachedDataService } from '../../services/cached-data.service';
import { ApiImportService } from '../../api-services/import/api-import.service';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { FileSavingService } from '../../services/file-saving.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment.development';
import { HeaderComponent } from '../header/header.component';
import { HttpResponse } from '@angular/common/http';
import { ConfirmPopupModule } from 'primeng/confirmpopup';


@Component({
  selector: 'app-search-page',
  imports: [FormsModule, SelectModule, ButtonModule,
    RouterOutlet, RouterModule, FileUploadModule, ToastModule,
    CommonModule, HeaderComponent, ConfirmPopupModule
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SearchPageComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private apiExportService: ApiExportService, private apiStudentsService: ApiStudentsService,
    private apiGroupsService: ApiGroupsService, private cachedDataService: CachedDataService,
    private apiImportService: ApiImportService, private messageService: MessageService,
    private dataManagerService: DataManagerService, private fileSavingService: FileSavingService,
    private userAuthService: AuthService, private confirmationService: ConfirmationService) { }


  dataManagerSub: any;

  ldFile: any = null; // Файл личного дела
  contractFile: any = null; // Файл журнала регистрации договоров
  journalFile: any = null; // Файл журнала выдачи зачеток
  files: { ld?: File, contract?: File, journal?: File } = {};
  uploadApiUrl: string = environment.api.baseUrl + '/import/LD';

  tableLoading: boolean = false;
  importLoading: boolean = false;
  exportLoading: boolean = false;

  excelFileFormat = '.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls, application/vnd.ms-excel';
  cancelLabel = 'Очистить';

  selectedStudent: Student | undefined;
  groups: Group[] = [];

  selectedGroup: Group | undefined;
  students: Student[] = [];


  ngOnInit() {
    // Подписываемся на данные
    this.dataManagerSub = this.dataManagerService.selectedGroup$.subscribe(selectedGroup => {
      this.selectedGroup = selectedGroup;
      console.log("Из данных - выбранная группа: ", this.selectedGroup);
    });

    // this.getAllStudentsAsync();
    // this.getAllGroupsAsync();
    this.getAllGroupsWithStudentsAsync();
  }

  // По уничтожении компонента отписываемся
  ngOnDestroy() {
    if (this.dataManagerSub) {
      this.dataManagerSub.unsubscribe();
    }
  }



  onGroupChange(group: Group | undefined) {
    this.dataManagerService.updateSelectedGroup(this.selectedGroup);
  }

  // Вставить группу студента, которого выбрали
  syncGroup() {
    if (this.selectedStudent) {
      this.selectedGroup = this.groups.find(group => group.id == this.selectedStudent?.groupId);
    }
  }

  searchSubmit() {
    // this.router.navigate(['students']);
    this.getAllGroupsWithStudentsAsync();
    if (this.selectedGroup) this.dataManagerService.updateSelectedGroup(this.selectedGroup);
  }

  onStudentsRecieved(recieved: Student[]) {
    this.students = recieved;
    // Сохраняем в кэш
    this.cachedDataService.updateStudentsCache(this.students);
  }

  onGroupsRecieved(recieved: Group[]) {
    this.groups = recieved;
    // Сохраняем в кэш
    this.groups.forEach(group => {
      group.students = this.students.filter(student => student.groupId == group.id);
    });
    this.cachedDataService.updateGroupsCache(this.groups);
  }

  /*getAllStudentsAsync() {
    this.apiStudentsService.getAllStudentsAsync().subscribe({
      next: response => {
        this.onStudentsRecieved(response);
      },
      error: error => {
        console.error(error.status, error.error, error.message, error);
        this.messageService.add({ severity: 'error', summary: 'Ошибка получения студентов', detail: error.message });
      }
    });
  }*/

  async getAllGroupsWithStudentsAsync() {
    this.tableLoading = true;
    // Начинаем получать группы
    this.apiGroupsService.getAllGroupsAsync().subscribe({
      next: (response) => {
        // Получили группы, получаем студентов
        this.apiStudentsService.getAllStudentsAsync().subscribe({
          next: (response) => {
            // Записываем студентов в кэш
            this.onStudentsRecieved(response);
          },
          complete: () => {
            // Заполняем каждую группу студетами и пишем в кеш
            this.onGroupsRecieved(response);
            this.tableLoading = false;
          },
          error: (error) => {
            this.showError(error, "Студенты: Ошибка получения студентов");
          }
        });
      },
      error: (error) => {
        this.showError(error, "Группы: Ошибка получения групп");
        this.tableLoading = false;
      }
    });
  }

  // TODO: передлать на числовые индексы
  onFileSelect(event: any, type: 'ld' | 'contract' | 'journal') {
    if (event.files && event.files.length > 0) {
      this.files[type] = event.files[0];
    }
  }

  onClearFile(type: 'ld' | 'contract' | 'journal') {
    this.files[type] = undefined;
  }

  uploadAll() {
    this.importLoading = true;

    const formData = new FormData();

    if (!this.files.ld || !this.files.contract || !this.files.journal) {
      this.showError(null, "Импорт: Не все файлы загружены.", "Пожалуйста, загрузите все требуемые файлы.");
      this.importLoading = false;
      return;
    }
    if (this.files.ld) formData.append('ld', this.files.ld);
    if (this.files.contract) formData.append('contract', this.files.contract);
    if (this.files.journal) formData.append('journal', this.files.journal);

    this.apiImportService.importFileAsync(formData).subscribe({
      next: response => {
        console.log(response);
        this.getAllGroupsWithStudentsAsync();
        this.messageService.add(
          {
            severity: 'success', summary: 'Импорт: успех принятия новых данных.',
            detail: 'Документы успешно импортированы. Обновляем таблицу...'
          });
        this.importLoading = false;
      },
      error: error => {
        this.showError(error, "Импорт: Ошибка отправки/принятия файла");
        this.importLoading = false;
      }
    });
  }


  exportStudent(studentId: string) {
    this.exportLoading = true;
    this.apiExportService.exportStudentCardAsync(studentId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, environment.export.student.defaultName));
      },
      error: (error) => {
        this.showError(error, "Экспорт: Ошибка экспорта файла");
        this.exportLoading = false;
      }
    });
  }

  exportGroup(GroupId: string) {
    this.exportLoading = true;
    this.apiExportService.exportGroupCardsAsync(GroupId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, environment.export.group.defaultName));
      },
      error: (error) => {
        this.showError(error, "Экспорт: Ошибка экспорта файла");
        this.exportLoading = false;
      }
    });
  }

  confirmDeleteGroup(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Удалить ${this.selectedGroup?.name}?`,
      rejectButtonProps: {
        label: '',
        icon: 'pi pi-ban',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: '',
        severity: 'info',
        icon: 'pi pi-check',
      },
      accept: () => {
        this.deleteGroup(event);
      },
      reject: () => {
      }
    });
  }

  deleteGroup(event: any) {
    let btn = event.target.closest('button');
    btn.disabled = true;
    this.apiGroupsService.deleteGroup(this.selectedGroup!.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Группы: Успешное удаление',
          detail: `Группа ${this.selectedGroup!.name} успешно удалена`
        });
        this.selectedGroup = undefined;
        this.dataManagerService.clearSelectedGroup();
        this.getAllGroupsWithStudentsAsync();
        btn.disabled = false;
      },
      error: (error: any) => {
        this.showError(error, "Группы: Ошибка удаления группы");
        btn.disabled = false;
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