import { Component, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
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
import { backend_api_url, import_api_url, student_export_default_name } from '../../app.config';
import { ApiImportService } from '../../api-services/import/api-import.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { FileSavingService } from '../../services/file-saving.service';


@Component({
  selector: 'app-search-page',
  imports: [FormsModule, SelectModule, ButtonModule,
    RouterOutlet, RouterModule, FileUploadModule, ToastModule,
    CommonModule
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
    private dataManagerService: DataManagerService, private fileSavingService: FileSavingService) { }


  dataManagerSub: any;

  ldFile: any = null; // Файл личного дела
  contractFile: any = null; // Файл журнала регистрации договоров
  journalFile: any = null; // Файл журнала выдачи зачеток
  files: { ld?: File, contract?: File, journal?: File } = {};
  uploadApiUrl: string = backend_api_url + '/import/LD';

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

    this.getAllStudentsAsync();
    this.getAllGroupsAsync();
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

  getAllStudentsAsync() {
    this.apiStudentsService.getAllStudentsAsync().subscribe({
      next: response => {
        this.students = response;
        // Сохраняем в кэш
        this.cachedDataService.updateStudentsCache(this.students);
      },
      error: error => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Ошибка получения студентов', detail: error.message });
      }
    });
  }

  getAllGroupsAsync() {
    this.apiGroupsService.getAllGroupsAsync().subscribe({
      next: (response: any) => {
        this.groups = response;
        // Сохраняем в кэш
        this.cachedDataService.updateGroupsCache(this.groups);
      },
      error: error => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Ошибка получения групп', detail: error.message });
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

  // TODO: сам поиск и фильтрация с перенаправлением
  searchSubmit() {
    this.router.navigate(['students']);
    this.getAllStudentsAsync();
    this.getAllGroupsAsync();
    if (this.selectedGroup) this.dataManagerService.updateSelectedGroup(this.selectedGroup);
  }

  // TODO: убрать
  exportStudent(studentId: string) {
    this.exportLoading = true;
    this.apiExportService.exportStudentCardAsync(studentId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, student_export_default_name));
      },
      error: (error) => {
        console.error(error);
        this.exportLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ошибка экспорта файла', detail: error });
      }
    });
  }
}