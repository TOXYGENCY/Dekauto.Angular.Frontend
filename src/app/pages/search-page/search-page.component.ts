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
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { FileSavingService } from '../../services/file-saving.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment.development';
import { HeaderComponent } from '../header/header.component';
import { HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-search-page',
  imports: [FormsModule, SelectModule, ButtonModule,
    RouterOutlet, RouterModule, FileUploadModule, ToastModule,
    CommonModule, HeaderComponent
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css',
  providers: [MessageService]
})
export class SearchPageComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private apiExportService: ApiExportService, private apiStudentsService: ApiStudentsService,
    private apiGroupsService: ApiGroupsService, private cachedDataService: CachedDataService,
    private apiImportService: ApiImportService, private messageService: MessageService,
    private dataManagerService: DataManagerService, private fileSavingService: FileSavingService,
    private userAuthService: AuthService) { }


  dataManagerSub: any;

  ldFile: any = null; // Файл личного дела
  contractFile: any = null; // Файл журнала регистрации договоров
  journalFile: any = null; // Файл журнала выдачи зачеток
  files: { ld?: File, contract?: File, journal?: File } = {};
  uploadApiUrl: string = environment.api.baseUrl + '/import/LD';

  tableLoading: boolean = false;
  importLoading: boolean = false;
  exportLoading: boolean = false;

  excelFileFormat = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Ошибка получения студентов', detail: error.message });
      }
    });
  }*/

  async getAllGroupsWithStudentsAsync() {
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
            },
            error: (error) => {
              console.error(error);
              this.messageService.add({ severity: 'error', 
                summary: 'Ошибка получения студентов', detail: error.message });
            }
          });
        
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', 
          summary: 'Ошибка получения групп', detail: error.message });
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

    if (this.files.ld) formData.append('ld', this.files.ld);
    if (this.files.contract) formData.append('contract', this.files.contract);
    if (this.files.journal) formData.append('journal', this.files.journal);

    this.apiImportService.importFileAsync(formData).subscribe({
      next: response => {
        console.log(response);
        this.importLoading = false;
      },
      error: error => {
        console.error(error);
        this.importLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ошибка отправки/принятия файла', detail: error.message.message });
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
        console.error(error);
        this.exportLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ошибка экспорта файла', detail: error });
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
        console.error(error);
        this.exportLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ошибка экспорта файла', detail: error });
      }
    });
  }

}