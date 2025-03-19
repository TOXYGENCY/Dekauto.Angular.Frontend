import { Component, ViewEncapsulation } from '@angular/core';
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
import { backend_api_url, import_api_url } from '../../app.config';
import { ApiImportService } from '../../api-services/import/api-import.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';


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
export class SearchPageComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, 
    private apiExportService: ApiExportService, private apiStudentsService: ApiStudentsService,
    private apiGroupsService: ApiGroupsService, private cachedDataService: CachedDataService,
    private apiImportService: ApiImportService, private messageService: MessageService) { }

  ngOnInit() {
    this.getAllStudentsAsync();
    this.getAllGroupsAsync();
  }

  LdFile: any = null; // Файл личного дела
  LogFile: any = null; // Файл журнала регистрации договоров
  Log2File: any = null; // Файл журнала выдачи зачеток
  files: { ld?: File, log?: File, log2?: File } = {};
  uploadApiUrl: string = backend_api_url + '/import/LD';

  tableLoading: boolean = false;
  importLoading: boolean = false;

  excelFileFormat = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  cancelLabel = 'Очистить';

  selectedStudent: Student | undefined;
  groups: Group[] = [];

  selectedGroup: Group | undefined;
  students: Student[] = [];

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

  onFileSelect(event: any, type: 'ld' | 'log' | 'log2') {
    if (event.files && event.files.length > 0) {
      this.files[type] = event.files[0];
    }
  }

  onClearFile(type: 'ld' | 'log' | 'log2') { 
    this.files[type] = undefined; //clearFile
  } 

  uploadAll() {
    this.importLoading = true;
    
    const formData = new FormData();

    if (this.files.ld) formData.append('ld', this.files.ld);
    if (this.files.log) formData.append('log', this.files.log);
    if (this.files.log2) formData.append('log2', this.files.log2);

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

  onUploadLd(event: FileUploadEvent) {
    // this.ldFile = event.files[0];
    // this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  onUploadLog(event: FileUploadEvent) {
    // this.logFile = event.files[0];
    // this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  onUploadLog2(event: FileUploadEvent) {
    // this.log2File = event.files[0];
    // this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  // сам поиск и фильтрация с перенаправлением
  searchSubmit(){
    this.router.navigate(['students']);
    
  }
}